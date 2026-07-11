"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/sections/PageHeader";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { loanTypes } from "@/data/site";
import { User, Home, Briefcase, Car, ArrowLeft, Check, Shield, Clock, Calculator } from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, React.ElementType> = {
  User,
  Home,
  Briefcase,
  Car,
};

const generalConditions = [
  "أن يكون المتقدم عراقي الجنسية",
  "العمر بين 21 و 65 عاماً",
  "دخل شهري ثابت لا يقل عن 500,000 دينار",
  "أن لا يقل الراتب الصافي بعد خصم القسط عن 30% من الراتب الإجمالي",
  "تقديم كافة المستندات المطلوبة",
  "اجتياز دراسة الجدارة الائتمانية",
  "عدم وجود تعثرات مصرفية سابقة",
  "التوقيع على اتفاقية التمويل وسندات الدين",
];

export default function LoanConditionsPage() {
  return (
    <>
      <PageHeader
        title="شروط التمويل"
        description="تعرف على شروط وأحكام الحصول على التمويل من الأمانة للتمويل"
        breadcrumb={[{ label: "شروط التمويل" }]}
      />

      {/* General Conditions */}
      <Container>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="sticky top-24"
            >
              <h2 className="text-2xl font-bold text-navy-900 mb-4">
                الشروط العامة
              </h2>
              <p className="text-navy-500 mb-6 leading-relaxed">
                تنطبق هذه الشروط على جميع أنواع القروض المقدمة من الأمانة
                للتمويل. قد تختلف بعض المتطلبات حسب نوع القرض.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Badge variant="gold">مرخص من البنك المركزي</Badge>
                <Badge variant="navy">شفافية كاملة</Badge>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="divide-y divide-navy-50">
                {generalConditions.map((condition, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 py-4 px-2 first:pt-0 last:pb-0"
                  >
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-navy-700 text-sm">{condition}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Container>

      {/* Loan Types Detail */}
      <div className="bg-navy-900">
        <Container>
          <div className="text-center mb-12">
            <span className="text-gold-300 text-sm font-semibold bg-gold-500/10 border border-gold-500/20 px-4 py-1.5 rounded-full">
              منتجاتنا
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
              تفاصيل المنتجات التمويلية
            </h2>
            <p className="text-navy-300 max-w-2xl mx-auto">
              اختر المنتج التمويلي المناسب لاحتياجاتك
            </p>
          </div>

          <div className="space-y-6">
            {loanTypes.map((loan, i) => {
              const Icon = iconMap[loan.icon] || User;
              return (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="lg:w-1/3">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${loan.color} flex items-center justify-center mb-4`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {loan.title}
                        </h3>
                        <p className="text-navy-300 text-sm leading-relaxed">
                          {loan.description}
                        </p>
                      </div>
                      <div className="lg:w-2/3 grid sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-xl bg-white/5">
                          <p className="text-navy-400 text-xs mb-1">مبلغ التمويل</p>
                          <p className="text-white font-bold text-sm" dir="ltr">{loan.amount} د.ع</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-white/5">
                          <p className="text-navy-400 text-xs mb-1">مدة السداد</p>
                          <p className="text-white font-bold text-sm">{loan.period}</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-white/5">
                          <p className="text-navy-400 text-xs mb-1">نسبة الفائدة</p>
                          <p className="text-gold-400 font-bold text-sm">{loan.rate}</p>
                        </div>
                        <div className="sm:col-span-3">
                          <p className="text-navy-400 text-xs mb-2">المميزات:</p>
                          <div className="flex flex-wrap gap-2">
                            {loan.features.map((f, j) => (
                              <Badge key={j} variant="outline">{f}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </div>

      {/* Calculator Teaser */}
      <Container>
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="max-w-2xl mx-auto bg-gradient-to-br from-navy-800 to-navy-950 border-none text-white p-10">
              <Calculator className="w-14 h-14 text-gold-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">هل تريد حساب القسط الشهري؟</h3>
              <p className="text-navy-300 mb-6">
                استخدم حاسبة التمويل لتقدير القسط الشهري المناسب لك بناءً على مبلغ القرض ومدة السداد
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/loan-application">
                  <Button variant="primary" size="lg">
                    احسب قسطك
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="goldOutline" size="lg">
                    تحدث مع خبير
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </Container>
    </>
  );
}
