export function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/** Formata CPF a partir de 11 dígitos; se inválido, devolve o texto original ou traço. */
export function formatCpfDisplay(stored: string): string {
  const d = digitsOnly(stored);
  if (d.length !== 11) return stored.trim() || "—";
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Formata telefone BR (10 ou 11 dígitos). */
export function formatPhoneBr(stored: string): string {
  const d = digitsOnly(stored);
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return stored.trim() || "—";
}

export function formatCurrencyBRL(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

export function formatServiceDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
