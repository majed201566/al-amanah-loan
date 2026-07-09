"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/sections/PageHeader";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import { Target, Eye, Heart, Award, Shield, Users } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "النزاهة والشفافية",
    description:
      "نلتزم بأعلى معايير النزاهة والشفافية في جميع تعاملاتنا. لا رسوم مخفية، لا شروط مبهمة، كل شيء واضح منذ البداية.",
  },
  {
    icon: Heart,
    title: "التركيز على العميل",
    description:
      "عميلنا هو محور اهتمامنا. نصمم حلولنا التمويلية لتلبية احتياجاته الفعلية ونسعى دائماً لتجاوز توقعاته.",
  },
  {
    icon: Target,
    title: "الابتكار المستمر",
    description:
      "نستثمر في أحدث التقنيات المالية لتقديم خدمات أسرع وأكثر كفاءة. التحول الرقمي هو ركيزة أساسية في استراتيجيتنا.",
  },
  {
    icon: Award,
    title: "التميز في الخدمة",
    description:
      "نسعى للتميز في كل تفاصيل خدمتنا. من أول اتصال إلى آخر دفعة، نضمن تجربة استثنائية لعملائنا.",
  },
];

const timeline = [
  { year: "2010", title: "التأسيس", desc: "انطلاق شركة الأمانة للتمويل في النجف الأشرف" },
  { year: "2014", title: "التوسع", desc: "افتتاح فروع جديدة في بغداد والبصرة وكربلاء" },
  { year: "2018", title: "التحول الرقمي", desc: "إطلاق المنصة الإلكترونية وتطبيق الهاتف المحمول" },
  { year: "2022", title: "الريادة", desc: "تجاوزنا 10,000 عميل و 500 مليار دينار تمويلات ممنوحة" },
  { year: "2025", title: "الابتكار", desc: "إطلاق خدمات التمويل الفوري والموافقة الآلية خلال دقائق" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="من نحن"
        description="تعرف على قصة نجاح الأمانة للتمويل، رسالتنا، رؤيتنا، والقيم التي توجه عملنا"
        breadcrumb={[{ label: "من نحن" }]}
      />

      {/* Story */}
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gold-600 font-semibold text-sm mb-2 block">
              قصتنا
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
              أكثر من 15 عاماً من{" "}
              <span className="text-gradient-gold">الثقة والتميز</span>
            </h2>
            <div className="space-y-4 text-navy-600 leading-relaxed">
              <p>
                تأسست شركة الأمانة للتمويل في عام 2010 في مدينة النجف الأشرف،
                بهدف تقديم حلول تمويلية مبتكرة تلبي احتياجات المواطن العراقي
                وتدعم الاقتصاد الوطني.
              </p>
              <p>
                بدأنا بفريق صغير من 5 موظفين وفرع واحد، واليوم نفخر بوجود أكثر
                من 200 موظف و8 فروع تغطي المحافظات الرئيسية في العراق. نمت
                محفظتنا التمويلية لتتجاوز 500 مليار دينار عراقي.
              </p>
              <p>
                نضع ثقة عملائنا في مقدمة أولوياتنا، ونعمل بجد للحفاظ على سمعتنا
                كمؤسسة تمويلية رائدة تتمتع بالمصداقية والشفافية.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full blur-2xl" />
              <div className="text-center relative z-10 p-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <p className="text-5xl font-bold text-white mb-2">15+</p>
                <p className="text-gold-300 text-lg">عاماً من الخبرة</p>
                <p className="text-navy-300 mt-4 text-sm">
                  مرخصون ومعتمدون من البنك المركزي العراقي
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>

      {/* Mission & Vision */}
      <div className="bg-navy-900 py-16 sm:py-20">
        <Container>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/5 border-white/10 h-full">
                <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">رسالتنا</h3>
                <p className="text-navy-200 leading-relaxed">
                  توفير حلول تمويلية مبتكرة وسريعة تلبي احتياجات جميع شرائح
                  المجتمع العراقي، مع الالتزام بأعلى معايير الشفافية والأخلاقيات
                  المهنية، والمساهمة في دعم الاقتصاد الوطني وتحسين جودة الحياة.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 h-full">
                <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">رؤيتنا</h3>
                <p className="text-navy-200 leading-relaxed">
                  أن نكون المؤسسة التمويلية الأولى في العراق والأكثر ثقة، من
                  خلال تقديم تجربة تمويلية رقمية متكاملة، والتوسع في جميع
                  المحافظات، وبناء شراكات استراتيجية تدعم النمو المستدام.
                </p>
              </Card>
            </motion.div>
          </div>
        </Container>
      </div>

      {/* Values */}
      <Container>
        <div className="text-center mb-12">
          <span className="text-gold-600 font-semibold text-sm bg-gold-100 px-4 py-1.5 rounded-full">
            قيمنا
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mt-3">
            المبادئ التي توجه عملنا
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hover className="h-full text-center group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center group-hover:from-gold-400 group-hover:to-gold-500 transition-all duration-500">
                  <v.icon className="w-7 h-7 text-gold-600 group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{v.title}</h3>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {v.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>

      {/* Timeline */}
      <div className="bg-cream-dark/50">
        <Container>
          <div className="text-center mb-12">
            <span className="text-gold-600 font-semibold text-sm bg-gold-100 px-4 py-1.5 rounded-full">
              مسيرتنا
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mt-3">
              رحلتنا عبر السنوات
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 pb-8 relative"
              >
                {i < timeline.length - 1 && (
                  <div className="absolute right-[22px] top-12 w-0.5 h-full bg-gradient-to-b from-gold-400 to-transparent" />
                )}
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold shadow-lg shadow-gold-500/20">
                  {item.year}
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-navy-900 text-lg mb-1">
                    {item.title}
                  </h3>
                  <p className="text-navy-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </div>
    </>
  );
}
