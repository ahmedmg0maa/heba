"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { testimonials } from "@/lib/site-data"

export function TestimonialsSection() {
  const [index, setIndex] = useState(0)
  const current = testimonials[index]

  return (
    <section className="section-padding bg-secondary text-foreground" dir="rtl">
      <div className="container-brand">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-accent">تجارب حقيقية</p>
          <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">كلمات من رحلات بدأت بالفعل</h2>
        </div>

        <div className="relative mx-auto mt-12 max-w-4xl rounded-[2.5rem] border border-border bg-card/88 p-8 text-center shadow-xl md:p-12">
          <Quote className="mx-auto h-12 w-12 text-accent" />
          <p className="mt-8 text-balance text-xl font-semibold leading-9 md:text-2xl">
            &ldquo;{current.text}&rdquo;
          </p>
          <div className="mt-7 flex justify-center gap-1 text-accent">
            {Array.from({ length: 5 }).map((_, star) => (
              <Star key={star} className="h-5 w-5 fill-current" />
            ))}
          </div>
          <div className="mt-6">
            <p className="text-xl font-bold">{current.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{current.role}</p>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              onClick={() => setIndex((index - 1 + testimonials.length) % testimonials.length)}
              type="button"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            {testimonials.map((_, dot) => (
              <button
                key={dot}
                onClick={() => setIndex(dot)}
                className={`h-2.5 rounded-full transition-all ${dot === index ? "w-8 bg-accent" : "w-2.5 bg-border"}`}
                aria-label={`تجربة ${dot + 1}`}
                type="button"
              />
            ))}
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              onClick={() => setIndex((index + 1) % testimonials.length)}
              type="button"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
