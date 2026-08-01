import { cn } from "@/lib/utils";

export function ClayProgress({
  value,
  className,
  label,
  tone = "primary",
}: {
  value: number;
  className?: string;
  label?: string;
  tone?: "primary" | "success" | "accent" | "warning";
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const bar = {
    primary: "bg-primary",
    success: "bg-success",
    accent: "bg-accent",
    warning: "bg-warning",
  }[tone];
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      ) : null}
      <div
        className="clay-inset h-3 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-out", bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}