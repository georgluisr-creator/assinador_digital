"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function todayISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ContractorForm() {
  const router = useRouter();
  const [payerName, setPayerName] = useState("");
  const [payerCpf, setPayerCpf] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerCpf, setProviderCpf] = useState("");
  const [providerPhone, setProviderPhone] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
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
        setPayerName("");
        setPayerCpf("");
        setProviderName("");
        setProviderCpf("");
        setProviderPhone("");
        setServiceDesc("");
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
            <label className="block text-sm font-medium text-ink" htmlFor="payer">
              Seu nome
            </label>
            <input
              id="payer"
              name="payerName"
              required
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
              placeholder="Ex.: Maria Silva"
              autoComplete="name"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink" htmlFor="payerCpf">
              Seu CPF
            </label>
            <input
              id="payerCpf"
              name="payerCpf"
              required
              inputMode="numeric"
              autoComplete="off"
              value={payerCpf}
              onChange={(e) => setPayerCpf(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
              placeholder="000.000.000-00"
              maxLength={14}
            />
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
            rows={3}
            value={serviceDesc}
            onChange={(e) => setServiceDesc(e.target.value)}
            className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-ink outline-none ring-accent/30 placeholder:text-slate-400 focus:border-accent focus:ring-2"
            placeholder="Ex.: transporte de cargas — rota X"
          />
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
