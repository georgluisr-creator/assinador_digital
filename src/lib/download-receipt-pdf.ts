"use client";

import { createRoot } from "react-dom/client";
import { ReceiptPrintBlock } from "@/components/ReceiptPrintBlock";
import type { SerializedReceipt } from "@/types/receipt";

/** Gera e baixa o PDF no aparelho (mesmo fluxo do painel). */
export async function downloadReceiptPdfToDevice(
  receipt: SerializedReceipt,
): Promise<void> {
  const rootId = `pdf-export-${receipt.id}-${Date.now()}`;
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.style.cssText =
    "position:fixed;left:0;top:0;z-index:2147483646;width:min(210mm,100vw);pointer-events:none;";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    <div className="bg-white p-4">
      <ReceiptPrintBlock receipt={receipt} rootId={rootId} />
    </div>,
  );

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const el = document.getElementById(rootId);
  if (!el) {
    root.unmount();
    container.remove();
    throw new Error("Elemento do PDF não encontrado.");
  }

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

  root.unmount();
  container.remove();
}
