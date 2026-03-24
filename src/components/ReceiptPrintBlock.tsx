"use client";

import { formatServiceDate } from "@/lib/receipt-text";
import type { SerializedReceipt } from "@/types/receipt";
import { ReceiptParagraph } from "./ReceiptParagraph";

type Props = {
  receipt: SerializedReceipt;
  /** id do elemento raiz para html2pdf */
  rootId: string;
};

export function ReceiptPrintBlock({ receipt, rootId }: Props) {
  const dateObj = new Date(receipt.serviceDate);

  return (
    <div
      id={rootId}
      className="rounded-xl border border-slate-200 bg-white p-6 text-ink shadow-sm"
    >
      <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-ink-muted">
        Recibo de serviço
      </h3>
      <ReceiptParagraph receipt={receipt} className="mt-4 text-base leading-relaxed text-ink" />
      <p className="mt-4 text-sm text-ink-muted">
        Data de emissão: {formatServiceDate(dateObj)}
      </p>
      {receipt.signatureBase64 ? (
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-ink">Assinatura do prestador</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={receipt.signatureBase64}
            alt="Assinatura"
            className="mt-3 max-h-40 w-auto object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
