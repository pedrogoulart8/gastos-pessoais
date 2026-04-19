"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Category } from "@/app/generated/prisma/client";
import type { ExtractionResult } from "@/src/types";
import { getApiHeaders } from "@/src/lib/apiClient";

interface Props {
  receiptId: string;
  imageUrl: string;
  extraction: ExtractionResult;
  categories: Category[];
  onConfirm: () => void;
  onDiscard: () => void;
}

export function ReviewForm({
  receiptId,
  imageUrl,
  extraction,
  categories,
  onConfirm,
  onDiscard,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState({
    date: extraction.date,
    amount: (extraction.amount_cents / 100).toFixed(2),
    merchant: extraction.merchant,
    paymentMethod: extraction.payment_method,
    description: extraction.description_suggestion,
    categoryId: categories[0]?.id ?? "",
    notes: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleConfirm() {
    setError("");
    startTransition(async () => {
      try {
        const amountCents = Math.round(parseFloat(form.amount) * 100);
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getApiHeaders() },
          body: JSON.stringify({
            receiptId,
            date: form.date,
            amount: amountCents,
            merchant: form.merchant,
            description: form.description,
            paymentMethod: form.paymentMethod,
            categoryId: form.categoryId,
            notes: form.notes || undefined,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Erro ${res.status} ao salvar`);
        }
        onConfirm();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro desconhecido");
      }
    });
  }

  const isLowConfidence = extraction.confidence === "low";

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* Imagem */}
      <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-muted">
        <Image src={imageUrl} alt="Comprovante" fill className="object-contain" />
      </div>

      {/* Aviso de baixa confiança */}
      {isLowConfidence && (
        <div className="flex items-start gap-2 rounded-xl bg-yellow-50 border border-yellow-200 px-3 py-2.5 text-sm text-yellow-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            Alguns dados podem estar incorretos. Revise os campos antes de confirmar.
          </span>
        </div>
      )}

      {/* Campos */}
      <div className="space-y-3">
        <Field label="Estabelecimento">
          <input
            value={form.merchant}
            onChange={(e) => update("merchant", e.target.value)}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor (R$)">
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Data">
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Categoria">
          <select
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className="input"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Descrição">
          <input
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Método de pagamento">
          <select
            value={form.paymentMethod}
            onChange={(e) => update("paymentMethod", e.target.value)}
            className="input"
          >
            <option value="PIX">Pix</option>
            <option value="CARD">Cartão</option>
            <option value="BOLETO">Boleto</option>
            <option value="CASH">Dinheiro</option>
            <option value="OTHER">Outro</option>
          </select>
        </Field>

        <Field label="Notas (opcional)">
          <input
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Observações..."
            className="input"
          />
        </Field>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onDiscard}
          className="flex-1 rounded-2xl border border-border py-3.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Descartar
        </button>
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Confirmar
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
