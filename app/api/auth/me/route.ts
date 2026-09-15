import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { SESSION_COOKIE, findUserById, getPublicUser, verifySessionToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(sessionToken);

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: getPublicUser(user) }, { status: 200 });
}
