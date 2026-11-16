import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { street, number, neighborhood, complement, reference, isDefault } = body;

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Endereço não encontrado." }, { status: 404 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        street: street ?? existing.street,
        number: number ?? existing.number,
        neighborhood: neighborhood ?? existing.neighborhood,
        complement: complement !== undefined ? complement : existing.complement,
        reference: reference !== undefined ? reference : existing.reference,
        isDefault: isDefault !== undefined ? Boolean(isDefault) : existing.isDefault,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error);
    return NextResponse.json({ error: "Erro ao atualizar endereço." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Endereço não encontrado." }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Endereço removido com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir endereço:", error);
    return NextResponse.json({ error: "Erro ao excluir endereço." }, { status: 500 });
  }
}
