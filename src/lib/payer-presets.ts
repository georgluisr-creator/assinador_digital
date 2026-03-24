/** Contratantes fixos + descrição padrão do serviço (formulário). */

export const DEFAULT_SERVICE_DESCRIPTION =
  "Referente ao frete de transporte de soja da fazenda Rancho Fundo em Açailândia - MA para a empresa ADM em Porto Franco-MA";

export const PAYER_PRESETS = [
  {
    id: "luiz" as const,
    name: "Luiz Bernardino de Deus",
    cpf: "393.298.106-59",
    /** DDD+número, só dígitos; preencha para preencher o WhatsApp ao escolher o preset. */
    whatsappDigits: "",
  },
  {
    id: "george" as const,
    name: "George Luis Rodrigues de Deus",
    cpf: "045.672.993-37",
    whatsappDigits: "",
  },
] as const;

export type PayerPresetId = (typeof PAYER_PRESETS)[number]["id"] | "custom";

export function getPayerPreset(id: PayerPresetId) {
  if (id === "custom") return null;
  return PAYER_PRESETS.find((p) => p.id === id) ?? null;
}
