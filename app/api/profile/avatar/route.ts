import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "@/app/lib/auth/session";
import { db } from "@/app/lib/db";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getExtension(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "bin";
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is missing in environment variables" },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const rawFile = formData.get("file");
    if (!(rawFile instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(rawFile.type)) {
      return NextResponse.json({ error: "Only JPG, PNG and WEBP are allowed" }, { status: 400 });
    }

    if (rawFile.size > MAX_AVATAR_SIZE) {
      return NextResponse.json({ error: "Avatar must be up to 2MB" }, { status: 400 });
    }

    const extension = getExtension(rawFile.type);
    const pathname = `avatars/${session.userId}-${crypto.randomUUID()}.${extension}`;
    const blob = await put(pathname, rawFile, {
      access: "public",
      addRandomSuffix: false,
      contentType: rawFile.type,
    });

    const user = await db.user.update({
      where: { id: session.userId },
      data: { avatarUrl: blob.url },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user, avatarUrl: blob.url });
  } catch (error) {
    console.error("Avatar upload failed:", error);
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}
