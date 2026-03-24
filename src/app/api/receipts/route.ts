import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { digitsOnly } from "@/lib/receipt-text";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const receipts = await prisma.receipt.findMany({
      orderBy: { serviceDate: "desc" },
      take: 30,
    });
    return NextResponse.json({
      receipts: receipts.map((r) => ({
        id: r.id,
        payerName: r.payerName,
        payerCpf: r.payerCpf,
        payerWhatsapp: r.payerWhatsapp,
        providerName: r.providerName,
        providerCpf: r.providerCpf,
        providerPhone: r.providerPhone,
        serviceDesc: r.serviceDesc,
        amount: r.amount.toString(),
        serviceDate: r.serviceDate.toISOString(),
        status: r.status,
        signatureBase64: r.signatureBase64,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Não foi possível listar os recibos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      payerName,
      payerCpf,
      providerName,
      providerCpf,
      providerPhone,
      serviceDesc,
      amount,
      serviceDate,
      payerWhatsapp,
    } = body as Record<string, unknown>;

    if (
      typeof payerName !== "string" ||
      typeof payerCpf !== "string" ||
      typeof payerWhatsapp !== "string" ||
      typeof providerName !== "string" ||
      typeof providerCpf !== "string" ||
      typeof providerPhone !== "string" ||
      typeof serviceDesc !== "string" ||
      typeof amount === "undefined" ||
      typeof serviceDate !== "string"
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes ou inválidos." },
        { status: 400 },
      );
    }

    const trimmed = {
      payerName: payerName.trim(),
      providerName: providerName.trim(),
      serviceDesc: serviceDesc.trim(),
    };

    const payerCpfDigits = digitsOnly(payerCpf);
    const payerWhatsappDigits = digitsOnly(payerWhatsapp);
    const providerCpfDigits = digitsOnly(providerCpf);
    const providerPhoneDigits = digitsOnly(providerPhone);

    if (
      !trimmed.payerName ||
      !trimmed.providerName ||
      !trimmed.serviceDesc
    ) {
      return NextResponse.json(
        { error: "Preencha nome do contratante, prestador e descrição." },
        { status: 400 },
      );
    }

    if (payerCpfDigits.length !== 11) {
      return NextResponse.json(
        { error: "CPF do contratante deve ter 11 dígitos." },
        { status: 400 },
      );
    }
    if (payerWhatsappDigits.length < 10 || payerWhatsappDigits.length > 11) {
      return NextResponse.json(
        {
          error:
            "WhatsApp do contratante: informe DDD + número (10 ou 11 dígitos).",
        },
        { status: 400 },
      );
    }
    if (providerCpfDigits.length !== 11) {
      return NextResponse.json(
        { error: "CPF do prestador deve ter 11 dígitos." },
        { status: 400 },
      );
    }
    if (providerPhoneDigits.length < 10 || providerPhoneDigits.length > 11) {
      return NextResponse.json(
        { error: "Telefone do prestador deve ter 10 ou 11 dígitos (com DDD)." },
        { status: 400 },
      );
    }

    const parsedAmount = new Prisma.Decimal(String(amount).replace(",", "."));
    if (parsedAmount.lte(0)) {
      return NextResponse.json(
        { error: "Informe um valor maior que zero." },
        { status: 400 },
      );
    }

    const date = new Date(serviceDate);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Data inválida." }, { status: 400 });
    }

    const receipt = await prisma.receipt.create({
      data: {
        payerName: trimmed.payerName,
        payerCpf: payerCpfDigits,
        payerWhatsapp: payerWhatsappDigits,
        providerName: trimmed.providerName,
        providerCpf: providerCpfDigits,
        providerPhone: providerPhoneDigits,
        serviceDesc: trimmed.serviceDesc,
        amount: parsedAmount,
        serviceDate: date,
        status: "pendente",
      },
    });

    return NextResponse.json({
      id: receipt.id,
      status: receipt.status,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao criar recibo." },
      { status: 500 },
    );
  }
}
