export interface PasswordStrength {
  score: number // 0-4
  label: string
  color: string
  percentage: number
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0

  if (!password) {
    return { score: 0, label: "Enter password", color: "#6B7280", percentage: 0 }
  }

  // Length check
  if (password.length >= 8) score++
  if (password.length >= 12) score++

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  // Map score to strength levels
  const strengthLevels = [
    { score: 0, label: "Very Weak", color: "#EF4444", percentage: 20 },
    { score: 1, label: "Weak", color: "#F59E0B", percentage: 40 },
    { score: 2, label: "Fair", color: "#EAB308", percentage: 60 },
    { score: 3, label: "Good", color: "#10B981", percentage: 80 },
    { score: 4, label: "Strong", color: "#059669", percentage: 100 },
  ]

  return strengthLevels[Math.min(score, 4)]
}
