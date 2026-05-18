import type { LucideIcon } from "lucide-react"
import { BookOpen, Layers3, MessageCircleHeart, UsersRound } from "lucide-react"

export const brand = {
  arName: "هبة الشريف",
  enName: "Heba El Sharif",
  tagline: "مساحة هادئة للوعي",
  shortTagline: "رحلة وعي تعيدكِ إلى ذاتك",
  email: "hello@hebaelsharif.com",
  phone: "+20 100 000 0000",
  whatsapp: "https://wa.me/201000000000",
  location: "القاهرة، مصر · جلسات أونلاين حول العالم",
  logo: "/images/heba-logo.webp",
  banner: "/images/heba-banner.jpeg",
}

export const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "من هي هبة", href: "/about" },
  { label: "الخدمات", href: "/services" },
  { label: "الكورسات", href: "/courses" },
  { label: "الكتب", href: "/books" },
  { label: "المقالات", href: "/blog" },
  { label: "تواصل", href: "/contact" },
]

export type Service = {
  id: string
  title: string
  icon: LucideIcon
  href: string
}

export const services: Service[] = [
  { id: "coaching", title: "جلسات فردية 1:1", icon: MessageCircleHeart, href: "/booking?service=coaching" },
  { id: "workshops", title: "ورش وعي تفاعلية", icon: UsersRound, href: "/contact" },
  { id: "courses", title: "كورسات عملية", icon: Layers3, href: "/courses" },
  { id: "books", title: "كتب ودلائل", icon: BookOpen, href: "/books" },
]

export const journeySteps = [
  { title: "اسمعي صوتك", text: "ابدئي بسؤال بسيط: ما الذي يحدث داخلك الآن؟" },
  { title: "افهمي النمط", text: "اربطي بين المشاعر والقرارات والعلاقات التي تتكرر." },
  { title: "اختاري خطوة", text: "حوّلي الوعي إلى فعل صغير قابل للتطبيق في يومك." },
]
