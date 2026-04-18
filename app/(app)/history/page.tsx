"use client";

import { useEffect, useState, useCallback } from "react";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionCard } from "@/components/transaction/TransactionCard";
import { TransactionFilters } from "@/components/transaction/TransactionFilters";
import { ImageLightbox } from "@/components/transaction/ImageLightbox";
import { EditTransactionForm } from "@/components/transaction/EditTransactionForm";
import type { TransactionWithCategory } from "@/src/types";
import type { Category } from "@/app/generated/prisma/client";
import { getApiHeaders } from "@/src/lib/apiClient";

function HistoryContent() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [month, setMonth] = useState(currentMonth);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<TransactionWithCategory | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const headers = getApiHeaders();

  const fetchTransactions = useCallback(async () => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (categoryId) params.set("categoryId", categoryId);
    if (search) params.set("search", search);

    const res = await fetch(`/api/transactions?${params}`, { headers });
    const data = await res.json();
    setTransactions(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, categoryId, search]);

  useEffect(() => {
    fetch("/api/transactions?resource=categories", { headers })
      .then((r) => r.json())
      .then(setCategories);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  async function handleDelete(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE", headers });
    setConfirmDeleteId(null);
    fetchTransactions();
  }

  return (
    <div>
      <PageHeader title="Histórico" />
      <TransactionFilters
        month={month}
        categoryId={categoryId}
        search={search}
        categories={categories}
        onMonthChange={setMonth}
        onCategoryChange={setCategoryId}
        onSearchChange={setSearch}
      />

      <div className="divide-y divide-border">
        {transactions.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Nenhuma transação encontrada
          </p>
        )}
        {transactions.map((t) => (
          <TransactionCard
            key={t.id}
            transaction={t}
            onEdit={() => setEditing(t)}
            onDelete={() => setConfirmDeleteId(t.id)}
            onImageClick={() => {
              if (t.receipt?.imageUrl) setViewingImage(t.receipt.imageUrl);
            }}
          />
        ))}
      </div>

      {/* Lightbox da imagem */}
      {viewingImage && (
        <ImageLightbox imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
      )}

      {/* Formulário de edição */}
      {editing && (
        <EditTransactionForm
          transaction={editing}
          categories={categories}
          onSaved={() => {
            setEditing(null);
            fetchTransactions();
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Confirmação de exclusão */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-5 text-center font-medium">Excluir esta transação?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 rounded-xl bg-destructive py-3 text-sm font-medium text-white hover:bg-destructive/90 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-sm text-muted-foreground">Carregando...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
