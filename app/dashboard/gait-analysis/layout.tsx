import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export default async function GaitAnalysisLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(sessionToken);

  if (!session) {
    redirect("/login?next=/dashboard/gait-analysis");
  }

  return <>{children}</>;
}
