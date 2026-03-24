import {
  formatCpfDisplay,
  formatCurrencyBRL,
  formatPhoneBr,
  formatServiceDate,
} from "@/lib/receipt-text";
import type { SerializedReceipt } from "@/types/receipt";

type Props = {
  receipt: SerializedReceipt;
  className?: string;
};

export function ReceiptParagraph({ receipt, className }: Props) {
  const dateObj = new Date(receipt.serviceDate);
  const amountFormatted = formatCurrencyBRL(receipt.amount);
  const cpfPayer = formatCpfDisplay(receipt.payerCpf);
  const cpfProvider = formatCpfDisplay(receipt.providerCpf);
  const phone = formatPhoneBr(receipt.providerPhone);

  return (
    <p className={className ?? "text-base leading-relaxed text-ink"}>
      Eu, <strong>{receipt.providerName}</strong>, inscrito(a) no CPF{" "}
      <strong>{cpfProvider}</strong>, telefone {phone}, declaro que recebi de{" "}
      <strong>{receipt.payerName}</strong>, CPF <strong>{cpfPayer}</strong>, a
      quantia de <strong>{amountFormatted}</strong>, referente a{" "}
      {receipt.serviceDesc} no dia {formatServiceDate(dateObj)}.
    </p>
  );
}
