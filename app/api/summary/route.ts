import { NextResponse } from "next/server";
import { generateAISummary } from "@/lib/summary";
import { AuditSummary } from "@/types/audit";

export async function POST(request: Request) {
  try {
    const body: AuditSummary = await request.json();
    
    if (!body || !body.results) {
      return NextResponse.json(
        { error: "Invalid audit summary data provided" },
        { status: 400 }
      );
    }

    const aiSummary = await generateAISummary(body);
    
    return NextResponse.json({ summary: aiSummary });
  } catch (error) {
    console.error("Failed to generate summary via API route:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
