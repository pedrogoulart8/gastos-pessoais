"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import type { Category } from "@/app/generated/prisma/client";
import type { TransactionWithCategory } from "@/src/types";
import { getApiHeaders } from "@/src/lib/apiClient";

interface Props {
  transaction: TransactionWithCategory;
  categories: Category[];
  onSaved: () => void;
  onClose: () => void;
}

export function EditTransactionForm({ transaction, categories, onSaved, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    date: new Date(transaction.date).toISOString().slice(0, 10),
    amount: (transaction.amount / 100).toFixed(2),
    merchant: transaction.merchant,
    paymentMethod: transaction.paymentMethod,
    description: transaction.description ?? "",
    categoryId: transaction.categoryId,
    notes: transaction.notes ?? "",
  });

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      const amountCents = Math.round(parseFloat(form.amount) * 100);
      await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getApiHeaders() },
        body: JSON.stringify({
          date: form.date,
          amount: amountCents,
          merchant: form.merchant,
          description: form.description,
          paymentMethod: form.paymentMethod,
          categoryId: form.categoryId,
          notes: form.notes,
        }),
      });
      onSaved();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold">Editar transação</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1 hover:bg-muted text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-5">
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

        <div className="flex gap-3 border-t border-border p-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </button>
        </div>
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
