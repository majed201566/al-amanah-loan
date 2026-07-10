"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import { features } from "@/data/site";
import { Zap, FileCheck, Percent, Shield } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Zap,
  FileCheck,
  Percent,
  Shield,
};

export default function Features() {
  return (
    <Container className="relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vmin] h-[100vmin] max-w-[800px] max-h-[800px] bg-gold-100/50 rounded-full blur-3xl -z-10" />

      <SectionHeading
        label="لماذا الأمانة؟"
        title="مميزات تجعلنا الخيار الأول لتمويلك"
        description="نضع بين يديك باقة من المميزات الحصرية التي تضمن لك تجربة تمويلية فريدة وآمنة"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, i) => {
          const Icon = iconMap[feature.icon] || Shield;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card hover className="h-full text-center group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center group-hover:from-gold-400 group-hover:to-gold-500 transition-all duration-500">
                  <Icon className="w-7 h-7 text-gold-600 group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2 text-lg">
                  {feature.title}
                </h3>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Container>
  );
}
