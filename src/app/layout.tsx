import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "الأمانة للتمويل | Al-Amanah Finance",
  description:
    "حلول تمويلية متميزة تلبي احتياجاتك بأفضل الشروط وأسرع الإجراءات - Premium financing solutions tailored to your needs",
  keywords: "تمويل, قروض, العراق, النجف, قرض شخصي, قرض عقاري, تمويل مشاريع",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-navy-900 antialiased">
        <Providers>
          <Header />
          <main className="flex-1 pt-20 w-full min-w-0 max-w-full overflow-x-clip">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
