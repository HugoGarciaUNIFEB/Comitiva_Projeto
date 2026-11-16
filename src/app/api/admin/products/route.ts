import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/admin/products - Listagem completa de produtos para o painel
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      include: {
        sizes: true,
        sides: true,
      },
      orderBy: [{ isDailySpecial: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Erro ao listar produtos admin:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

// POST /api/admin/products - Cadastro de novo prato ou produto
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      imageUrl,
      category = "marmita",
      isDailySpecial = false,
      fireTime = "4h de brasa lenta",
      servingsLeft = 20,
      sizes = [],
      sides = [],
    } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Nome e descrição são obrigatórios." },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        imageUrl: imageUrl || "/images/vaca_atolada.png",
        category,
        isDailySpecial: Boolean(isDailySpecial),
        isPaused: false,
        fireTime,
        servingsLeft: Number(servingsLeft) || 20,
        sizes: {
          create: sizes.map((s: { size: string; price: number; weight: string }) => ({
            size: s.size,
            price: Number(s.price),
            weight: s.weight || "500 g",
          })),
        },
        sides: {
          create: sides.map((side: { name: string; type?: string; price?: number }) => ({
            name: side.name,
            type: side.type || "INCLUDED",
            price: Number(side.price) || 0,
            isPaused: false,
          })),
        },
      },
      include: {
        sizes: true,
        sides: true,
      },
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json({ error: "Erro ao cadastrar produto." }, { status: 500 });
  }
}
