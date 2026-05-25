export const dynamic = 'force-dynamic'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BrandDivider from '@/components/brand/BrandDivider'
import BrandMark from '@/components/brand/BrandMark'
import BrandOrnament from '@/components/brand/BrandOrnament'
import MotionReveal from '@/components/experience/MotionReveal'
import PremiumButton from '@/components/ui/PremiumButton'
import PremiumBadge from '@/components/ui/PremiumBadge'
import PremiumSection from '@/components/ui/PremiumSection'
import ImageSlot from '@/components/ui/ImageSlot'
import FAQSection from '@/components/marketing/FAQSection'
import LeadMagnet from '@/components/marketing/LeadMagnet'
import PremiumAssessment from '@/components/marketing/PremiumAssessment'

const trustStats = [
  { value: '+7', label: 'سنوات من الخبرة والتأثير' },
  { value: '+120', label: 'رحلة طلبت وضوحها' },
  { value: '4.9/5', label: 'تقييم المستفيدات' },
  { value: '+50k', label: 'متابعة حول العالم' },
]

const featuredCourses = [
  {
    title: 'إدارة المشاعر والقلق',
    promise: 'دورة عملية تساعدك على فهم مشاعرك وتهدئة الداخل بخطوات قابلة للتطبيق.',
    lessons: '12 درسًا',
    price: '599 ر.س',
    badge: 'الأكثر طلبًا',
    variant: 'course' as const,
  },
  {
    title: 'التعافي من العلاقات السامة',
    promise: 'تعلّمي كيف تستعيدين حدودك وهدوءك بعد علاقة استنزفت طاقتك.',
    lessons: '18 درسًا',
    price: '699 ر.س',
    badge: 'رحلة عميقة',
    variant: 'session' as const,
  },
  {
    title: 'رحلة إلى الذات',
    promise: 'مسار هادئ لاكتشاف احتياجاتك، قيمك، وصوتك الداخلي الحقيقي.',
    lessons: '10 دروس',
    price: '499 ر.س',
    badge: 'بداية مثالية',
    variant: 'brand' as const,
  },
]

const featuredBooks = [
  {
    title: 'رحلتك نحو حياة أكثر وعيًا',
    subtitle: 'دليل عملي للعودة إلى النفس بخطوات هادئة.',
    price: '69 ر.س',
    image: '/images/brand/reference/book-journey-awareness.jpeg',
  },
  {
    title: 'الانهيار الصامت',
    subtitle: 'رحلتك من الاختباء إلى الوجود.',
    price: '89 ر.س',
    image: '/images/brand/reference/book-silent-bloom.jpeg',
  },
  {
    title: 'نقطة وعي',
    subtitle: 'مساحات تأمل قصيرة تعيدك إلى بصيرتك.',
    price: '49 ر.س',
    image: '',
  },
]

const pathCards = [
  {
    title: 'ابدئي بجلسة فردية',
    text: 'لو لديك سؤال محدد، علاقة مرهقة، أو قرار يحتاج مساحة تفكير آمنة.',
    href: '/booking',
    cta: 'احجزي الآن',
    icon: '✦',
  },
  {
    title: 'اختاري كورسًا',
    text: 'لو تريدين مسارًا منظمًا تتعلمين فيه على مهل وتعودين له داخل حسابك.',
    href: '/courses',
    cta: 'تصفحي الدورات',
    icon: '☉',
  },
  {
    title: 'افتحي كتابًا',
    text: 'لو تحتاجين رفيقًا هادئًا للقراءة والتأمل والكتابة في وقتك الخاص.',
    href: '/books',
    cta: 'شاهدي الكتب',
    icon: '❋',
  },
]

const transformationCards = [
  { from: 'ضجيج داخلي', to: 'لغة واضحة لما تشعرين به' },
  { from: 'استنزاف في العلاقات', to: 'حدود أكثر رحمة واتزانًا' },
  { from: 'خوف من البداية', to: 'خطوة صغيرة قابلة للتنفيذ' },
  { from: 'تشتت في الاختيار', to: 'مسار يناسب مرحلتك الحالية' },
]

