import Link from "next/link";
import { siteConfig, navLinks, loanTypes } from "@/data/site";
import {
  Landmark,
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  MessageCircle,
  Link2,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      {/* Top Wave */}
      <div className="relative">
        <svg viewBox="0 0 1440 80" className="w-full h-auto fill-cream" preserveAspectRatio="none">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">الأمانة</h3>
                <p className="text-xs text-gold-400">للتمويل</p>
              </div>
            </div>
            <p className="text-navy-200 text-sm leading-relaxed mb-6">
              {siteConfig.description}
            </p>
            <div className="flex gap-2">
              {[
                { icon: Globe, href: siteConfig.social.facebook },
                { icon: Share2, href: siteConfig.social.twitter },
                { icon: MessageCircle, href: siteConfig.social.instagram },
                { icon: Link2, href: siteConfig.social.linkedin },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-navy-800 hover:bg-gold-500 flex items-center justify-center transition-all duration-300 group"
                >
                  <Icon className="w-4 h-4 text-navy-200 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-lg">روابط سريعة</h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-navy-200 hover:text-gold-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Loan Types */}
          <div>
            <h4 className="text-white font-bold mb-4 text-lg">أنواع القروض</h4>
            <ul className="space-y-2.5">
              {loanTypes.map((loan) => (
                <li key={loan.id}>
                  <Link
                    href="/loan-conditions"
                    className="text-navy-200 hover:text-gold-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                    {loan.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 text-lg">تواصل معنا</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="flex items-center gap-3 text-navy-200 hover:text-gold-400 transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                  <span dir="ltr">{siteConfig.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-3 text-navy-200 hover:text-gold-400 transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                  <span dir="ltr">{siteConfig.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-navy-200 text-sm">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span>{siteConfig.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-navy-400 text-xs">
            © {new Date().getFullYear()} الأمانة للتمويل. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/loan-conditions" className="text-navy-400 hover:text-gold-400 text-xs transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/loan-conditions" className="text-navy-400 hover:text-gold-400 text-xs transition-colors">
              الشروط والأحكام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
