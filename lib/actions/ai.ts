"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { answerAiQuestion, getAiInsightsSnapshot } from "@/lib/ai-insights";

export async function askAiQuestionAction(question: string, locationId?: string) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "ai:view", user.permissions)) {
    return { success: false as const, message: "You do not have access to AI insights." };
  }

  const scopedLocationId = hasPermission(user.role, "location:view-all", user.permissions)
    ? locationId || user.activeLocationId
    : user.activeLocationId;

  const snapshot = await getAiInsightsSnapshot(scopedLocationId);
  return {
    success: true as const,
    answer: answerAiQuestion(question, snapshot),
  };
}
