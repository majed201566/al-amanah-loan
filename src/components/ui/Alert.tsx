"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, XCircle, X } from "lucide-react";

type AlertType = "error" | "success" | "warning";

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const styles: Record<AlertType, { bg: string; border: string; text: string; icon: string }> = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "text-red-500",
  },
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: "text-emerald-500",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: "text-amber-500",
  },
};

const IconMap = {
  error: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
};

export default function Alert({ type, message, onClose }: AlertProps) {
  const s = styles[type];
  const Icon = IconMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`flex items-center gap-3 p-4 rounded-xl border ${s.bg} ${s.border} ${s.text} text-sm`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${s.icon}`} />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 hover:opacity-70 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
