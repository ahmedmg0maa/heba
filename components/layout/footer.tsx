import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react"
import { brand, navItems, services } from "@/data/site"

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com", icon: Instagram },
  { name: "Facebook", href: "https://facebook.com", icon: Facebook },
  { name: "YouTube", href: "https://youtube.com", icon: Youtube },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-card" dir="rtl">
      <div className="absolute -right-24 top-12 size-52 rounded-full bg-primary/7 blur-lg" />
      <div className="absolute -bottom-24 left-0 size-56 rounded-full bg-accent/8 blur-lg" />

      <div className="container-brand relative py-16">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative size-16 overflow-hidden rounded-3xl bg-[var(--cream)] ring-1 ring-border">
                <Image src={brand.logo} alt={brand.arName} fill sizes="64px" className="object-contain p-1" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">{brand.arName}</p>
                <p className="text-sm font-medium text-accent">{brand.tagline}</p>
              </div>
            </Link>
            <p className="mt-6 max-w-lg text-sm leading-8 text-muted-foreground">
              منصة عربية هادئة تجمع بين الجلسات الفردية، البرامج العملية، والكتب المختارة بعناية لتمنحك بداية أوضح وخطوات أكثر اتزانًا.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/60 text-foreground transition hover:-translate-y-1 hover:border-accent hover:text-accent"
                  aria-label={social.name}
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground">روابط الموقع</h3>
            <ul className="space-y-3">
              {navItems.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground">ابدئي من هنا</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.id}>
                  <Link href={service.href} className="text-sm text-muted-foreground transition hover:text-accent">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground">تواصل معنا</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <a href={`mailto:${brand.email}`} className="flex items-center gap-3 transition hover:text-accent">
                  <Mail className="size-4" />
                  <span>{brand.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={brand.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition hover:text-accent"
                >
                  <Phone className="size-4" />
                  <span>واتساب للحجز والاستفسار</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 size-4" />
                <span>{brand.location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-center text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.arName}. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition hover:text-accent">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="transition hover:text-accent">
              الشروط والأحكام
            </Link>
            <Link href="/refund-policy" className="transition hover:text-accent">
              سياسة الاسترجاع
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
