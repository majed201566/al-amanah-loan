import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
}

export default function Container({
  children,
  className,
  as: Tag = "section",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24",
        className
      )}
    >
      {children}
    </Tag>
  );
}
