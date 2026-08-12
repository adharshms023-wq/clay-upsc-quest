
-- ============ sources ============
CREATE TABLE public.ca_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  source_url text NOT NULL DEFAULT '',
  feed_url text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  active boolean NOT NULL DEFAULT true,
  last_fetched_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (feed_url)
);

GRANT SELECT ON public.ca_sources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ca_sources TO authenticated;
GRANT ALL ON public.ca_sources TO service_role;

ALTER TABLE public.ca_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sources are readable by everyone" ON public.ca_sources
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert sources" ON public.ca_sources
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sources" ON public.ca_sources
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sources" ON public.ca_sources
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER ca_sources_set_updated_at BEFORE UPDATE ON public.ca_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ articles ============
CREATE TABLE public.current_affairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  source_url text NOT NULL,
  image_url text,
  published_at timestamptz NOT NULL DEFAULT now(),
  category text NOT NULL DEFAULT 'General',
  subject text NOT NULL DEFAULT '',
  topic text NOT NULL DEFAULT '',
  subtopic text NOT NULL DEFAULT '',
  upsc_relevance integer NOT NULL DEFAULT 0,
  tags text[] NOT NULL DEFAULT '{}',
  content_hash text NOT NULL,
  status text NOT NULL DEFAULT 'fetched',
  question_count integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_url),
  UNIQUE (content_hash)
);

CREATE INDEX current_affairs_status_idx ON public.current_affairs (status, published_at DESC);
CREATE INDEX current_affairs_published_idx ON public.current_affairs (published_at DESC);

GRANT SELECT ON public.current_affairs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.current_affairs TO authenticated;
GRANT ALL ON public.current_affairs TO service_role;

ALTER TABLE public.current_affairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved articles are readable by everyone" ON public.current_affairs
  FOR SELECT TO anon, authenticated
  USING (status IN ('approved', 'question_generated'));
CREATE POLICY "Admins can read all articles" ON public.current_affairs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert articles" ON public.current_affairs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update articles" ON public.current_affairs
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete articles" ON public.current_affairs
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER current_affairs_set_updated_at BEFORE UPDATE ON public.current_affairs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ question bank extensions ============
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'Static',
  ADD COLUMN IF NOT EXISTS current_affair_id uuid REFERENCES public.current_affairs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_url text;

CREATE INDEX IF NOT EXISTS questions_source_type_idx ON public.questions (source_type, status, created_at DESC);

-- ============ seed sources ============
INSERT INTO public.ca_sources (source_name, source_url, feed_url, category) VALUES
  ('Press Information Bureau', 'https://pib.gov.in', 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3', 'Government of India'),
  ('PIB Economic Affairs', 'https://pib.gov.in', 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=0', 'Economy'),
  ('Reserve Bank of India — Press Releases', 'https://rbi.org.in', 'https://website.rbi.org.in/web/rbi/press-releases/rss', 'Economy'),
  ('ISRO', 'https://www.isro.gov.in', 'https://www.isro.gov.in/rss.xml', 'Science & Technology'),
  ('PRS Legislative Research', 'https://prsindia.org', 'https://prsindia.org/rss.xml', 'Polity & Governance'),
  ('United Nations News — Global', 'https://news.un.org', 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', 'International Relations'),
  ('World Bank News', 'https://www.worldbank.org', 'https://www.worldbank.org/en/news/all?format=atom', 'Economy')
ON CONFLICT (feed_url) DO NOTHING;

-- ============ retrieval helpers ============
CREATE OR REPLACE FUNCTION public.pick_current_affairs_questions(
  _limit integer,
  _subjects text[] DEFAULT NULL,
  _difficulties text[] DEFAULT NULL,
  _since timestamptz DEFAULT NULL,
  _exclude uuid[] DEFAULT NULL
)
RETURNS SETOF public.questions
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT q.*
  FROM public.questions q
  WHERE q.status = 'approved'
    AND q.source_type = 'Current Affairs'
    AND (_subjects IS NULL OR array_length(_subjects, 1) IS NULL OR q.subject = ANY(_subjects))
    AND (_difficulties IS NULL OR array_length(_difficulties, 1) IS NULL OR q.difficulty = ANY(_difficulties))
    AND (_since IS NULL OR q.created_at >= _since)
    AND (_exclude IS NULL OR array_length(_exclude, 1) IS NULL OR NOT (q.id = ANY(_exclude)))
  ORDER BY random()
  LIMIT GREATEST(_limit, 0)
$$;

CREATE OR REPLACE FUNCTION public.current_affairs_pipeline_stats()
RETURNS TABLE(status text, total integer)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT c.status, count(*)::int AS total
  FROM public.current_affairs c
  GROUP BY c.status
$$;
