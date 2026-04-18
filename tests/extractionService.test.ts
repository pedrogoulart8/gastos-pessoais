import { describe, it, expect, vi, beforeEach } from "vitest";

// Moca o singleton diretamente — evita complexidade do construtor do SDK
const mockCreate = vi.hoisted(() => vi.fn());

vi.mock("@/src/lib/anthropic", () => ({
  anthropic: {
    messages: { create: mockCreate },
  },
}));

import { extractReceiptData } from "@/src/services/extractionService";

const validExtraction = {
  date: "2026-04-15",
  amount_cents: 4590,
  merchant: "Supermercado Pão de Açúcar",
  payment_method: "PIX",
  description_suggestion: "Compras de mercado",
  confidence: "high",
};

function makeToolUseResponse(input: unknown) {
  return {
    content: [{ type: "tool_use", id: "tu_1", name: "save_receipt_data", input }],
    stop_reason: "tool_use",
  };
}

describe("extractReceiptData", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna dados corretos para extração bem-sucedida", async () => {
    mockCreate.mockResolvedValue(makeToolUseResponse(validExtraction));
    const result = await extractReceiptData("base64data");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount_cents).toBe(4590);
      expect(result.data.merchant).toBe("Supermercado Pão de Açúcar");
      expect(result.data.confidence).toBe("high");
    }
  });

  it("retorna erro quando Claude não retorna tool_use", async () => {
    mockCreate.mockResolvedValue({ content: [{ type: "text", text: "Não entendi" }] });
    const result = await extractReceiptData("base64data");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("não retornou dados estruturados");
    }
  });

  it("retorna erro quando campos obrigatórios estão faltando", async () => {
    mockCreate.mockResolvedValue(makeToolUseResponse({ date: "2026-04-15" }));
    const result = await extractReceiptData("base64data");
    expect(result.success).toBe(false);
  });

  it("retorna erro quando amount_cents é negativo", async () => {
    mockCreate.mockResolvedValue(
      makeToolUseResponse({ ...validExtraction, amount_cents: -100 })
    );
    const result = await extractReceiptData("base64data");
    expect(result.success).toBe(false);
  });

  it("retorna erro quando data tem formato errado", async () => {
    mockCreate.mockResolvedValue(
      makeToolUseResponse({ ...validExtraction, date: "15/04/2026" })
    );
    const result = await extractReceiptData("base64data");
    expect(result.success).toBe(false);
  });

  it("captura erros de rede e retorna mensagem amigável", async () => {
    mockCreate.mockRejectedValue(new Error("Network error"));
    const result = await extractReceiptData("base64data");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Network error");
    }
  });
});
