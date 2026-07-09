"use client";

import { motion } from "framer-motion";
import { Landmark, Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/25">
          <Landmark className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-3" />
        <p className="text-navy-600 text-sm">جارٍ التحميل...</p>
      </motion.div>
    </div>
  );
}
