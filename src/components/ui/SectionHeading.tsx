import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}

export default function SectionHeading({
  label,
  title,
  description,
  centered = true,
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl mb-12",
        centered && "mx-auto text-center",
        className
      )}
    >
      {label && (
        <span
          className={cn(
            "inline-block text-sm font-semibold mb-3 px-4 py-1.5 rounded-full",
            light
              ? "bg-white/10 text-gold-300 border border-gold-500/20"
              : "bg-gold-100 text-gold-700"
          )}
        >
          {label}
        </span>
      )}
      <h2
        className={cn(
          "text-3xl sm:text-4xl font-bold leading-tight",
          light ? "text-white" : "text-navy-900"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed",
            light ? "text-navy-200" : "text-navy-500"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
