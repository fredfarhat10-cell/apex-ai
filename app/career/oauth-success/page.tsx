"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { storeTokens } from "@/lib/token-storage"
import { Spinner } from "@/components/spinner"

export default function OAuthSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"storing" | "success" | "error">("storing")

  useEffect(() => {
    async function handleTokenStorage() {
      try {
        const tokensParam = searchParams.get("tokens")
        const email = searchParams.get("email")

        if (!tokensParam || !email) {
          throw new Error("Missing tokens or email")
        }

        // Decode and parse tokens
        const tokens = JSON.parse(atob(tokensParam))

        // Store tokens in IndexedDB
        await storeTokens("google-gmail", "google", {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          tokenType: tokens.tokenType,
          scope: tokens.scope,
        })

        setStatus("success")

        // Redirect back to career page after 2 seconds
        setTimeout(() => {
          router.push("/career?success=true")
        }, 2000)
      } catch (error) {
        console.error("[v0] Error storing tokens:", error)
        setStatus("error")
        setTimeout(() => {
          router.push("/career?error=storage_failed")
        }, 2000)
      }
    }

    handleTokenStorage()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030014]">
      <div className="text-center space-y-6">
        {status === "storing" && (
          <>
            <Spinner />
            <p className="text-cyan-400 text-xl">Securing your connection...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-6xl">✓</div>
            <p className="text-green-400 text-xl">Successfully connected!</p>
            <p className="text-gray-400">Redirecting...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-6xl">✗</div>
            <p className="text-red-400 text-xl">Connection failed</p>
            <p className="text-gray-400">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  )
}
