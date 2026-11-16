import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// PATCH /api/admin/products/[id]/pause - Pausa Emergencial (esgotou no fogão)
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
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    // Alterna o status de pausa emergencial
    const updated = await prisma.product.update({
      where: { id },
      data: { isPaused: !product.isPaused },
      include: { sizes: true, sides: true },
    });

    return NextResponse.json({
      success: true,
      isPaused: updated.isPaused,
      product: updated,
    });
  } catch (error) {
    console.error("Erro na pausa emergencial do produto:", error);
    return NextResponse.json(
      { error: "Erro ao pausar/reativar prato." },
      { status: 500 }
    );
  }
}
