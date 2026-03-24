-- WhatsApp do contratante (motorista envia PDF após assinar)
ALTER TABLE receipts
  ADD COLUMN IF NOT EXISTS payer_whatsapp TEXT NOT NULL DEFAULT '';

-- Opcional: preencher recibos antigos e remover DEFAULT depois
-- UPDATE receipts SET payer_whatsapp = '' WHERE payer_whatsapp IS NULL;
