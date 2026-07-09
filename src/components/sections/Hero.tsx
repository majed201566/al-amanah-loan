"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { ArrowLeft, ShieldCheck, Zap, BadgeCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-navy-900">
      {/* Background Patterns */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-gold-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-gold-500/8 to-transparent rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Decorative Lines */}
      <div className="absolute top-20 left-0 w-32 h-[2px] bg-gradient-to-l from-gold-500/60 to-transparent" />
      <div className="absolute top-20 left-0 w-[2px] h-32 bg-gradient-to-b from-gold-500/60 to-transparent" />
      <div className="absolute bottom-20 right-0 w-32 h-[2px] bg-gradient-to-r from-gold-500/60 to-transparent" />
      <div className="absolute bottom-20 right-0 w-[2px] h-32 bg-gradient-to-t from-gold-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 text-gold-300 text-sm font-medium bg-gold-500/10 border border-gold-500/20 px-4 py-2 rounded-full mb-6">
                <BadgeCheck className="w-4 h-4" />
                مرخصون من البنك المركزي العراقي
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              تمويل{" "}
              <span className="text-gradient-gold">سريع وموثوق</span>
              {" "}لتحقيق{" "}
              <span className="text-gradient-gold">أحلامك</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-navy-200 leading-relaxed mb-8 max-w-lg"
            >
              نقدم حلولاً تمويلية مبتكرة بأقل نسبة فائدة في العراق. وافق على طلبك
              خلال 24 ساعة واستلم التمويل في حسابك خلال 3 أيام عمل.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Link href="/loan-application">
                <Button variant="primary" size="lg">
                  قدّم طلبك الآن
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/loan-conditions">
                <Button variant="goldOutline" size="lg">
                  تعرف على الشروط
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 text-navy-300 text-sm"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-500" />
                معتمدون رسمياً
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gold-500" />
                موافقة خلال 24 ساعة
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-gold-500" />
                بدون كفيل
              </div>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            {/* Floating Card */}
            <div className="relative">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">القرض الشخصي</p>
                    <p className="text-gold-300 text-sm">نسبة فائدة من 8%</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-300">مبلغ التمويل</span>
                    <span className="text-white font-medium">50,000,000 د.ع</span>
                  </div>
                  <div className="w-full h-2 bg-navy-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
                      animate={{ width: ["0%", "75%"] }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-300">مدة السداد</span>
                    <span className="text-white font-medium">48 شهراً</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-300">القسط الشهري</span>
                    <span className="text-gold-300 font-bold">1,250,000 د.ع</span>
                  </div>
                </div>
              </motion.div>

              {/* Glow behind card */}
              <div className="absolute inset-0 bg-gold-500/20 rounded-3xl blur-3xl animate-pulse-glow" />
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 glass-dark rounded-2xl px-4 py-3 shadow-xl z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-medium">موافقة فورية</p>
                  <p className="text-emerald-400 text-xs">خلال 24 ساعة</p>
                </div>
              </div>
            </motion.div>

            {/* Stats badge */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 glass-dark rounded-2xl px-5 py-4 shadow-xl z-20"
            >
              <p className="text-gold-400 text-2xl font-bold">+10,000</p>
              <p className="text-navy-300 text-xs">عميل يثق بنا</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
