import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getBackupsDir } from "@/lib/services/backup-paths";

const allowedPattern = /^(backup|export)_(([0-3]\d)_[a-z]+_\d{4}_([0-2]\d)-([0-5]\d)-([0-5]\d)|\d+)(\.json|\.xlsx|_report\.html)$/;

function contentTypeFor(fileName: string) {
  if (fileName.endsWith(".json")) return "application/json; charset=utf-8";
  if (fileName.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return "text/html; charset=utf-8";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileName: string }> },
) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "backups:manage", user.permissions)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { fileName } = await params;
  const safeName = path.basename(fileName);
  if (safeName !== fileName || !allowedPattern.test(safeName)) {
    return NextResponse.json({ message: "Invalid backup file" }, { status: 400 });
  }

  const backupsDir = path.resolve(getBackupsDir());
  const filePath = path.resolve(backupsDir, safeName);
  if (!filePath.startsWith(backupsDir + path.sep) || !fs.existsSync(filePath)) {
    return NextResponse.json({ message: "Backup file not found" }, { status: 404 });
  }

  const file = fs.readFileSync(filePath);
  const headers = new Headers({
    "Content-Type": contentTypeFor(safeName),
    "Cache-Control": "private, no-store",
  });

  if (!safeName.endsWith("_report.html")) {
    headers.set("Content-Disposition", `attachment; filename="${safeName}"`);
  }

  return new NextResponse(file, { headers });
}