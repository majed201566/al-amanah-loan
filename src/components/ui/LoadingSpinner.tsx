"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex items-center justify-center", className)}
    >
      <Loader2
        className={cn(
          "animate-spin text-gold-500",
          size === "sm" && "w-4 h-4",
          size === "md" && "w-6 h-6",
          size === "lg" && "w-10 h-10"
        )}
      />
    </motion.div>
  );
}
