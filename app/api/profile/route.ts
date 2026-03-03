import { NextResponse } from "next/server";
import { getServerSession } from "@/app/lib/auth/session";
import { db } from "@/app/lib/db";
import { profileUpdateSchema } from "@/app/lib/auth/schemas";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      nickname: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const nextData = parsed.data;
    if (!nextData.nickname && !nextData.avatarUrl) {
      return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
    }

    if (nextData.nickname) {
      const existing = await db.user.findFirst({
        where: {
          nickname: nextData.nickname,
          NOT: { id: session.userId },
        },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json({ error: "Никнейм уже занят" }, { status: 409 });
      }
    }

    const user = await db.user.update({
      where: { id: session.userId },
      data: {
        nickname: nextData.nickname,
        avatarUrl: nextData.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Не удалось обновить профиль" }, { status: 500 });
  }
}
