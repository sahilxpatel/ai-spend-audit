import { AuditSummary } from "@/types/audit";
import { groq, GROQ_MODEL } from "./groq";

const FALLBACK_SUMMARY = 
  "Based on our analysis of your tool stack, we've identified key opportunities to optimize your spending. Review the itemized recommendations below to see where you can eliminate redundancies, adjust plan tiers, and improve your overall software ROI.";

export async function generateAISummary(auditSummary: AuditSummary): Promise<string> {
  // If there's no API key configured, use fallback immediately
  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY is not set. Using fallback summary.");
    return FALLBACK_SUMMARY;
  }

  const { totalCurrentSpend, totalMonthlySavings, savingsPercentage, results } = auditSummary;

  const toolSummaryList = results.map(r => 
    `- ${r.toolId}: current spend $${r.currentSpend}/mo, potential savings $${r.potentialSavings}/mo`
  ).join("\n");

  const prompt = `
You are a fractional CFO and software procurement expert. Your goal is to write a highly professional, concise financial summary (under 100 words) for a company reviewing their AI software spend.

Data:
- Total Current Monthly Spend: $${totalCurrentSpend}
- Total Potential Monthly Savings: $${totalMonthlySavings}
- Savings Percentage: ${savingsPercentage.toFixed(1)}%
- Tool Breakdown:
${toolSummaryList}

Instructions:
1. Summarize the financial findings in a trustworthy, professional tone.
2. DO NOT calculate pricing, savings, or generate new financial logic. ONLY use the provided data.
3. Keep the summary under 100 words.
4. Do not include any pleasantries or generic advice, just the hard facts and strategic impact.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.2, // Low temperature for deterministic, professional output
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content?.trim() || FALLBACK_SUMMARY;
  } catch (error) {
    console.error("Error generating AI summary from Groq:", error);
    // Graceful fallback UX on error
    return FALLBACK_SUMMARY;
  }
}
