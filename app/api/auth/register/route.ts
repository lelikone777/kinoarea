import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { hashPassword } from "@/app/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/app/lib/auth/session";
import { registerSchema } from "@/app/lib/auth/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, nickname, password } = parsed.data;
    const existing = await db.user.findFirst({
      where: {
        OR: [{ email }, { nickname }],
      },
      select: { id: true, email: true, nickname: true },
    });

    if (existing?.email === email) {
      return NextResponse.json({ error: "Email уже используется" }, { status: 409 });
    }
    if (existing?.nickname === nickname) {
      return NextResponse.json({ error: "Никнейм уже используется" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email,
        nickname,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
    });
    await setSessionCookie(token);

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Не удалось зарегистрироваться" }, { status: 500 });
  }
}
