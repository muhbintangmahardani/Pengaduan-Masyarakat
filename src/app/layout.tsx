import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { PageTitleUpdater } from "@/components/common/PageTitleUpdater";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Jalan Baik",
    default: "Jalan Baik | Jalan Lebih Baik, Bersama",
  },
  description:
    "Platform transparansi layanan pengaduan dan perbaikan fasilitas jalan terintegrasi.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${manrope.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#f8faf9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <PageTitleUpdater />
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
