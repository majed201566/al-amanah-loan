"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/site";
import { useAuth } from "@/context/AuthContext";
import {
  Menu, X, Phone, Landmark, User, LogOut, LayoutDashboard, ChevronDown,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try { await logout(); setUserMenuOpen(false); router.push("/"); } catch {}
  };

  const isFullScreen =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/applications");
  if (isFullScreen) return null;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "glass py-2 shadow-lg shadow-navy-900/5" : "bg-transparent py-4"
        )}
      >
        <div className="w-full lg:max-w-7xl lg:mx-auto px-3 sm:px-5 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/25 group-hover:shadow-gold-500/40 transition-all duration-300">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-navy-900 leading-tight">الأمانة</span>
              <span className="text-xs text-gold-600 font-medium leading-tight">للتمويل</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  className={cn("relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                    isActive ? "text-navy-900 bg-gold-100/80" : "text-navy-600 hover:text-navy-900 hover:bg-navy-50/50")}>
                  {link.label}
                  {isActive && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold-500 rounded-full" transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+9647801234567" className="flex items-center gap-2 text-sm text-navy-600 hover:text-gold-600 transition-colors">
              <Phone className="w-4 h-4" /><span dir="ltr">0770 123 4567</span>
            </a>
            {!loading && (<>
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-navy-200 hover:border-gold-300 transition-all text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-xs font-bold">
                      {(user?.displayName || user?.email || "م").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-navy-700 font-medium max-w-[100px] truncate">{user?.displayName || "حسابي"}</span>
                    <ChevronDown className={`w-4 h-4 text-navy-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-navy-100 overflow-hidden z-50">
                        <div className="p-3 border-b border-navy-50"><p className="text-sm font-medium text-navy-900 truncate">{user?.displayName || "مستخدم"}</p><p className="text-xs text-navy-400 truncate" dir="ltr">{user?.email || ""}</p></div>
                        <div className="p-1.5">
                          <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy-600 hover:bg-navy-50 transition-all"><LayoutDashboard className="w-4 h-4" />لوحة التحكم</Link>
                          <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy-600 hover:bg-navy-50 transition-all"><User className="w-4 h-4" />الملف الشخصي</Link>
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all"><LogOut className="w-4 h-4" />تسجيل الخروج</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (<>
                <Link href="/login"><Button variant="outline" size="sm">تسجيل الدخول</Button></Link>
                <Link href="/register"><Button variant="primary" size="sm">افتح حساب</Button></Link>
              </>)}
            </>)}
            <Link href="/loan-application"><Button variant={isAuthenticated ? "primary" : "goldOutline"} size="sm">قدم طلبك الآن</Button></Link>
          </div>

          <button className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-white/80 border border-gold-200/50 text-navy-800" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gold-100">
                <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center"><Landmark className="w-4 h-4 text-white" /></div><span className="font-bold text-navy-900">الأمانة للتمويل</span></div>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-navy-50"><X className="w-5 h-5" /></button>
              </div>
              {isAuthenticated && user && (
                <div className="p-4 border-b border-navy-50 bg-navy-50/50">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold">{(user.displayName || user.email || "م").charAt(0).toUpperCase()}</div><div><p className="font-medium text-navy-900 text-sm">{user.displayName || "مستخدم"}</p><p className="text-xs text-navy-400 truncate" dir="ltr">{user.email || ""}</p></div></div>
                </div>
              )}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.div key={link.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link href={link.href} className={cn("block px-4 py-3 rounded-xl text-sm font-medium transition-all", pathname === link.href ? "bg-gold-50 text-gold-700 border border-gold-200" : "text-navy-700 hover:bg-navy-50")}>{link.label}</Link>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {isAuthenticated ? (<>
                    <Link href="/dashboard" className="block"><Button variant="outline" className="w-full justify-center"><LayoutDashboard className="w-4 h-4" />لوحة التحكم</Button></Link>
                    <Link href="/profile" className="block"><Button variant="ghost" className="w-full justify-center"><User className="w-4 h-4" />الملف الشخصي</Button></Link>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-all"><LogOut className="w-4 h-4" />تسجيل الخروج</button>
                  </>) : (<>
                    <Link href="/login" className="block"><Button variant="outline" className="w-full justify-center">تسجيل الدخول</Button></Link>
                    <Link href="/register" className="block"><Button variant="primary" className="w-full justify-center">إنشاء حساب</Button></Link>
                  </>)}
                  <Link href="/loan-application" className="block"><Button variant="primary" className="w-full justify-center">قدم طلبك الآن</Button></Link>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
