import { type NextRequest, NextResponse } from "next/server"
import { WellnessOracle } from "@/lib/wellness-oracle"

export async function POST(request: NextRequest) {
  try {
    const { userId, deviceType, accessToken } = await request.json()

    if (!userId || !deviceType || !accessToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const oracle = new WellnessOracle()
    await oracle.init()

    const data = await oracle.syncWearableData(userId, deviceType, accessToken)

    return NextResponse.json({ success: true, dataPoints: data.length })
  } catch (error) {
    console.error("Wellness sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
