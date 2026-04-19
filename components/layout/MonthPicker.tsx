"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface Props {
  year: number;
  month: number;
}

export function MonthPicker({ year, month }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const now = new Date();
  const isCurrent = now.getFullYear() === year && now.getMonth() + 1 === month;

  const label = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1);

  function navigate(delta: number) {
    const date = new Date(year, month - 1 + delta, 1);
    const newYear = date.getFullYear();
    const newMonth = date.getMonth() + 1;
    const params = new URLSearchParams(searchParams);
    params.set("month", `${newYear}-${String(newMonth).padStart(2, "0")}`);
    router.push(`?${params.toString()}`);
  }

  function goToToday() {
    const params = new URLSearchParams(searchParams);
    params.delete("month");
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "/");
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 md:px-6">
      <button
        onClick={() => navigate(-1)}
        aria-label="Mês anterior"
        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center justify-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">{capitalized}</span>
        {!isCurrent && (
          <button
            onClick={goToToday}
            className="ml-2 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/70 transition-colors"
          >
            Hoje
          </button>
        )}
      </div>

      <button
        onClick={() => navigate(1)}
        aria-label="Próximo mês"
        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
