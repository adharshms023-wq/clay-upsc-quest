import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  ghost: "bg-card text-foreground",
  danger: "bg-destructive text-destructive-foreground",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-sm rounded-[16px]",
  md: "min-h-12 px-6 text-[0.95rem] rounded-[20px]",
  lg: "min-h-14 px-8 text-base rounded-[24px]",
};

const base =
  "clay-press inline-flex items-center justify-center gap-2 font-semibold shadow-[var(--clay-shadow-sm)] disabled:opacity-50 disabled:pointer-events-none select-none";

export function ClayButton({
  children,
  className,
  variant = "primary",
  size = "md",
  ...rest
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ClayLinkButton({
  children,
  className,
  variant = "primary",
  size = "md",
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}