import { NextResponse } from "next/server";
import { getServerSession } from "@/app/lib/auth/session";
import { db } from "@/app/lib/db";
import { hashPassword, verifyPassword } from "@/app/lib/auth/password";
import { passwordUpdateSchema } from "@/app/lib/auth/schemas";

export async function PATCH(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = passwordUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const validPassword = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: "Текущий пароль неверный" }, { status: 400 });
    }

    const nextHash = await hashPassword(parsed.data.newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: nextHash },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалось обновить пароль" }, { status: 500 });
  }
}
