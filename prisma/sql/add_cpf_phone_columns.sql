-- Execute no Neon (SQL Editor) se a tabela receipts existir sem estas colunas.
-- Depois disso, o Prisma volta a funcionar sem erro P2022.

ALTER TABLE receipts
  ADD COLUMN IF NOT EXISTS payer_cpf TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS provider_cpf TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS provider_phone TEXT NOT NULL DEFAULT '';

-- Opcional: remover DEFAULT após preencher dados legados (ou deixar como está).
-- ALTER TABLE receipts ALTER COLUMN payer_cpf DROP DEFAULT;
-- ALTER TABLE receipts ALTER COLUMN provider_cpf DROP DEFAULT;
-- ALTER TABLE receipts ALTER COLUMN provider_phone DROP DEFAULT;