const communityNotes = [
  'محتوى عربي عميق يحترم خصوصيتك وسرعة رحلتك.',
  'جلسات وكورسات وكتب داخل تجربة واحدة لا تشتتك.',
  'لوحة شخصية تحفظ تقدمك وطلباتك وجلساتك بوضوح.',
]

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="min-h-screen pt-20">
        <section className="container-wide px-2 pb-4 pt-4 sm:px-0">
          <div className="premium-glow-border botanical-frame paper-texture relative overflow-hidden rounded-[2rem] border border-sand bg-ivory/88 shadow-premium lg:rounded-[2.75rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgb(var(--color-gold)/.18),transparent_22rem),radial-gradient(circle_at_15%_12%,rgb(var(--color-petrol)/.10),transparent_22rem)]" />
            <div className="ambient-orb ambient-orb-gold right-4 top-10 h-64 w-64" />
            <div className="ambient-orb ambient-orb-petrol bottom-4 left-10 h-80 w-80" />
            <div className="relative grid min-h-[620px] items-center gap-8 p-5 md:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:p-10 xl:p-14">
              <MotionReveal className="order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -right-4 top-8 hidden h-[420px] w-[420px] rounded-full border border-gold/35 lg:block" />
                  <div className="relative overflow-hidden rounded-[2.4rem] border border-sand bg-cream/70 p-4 shadow-botanical">
                    <ImageSlot
                      variant="hero"
                      ratio="free"
                      label="صورة هادئة لهبة أو مساحة الجلسة"
                      hint="يمكن استبدال هذه المساحة بصورة حقيقية لاحقًا."
                      className="min-h-[390px] rounded-[2rem]"
                      showLabel={false}
                    />
                    <div className="absolute inset-4 rounded-[2rem] bg-[linear-gradient(90deg,rgb(var(--color-cream)/.14),transparent_36%,rgb(var(--color-ivory)/.42))]" />
                    <div className="absolute bottom-8 left-8 right-8 rounded-[1.8rem] border border-white/55 bg-ivory/86 p-5 shadow-soft backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <BrandOrnament className="scale-75" />
                        <span className="mini-label">نقطة وعي</span>
                      </div>
                      <h2 className="mt-3 text-2xl font-black leading-tight text-petrol">مساحة هادئة لاكتشاف رسالتك، واختيار طريقك بوعي.</h2>
                    </div>
                  </div>
                </div>
              </MotionReveal>

              <MotionReveal delay={0.08} className="order-1 lg:order-2">
                <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-right">
                  <div className="mx-auto mb-6 flex justify-center lg:mx-0 lg:justify-start">
                    <BrandMark size="lg" showText={false} />
                  </div>
                  <PremiumBadge variant="gold">رحلتك نحو حياة أكثر وعيًا واتزانًا</PremiumBadge>
                  <h1 className="mt-6 text-balance text-5xl font-black leading-[1.25] text-charcoal md:text-7xl">
                    استثمري في نفسك
                    <span className="mt-2 block text-petrol">وابني الحياة التي تستحقينها</span>
                  </h1>
                  <p className="mx-auto mt-6 max-w-2xl text-base leading-9 text-warm-gray md:text-lg lg:mx-0">
                    دورات عميقة، كتب ملهمة، وجلسات خاصة تساعدك على فهم النفس، الشفاء، وتحقيق التوازن في كل جوانب حياتك.
                  </p>
                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                    <PremiumButton href="/courses" size="lg" className="mobile-full-cta">تصفحي الدورات</PremiumButton>
                    <PremiumButton href="/start-here" size="lg" variant="outline" className="mobile-full-cta">استكشفي المحتوى المجاني</PremiumButton>
                  </div>

                  <div className="mt-10 grid gap-3 rounded-[1.75rem] border border-sand bg-ivory/80 p-3 shadow-soft backdrop-blur md:grid-cols-4">
                    {trustStats.map((stat) => (
                      <div key={stat.label} className="border-sand px-4 py-3 text-center md:border-l last:md:border-l-0">
                        <strong className="latin-numerals block text-2xl font-black text-petrol">{stat.value}</strong>
                        <span className="mt-1 block text-xs font-bold leading-5 text-warm-gray">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </MotionReveal>
            </div>
          </div>
        </section>

        <section className="container-wide grid gap-4 px-2 pb-5 sm:px-0 lg:grid-cols-[1.05fr_0.78fr_0.9fr]">
          <HomePanel title="دورات مميزة" href="/courses" action="عرض جميع الدورات">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <FeaturedCourseCard key={course.title} {...course} />
              ))}
            </div>
          </HomePanel>

          <HomePanel title="كتب مميزة" href="/books" action="عرض جميع الكتب">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {featuredBooks.map((book) => (
                <FeaturedBookCard key={book.title} {...book} />
              ))}
            </div>
          </HomePanel>

          <HomePanel title="جلسات خاصة" href="/booking" action="عرض جميع الجلسات">
            <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr] lg:grid-cols-[0.9fr_1.1fr]">
              <ImageSlot
                variant="session"
                ratio="free"
                label="صورة الجلسات"
                hint="مساحة لصورة هادئة أو جلسة حقيقية لاحقًا."
                className="min-h-[250px] rounded-[1.75rem]"
                showLabel={false}
              />
              <div className="rounded-[1.75rem] border border-sand bg-cream/70 p-6">
                <p className="mini-label">جلسات فردية</p>
                <h3 className="mt-4 text-2xl font-black text-charcoal">جلسة خاصة 1:1 مع هبة الشريف</h3>
                <p className="mt-4 text-sm leading-8 text-warm-gray">مساحة آمنة لفهم سؤال محدد، علاقة مرهقة، أو قرار يحتاج وعيًا وهدوءًا.</p>
                <ul className="mt-5 space-y-2 text-sm font-bold text-warm-gray">
                  <li>✓ اختيار موعد واضح بدون تكرار</li>
                  <li>✓ ملخص حجز قبل التأكيد</li>
                  <li>✓ متابعة حالة الجلسة داخل حسابك</li>
                </ul>
                <PremiumButton href="/booking" variant="burgundy" className="mt-6 w-full">احجزي جلستك الآن</PremiumButton>
              </div>
            </div>
          </HomePanel>
        </section>

        <section className="container-premium py-14">
          <PremiumSection
            eyebrow="اختاري مسارك"
            title="ثلاثة أبواب هادئة تقودك إلى بداية مناسبة"
            description="لا تحتاجين أن تبدئي من كل شيء. اختاري أقرب مسار لاحتياجك الآن، ثم اتركي التجربة تقودك خطوة بخطوة."
            align="center"
            showDivider
          >
            <div className="grid gap-5 md:grid-cols-3">
              {pathCards.map((path, index) => (
                <MotionReveal key={path.title} delay={index * 0.06}>
                  <Link href={path.href} className="group block h-full rounded-[2rem] border border-sand bg-ivory/90 p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-premium">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-2xl text-petrol">{path.icon}</span>
                    <h3 className="mt-6 text-2xl font-black text-charcoal transition group-hover:text-petrol">{path.title}</h3>
                    <p className="mt-3 text-sm leading-8 text-warm-gray">{path.text}</p>
                    <span className="mt-6 inline-flex rounded-full bg-petrol px-5 py-2 text-xs font-black text-ivory transition group-hover:bg-gold group-hover:text-deep-teal">{path.cta}</span>
                  </Link>
                </MotionReveal>
              ))}
            </div>
          </PremiumSection>
        </section>

        <section className="brand-quiet-divider border-y border-sand bg-ivory/58">
          <div className="container-premium grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <MotionReveal>
              <div className="luxury-shell rounded-[2.5rem] p-6">
                <ImageSlot
                  variant="portrait"
                  ratio="portrait"
                  label="صورة هبة الشريف"
                  hint="توضع هنا صورة شخصية احترافية لاحقًا."
                  className="mx-auto max-w-sm"
                />
              </div>
            </MotionReveal>

            <MotionReveal delay={0.08}>
              <p className="mini-label">مرحبًا، أنا هبة الشريف</p>
              <h2 className="mt-5 text-balance text-4xl font-black leading-tight text-charcoal md:text-6xl">مدربة حياة وكاتبة ترافقك نحو وعي أعمق بذاتك.</h2>
              <p className="mt-6 max-w-2xl text-base leading-10 text-warm-gray">
                أؤمن أن التغيير الحقيقي لا يبدأ بالضغط على النفس، بل بفهمها. هنا تجدين لغة هادئة، أدوات عملية، ومسارات تراعي إنسانيتك وخصوصيتك.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <IdentityPill title="نقطة وعي" text="رمز الوعي والبصيرة" />
                <IdentityPill title="رحلة آمنة" text="وتيرة تحترم مرحلتك" />
                <IdentityPill title="عمق عملي" text="تطبيق لا شعارات" />
              </div>
              <PremiumButton href="/about" variant="outline" className="mt-8">تعرفي على قصتي</PremiumButton>
            </MotionReveal>
          </div>
        </section>

        <section className="container-premium py-16">
          <PremiumSection
            eyebrow="ما الذي يتغير؟"
            title="ليست وعودًا سريعة، بل انتقالات صغيرة تشعرين بها"
            description="كل جلسة وكتاب وكورس مصمم ليساعدك على رؤية خطوة واحدة أوضح بدل حمل الطريق كله مرة واحدة."
          >
            <div className="grid gap-4 md:grid-cols-4">
              {transformationCards.map((item, index) => (
                <MotionReveal key={item.from} delay={index * 0.05}>
                  <div className="brand-rich-card h-full rounded-[2rem] p-6">
                    <span className="latin-numerals text-xs font-black text-gold">0{index + 1}</span>
                    <p className="mt-5 text-sm font-black text-warm-gray">من: {item.from}</p>
                    <p className="mt-3 text-xl font-black leading-8 text-petrol">إلى: {item.to}</p>
                  </div>
                </MotionReveal>
              ))}
            </div>
          </PremiumSection>
        </section>

        <section className="container-premium pb-16">
          <PremiumAssessment />
        </section>

        <section className="brand-quiet-divider border-y border-sand bg-ivory/58">
          <div className="container-premium grid gap-6 py-16 lg:grid-cols-[1fr_0.85fr]">
            <div className="brand-rich-card rounded-[2.4rem] p-7">
              <p className="mini-label">قصص ملهمة من مجتمعنا</p>
              <div className="mt-6 rounded-[2rem] border border-sand bg-cream/70 p-7">
                <p className="text-4xl text-gold">“</p>
                <p className="mt-2 text-lg font-bold leading-10 text-charcoal">غيّرت دورات هبة حياتي بالكامل. تعلمت كيف أضع حدودًا صحية، أحب نفسي بعمق، وأختار ما يشبهني مع فهمي لنفسي بشكل أكثر لطفًا.</p>
                <div className="mt-7 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ImageSlot variant="soft" ratio="square" label="صورة المستفيدة" className="h-12 w-12 rounded-full" showLabel={false} />
                    <div>
                      <p className="text-sm font-black text-charcoal">سارة م.</p>
                      <p className="text-xs font-bold text-warm-gray">مشتركة في رحلة إلى الذات</p>
                    </div>
                  </div>
                  <span className="text-gold">★★★★★</span>
                </div>
              </div>
              <PremiumButton href="/reviews" variant="outline" className="mt-5">اقرئي المزيد من القصص</PremiumButton>
            </div>

            <div className="grid gap-4">
              {communityNotes.map((note) => (
                <div key={note} className="rounded-[2rem] border border-sand bg-ivory/88 p-6 shadow-soft">
                  <BrandDivider className="mb-4 justify-start" />
                  <p className="text-sm font-black leading-8 text-charcoal">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-premium py-16">
          <FAQSection />
        </section>

        <section className="container-premium pb-16">
          <LeadMagnet />
        </section>

        <section className="container-wide px-2 pb-8 sm:px-0">
          <div className="premium-glow-border relative overflow-hidden rounded-[2.5rem] border border-sand bg-petrol p-8 text-center text-ivory shadow-premium md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(255_255_255/.14),transparent_52%),radial-gradient(circle_at_10%_80%,rgb(var(--color-gold)/.18),transparent_20rem)]" />
            <div className="relative mx-auto max-w-4xl">
              <BrandOrnament className="mx-auto mb-5 text-gold" />
              <h2 className="text-3xl font-black leading-tight md:text-5xl">جاهزة لبدء رحلتك نحو التغيير؟</h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-ivory/78">ابدئي اليوم بخطوة صغيرة نحو نسخة أفضل من نفسك وحياة تشبهك أكثر.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <PremiumButton href="/courses" variant="gold">تصفحي الدورات الآن</PremiumButton>
                <PremiumButton href="/booking" variant="outline" className="border-ivory text-ivory hover:bg-ivory hover:text-petrol">احجزي جلستك الخاصة</PremiumButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

function HomePanel({ title, href, action, children }: { title: string; href: string; action: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-sand bg-ivory/86 p-4 shadow-soft backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-charcoal">{title}</h2>
        <Link href={href} className="text-xs font-black text-burgundy transition hover:text-petrol">{action} ←</Link>
      </div>
      {children}
    </section>
  )
}

function FeaturedCourseCard({ title, promise, lessons, price, badge, variant }: { title: string; promise: string; lessons: string; price: string; badge: string; variant: 'course' | 'session' | 'brand' }) {
  return (
    <Link href="/courses" className="group block overflow-hidden rounded-[1.6rem] border border-sand bg-cream/70 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-premium">
      <ImageSlot variant={variant} ratio="video" label="صورة الدورة" className="rounded-none border-0 shadow-none" showLabel={false} />
      <div className="p-4">
        <span className="mb-3 inline-flex rounded-full bg-burgundy/10 px-3 py-1 text-[11px] font-black text-burgundy">{badge}</span>
        <h3 className="text-base font-black leading-7 text-charcoal transition group-hover:text-petrol">{title}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-6 text-warm-gray">{promise}</p>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs font-black text-warm-gray">
          <span>{lessons}</span>
          <span className="text-burgundy">{price}</span>
        </div>
      </div>
    </Link>
  )
}

function FeaturedBookCard({ title, subtitle, price, image }: { title: string; subtitle: string; price: string; image: string }) {
  return (
    <Link href="/books" className="group block rounded-[1.6rem] border border-sand bg-cream/70 p-4 text-center shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-premium">
      {image ? (
        <div className="relative mx-auto mb-4 aspect-[2.8/4] max-w-[120px] overflow-hidden rounded-xl border border-sand shadow-soft">
          <Image src={image} alt={title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="140px" />
        </div>
      ) : (
        <ImageSlot variant="book" ratio="book" label="غلاف الكتاب" className="mx-auto mb-4 max-w-[120px] rounded-xl" showLabel={false} />
      )}
      <h3 className="text-sm font-black leading-6 text-charcoal transition group-hover:text-petrol">{title}</h3>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-warm-gray">{subtitle}</p>
      <p className="mt-3 text-xs font-black text-burgundy">{price}</p>
    </Link>
  )
}

function IdentityPill({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-sand bg-ivory/80 p-4 shadow-soft">
      <h3 className="text-sm font-black text-petrol">{title}</h3>
      <p className="mt-2 text-xs font-bold leading-6 text-warm-gray">{text}</p>
    </div>
  )
}
