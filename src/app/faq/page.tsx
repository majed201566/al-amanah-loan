"use client";

import PageHeader from "@/components/sections/PageHeader";
import FAQSection from "@/components/sections/FAQSection";
import CTA from "@/components/sections/CTA";

export default function FAQPage() {
  return (
    <>
      <PageHeader
        title="الأسئلة الشائعة"
        description="إجابات على جميع أسئلتك حول خدمات التمويل من الأمانة"
        breadcrumb={[{ label: "الأسئلة الشائعة" }]}
      />
      <FAQSection />
      <CTA />
    </>
  );
}
