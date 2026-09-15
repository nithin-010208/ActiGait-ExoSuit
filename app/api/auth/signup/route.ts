import { NextResponse } from "next/server";

import { SESSION_COOKIE, createSessionPayload, createUser, getPublicUser, buildSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName || "").trim();
    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");
    const deviceCode = String(body.deviceCode || "").trim();

    if (!fullName || !username || !email || !password) {
      return NextResponse.json({ message: "Please complete all required fields." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match." }, { status: 400 });
    }

    const user = await createUser({ fullName, username, email, password, deviceCode: deviceCode || undefined });
    const publicUser = getPublicUser(user);
    const token = buildSessionToken({
      userId: user.id,
      exp: String(createSessionPayload(user.id).exp),
    });

    const response = NextResponse.json({ user: publicUser, message: "Account created successfully." }, { status: 201 });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the account.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
