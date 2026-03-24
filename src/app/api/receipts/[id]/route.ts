import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const receipt = await prisma.receipt.findUnique({ where: { id } });
    if (!receipt) {
      return NextResponse.json({ error: "Recibo não encontrado." }, { status: 404 });
    }
    return NextResponse.json({
      id: receipt.id,
      payerName: receipt.payerName,
      payerCpf: receipt.payerCpf,
      providerName: receipt.providerName,
      providerCpf: receipt.providerCpf,
      providerPhone: receipt.providerPhone,
      serviceDesc: receipt.serviceDesc,
      amount: receipt.amount.toString(),
      serviceDate: receipt.serviceDate.toISOString(),
      status: receipt.status,
      signatureBase64: receipt.signatureBase64,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao buscar recibo." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { signatureBase64 } = body as { signatureBase64?: unknown };

    if (typeof signatureBase64 !== "string" || !signatureBase64.trim()) {
      return NextResponse.json(
        { error: "Assinatura ausente ou inválida." },
        { status: 400 },
      );
    }

    if (!signatureBase64.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Formato de assinatura inválido." },
        { status: 400 },
      );
    }

    const existing = await prisma.receipt.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Recibo não encontrado." }, { status: 404 });
    }
    if (existing.status === "assinado") {
      return NextResponse.json(
        { error: "Este recibo já foi assinado." },
        { status: 409 },
      );
    }

    const receipt = await prisma.receipt.update({
      where: { id },
      data: {
        signatureBase64: signatureBase64.trim(),
        status: "assinado",
      },
    });

    return NextResponse.json({
      id: receipt.id,
      status: receipt.status,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao salvar assinatura." },
      { status: 500 },
    );
  }
}
