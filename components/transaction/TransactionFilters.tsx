"use client";

import { Search } from "lucide-react";
import type { Category } from "@/app/generated/prisma/client";

interface Props {
  month: string;
  categoryId: string;
  search: string;
  categories: Category[];
  onMonthChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}

export function TransactionFilters({
  month,
  categoryId,
  search,
  categories,
  onMonthChange,
  onCategoryChange,
  onSearchChange,
}: Props) {
  return (
    <div className="space-y-3 px-4 py-3">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome ou descrição..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Mês e Categoria */}
      <div className="flex gap-2">
        <input
          type="month"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
