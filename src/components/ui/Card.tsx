import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
  bordered?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  className,
  hover = false,
  glass = false,
  bordered = true,
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white",
        glass && "glass",
        bordered && !glass && "border border-navy-100",
        hover && "card-hover cursor-pointer",
        padding === "none" && "",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
