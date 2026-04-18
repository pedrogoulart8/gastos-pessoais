"use client";

import { formatBRL } from "@/src/lib/utils";
import type { CategoryWithTotal } from "@/src/types";

interface Props {
  data: CategoryWithTotal[];
}

export function CategoryBarChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Nenhum gasto registrado neste mês
      </div>
    );
  }

  const max = data[0].total;

  return (
    <div className="space-y-3">
      {data.map((category) => {
        const pct = max > 0 ? (category.total / max) * 100 : 0;
        return (
          <div key={category.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{category.name}</span>
              <span className="text-muted-foreground">{formatBRL(category.total)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: category.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
