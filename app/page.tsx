import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { TrustSection } from "@/components/home/trust-section"
import { StartHereSection } from "@/components/home/start-here-section"
import { ServicesPreview } from "@/components/home/services-preview"
import { CoursesPreview } from "@/components/home/courses-preview"
import { BooksPreview } from "@/components/home/books-preview"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { FinalCtaSection } from "@/components/home/final-cta-section"

export const dynamic = "force-dynamic"
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hebaelsharif.com"

export const metadata: Metadata = {
  title: "هبة الشريف | منصة وعي وتوجيه عملي",
  description:
    "منصة عربية راقية للجلسات الفردية 1:1 والكورسات والكتب الرقمية. رحلة هادئة نحو الوضوح والاتزان بخطوات عملية.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "هبة الشريف | منصة وعي وتوجيه عملي",
    description: "جلسات فردية وكورسات وكتب رقمية بإدارة احترافية وتجربة عربية هادئة.",
    url: siteUrl,
    images: ["/images/heba-banner.jpeg"],
  },
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustSection />
        <StartHereSection />
        <ServicesPreview />
        <CoursesPreview />
        <BooksPreview />
        <TestimonialsSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  )
}
