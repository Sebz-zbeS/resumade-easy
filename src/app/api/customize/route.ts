import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert resume writer and career coach. Customize the provided resume to perfectly match the job description. Rewrite every section: the summary/objective, all experience bullet points with strong action verbs, the skills section, and any other relevant section — aligning naturally and truthfully with the job's requirements and language. Quantify achievements where possible. Mirror key terms from the job description. Return only the complete, polished, customized resume. No preamble, no explanations, no commentary.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, resumeText, pdfBase64, pdfMediaType, jobDescription } = body;

    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }

    let userContent: Anthropic.MessageParam["content"];

    if (mode === "paste") {
      if (!resumeText?.trim()) {
        return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
      }
      userContent = `Here is my resume:\n\n${resumeText}\n\nHere is the job I am applying for:\n\n${jobDescription}\n\nPlease customize my entire resume for this job. Return only the full customized resume, ready to use.`;
    } else {
      if (!pdfBase64) {
        return NextResponse.json({ error: "PDF file is required." }, { status: 400 });
      }
      userContent = [
        {
          type: "document" as const,
          source: {
            type: "base64" as const,
            media_type: (pdfMediaType || "application/pdf") as "application/pdf",
            data: pdfBase64,
          },
        },
        {
          type: "text" as const,
          text: `Here is my resume (PDF above).\n\nJob description:\n\n${jobDescription}\n\nCustomize my entire resume for this job. Return only the full customized resume as plain text, ready to use.`,
        },
      ];
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const result = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");

    return NextResponse.json({ result });
  } catch (err) {
    console.error("API error:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
