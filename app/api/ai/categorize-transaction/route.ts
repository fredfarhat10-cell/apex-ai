import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, transaction } = await request.json()

    // In production, this would call OpenAI or another LLM
    // For demo, use rule-based logic
    const name = transaction.name.toLowerCase()
    const merchant = transaction.merchant_name?.toLowerCase() || ""

    let categoryId = "cat_shopping" // default

    if (name.includes("grocery") || merchant.includes("grocery")) {
      categoryId = "cat_groceries"
    } else if (name.includes("restaurant") || name.includes("food") || merchant.includes("starbucks")) {
      categoryId = "cat_dining_out"
    } else if (name.includes("gas") || name.includes("fuel")) {
      categoryId = "cat_gas"
    } else if (name.includes("rent") || name.includes("mortgage")) {
      categoryId = "cat_rent_mortgage"
    } else if (name.includes("electric") || name.includes("water") || name.includes("internet")) {
      categoryId = "cat_utilities"
    } else if (merchant.includes("netflix") || merchant.includes("spotify")) {
      categoryId = "cat_streaming"
    }

    return NextResponse.json({ categoryId })
  } catch (error) {
    console.error("[v0] Error categorizing transaction:", error)
    return NextResponse.json({ error: "Failed to categorize" }, { status: 500 })
  }
}
