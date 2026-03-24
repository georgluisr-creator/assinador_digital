import { ContractorForm } from "@/components/ContractorForm";
import { ReceiptsList } from "@/components/ReceiptsList";
import { prisma } from "@/lib/prisma";
import type { SerializedReceipt } from "@/types/receipt";

export const dynamic = "force-dynamic";

async function getReceipts(): Promise<SerializedReceipt[]> {
  const rows = await prisma.receipt.findMany({
    orderBy: { serviceDate: "desc" },
    take: 30,
  });
  return rows.map((r) => ({
    id: r.id,
    payerName: r.payerName,
    payerCpf: r.payerCpf,
    providerName: r.providerName,
    providerCpf: r.providerCpf,
    providerPhone: r.providerPhone,
    serviceDesc: r.serviceDesc,
    amount: r.amount.toString(),
    serviceDate: r.serviceDate.toISOString(),
    status: r.status,
    signatureBase64: r.signatureBase64,
  }));
}

export default async function HomePage() {
  const receipts = await getReceipts();

  return (
    <div className="min-h-dvh safe-pb">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Recibos de serviço
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Gere recibos, envie por WhatsApp e colete assinatura digital.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6">
        <ContractorForm />
        <ReceiptsList receipts={receipts} />
      </main>
    </div>
  );
}
