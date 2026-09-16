import { NextResponse } from "next/server";

import { SESSION_COOKIE, buildSessionToken, createSessionPayload, findUserByIdentifier, getPublicUser, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier || "").trim();
    const password = String(body.password || "");

    if (!identifier || !password) {
      return NextResponse.json({ message: "Username or email and password are required." }, { status: 400 });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ message: "Invalid username/email or password." }, { status: 401 });
    }

    const publicUser = getPublicUser(user);
    const token = buildSessionToken({
      userId: user.id,
      exp: String(createSessionPayload(user.id).exp),
    });

    const response = NextResponse.json({ user: publicUser, message: "Signed in successfully." }, { status: 200 });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Unable to sign in right now." }, { status: 500 });
  }
}
