export const availableBanks = [
  { id: "hsbc", name: "HSBC", logo: "hsbc.svg" },
  { id: "amex", name: "American Express", logo: "amex.svg" },
  { id: "revolut", name: "Revolut", logo: "revolut.svg" },
]

async function apiCall(body: any) {
  const response = await fetch("/api/financial/true-layer-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error("API call failed")
  return response.json()
}

export async function connectBank(provider: string) {
  return apiCall({ action: "connect", provider })
}

export async function fetchBalance(connectionId: string) {
  return apiCall({ action: "get_balance", connectionId })
}

export async function fetchTransactions(connectionId: string) {
  return apiCall({ action: "get_transactions", connectionId })
}
