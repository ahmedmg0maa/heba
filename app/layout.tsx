import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AssistantMount } from "@/components/ai/assistant-mount"
import { FirebaseAnalytics } from "@/components/firebase-analytics"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://hebaelsharif.com").replace(/\/$/, "")

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "هبة الشريف | وعي وكوتشنج وبرامج عملية",
    template: "%s | هبة الشريف",
  },
  description:
    "الموقع الرسمي لهبة الشريف: جلسات 1:1، كورسات عملية، كتب في الوعي، وتجربة عربية هادئة تساعدكِ على العودة إلى ذاتك.",
  keywords: [
    "هبة الشريف",
    "كوتشنج",
    "جلسات فردية",
    "كورسات وعي",
    "كتب تطوير الذات",
    "تطوير الذات",
  ],
  authors: [{ name: "هبة الشريف" }],
  creator: "هبة الشريف",
  openGraph: {
    title: "هبة الشريف | مساحة هادئة لفهم نفسك بعمق واتزان",
    description: "جلسات فردية، كورسات عملية، وكتب تساعدكِ على الوضوح والاتزان.",
    url: siteUrl,
    siteName: "هبة الشريف",
    locale: "ar_EG",
    type: "website",
    images: ["/images/heba-banner.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "هبة الشريف",
    description: "مساحة هادئة لفهم نفسك بعمق واتزان.",
    images: ["/images/heba-banner.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#f5f0e7",
  width: "device-width",
  initialScale: 1,
}

const schema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "هبة الشريف",
  jobTitle: "مدربة وعي وتوجيه فردي",
  description: "مدربة وكاتبة متخصصة في الوعي بالذات.",
  url: siteUrl,
  image: `${siteUrl}/images/heba-banner.jpeg`,
  sameAs: [],
  worksFor: {
    "@type": "Organization",
    name: "هبة الشريف",
    url: siteUrl,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans text-[15px] sm:text-base">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
          {children}
          <AssistantMount />
          <Toaster />
          <FirebaseAnalytics />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
