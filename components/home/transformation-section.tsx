import { transformation } from "@/lib/site-data"

export function TransformationSection() {
  return (
    <section className="section-padding" dir="rtl">
      <div className="container-brand">
        <div className="rounded-[2.5rem] border border-border bg-card p-6 shadow-xl md:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="eyebrow">التحول</p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl">
                لسنا هنا لنضيف ضجيجًا جديدًا… بل لنرتب ما بداخلك.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                الرحلة ليست وعدًا سحريًا، لكنها مساحة منظمة تنتقلين فيها من التشتت إلى الوضوح، ومن رد الفعل إلى الاختيار.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {transformation.map((item) => (
                <div key={item.before} className="rounded-[2rem] border border-border bg-background p-5">
                  <item.icon className="h-8 w-8 text-accent" />
                  <div className="mt-5 space-y-3">
                    <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">من: {item.before}</p>
                    <p className="rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">إلى: {item.after}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
