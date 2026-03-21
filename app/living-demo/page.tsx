"use client"

import { LivingApexDemo } from "@/components/living-apex-demo"
import { useRouter } from 'next/navigation'

export default function LivingDemoPage() {
  const router = useRouter()

  return (
    <LivingApexDemo
      onClose={() => router.push("/")}
      onStartApex={() => router.push("/")}
    />
  )
}
