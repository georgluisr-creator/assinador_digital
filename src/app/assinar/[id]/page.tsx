import { DatabaseConnectionError } from "@/components/DatabaseConnectionError";
import { SignReceiptClient } from "@/components/SignReceiptClient";
import { prisma } from "@/lib/prisma";
import type { SerializedReceipt } from "@/types/receipt";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PageProps = { params: Promise<{ id: string }> };

export default async function AssinarPage({ params }: PageProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  let row;
  try {
    row = await prisma.receipt.findUnique({ where: { id } });
  } catch (e) {
    console.error("[assinar] Falha ao buscar recibo:", e);
    return (
      <div className="min-h-dvh safe-pb">
        <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-lg px-4 py-4 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Assinatura digital
            </p>
            <h1 className="text-lg font-bold text-ink">Recibo de serviço</h1>
          </div>
        </header>
        <main className="mx-auto max-w-lg px-4 py-6 sm:px-6">
          <DatabaseConnectionError />
        </main>
      </div>
    );
  }

  if (!row) notFound();

  const receipt: SerializedReceipt = {
    id: row.id,
    payerName: row.payerName,
    payerCpf: row.payerCpf,
    providerName: row.providerName,
    providerCpf: row.providerCpf,
    providerPhone: row.providerPhone,
    serviceDesc: row.serviceDesc,
    amount: row.amount.toString(),
    serviceDate: row.serviceDate.toISOString(),
    status: row.status,
    signatureBase64: row.signatureBase64,
  };

  return (
    <div className="min-h-dvh safe-pb">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-lg px-4 py-4 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Assinatura digital
          </p>
          <h1 className="text-lg font-bold text-ink">Recibo de serviço</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 sm:px-6">
        <SignReceiptClient receipt={receipt} />
      </main>
    </div>
  );
}
