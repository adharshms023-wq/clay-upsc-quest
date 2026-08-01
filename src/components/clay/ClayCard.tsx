import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type ClayCardProps = {
  children: ReactNode;
  className?: string;
  tone?: "base" | "primary" | "secondary" | "accent" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  as?: ElementType;
} & Omit<ComponentPropsWithoutRef<"div">, "children">;

const tones: Record<string, string> = {
  base: "bg-card",
  primary: "bg-primary/25",
  secondary: "bg-secondary/40",
  accent: "bg-accent/40",
  success: "bg-success/30",
  warning: "bg-warning/30",
};

const sizes = { sm: "clay-sm p-4", md: "clay p-6", lg: "clay-lg p-7 md:p-9" };

export function ClayCard({
  children,
  className,
  tone = "base",
  size = "md",
  as: Tag = "div",
  ...rest
}: ClayCardProps) {
  return (
    <Tag className={cn(sizes[size], tones[tone], className)} {...rest}>
      {children}
    </Tag>
  );
}