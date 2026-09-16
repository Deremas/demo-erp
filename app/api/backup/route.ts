import { NextResponse } from "next/server";
import { generateSystemBackup } from "@/lib/services/backup";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const backup = await generateSystemBackup();
    return NextResponse.json({ success: true, fileName: backup.fileName });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Backup failed" }, { status: 500 });
  }
}