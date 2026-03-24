"use client";

import { useCallback, useState } from "react";
import type { SerializedReceipt } from "@/types/receipt";
import { ReceiptPrintBlock } from "./ReceiptPrintBlock";

type Props = {
  receipt: SerializedReceipt;
};

export function DownloadPdfButton({ receipt }: Props) {
  const [busy, setBusy] = useState(false);
  const rootId = `pdf-recibo-${receipt.id}`;

  const download = useCallback(async () => {
    setBusy(true);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    try {
      const el = document.getElementById(rootId);
      if (!el) return;
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 12,
          filename: `recibo-${receipt.id.slice(0, 8)}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .save();
    } catch (e) {
      console.error(e);
      alert("Não foi possível gerar o PDF. Tente outro navegador.");
    } finally {
      setBusy(false);
    }
  }, [receipt.id, rootId]);

  return (
    <>
      {busy ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-2 shadow-2xl">
            <ReceiptPrintBlock receipt={receipt} rootId={rootId} />
            <p className="px-4 pb-4 text-center text-sm text-ink-muted">
              Gerando PDF…
            </p>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {busy ? "Gerando…" : "Baixar PDF"}
      </button>
    </>
  );
}
