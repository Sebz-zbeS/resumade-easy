// @ts-nocheck
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert resume writer and career coach. Customize the provided resume to perfectly match the job description. Rewrite every section — aligning naturally and truthfully with the job requirements. Return only the complete customized resume. No preamble.`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { mode, resumeText, pdfBase64, pdfMediaType, jobDescription } = body;
    if (!jobDescription?.trim()) return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    let userContent;
    if (mode === "paste") {
      userContent = `My resume:\n\n${resumeText}\n\nJob:\n\n${jobDescription}\n\nCustomize my resume for this job. Return only the full customized resume.`;
    } else {
      userContent = [{ type: "document", source: { type: "base64", media_type: pdfMediaType || "application/pdf", data: pdfBase64 } }, { type: "text", text: `Job:\n\n${jobDescription}\n\nCustomize my resume. Return only the full customized resume as plain text.` }];
    }
    const response = await client.messages.create({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: SYSTEM_PROMPT, messages: [{ role: "user", content: userContent }] });
    const result = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
