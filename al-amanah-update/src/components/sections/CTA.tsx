"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { ArrowLeft, Phone } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-950" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-3xl" />

      {/* Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto px-3 sm:px-5 lg:px-8 text-center relative z-10"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          هل أنت مستعد لتحقيق{" "}
          <span className="text-gradient-gold">حلمك</span>؟
        </h2>
        <p className="text-navy-200 text-lg mb-10 max-w-xl mx-auto">
          لا تتردد، فريقنا مستعد لمساعدتك. قدم طلبك الآن واحصل على الموافقة خلال
          24 ساعة فقط.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/loan-application">
            <Button variant="primary" size="lg">
              ابدأ طلبك الآن
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <a href="tel:+9647801234567">
            <Button variant="goldOutline" size="lg">
              <Phone className="w-5 h-5" />
              <span dir="ltr">0770 123 4567</span>
            </Button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
