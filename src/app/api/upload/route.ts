import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // 1. Armazenamento na Vercel Blob (quando BLOB_READ_WRITE_TOKEN está configurado)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(file.name, file, {
        access: "public",
        addRandomSuffix: true,
      });

      return NextResponse.json({ success: true, url: blob.url });
    }

    // 2. Fallback de desenvolvimento local caso o token do Vercel Blob ainda não tenha sido definido no .env
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const extension = path.extname(file.name) || ".png";
    const filename = `dish_${Date.now()}_${Math.random().toString(36).substring(7)}${extension}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Erro no upload de imagem:", error);
    return NextResponse.json({ error: "Erro ao salvar arquivo." }, { status: 500 });
  }
}
