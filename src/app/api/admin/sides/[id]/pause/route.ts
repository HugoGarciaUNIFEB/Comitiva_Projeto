import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// PATCH /api/admin/sides/[id]/pause - Pausa Emergencial de Guarnição no Fogão
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

    const { id } = await params;
    const side = await prisma.side.findUnique({
      where: { id },
    });

    if (!side) {
      return NextResponse.json({ error: "Guarnição não encontrada." }, { status: 404 });
    }

    const updated = await prisma.side.update({
      where: { id },
      data: { isPaused: !side.isPaused },
    });

    return NextResponse.json({
      success: true,
      isPaused: updated.isPaused,
      side: updated,
    });
  } catch (error) {
    console.error("Erro na pausa de guarnição:", error);
    return NextResponse.json(
      { error: "Erro ao pausar/reativar guarnição." },
      { status: 500 }
    );
  }
}
