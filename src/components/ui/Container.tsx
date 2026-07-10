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
        "w-full lg:max-w-7xl lg:mx-auto px-3 sm:px-5 lg:px-8 py-12 sm:py-16 lg:py-24",
        className
      )}
    >
      {children}
    </Tag>
  );
}
