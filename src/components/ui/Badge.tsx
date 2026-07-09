import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "navy" | "outline" | "success";
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({
  children,
  variant = "gold",
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" && "px-3 py-1 text-xs",
        size === "md" && "px-4 py-1.5 text-sm",
        variant === "gold" && "bg-gold-100 text-gold-700",
        variant === "navy" && "bg-navy-100 text-navy-700",
        variant === "outline" && "border border-gold-300 text-gold-600",
        variant === "success" && "bg-emerald-100 text-emerald-700",
        className
      )}
    >
      {children}
    </span>
  );
}
