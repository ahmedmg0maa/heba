import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  Brain,
  CalendarHeart,
  Compass,
  HeartHandshake,
  Layers3,
  MessageCircleHeart,
  MoonStar,
  Sparkles,
  Target,
  Users,
} from "lucide-react"

export const brand = {
  name: "هبة الشريف",
  englishName: "Heba El Sharif",
  tagline: "نقطة وعي",
  promise: "رحلة وعي تعيدك إلى ذاتك",
  shortBio:
    "لايف كوتش معتمدة، كاتبة ومدربة وعي بالذات. ترافقك في رحلة هادئة لفهم النفس، وفك الأنماط المتكررة، واتخاذ قرارات أكثر اتزانًا.",
  whatsapp: "+201000000000",
  email: "hello@hebaelsharif.com",
  location: "القاهرة، مصر · جلسات أونلاين حول العالم",
}

export const navItems = [
  { name: "الرئيسية", href: "/" },
  { name: "من هي هبة", href: "/about" },
  { name: "الخدمات", href: "/services" },
  { name: "الكورسات", href: "/courses" },
  { name: "الكتب", href: "/books" },
  { name: "المقالات", href: "/blog" },
  { name: "تواصل", href: "/contact" },
]

export const stats = [
  { value: "1:1", label: "جلسات فردية عميقة" },
  { value: "Arabic", label: "تجربة عربية هادئة" },
  { value: "Online", label: "خدمات متاحة أونلاين" },
  { value: "Premium", label: "تجربة شخصية راقية" },
]

export type Service = {
  id: string
  title: string
  kicker: string
  description: string
  duration: string
  price: string
  href: string
  icon: LucideIcon
  featured?: boolean
  points: string[]
}

export const services: Service[] = [
  {
    id: "coaching",
    title: "جلسات كوتشنج فردية 1:1",
    kicker: "مساحة شخصية عميقة",
    description: "جلسات خاصة لفهم المشاعر، تفكيك الأنماط المتكررة، وبناء خطوات عملية واضحة تناسب واقعك الحالي.",
    duration: "60 أو 90 دقيقة",
    price: "1200 / 1500 ج.م",
    href: "/booking?service=coaching",
    icon: MessageCircleHeart,
    featured: true,
    points: ["جلسة 60 دقيقة بسعر 1200 ج.م", "جلسة 90 دقيقة بسعر 1500 ج.م", "تأكيد الموعد يتم برسالة خاصة بعد الحجز"],
  },
  {
    id: "workshops",
    title: "ورش وعي تفاعلية",
    kicker: "تعلّم جماعي آمن",
    description: "ورش حية أونلاين أو حضوري حول العلاقات، الحدود، وتقدير الذات بأسلوب عملي وإنساني.",
    duration: "من ساعتين إلى يوم كامل",
    price: "حسب موضوع الورشة",
    href: "/contact",
    icon: Users,
    points: ["تمارين عملية", "نقاشات موجّهة", "ملفات عمل"],
  },
  {
    id: "courses",
    title: "كورسات وبرامج مسجلة",
    kicker: "تعلّم وفق وتيرتك",
    description: "برامج تعليمية منظمة تجمع بين الوعي، التمارين، والتطبيق اليومي داخل مسار واضح.",
    duration: "4 - 8 أسابيع",
    price: "حسب البرنامج",
    href: "/courses",
    icon: Layers3,
    points: ["دروس قصيرة وعميقة", "تمارين Reflection", "وصول دائم للمحتوى"],
  },
  {
    id: "books",
    title: "كتب وأدلة عملية",
    kicker: "قراءة تعيد ترتيب الداخل",
    description: "كتب تساعدك على فهم نفسك بعمق، واستعادة الهدوء الداخلي، وفتح أسئلة أهم في رحلتك.",
    duration: "نسخ رقمية",
    price: "حسب الإصدار",
    href: "/books",
    icon: BookOpen,
    points: ["لغة رقيقة وعميقة", "أسئلة وتمارين", "مناسبة كبداية رحلة"],
  },
]

export const transformation = [
  { before: "تشتت داخلي", after: "وضوح واتصال بالذات", icon: Compass },
  { before: "خوف من الاختيار", after: "قرار نابع من وعي", icon: Target },
  { before: "استنزاف علاقات", after: "حدود صحية وحنان", icon: HeartHandshake },
  { before: "ضجيج أفكار", after: "سلام عملي يومي", icon: MoonStar },
]

