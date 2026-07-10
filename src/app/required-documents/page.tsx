"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/sections/PageHeader";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import { requiredDocuments } from "@/data/site";
import { FileText, ClipboardCheck, Home, Briefcase, AlertCircle } from "lucide-react";

const categoryIcons = [FileText, ClipboardCheck, Home, Briefcase];

export default function RequiredDocumentsPage() {
  return (
    <>
      <PageHeader
        title="المستندات المطلوبة"
        description="قائمة المستندات والأوراق المطلوبة للتقديم على التمويل"
        breadcrumb={[{ label: "المستندات المطلوبة" }]}
      />

      <Container>
        <div className="w-full lg:max-w-4xl lg:mx-auto px-3 sm:px-5 lg:px-8">
          {/* Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="mb-10 border-gold-200 bg-gold-50/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gold-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 mb-1">تنبيه مهم</h3>
                  <p className="text-navy-600 text-sm leading-relaxed">
                    يجب أن تكون جميع المستندات سارية المفعول. قد تطلب المؤسسة
                    مستندات إضافية حسب حالة كل متقدم. يرجى تجهيز نسخ أصلية مع نسخ
                    ملونة للمستندات.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Document Categories */}
          <div className="space-y-8">
            {requiredDocuments.map((category, index) => {
              const Icon = categoryIcons[index] || FileText;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gold-600" />
                      </div>
                      <h3 className="text-lg font-bold text-navy-900">
                        {category.category}
                      </h3>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {category.documents.map((doc, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-3 p-3 rounded-xl bg-navy-50/50 border border-navy-100"
                        >
                          <div className="w-2 h-2 rounded-full bg-gold-500 shrink-0" />
                          <span className="text-sm text-navy-700">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-navy-500 mb-4">
              جميع المستندات جاهزة؟ قدم طلبك الآن
            </p>
            <a
              href="/loan-application"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-bold text-lg shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 transition-all duration-300"
            >
              الانتقال إلى نموذج الطلب
            </a>
          </motion.div>
        </div>
      </Container>
    </>
  );
}
