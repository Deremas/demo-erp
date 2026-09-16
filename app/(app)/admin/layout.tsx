export const dynamic = "force-dynamic";

import { requireSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSession();

  return <>{children}</>;
}