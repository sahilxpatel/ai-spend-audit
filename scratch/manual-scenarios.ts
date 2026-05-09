
import { auditTool, aggregateAudit } from "../lib/audit-engine";
import { ToolInput } from "../types/audit";
import { pricing } from "../lib/pricing";

console.log("--- SCENARIO 1: 2 users, ChatGPT Team, $60/month ---");
const scenario1: ToolInput = {
  id: "s1",
  toolId: "chatgpt",
  planId: "team",
  monthlySpend: 60,
  seats: 2,
};
const result1 = auditTool(scenario1, [scenario1], pricing);
console.log("Recommendations:", result1.recommendations.map(r => r.title));
console.log("Monthly Savings:", result1.potentialSavings);
console.log("Optimal Spend:", result1.optimalSpend);
console.log("");

console.log("--- SCENARIO 2: 1 user, Cursor Business ---");
const scenario2: ToolInput = {
  id: "s2",
  toolId: "cursor",
  planId: "business",
  monthlySpend: 40,
  seats: 1,
};
const result2 = auditTool(scenario2, [scenario2], pricing);
console.log("Recommendations:", result2.recommendations.map(r => r.title));
console.log("");

console.log("--- SCENARIO 3: High API spend (Claude) ---");
const scenario3: ToolInput = {
  id: "s3",
  toolId: "claude",
  planId: "api",
  monthlySpend: 150,
  seats: 1,
};
const result3 = auditTool(scenario3, [scenario3], pricing);
console.log("Recommendations:", result3.recommendations.map(r => r.title));
console.log("");

console.log("--- SCENARIO 4: Multiple overlapping writing tools ---");
const scenario4: ToolInput[] = [
  { id: "s4a", toolId: "chatgpt", planId: "plus", monthlySpend: 20, seats: 1 },
  { id: "s4b", toolId: "claude", planId: "pro", monthlySpend: 20, seats: 1 },
];
const result4 = aggregateAudit(scenario4, pricing);
const overlaps = result4.results.flatMap(r => r.recommendations.filter(rec => rec.optimizationType === 'overlapping-tools'));
console.log("Overlap Warnings Found:", overlaps.length);
overlaps.forEach(o => console.log("- " + o.title + ": " + o.reasoning));
