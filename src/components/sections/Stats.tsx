"use client";

import { motion } from "framer-motion";
import { Users, Handshake, Award, Landmark } from "lucide-react";
import { stats } from "@/data/site";

const iconMap: Record<string, React.ElementType> = {
  Users,
  Handshake,
  Award,
  Landmark,
};

export default function Stats() {
  return (
    <section className="relative bg-navy-900 py-16 sm:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full lg:max-w-7xl lg:mx-auto px-3 sm:px-5 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = iconMap[stat.icon] || Award;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gold-400" />
                </div>
                <motion.p
                  className="text-3xl sm:text-4xl font-bold text-white mb-2"
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.2, duration: 0.4 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-navy-300 text-sm font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
