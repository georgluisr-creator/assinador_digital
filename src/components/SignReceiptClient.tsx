"use client";

import { downloadReceiptPdfToDevice } from "@/lib/download-receipt-pdf";
import { buildWaMeUrlForContractor } from "@/lib/whatsapp-contractor";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import type { SerializedReceipt } from "@/types/receipt";
import { ReceiptParagraph } from "./ReceiptParagraph";

type Props = {
  receipt: SerializedReceipt;
};

export function SignReceiptClient({ receipt }: Props) {
  const router = useRouter();
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSigned = receipt.status === "assinado" && receipt.signatureBase64;

  async function handleSign() {
    setError(null);
    const pad = sigRef.current;
    if (!pad || pad.isEmpty()) {
      setError("Desenhe sua assinatura no campo acima.");
      return;
    }
    setLoading(true);
    const dataUrl = pad.getTrimmedCanvas().toDataURL("image/png");
    try {
      const res = await fetch(`/api/receipts/${receipt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureBase64: dataUrl }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar.");
        return;
      }

      const signed: SerializedReceipt = {
        ...receipt,
        status: "assinado",
        signatureBase64: dataUrl,
      };

      try {
        await downloadReceiptPdfToDevice(signed);
      } catch (e) {
        console.error(e);
        alert(
          "O PDF não foi baixado automaticamente. Você pode avisar o contratante pelo WhatsApp e ele baixa o PDF no painel dele.",
        );
      }

      const base =
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const link = `${base}/assinar/${receipt.id}`;
      const msg = `Olá, ${receipt.payerName}!

Assinei o recibo de serviço. Por favor, confira o PDF que enviei em anexo nesta conversa.

Link do recibo assinado: ${link}

Obrigado(a).`;

      const wa = buildWaMeUrlForContractor(receipt.payerWhatsapp, msg);
      if (wa) {
        window.open(wa, "_blank", "noopener,noreferrer");
      } else {
        alert(
          "Recibo salvo, mas o WhatsApp do contratante não está válido neste recibo. O contratante pode baixar o PDF no sistema.",
        );
      }

      router.refresh();
    } catch {
      setError("Falha de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Texto do recibo
        </h2>
        <div className="mt-3">
          <ReceiptParagraph receipt={receipt} />
        </div>
      </article>

      {isSigned ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 sm:p-6">
          <p className="font-medium text-emerald-900">
            Recibo já assinado com sucesso
          </p>
          <p className="mt-2 text-sm text-emerald-800">
            Sua assinatura foi registrada. Você pode fechar esta página.
          </p>
          <div className="mt-4 border-t border-emerald-200/80 pt-4">
            <p className="text-sm font-medium text-emerald-900">Assinatura</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receipt.signatureBase64!}
              alt="Assinatura registrada"
              className="mt-3 max-h-48 w-auto object-contain"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-ink">Assinatura</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Use o dedo ou caneta no celular para assinar dentro da área abaixo.
            Ao finalizar, o PDF será baixado e o WhatsApp abrirá para você
            enviar o arquivo ao contratante.
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
            {mounted ? (
              <SignatureCanvas
                ref={sigRef}
                canvasProps={{
                  className:
                    "h-44 w-full touch-none bg-white sm:h-52 [touch-action:none]",
                }}
                backgroundColor="rgb(255,255,255)"
              />
            ) : (
              <div
                className="h-44 animate-pulse bg-slate-100 sm:h-52"
                aria-hidden
              />
            )}
          </div>

          {error ? (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                sigRef.current?.clear();
                setError(null);
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-ink transition hover:bg-slate-50"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={handleSign}
              disabled={loading}
              className="flex-1 rounded-xl bg-accent px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-accent-hover disabled:opacity-60"
            >
              {loading
                ? "Salvando, PDF e WhatsApp…"
                : "Assinar e finalizar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
