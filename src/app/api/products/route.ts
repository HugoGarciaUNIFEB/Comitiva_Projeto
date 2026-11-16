import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rota pública para buscar pratos, guarnições e adicionais
// Usada tanto no carregamento inicial quanto no polling do cliente a cada 5 segundos
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        sizes: true,
        sides: true,
      },
      orderBy: [{ isDailySpecial: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cardápio." },
      { status: 500 }
    );
  }
}
