import type { SerializedReceipt } from "@/types/receipt";
import { DownloadPdfButton } from "./DownloadPdfButton";

type Props = {
  receipts: SerializedReceipt[];
};

function statusLabel(status: string) {
  if (status === "assinado") return "Assinado";
  if (status === "pendente") return "Pendente";
  return status;
}

function statusClass(status: string) {
  if (status === "assinado") return "bg-emerald-100 text-emerald-800";
  return "bg-amber-100 text-amber-900";
}

export function ReceiptsList({ receipts }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-ink">Últimos recibos</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Acompanhe o status e baixe o PDF quando estiver assinado.
      </p>

      {receipts.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">Nenhum recibo ainda.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {receipts.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 py-4 first:pt-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">
                  {r.providerName}
                  <span className="font-normal text-ink-muted"> — </span>
                  <span className="text-ink-muted">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(parseFloat(r.amount))}
                  </span>
                </p>
                <p className="mt-0.5 truncate text-sm text-ink-muted">
                  {r.serviceDesc}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-400">
                  {r.id}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(r.status)}`}
                >
                  {statusLabel(r.status)}
                </span>
                {r.status === "assinado" && r.signatureBase64 ? (
                  <DownloadPdfButton receipt={r} />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
