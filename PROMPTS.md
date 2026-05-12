# AI Prompt Engineering Log

This document details the prompt engineering strategy used for generating the executive summaries on the audit results page.

## Core Strategy: Why AI is NOT trusted for pricing logic
Early in development, we evaluated using LLMs (like GPT-4 and Claude 3 Opus) to perform the entire audit. This approach **failed entirely**. LLMs hallucinate pricing data, struggle with complex cross-tool optimizations (e.g., "if team size > 5, then upgrade to Team tier but only if primary use case is writing"), and cannot guarantee deterministic math for financial recommendations. 

**Our Solution**: Keep AI strictly out of the critical path for math. The `lib/audit-engine.ts` handles all financial calculations deterministically. The AI is *only* used for qualitative synthesis—taking the rigid math and turning it into a human-readable executive summary.

## Current Production Prompt

**Model:** `llama-3.3-70b-versatile` (via Groq for ultra-low latency)

**System Prompt / Instruction:**
```text
You are a senior financial auditor for a tech startup.
Review the following deterministic audit data regarding the company's AI tool spend.
Provide a concise, professional, 2-3 sentence executive summary of the findings.
DO NOT perform any math. Rely strictly on the 'totalSavings' and 'recommendations' provided in the JSON payload.
Focus on the strategic impact of consolidating these tools.

Audit Data:
{json_payload}
```

## Iteration History & Failed Experiments

### Experiment 1 (The Math Hallucination)
- *Prompt:* "Analyze this list of tools and tell the user how much they can save by consolidating."
- *Result:* **Failed.** The model attempted to recalculate the math based on its training data of tool pricing. It hallucinated incorrect prices (e.g., claiming Copilot Business was $10/mo instead of $19/mo) and provided wrong totals.
- *Learning:* Never let the model do math.

### Experiment 2 (The Verbose Output)
- *Prompt:* "Summarize these audit results. Do not do any math, just use the numbers provided."
- *Result:* **Failed.** The model output 4 paragraphs of text, which broke the UI layout and took too long to generate even on Groq.
- *Learning:* Implement strict length constraints ("2-3 sentence executive summary").

### Experiment 3 (Current Production)
- *Prompt:* Added persona ("senior financial auditor"), strict constraints ("DO NOT perform any math"), and length limits.
- *Result:* **Success.** The model provides high-quality, trustworthy summaries that perfectly align with our deterministic numbers and render instantly on the frontend.

## Fallback Strategy
If the Groq API fails, times out, or returns an error, the frontend catches the exception and immediately falls back to a deterministic, generic string:
> "We couldn't generate the personalized AI summary, but your detailed deterministic audit results are ready below."
This ensures the core value proposition (the financial math) is never blocked by an AI outage.
