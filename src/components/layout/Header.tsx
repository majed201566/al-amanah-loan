"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/site";
import {
  Menu,
  X,
  Phone,
  Landmark,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Hide header on full-screen layouts (admin has its own nav)
  const isFullScreen = pathname.startsWith("/admin");
  if (isFullScreen) return null;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "glass py-3 shadow-lg shadow-navy-900/5"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/25 group-hover:shadow-gold-500/40 transition-all duration-300">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-navy-900 leading-tight">
                الأمانة
              </span>
              <span className="text-xs text-gold-600 font-medium leading-tight">
                للتمويل
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                    isActive
                      ? "text-navy-900 bg-gold-100/80"
                      : "text-navy-600 hover:text-navy-900 hover:bg-navy-50/50"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold-500 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions - No Auth, Direct Loan Application */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+9647801234567"
              className="flex items-center gap-2 text-sm text-navy-600 hover:text-gold-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span dir="ltr">0770 123 4567</span>
            </a>

            <Link href="/loan-application">
              <Button variant="primary" size="sm">
                قدم طلبك الآن
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-white/80 border border-gold-200/50 text-navy-800"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-80 bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gold-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <Landmark className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-navy-900">الأمانة للتمويل</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-navy-50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "block px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          pathname === link.href
                            ? "bg-gold-50 text-gold-700 border border-gold-200"
                            : "text-navy-700 hover:bg-navy-50"
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  <Link href="/loan-application" className="block">
                    <Button variant="primary" className="w-full justify-center">
                      قدم طلبك الآن
                    </Button>
                  </Link>
                  <div className="pt-4 border-t border-navy-100">
                    <a
                      href="tel:+9647801234567"
                      className="flex items-center justify-center gap-2 text-sm text-navy-600 hover:text-gold-600 py-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span dir="ltr">0770 123 4567 - اتصل بنا</span>
                    </a>
                  </div>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
