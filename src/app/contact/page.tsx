"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/sections/PageHeader";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { siteConfig } from "@/data/site";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    label: "رقم الهاتف",
    value: siteConfig.phone,
    href: `tel:${siteConfig.phone}`,
    dir: "ltr" as const,
  },
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    dir: "ltr" as const,
  },
  {
    icon: MapPin,
    label: "العنوان",
    value: siteConfig.address,
  },
  {
    icon: Clock,
    label: "ساعات العمل",
    value: "الأحد - الخميس: 8:00 صباحاً - 4:00 مساءً",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <PageHeader
        title="اتصل بنا"
        description="نحن هنا للإجابة على استفساراتك. تواصل معنا بأي طريقة تناسبك"
        breadcrumb={[{ label: "اتصل بنا" }]}
      />

      <Container>
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-4">
            {contactInfo.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-gold-50 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gold-600" />
                    </div>
                    <div>
                      <p className="text-xs text-navy-400 mb-1">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-navy-900 font-medium hover:text-gold-600 transition-colors text-sm"
                          dir={item.dir}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-navy-900 font-medium text-sm">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-gold-50 to-gold-100 border-gold-200">
                <div className="flex items-start gap-4">
                  <MessageCircle className="w-10 h-10 text-gold-600" />
                  <div>
                    <p className="font-bold text-navy-900 mb-1">تحتاج مساعدة فورية؟</p>
                    <p className="text-navy-600 text-sm mb-3">
                      فريق خدمة العملاء جاهز للرد على استفساراتك عبر الواتساب
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center gap-2 text-sm font-medium text-gold-700"
                    >
                      راسلنا واتساب
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card padding="lg">
              <h3 className="text-xl font-bold text-navy-900 mb-6">
                أرسل رسالة
              </h3>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Send className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h4 className="text-xl font-bold text-navy-900 mb-2">
                    تم إرسال رسالتك بنجاح
                  </h4>
                  <p className="text-navy-500">
                    سنقوم بالرد عليك في أقرب وقت ممكن
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="الاسم الكامل" placeholder="أدخل اسمك الكامل" required />
                    <Input label="البريد الإلكتروني" type="email" placeholder="example@email.com" required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="رقم الهاتف" type="tel" placeholder="0770 000 0000" required />
                    <Input label="الموضوع" placeholder="موضوع الرسالة" required />
                  </div>
                  <Textarea label="الرسالة" placeholder="اكتب رسالتك هنا..." rows={5} required />
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    <Send className="w-5 h-5" />
                    إرسال الرسالة
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>
        </div>
      </Container>

      {/* Map Placeholder */}
      <div className="bg-navy-900">
        <Container>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="aspect-[21/9] max-w-4xl mx-auto rounded-3xl bg-navy-800 border border-white/10 flex items-center justify-center"
            >
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gold-400 mx-auto mb-3" />
                <p className="text-white font-bold text-lg">فروعنا</p>
                <p className="text-navy-300 text-sm">
                  النجف | بغداد | البصرة | كربلاء | بابل
                </p>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>
    </>
  );
}
