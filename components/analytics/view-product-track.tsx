"use client"

import { useEffect } from "react"
import { trackClientEvent } from "@/lib/analytics"

export function ViewProductTrack({
  productId,
  productType,
  price,
}: {
  productId: string
  productType: "book" | "course"
  price: number
}) {
  useEffect(() => {
    trackClientEvent("view_product", {
      productId,
      productType,
      price,
      source: "product_page",
    })
  }, [price, productId, productType])

  return null
}
