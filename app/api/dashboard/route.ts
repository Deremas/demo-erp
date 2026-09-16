import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId") || searchParams.get("branchId") || undefined;
  
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getDashboardSnapshot(user.role, locationId || user.activeLocationId);

  return NextResponse.json(snapshot);
}