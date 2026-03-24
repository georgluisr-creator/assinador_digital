"use client";

import {
  DEFAULT_SERVICE_DESCRIPTION,
  type PayerPresetId,
  PAYER_PRESETS,
  getPayerPreset,
} from "@/lib/payer-presets";
import { formatPhoneBr } from "@/lib/receipt-text";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function todayISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const INITIAL_PRESET: PayerPresetId = "luiz";
const firstPreset = getPayerPreset(INITIAL_PRESET)!;

export function ContractorForm() {
  const router = useRouter();
  const [payerPreset, setPayerPreset] = useState<PayerPresetId>(INITIAL_PRESET);
  const [payerName, setPayerName] = useState(firstPreset.name);
  const [payerCpf, setPayerCpf] = useState(firstPreset.cpf);
  const [payerWhatsapp, setPayerWhatsapp] = useState(() =>
    firstPreset.whatsappDigits
      ? formatPhoneBr(firstPreset.whatsappDigits)
      : "",
  );
  const [providerName, setProviderName] = useState("");
  const [providerCpf, setProviderCpf] = useState("");
  const [providerPhone, setProviderPhone] = useState("");
  const [serviceDesc, setServiceDesc] = useState(DEFAULT_SERVICE_DESCRIPTION);
  const [amount, setAmount] = useState("");
  const [serviceDate, setServiceDate] = useState(todayISODate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const baseUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return (
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      window.location.origin
    );
  }, []);

  const signUrl = createdId ? `${baseUrl}/assinar/${createdId}` : "";

  const whatsappHref = useMemo(() => {
    if (!signUrl) return "#";
    const msg = `Olá! Por favor assine o recibo de serviço neste link:\n${signUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }, [signUrl]);

  function applyPayerPreset(id: PayerPresetId) {
    setPayerPreset(id);
    const preset = getPayerPreset(id);
    if (preset) {
      setPayerName(preset.name);
      setPayerCpf(preset.cpf);
      setPayerWhatsapp(
        preset.whatsappDigits ? formatPhoneBr(preset.whatsappDigits) : "",
      );
    } else {
      setPayerName("");
      setPayerCpf("");
      setPayerWhatsapp("");
    }
  }

  function markCustomIfEdited(nextName: string, nextCpf: string) {
    const match = PAYER_PRESETS.find(
      (p) => p.name === nextName && p.cpf === nextCpf,
    );
    if (match) {
      setPayerPreset(match.id);
    } else {
      setPayerPreset("custom");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setCreatedId(null);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerName,
          payerCpf,
          payerWhatsapp,
          providerName,
          providerCpf,
          providerPhone,
          serviceDesc,
          amount,
          serviceDate,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        setError(data.error || "Erro ao criar recibo.");
        return;
      }
      if (data.id) {
        setCreatedId(data.id);
        setPayerPreset(INITIAL_PRESET);
        setPayerName(firstPreset.name);
        setPayerCpf(firstPreset.cpf);
        setPayerWhatsapp(
          firstPreset.whatsappDigits
            ? formatPhoneBr(firstPreset.whatsappDigits)
            : "",
        );
        setProviderName("");
        setProviderCpf("");
        setProviderPhone("");
        setServiceDesc(DEFAULT_SERVICE_DESCRIPTION);
        setAmount("");
        setServiceDate(todayISODate());
        router.refresh();
      }
    } catch {
      setError("Falha de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-ink">Novo recibo</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Preencha os dados e envie o link ao prestador para assinar no celular.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Contratante
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              className="block text-sm font-medium text-ink"
              htmlFor="payerPreset"
            >
              Selecionar contratante
            </label>
            <select
              id="payerPreset"
              name="payerPreset"
              value={payerPreset}
              onChange={(e) =>
                applyPayerPreset(e.target.value as PayerPresetId)
              }
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 focus:border-accent focus:ring-2"
            >
              {PAYER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="custom">Outro (preencher nome e CPF abaixo)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink" htmlFor="payer">
              Nome do contratante
            </label>
            <input
              id="payer"
              name="payerName"
              required
              value={payerName}
              onChange={(e) => {
                const v = e.target.value;
                setPayerName(v);
                markCustomIfEdited(v, payerCpf);
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
              placeholder="Nome completo"
              autoComplete="name"
            />
            <p className="mt-1 text-xs text-ink-muted">
              Ao escolher na lista, nome e CPF são preenchidos; você pode editar
              livremente.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink" htmlFor="payerCpf">
              CPF do contratante
            </label>
            <input
              id="payerCpf"
              name="payerCpf"
              required
              inputMode="numeric"
              autoComplete="off"
              value={payerCpf}
              onChange={(e) => {
                const v = e.target.value;
                setPayerCpf(v);
                markCustomIfEdited(payerName, v);
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="block text-sm font-medium text-ink"
              htmlFor="payerWhatsapp"
            >
              Seu WhatsApp (contratante)
            </label>
            <input
              id="payerWhatsapp"
              name="payerWhatsapp"
              required
              inputMode="tel"
              autoComplete="tel"
              value={payerWhatsapp}
              onChange={(e) => setPayerWhatsapp(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
              placeholder="(99) 99999-9999"
              maxLength={16}
            />
            <p className="mt-1 text-xs text-ink-muted">
              Após o motorista assinar, abriremos o WhatsApp para ele enviar o
              PDF a você. Use DDD + número.
            </p>
          </div>
        </div>

        <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Prestador de serviço
        </p>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-ink"
              htmlFor="provider"
            >
              Nome do prestador
            </label>
            <input
              id="provider"
              name="providerName"
              required
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
              placeholder="Ex.: João Souza"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="block text-sm font-medium text-ink"
                htmlFor="providerCpf"
              >
                CPF do prestador
              </label>
              <input
                id="providerCpf"
                name="providerCpf"
                required
                inputMode="numeric"
                value={providerCpf}
                onChange={(e) => setProviderCpf(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-ink"
                htmlFor="providerPhone"
              >
                Telefone do prestador
              </label>
              <input
                id="providerPhone"
                name="providerPhone"
                required
                inputMode="tel"
                autoComplete="tel"
                value={providerPhone}
                onChange={(e) => setProviderPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
                placeholder="(11) 98765-4321"
                maxLength={16}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="desc">
            Descrição do serviço
          </label>
          <textarea
            id="desc"
            name="serviceDesc"
            required
            rows={4}
            value={serviceDesc}
            onChange={(e) => setServiceDesc(e.target.value)}
            className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
            placeholder={DEFAULT_SERVICE_DESCRIPTION}
          />
          <p className="mt-1 text-xs text-ink-muted">
            Texto padrão já vem preenchido; altere se precisar.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="amt">
              Valor (R$)
            </label>
            <input
              id="amt"
              name="amount"
              required
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
              placeholder="1500,00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="dt">
              Data do serviço
            </label>
            <input
              id="dt"
              name="serviceDate"
              type="date"
              required
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 focus:border-accent focus:ring-2"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Salvando…" : "Gerar recibo"}
        </button>
      </form>

      {createdId && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-sm font-medium text-emerald-900">
            Recibo criado. Envie o link ao prestador:
          </p>
          <p className="mt-2 break-all font-mono text-xs text-emerald-800 sm:text-sm">
            {signUrl}
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            <span aria-hidden>📱</span>
            Enviar para WhatsApp
          </a>
        </div>
      )}
    </section>
  );
}
