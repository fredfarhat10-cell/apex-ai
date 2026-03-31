"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function AuthCallback() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      // Send error to parent window
      window.opener?.postMessage(
        {
          type: "oauth_error",
          error: error,
        },
        window.location.origin,
      )
      window.close()
      return
    }

    if (code && state) {
      // Verify state matches
      const storedState = sessionStorage.getItem("oauth_state")
      const provider = sessionStorage.getItem("oauth_provider")

      if (state !== storedState) {
        window.opener?.postMessage(
          {
            type: "oauth_error",
            error: "State mismatch",
          },
          window.location.origin,
        )
        window.close()
        return
      }

      // In a real implementation, you would exchange the code for tokens on the server
      // For this demo, we'll simulate a successful token exchange
      // NOTE: This is NOT secure for production - tokens should be exchanged server-side

      // Simulate token (in production, this would come from your backend)
      const mockAccessToken = `mock_${provider}_token_${code.substring(0, 10)}`

      window.opener?.postMessage(
        {
          type: "oauth_success",
          accessToken: mockAccessToken,
          refreshToken: `mock_refresh_${code.substring(0, 10)}`,
        },
        window.location.origin,
      )

      window.close()
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#4A90E2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing authentication...</p>
        <p className="text-gray-400 text-sm mt-2">This window will close automatically.</p>
      </div>
    </div>
  )
}
