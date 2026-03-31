import { type NextRequest, NextResponse } from "next/server"
import { GenerativeToolkit } from "@/lib/generative-toolkit"

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, templateId, parameters, context } = await request.json()

    const toolkit = new GenerativeToolkit()
    await toolkit.init()

    let generationRequest

    if (templateId) {
      generationRequest = await toolkit.generateFromTemplate(templateId, parameters, context)
    } else {
      generationRequest = await toolkit.generateCustom(type, prompt, context)
    }

    return NextResponse.json({ request: generationRequest })
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
