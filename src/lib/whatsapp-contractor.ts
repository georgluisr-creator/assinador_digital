import { digitsOnly } from "@/lib/receipt-text";

/** Monta URL wa.me para o número do contratante (Brasil: força 55 + DDD + número). */
export function buildWaMeUrlForContractor(
  phoneDigits: string,
  message: string,
): string | null {
  let d = digitsOnly(phoneDigits);
  if (d.length < 10 || d.length > 13) return null;
  if (!d.startsWith("55")) d = `55${d}`;
  return `https://wa.me/${d}?text=${encodeURIComponent(message)}`;
}
