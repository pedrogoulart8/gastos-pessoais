import { z } from "zod";

export const extractionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (YYYY-MM-DD)"),
  amount_cents: z.number().int().positive("Valor deve ser positivo"),
  merchant: z.string().min(1, "Nome do estabelecimento é obrigatório"),
  payment_method: z.enum(["PIX", "CARD", "BOLETO", "CASH", "OTHER"]),
  description_suggestion: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

export type ExtractionInput = z.infer<typeof extractionSchema>;

// JSON Schema para o tool use do Claude
export const extractionJsonSchema = {
  type: "object",
  properties: {
    date: {
      type: "string",
      description: "Data da transação no formato YYYY-MM-DD",
    },
    amount_cents: {
      type: "integer",
      description: "Valor em centavos (ex: R$ 45,90 → 4590)",
    },
    merchant: {
      type: "string",
      description: "Nome do estabelecimento ou beneficiário",
    },
    payment_method: {
      type: "string",
      enum: ["PIX", "CARD", "BOLETO", "CASH", "OTHER"],
      description: "Método de pagamento identificado",
    },
    description_suggestion: {
      type: "string",
      description: "Sugestão de descrição curta para a transação",
    },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"],
      description: "Confiança na extração: high se dados claros, low se difícil de ler",
    },
  },
  required: ["date", "amount_cents", "merchant", "payment_method", "description_suggestion", "confidence"],
};
