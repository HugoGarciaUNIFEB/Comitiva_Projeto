import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      name,
      description,
      imageUrl,
      category,
      isDailySpecial,
      fireTime,
      servingsLeft,
      sizes,
    } = body;

    // Atualiza dados básicos do produto
    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(imageUrl && { imageUrl }),
          ...(category && { category }),
          ...(typeof isDailySpecial === "boolean" && { isDailySpecial }),
          ...(fireTime !== undefined && { fireTime }),
          ...(servingsLeft !== undefined && { servingsLeft: Number(servingsLeft) }),
        },
      });

      // Se passou lista de tamanhos, atualiza os preços de cada tamanho
      if (Array.isArray(sizes)) {
        for (const s of sizes) {
          if (s.id) {
            await tx.productSize.update({
              where: { id: s.id },
              data: {
                price: Number(s.price),
                ...(s.weight && { weight: s.weight }),
              },
            });
          }
        }
      }

      return prod;
    });

    const refreshed = await prisma.product.findUnique({
      where: { id: updated.id },
      include: { sizes: true, sides: true },
    });

    return NextResponse.json({ success: true, product: refreshed });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Produto removido com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return NextResponse.json({ error: "Erro ao excluir produto." }, { status: 500 });
  }
}
