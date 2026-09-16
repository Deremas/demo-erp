import Link from "next/link";

import {
  accessControlNotes,
  aiCapabilities,
  auditTrailNotes,
  backupNotes,
  customizationOptions,
  demoWalkthrough,
  implementationPlan,
  quotationLines,
  quotationNotes,
  quotationTotals,
  requirementCoverage,
  supportCommitments,
  trainingByRole,
} from "@/lib/demo-commercial";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DemoPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600">Client demo</p>
        <h1 className="text-3xl font-black tracking-tight">Rungo Traders ERP walkthrough, plan, and quotation</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          This briefing maps every requested business area to a live screen: multi-branch inventory, warehouse control, agent credit, sales, purchasing, imports, supplier balances, accounting, expenses, financial reporting, AI, access control, audit trail, backup, customization, implementation, training, support, and total cost.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/assistant">Open AI insights</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/backups">Open backups</Link>
          </Button>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Requirement coverage</h2>
        <Card>
          <CardHeader>
            <CardTitle>Live screens for the requested operations</CardTitle>
            <CardDescription>
              Use this matrix during the demo so each requirement is shown on the actual system, not only described.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">Requirement</th>
                  <th className="py-2 pr-4">What the demo shows</th>
                  <th className="py-2">Open</th>
                </tr>
              </thead>
              <tbody>
                {requirementCoverage.map((row) => (
                  <tr key={row.requirement} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-semibold">{row.requirement}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.capability}</td>
                    <td className="py-3">
                      <Link href={row.href} className="font-semibold text-sky-700 hover:underline">
                        Open screen
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Recommended demo sequence</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {demoWalkthrough.map((item) => (
            <Link key={item.step} href={item.href}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:border-sky-400/50">
                <CardHeader>
                  <CardDescription>Step {item.step}</CardDescription>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">AI, access, audit, backup, and customization</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>AI capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {aiCapabilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>User access controls</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {accessControlNotes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Audit trail</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {auditTrailNotes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Data backup</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {backupNotes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Customization options</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {customizationOptions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Implementation plan</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {implementationPlan.map((phase) => (
            <Card key={phase.phase}>
              <CardHeader>
                <CardDescription>{phase.duration}</CardDescription>
                <CardTitle>{phase.phase}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {phase.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Training by role</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {trainingByRole.map((item) => (
            <Card key={item.role}>
              <CardHeader>
                <CardTitle>{item.role}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.sessions}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Full quotation and total cost</h2>
        <Card>
          <CardHeader>
            <CardTitle>Commercial breakdown</CardTitle>
            <CardDescription>
              One-time {quotationTotals.oneTime}. Ongoing core {quotationTotals.monthlyCore}. With optional AI {quotationTotals.monthlyWithAi}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4">Scope</th>
                  <th className="py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {quotationLines.map((line) => (
                  <tr key={line.item} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-semibold">{line.item}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{line.detail}</td>
                    <td className="py-3 font-medium">{line.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border p-4">
                <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">First year, core</p>
                <p className="mt-1 text-2xl font-black">{quotationTotals.firstYearCore}</p>
                <p className="mt-1 text-sm text-muted-foreground">Implementation, training, customization, plus 12 months of licensing and hosting.</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">First year, with AI</p>
                <p className="mt-1 text-2xl font-black">{quotationTotals.firstYearWithAi}</p>
                <p className="mt-1 text-sm text-muted-foreground">Same as core, plus twelve months of optional AI insights.</p>
              </div>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {quotationNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Technical support</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc space-y-3 pl-5 text-sm leading-6 text-muted-foreground">
              {supportCommitments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
