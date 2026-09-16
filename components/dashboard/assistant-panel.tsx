"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { askAiQuestionAction } from "@/lib/actions/ai";
import type { AiInsight, AiInsightsSnapshot } from "@/lib/ai-insights";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const sampleQuestions = [
  "Summarize sales, expenses, and cash position for the last 30 days.",
  "Which items are low stock and what should we purchase?",
  "Which agents or customers have overdue credit risk?",
  "Are there unusual discounts I should review?",
];

function InsightList({ title, items }: { title: string; items: AiInsight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing to flag in this view.</p>
        ) : (
          items.map((item) => (
            <a key={`${item.title}-${item.detail}`} href={item.href ?? "/assistant"} className="block rounded-xl border border-border/70 p-3 hover:border-primary/40">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
            </a>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function AssistantPanel({ snapshot, locationId }: { snapshot: AiInsightsSnapshot; locationId?: string | undefined }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(snapshot.summary);
  const [isPending, startTransition] = useTransition();

  function ask(nextQuestion: string) {
    startTransition(async () => {
      const result = await askAiQuestionAction(nextQuestion, locationId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setAnswer(result.answer);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-600" />
            Ask the live books
          </CardTitle>
          <CardDescription>
            Answers use current stock, sales, credit, and expense data. Results follow the signed-in user&apos;s location and role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {answer}
          </p>
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about stock, credit, imports, expenses, or unusual discounts"
          />
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((sample) => (
              <Button key={sample} type="button" variant="outline" size="sm" onClick={() => ask(sample)}>
                {sample}
              </Button>
            ))}
          </div>
          <Button type="button" disabled={isPending} onClick={() => ask(question)}>
            {isPending ? "Reviewing..." : "Ask"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <InsightList title="Stock and movement recommendations" items={snapshot.recommendations} />
        <InsightList title="Credit-risk review" items={snapshot.creditRisk} />
        <InsightList title="Unusual discounts and prices" items={snapshot.anomalies} />
        <InsightList title="Suggested purchase quantities" items={snapshot.suggestedPurchases} />
      </div>
    </div>
  );
}
