import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-lg shadow-gold-500/20 hover:shadow-gold-500/35 hover:from-gold-400 hover:to-gold-500",
        secondary:
          "bg-navy-800 text-white shadow-lg shadow-navy-800/20 hover:bg-navy-700 hover:shadow-navy-800/30",
        outline:
          "border-2 border-navy-200 text-navy-700 hover:border-gold-400 hover:text-gold-600 hover:bg-gold-50/50",
        ghost:
          "text-navy-600 hover:text-navy-900 hover:bg-navy-50",
        danger:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/35",
        goldOutline:
          "border-2 border-gold-400 text-gold-600 hover:bg-gold-500 hover:text-white",
      },
      size: {
        sm: "text-xs px-4 py-2",
        md: "text-sm px-5 py-2.5",
        lg: "text-base px-7 py-3.5",
        xl: "text-lg px-9 py-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
