import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });

  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const { street, number, neighborhood, complement, reference, recipient, phone, isDefault } =
      await req.json();

    if (!street || !number || !neighborhood) {
      return NextResponse.json({ error: "Preencha os campos obrigatórios." }, { status: 400 });
    }

    if (isDefault) {
      // Desmarca o anterior como padrão
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        street,
        number,
        neighborhood,
        complement: complement || null,
        reference: reference || null,
        recipient: recipient || user.name,
        phone: phone || user.whatsapp,
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json(newAddress);
  } catch (error) {
    console.error("Erro ao salvar endereço:", error);
    return NextResponse.json({ error: "Erro ao salvar endereço." }, { status: 500 });
  }
}
