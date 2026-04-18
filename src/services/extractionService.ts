import { anthropic } from "@/src/lib/anthropic";
import { extractionSchema, extractionJsonSchema } from "@/src/schemas/receipt";
import type { ExtractionResponse } from "@/src/types";

export async function extractReceiptData(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg"
): Promise<ExtractionResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    const today = new Date().toISOString().slice(0, 10);
    return {
      success: true,
      data: {
        date: today,
        amount_cents: 4590,
        merchant: "Estabelecimento Mock",
        payment_method: "PIX",
        description_suggestion: "Compra de teste (sem IA)",
        confidence: "low",
      },
    };
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools: [
        {
          name: "save_receipt_data",
          description:
            "Extrai dados estruturados de um comprovante de pagamento brasileiro (Pix, cartão, etc.)",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          input_schema: extractionJsonSchema as any,
        },
      ],
      tool_choice: { type: "tool", name: "save_receipt_data" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Extraia os dados deste comprovante de pagamento brasileiro.
Se for um Pix, identifique o beneficiário, valor e data.
Se não conseguir ler algum campo com certeza, use confidence "low".
A data deve estar no formato YYYY-MM-DD.
O valor deve estar em centavos (R$ 45,90 → 4590).`,
            },
          ],
        },
      ],
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return { success: false, error: "Claude não retornou dados estruturados" };
    }

    const parsed = extractionSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      return {
        success: false,
        error: `Dados extraídos inválidos: ${parsed.error.message}`,
      };
    }

    return { success: true, data: parsed.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Falha na extração: ${message}` };
  }
}
