export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, CircleAlert, ScrollText } from "lucide-react";

import { getActionActorByPermission } from "@/lib/actions/common";
import { getAuditCoverageRows } from "@/lib/audit-coverage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AuditCoveragePage() {
  const actor = await getActionActorByPermission("audit:view");
  if (!actor) redirect("/dashboard");

  const rows = await getAuditCoverageRows();
  const observed = rows.filter((row) => row.count > 0).length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 xl:p-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Administrative</p>
          <h1 className="text-3xl font-black tracking-tight">Audit Coverage</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Checklist view for transaction areas that should write audit logs. Counts show logs already observed in this database.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/audit-logs">
            <ScrollText className="h-4 w-4" />
            Open Audit Logs
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Observed Areas</p>
            <p className="mt-2 text-2xl font-black">{observed}/{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Needs Verification</p>
            <p className="mt-2 text-2xl font-black">{rows.length - observed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rule</p>
            <p className="mt-2 text-lg font-black">Every transaction</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle>Coverage Checklist</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {rows.map((row) => {
              const ok = row.count > 0;
              return (
                <div key={row.area} className="grid gap-4 p-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center">
                  <div className="flex items-start gap-3">
                    {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> : <CircleAlert className="mt-0.5 h-5 w-5 text-amber-600" />}
                    <div>
                      <p className="font-black">{row.area}</p>
                      <p className="text-xs text-muted-foreground">{row.entityTypes.join(", ")}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold">{row.count.toLocaleString()} logs</p>
                    <p className="text-xs text-muted-foreground">{row.latestAction ?? "No matching log yet"}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold">{row.latestAt ? new Date(row.latestAt).toLocaleString() : "Not observed"}</p>
                    <p className="text-xs text-muted-foreground">Latest activity</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ok ? "success" : "warning"}>{row.status}</Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link href={row.route as any}>Test Area</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}