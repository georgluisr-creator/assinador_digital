export type SerializedReceipt = {
  id: string;
  payerName: string;
  payerCpf: string;
  /** Apenas dígitos; usado para abrir wa.me do contratante após assinar. */
  payerWhatsapp: string;
  providerName: string;
  providerCpf: string;
  providerPhone: string;
  serviceDesc: string;
  amount: string;
  serviceDate: string;
  status: string;
  signatureBase64: string | null;
};
