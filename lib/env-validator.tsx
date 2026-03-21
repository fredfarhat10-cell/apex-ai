// lib/env-validator.tsx

// This module checks for the presence of critical environment variables at runtime.
// It helps developers quickly identify configuration issues without cryptic errors.

// Define which variables are absolutely required for the app to function.
const requiredFrontendVars = [
  "NEXT_PUBLIC_CREWAI_API_URL",
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
  "PLAID_CLIENT_ID",
  "PLAID_SECRET",
  "SERPER_API_KEY",
]

interface ValidationResult {
  isValid: boolean
  missingVars: string[]
}

export function validateEnvironmentVariables(): ValidationResult {
  const missingVars: string[] = []

  // Check if we are in a server environment (or a browser that supports process.env)
  if (typeof process === "undefined" || !process.env) {
    // Cannot validate in this environment, assume valid for now.
    // Client-side checks will be different.
    return { isValid: true, missingVars: [] }
  }

  for (const varName of requiredFrontendVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
  }
}

// A simple component to render the error overlay if validation fails.
export function EnvValidationErrorOverlay({ missingVars }: { missingVars: string[] }) {
  const guideLink = "/SETUP_GUIDE.md"

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 10, 26, 0.95)",
        color: "#E5E7EB",
        fontFamily: "monospace",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          border: "1px solid #EF4444",
          borderRadius: "8px",
          padding: "2rem",
          backgroundColor: "#111827",
        }}
      >
        <h1
          style={{
            color: "#F87171",
            fontSize: "1.5rem",
            fontWeight: "bold",
            borderBottom: "1px solid #EF4444",
            paddingBottom: "1rem",
            marginBottom: "1rem",
          }}
        >
          Environment Configuration Error
        </h1>
        <p style={{ marginBottom: "1.5rem" }}>
          Apex AI cannot start because some required environment variables are missing.
        </p>
        <p style={{ marginBottom: "0.5rem" }}>
          Please add the following variables to your <strong>.env.local</strong> file:
        </p>
        <div style={{ backgroundColor: "#1F2937", padding: "1rem", borderRadius: "4px", marginBottom: "1.5rem" }}>
          {missingVars.map((varName) => (
            <p key={varName} style={{ margin: 0, padding: "0.25rem 0" }}>
              • {varName}
            </p>
          ))}
        </div>
        <p>
          For detailed instructions on how to obtain these keys, please refer to the{" "}
          <a
            href={guideLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#60A5FA", textDecoration: "underline" }}
          >
            SETUP_GUIDE.md
          </a>
          .
        </p>
      </div>
    </div>
  )
}
