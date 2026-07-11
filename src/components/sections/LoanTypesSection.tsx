"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { loanTypes } from "@/data/site";
import { ArrowLeft, User, Home, Briefcase, Car, Check } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  User,
  Home,
  Briefcase,
  Car,
};

export default function LoanTypesSection() {
  return (
    <Container className="bg-white">
      <SectionHeading
        label="منتجاتنا التمويلية"
        title="حلول تمويلية تناسب احتياجاتك"
        description="اختر من بين مجموعة منتجاتنا التمويلية المصممة خصيصاً لتلبية متطلباتك"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loanTypes.map((loan, i) => {
          const Icon = iconMap[loan.icon] || User;
          return (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card hover className="h-full flex flex-col group">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${loan.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="font-bold text-navy-900 mb-2 text-lg">
                  {loan.title}
                </h3>
                <p className="text-navy-500 text-sm leading-relaxed mb-4 flex-1">
                  {loan.description}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-navy-400">المبلغ:</span>
                    <span className="text-navy-700 font-medium" dir="ltr">
                      {loan.amount} د.ع
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-400">المدة:</span>
                    <span className="text-navy-700">{loan.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-400">الفائدة:</span>
                    <span className="text-gold-600 font-medium">
                      {loan.rate}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1.5 mb-5">
                  {loan.features.slice(0, 2).map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-navy-500">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                <Link href="/loan-application" className="mt-auto">
                  <Button variant="outline" size="sm" className="w-full">
                    قدم طلبك
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Container>
  );
}
