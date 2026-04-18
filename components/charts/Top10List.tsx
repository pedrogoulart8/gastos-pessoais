import Image from "next/image";
import Link from "next/link";
import { formatBRL, formatDate } from "@/src/lib/utils";
import type { TransactionWithCategory } from "@/src/types";

interface Props {
  transactions: TransactionWithCategory[];
}

export function Top10List({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Nenhuma transação neste mês
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {transactions.map((t, idx) => (
        <Link
          key={t.id}
          href={`/history?detail=${t.id}`}
          className="flex items-center gap-3 py-3 hover:bg-muted/30 -mx-4 md:-mx-6 px-4 md:px-6 transition-colors"
        >
          <span className="w-5 text-right text-sm font-bold text-muted-foreground">
            {idx + 1}
          </span>
          {t.receipt?.imageUrl && (
            <Image
              src={t.receipt.imageUrl}
              alt="Comprovante"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{t.merchant}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: t.category.color }}
              />
              <span className="text-xs text-muted-foreground">{t.category.name}</span>
              <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
            </div>
          </div>
          <span className="text-sm font-bold text-foreground">{formatBRL(t.amount)}</span>
        </Link>
      ))}
    </div>
  );
}
