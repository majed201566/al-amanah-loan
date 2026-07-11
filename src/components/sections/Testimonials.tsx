"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import { testimonials } from "@/data/site";
import { Star, ChevronRight, ChevronLeft, Quote } from "lucide-react";

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((p) => (p + 1) % testimonials.length);
  const prev = () =>
    setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <Container className="bg-cream-dark/50">
      <SectionHeading
        label="آراء العملاء"
        title="ماذا يقول عملاؤنا عنا"
        description="نسعد بثقة آلاف العملاء الذين اختاروا الأمانة للتمويل لتحقيق أهدافهم المالية"
      />

      <div className="max-w-3xl mx-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
          >
            <Card glass className="text-center relative">
              <Quote className="w-10 h-10 text-gold-200 mx-auto mb-4" />
              <p className="text-navy-600 text-lg leading-relaxed mb-6">
                &ldquo;{testimonials[current].content}&rdquo;
              </p>
              <div className="flex justify-center gap-1 mb-3">
                {Array.from({ length: testimonials[current].rating }).map(
                  (_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-gold-400 text-gold-400"
                    />
                  )
                )}
              </div>
              <p className="font-bold text-navy-900">
                {testimonials[current].name}
              </p>
              <p className="text-sm text-navy-400">
                {testimonials[current].role}
              </p>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-xl border border-navy-200 bg-white flex items-center justify-center hover:border-gold-400 hover:text-gold-600 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex gap-2 items-center">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current
                    ? "bg-gold-500 w-6"
                    : "bg-navy-200 hover:bg-navy-300"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-10 h-10 rounded-xl border border-navy-200 bg-white flex items-center justify-center hover:border-gold-400 hover:text-gold-600 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Container>
  );
}
