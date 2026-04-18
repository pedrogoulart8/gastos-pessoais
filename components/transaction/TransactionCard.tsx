"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { formatBRL, formatDate } from "@/src/lib/utils";
import type { TransactionWithCategory } from "@/src/types";

interface Props {
  transaction: TransactionWithCategory;
  onEdit: () => void;
  onDelete: () => void;
  onImageClick: () => void;
}

export function TransactionCard({ transaction: t, onEdit, onDelete, onImageClick }: Props) {
  return (
    <div className="flex w-full items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
      {/* Ações à esquerda */}
      <div className="flex flex-col gap-1 md:flex-row md:gap-2">
        <button
          onClick={onEdit}
          aria-label="Editar"
          className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          aria-label="Excluir"
          className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Imagem (abre lightbox) */}
      <button
        onClick={onImageClick}
        className="flex-shrink-0 rounded-xl overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all"
        aria-label="Ver comprovante"
      >
        {t.receipt?.imageUrl ? (
          <Image
            src={t.receipt.imageUrl}
            alt="Comprovante"
            width={44}
            height={44}
            className="h-11 w-11 object-cover"
          />
        ) : (
          <div
            className="flex h-11 w-11 items-center justify-center text-lg"
            style={{ backgroundColor: t.category.color + "22" }}
          >
            <span style={{ color: t.category.color }}>
              {t.merchant.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </button>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{t.merchant}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: t.category.color }}
          />
          <span className="text-xs text-muted-foreground">{t.category.name}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
        </div>
      </div>

      {/* Valor */}
      <span className="text-sm font-bold text-foreground">{formatBRL(t.amount)}</span>
    </div>
  );
}
