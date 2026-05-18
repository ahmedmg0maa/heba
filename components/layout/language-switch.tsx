"use client"

import { useState } from "react"
import { Languages } from "lucide-react"

export function LanguageSwitch() {
  const [lang, setLang] = useState<"AR" | "EN">("AR")

  return (
    <button
      type="button"
      onClick={() => setLang((current) => (current === "AR" ? "EN" : "AR"))}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card/70 px-3 text-xs font-bold text-foreground shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
      aria-label="تبديل اللغة"
      title="الترجمة الإنجليزية واجهة جاهزة للربط لاحقًا"
    >
      <Languages className="h-4 w-4" />
      <span className="latin">{lang}</span>
    </button>
  )
}
