"use client"

import { useEffect } from "react"
import { initFirebaseAnalytics } from "@/lib/firebase/client"

export function FirebaseAnalytics() {
  useEffect(() => {
    void initFirebaseAnalytics()
  }, [])
  return null
}
