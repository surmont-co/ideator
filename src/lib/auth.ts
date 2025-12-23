import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface SessionUser {
  id?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
}

type SessionPayload = JWTPayload & {
  user?: SessionUser;
  expires?: number;
};

const secretKey = process.env.WORKOS_COOKIE_PASSWORD || "secret-key-must-be-at-least-32-chars-long";
const cookieDomain = process.env.SESSION_COOKIE_DOMAIN;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 week")
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function getUser(): Promise<SessionUser | undefined> {
  const session = await getSession();
  return session?.user;
}

export async function login(user: SessionUser) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
  const session = await encrypt({ user, expires: expires.getTime() });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session", {
    path: "/",
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });
  redirect("/");
}
