"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

const AIAssistant = dynamic(() => import("./ai-assistant").then((mod) => mod.AIAssistant), {
  ssr: false,
  loading: () => null,
})

export function AssistantMount() {
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (pathname.startsWith("/admin")) return

    const idleCallback = globalThis.requestIdleCallback
    if (typeof idleCallback === "function") {
      const id = idleCallback(() => setReady(true), { timeout: 1200 })
      return () => globalThis.cancelIdleCallback?.(id)
    }

    const timer = globalThis.setTimeout(() => setReady(true), 600)
    return () => globalThis.clearTimeout(timer)
  }, [pathname])

  if (pathname.startsWith("/admin") || !ready) {
    return null
  }

  return <AIAssistant />
}
