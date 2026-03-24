export type SerializedReceipt = {
  id: string;
  payerName: string;
  payerCpf: string;
  providerName: string;
  providerCpf: string;
  providerPhone: string;
  serviceDesc: string;
  amount: string;
  serviceDate: string;
  status: string;
  signatureBase64: string | null;
};
