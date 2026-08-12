import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type SourceRow = {
  id: string;
  source_name: string;
  source_url: string;
  feed_url: string;
  category: string;
  active: boolean;
  last_fetched_at: string | null;
  last_error: string | null;
};

export type FeedItem = {
  title: string;
  summary: string;
  content: string;
  link: string;
  publishedAt: string;
  imageUrl: string | null;
};

/** SHA-256 of the normalised title + summary — used as the duplicate fingerprint. */
export async function contentHash(title: string, summary: string) {
  const normalised = `${title} ${summary}`
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
  const bytes = new TextEncoder().encode(normalised);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const stripTags = (value: string) =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

function tagValue(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1] ? stripTags(match[1]) : "";
}

function linkValue(block: string): string {
  const plain = tagValue(block, "link");
  if (plain && /^https?:/i.test(plain)) return plain;
  const href = block.match(/<link[^>]*href=["']([^"']+)["']/i);
  return href?.[1] ?? tagValue(block, "guid");
}

/** Minimal RSS 2.0 + Atom parser. No dependency, worker-safe. */
export function parseFeed(xml: string, limit: number): FeedItem[] {
  const blocks = [
    ...(xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []),
    ...(xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? []),
  ];
  const items: FeedItem[] = [];

  for (const block of blocks.slice(0, limit)) {
    const title = tagValue(block, "title");
    const link = linkValue(block);
    if (!title || !link) continue;

    const description =
      tagValue(block, "description") || tagValue(block, "summary") || tagValue(block, "content");
    const dateRaw =
      tagValue(block, "pubDate") || tagValue(block, "published") || tagValue(block, "updated");
    const parsedDate = dateRaw ? new Date(dateRaw) : null;
    const image = block.match(/<(?:media:content|media:thumbnail|enclosure)[^>]*url=["']([^"']+)["']/i);

    items.push({
      title: title.slice(0, 400),
      // Only a short extract is stored — never a full copyrighted article.
      summary: description.slice(0, 600),
      content: description.slice(0, 4000),
      link,
      publishedAt:
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toISOString()
          : new Date().toISOString(),
      imageUrl: image?.[1] ?? null,
    });
  }
  return items;
}

async function fetchFeed(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      "user-agent": "UPSCClayBot/1.0 (+current-affairs aggregator; respects robots)",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

export type IngestionResult = {
  sources: { source: string; fetched: number; inserted: number; error: string | null }[];
  inserted: number;
};

/**
 * Polls every active source, stores new articles and records per-source failures.
 * A failing source never stops the others, and duplicates are skipped by
 * source URL + content hash.
 */
export async function runIngestion(perSource = 15): Promise<IngestionResult> {
  const { data: sources, error } = await supabaseAdmin
    .from("ca_sources")
    .select("*")
    .eq("active", true);
  if (error) throw new Error(error.message);

  const report: IngestionResult["sources"] = [];

  for (const source of (sources ?? []) as SourceRow[]) {
    try {
      const xml = await fetchFeed(source.feed_url);
      const items = parseFeed(xml, perSource);
      let inserted = 0;

      for (const item of items) {
        const hash = await contentHash(item.title, item.summary);
        const { data, error: insertError } = await supabaseAdmin
          .from("current_affairs")
          .upsert(
            {
              title: item.title,
              summary: item.summary,
              content: item.content,
              source: source.source_name,
              source_url: item.link,
              image_url: item.imageUrl,
              published_at: item.publishedAt,
              category: source.category,
              content_hash: hash,
              status: "fetched",
            },
            { onConflict: "source_url", ignoreDuplicates: true },
          )
          .select("id");
        // A content-hash clash from another source is a duplicate, not a failure.
        if (insertError && !insertError.message.includes("content_hash")) throw insertError;
        inserted += data?.length ?? 0;
      }

      await supabaseAdmin
        .from("ca_sources")
        .update({ last_fetched_at: new Date().toISOString(), last_error: null })
        .eq("id", source.id);
      report.push({ source: source.source_name, fetched: items.length, inserted, error: null });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unknown error";
      await supabaseAdmin
        .from("ca_sources")
        .update({ last_fetched_at: new Date().toISOString(), last_error: message })
        .eq("id", source.id);
      report.push({ source: source.source_name, fetched: 0, inserted: 0, error: message });
    }
  }

  return { sources: report, inserted: report.reduce((a, r) => a + r.inserted, 0) };
}