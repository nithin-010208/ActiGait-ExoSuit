import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import path from "node:path";

export type UserRecord = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  deviceCode?: string;
};

export type PublicUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  createdAt: string;
  deviceCode?: string;
};

export const SESSION_COOKIE = "actigait_session";
const USERS_PATH = path.join(process.cwd(), "data", "users.json");
const SESSION_SECRET = process.env.ACTIGAIT_SESSION_SECRET || "actigait-local-demo-secret-change-me";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const toBase64Url = (value: Buffer) =>
  value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (value: string) =>
  Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");

async function ensureUsersStore() {
  try {
    const mod = await import("node:fs/promises");
    await mod.mkdir("data", { recursive: true });
    try {
      await mod.access(USERS_PATH);
    } catch {
      await mod.writeFile(USERS_PATH, "[]", "utf8");
    }
  } catch {
    // ignore in unsupported runtimes; the file may already exist in a local dev environment
  }
}

export async function readUsers(): Promise<UserRecord[]> {
  await ensureUsersStore();

  try {
    const mod = await import("node:fs/promises");
    const content = await mod.readFile(USERS_PATH, "utf8");
    if (!content.trim()) return [];

    const users = JSON.parse(content) as UserRecord[];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

export async function writeUsers(users: UserRecord[]) {
  await ensureUsersStore();

  try {
    const mod = await import("node:fs/promises");
    await mod.writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
  } catch {
    // unsupported runtime fallback
  }
}

export function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, actualHash] = passwordHash.split(":");
  if (!salt || !actualHash) return false;

  const candidate = pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
  const actual = Buffer.from(actualHash, "hex");
  const expected = Buffer.from(candidate, "hex");

  try {
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function getPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    deviceCode: user.deviceCode,
  };
}

export function buildSessionToken(payload: Record<string, string | number>) {
  const raw = Buffer.from(JSON.stringify(payload), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const signature = createHmac("sha256", SESSION_SECRET)
    .update(raw)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${raw}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expected = createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    const decoded = JSON.parse(fromBase64Url(encodedPayload).toString("utf8")) as {
      userId: string;
      exp: number;
    };

    if (!decoded.userId || decoded.exp < Date.now()) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function createSessionPayload(userId: string) {
  return {
    userId,
    exp: Date.now() + SESSION_TTL_MS,
  };
}

export async function findUserById(userId: string) {
  const users = await readUsers();
  return users.find((user) => user.id === userId);
}

export async function findUserByIdentifier(identifier: string) {
  const users = await readUsers();
  const normalized = normalizeIdentifier(identifier);

  return users.find((user) => {
    return (
      normalizeIdentifier(user.username) === normalized ||
      normalizeIdentifier(user.email) === normalized
    );
  });
}

export async function createUser(input: {
  fullName: string;
  username: string;
  email: string;
  password: string;
  deviceCode?: string;
}) {
  const fullName = input.fullName.trim();
  const username = input.username.trim();
  const email = input.email.trim();
  const deviceCode = input.deviceCode?.trim();

  if (!fullName || !username || !email || !input.password) {
    throw new Error("All required fields must be completed.");
  }

  const users = await readUsers();
  const normalizedUsername = normalizeIdentifier(username);
  const normalizedEmail = normalizeIdentifier(email);

  const duplicate = users.some((user) => {
    return (
      normalizeIdentifier(user.username) === normalizedUsername ||
      normalizeIdentifier(user.email) === normalizedEmail
    );
  });

  if (duplicate) {
    throw new Error("An account with that username or email already exists.");
  }

  const newUser: UserRecord = {
    id: `user_${randomBytes(8).toString("hex")}`,
    fullName,
    username,
    email,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
    ...(deviceCode ? { deviceCode } : {}),
  };

  users.push(newUser);
  await writeUsers(users);
  return newUser;
}
