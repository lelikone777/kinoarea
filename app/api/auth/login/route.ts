import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { verifyPassword } from "@/app/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/app/lib/auth/session";
import { loginSchema } from "@/app/lib/auth/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nickname: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch {
    return NextResponse.json({ error: "Не удалось войти" }, { status: 500 });
  }
}