export const startHereSteps = [
  { title: "قيّمي احتياجك الحالي", text: "هل تحتاجين جلسة فردية؟ كورس منظم؟ أم كتاب كبداية خفيفة؟", href: "/services" },
  { title: "ابدئي بخطوة واحدة", text: "اختيار واحد واضح اليوم أفضل من تأجيل كبير بلا حركة.", href: "/booking" },
  { title: "ثبتي الإيقاع", text: "التحول الهادئ يأتي من خطوات صغيرة تتكرر بوعي.", href: "/courses" },
]

export const testimonials = [
  {
    name: "إحدى العميلات",
    role: "جلسات 1:1",
    text: "خرجت من الجلسة شايفة الصورة أوضح، والأهم إن عندي خطوات أقدر أبدأ بها فورًا.",
  },
  {
    name: "عميلة",
    role: "برنامج تدريبي",
    text: "الرحلة كانت منظمة وهادئة وساعدتني أرتب أفكاري بدون ضغط.",
  },
  {
    name: "قارئة",
    role: "كتاب رقمي",
    text: "أسلوب الكتاب بسيط وعميق وساعدني أتكلم مع نفسي بهدوء أكبر.",
  },
]

export const posts = [
  {
    id: "why-self-awareness-hurts",
    title: "لماذا يؤلم الوعي أحيانًا؟",
    excerpt: "الوعي يفتح بابًا كان مغلقًا طويلًا، لكنه الباب الذي يقودك أخيرًا إلى نفسك.",
    category: "وعي",
    readTime: "5 دقائق",
    date: "2026-01-10",
  },
  {
    id: "decision-without-fear",
    title: "كيف تختارين بدون رعب؟",
    excerpt: "القرار لا يحتاج يقينًا كاملًا، لكنه يحتاج صدقًا وخطة صغيرة قابلة للتنفيذ.",
    category: "قرارات",
    readTime: "6 دقائق",
    date: "2026-01-22",
  },
  {
    id: "quiet-collapse",
    title: "علامات الانهيار الصامت",
    excerpt: "حين تتراكم الأشياء الصغيرة يبدأ الداخل بإرسال رسائل هادئة لا يجب تجاهلها.",
    category: "مشاعر",
    readTime: "7 دقائق",
    date: "2026-02-04",
  },
]

type FaqItem = {
  q: string
  a: string
  question: string
  answer: string
}

const faqSeed = [
  { question: "كيف أبدأ الحجز؟", answer: "اختاري مدة الجلسة واليوم المناسب لكِ، وستظهر لكِ المواعيد المتاحة مباشرة." },
  { question: "هل يمكن استخدام كود خصم؟", answer: "نعم، يمكنكِ إدخال الكود الخاص أثناء الحجز وسيتم تطبيقه تلقائيًا عند صحته." },
  { question: "كيف أتأكد من تفاصيل الموعد؟", answer: "بعد إرسال الطلب ستصلك رسالة تأكيد بكل التفاصيل." },
]

export const faqs: FaqItem[] = faqSeed.map((item) => ({
  ...item,
  q: item.question,
  a: item.answer,
}))

export const values = [
  {
    icon: Brain,
    title: "وضوح",
    description: "نبحث عن الجذر لا عن المسكنات المؤقتة، لتظهر الصورة كما هي.",
  },
  {
    icon: HeartHandshake,
    title: "احتواء",
    description: "مساحة بلا أحكام، تسمح للصوت الداخلي أن يظهر بأمان.",
  },
  {
    icon: CalendarHeart,
    title: "استمرارية",
    description: "خطوات صغيرة قابلة للتطبيق تحافظ على أثر الرحلة بعد الجلسة.",
  },
  {
    icon: Sparkles,
    title: "رقي",
    description: "تجربة عربية هادئة بعناية بصرية ومحتوى عميق.",
  },
]

export const mediaItems = [
  { type: "بودكاست", title: "كيف نسمع أنفسنا بوضوح؟", outlet: "وعي بودكاست" },
  { type: "ندوة", title: "الحدود الصحية في العلاقات", outlet: "مجتمع نقطة وعي" },
  { type: "مقال", title: "الانهيار الصامت في حياة المرأة", outlet: "منصة عربية نفسية" },
]
