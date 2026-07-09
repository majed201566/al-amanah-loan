import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Stats from "@/components/sections/Stats";
import Testimonials from "@/components/sections/Testimonials";
import CTA from "@/components/sections/CTA";
import FAQSection from "@/components/sections/FAQSection";
import LoanTypesSection from "@/components/sections/LoanTypesSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LoanTypesSection />
      <Features />
      <Stats />
      <Testimonials />
      <FAQSection />
      <CTA />
    </>
  );
}
