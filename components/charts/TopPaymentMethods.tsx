import { Smartphone, CreditCard, Receipt, Banknote, MoreHorizontal } from "lucide-react";
import { formatBRL } from "@/src/lib/utils";
import type { PaymentMethodTotal } from "@/src/types";
import type { PaymentMethod } from "@/app/generated/prisma/client";

interface Props {
  data: PaymentMethodTotal[];
}

const LABELS: Record<PaymentMethod, string> = {
  PIX: "Pix",
  CARD: "Cartão",
  BOLETO: "Boleto",
  CASH: "Dinheiro",
  OTHER: "Outro",
};

const ICONS: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  PIX: Smartphone,
  CARD: CreditCard,
  BOLETO: Receipt,
  CASH: Banknote,
  OTHER: MoreHorizontal,
};

export function TopPaymentMethods({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Nenhuma transação neste mês
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, idx) => {
        const Icon = ICONS[item.method];
        return (
          <div key={item.method}>
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                {idx + 1}
              </span>
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium flex-1">{LABELS[item.method]}</span>
              <span className="text-sm font-bold">{formatBRL(item.total)}</span>
            </div>
            <div className="flex items-center gap-3 pl-11">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground w-12 text-right">
                {item.percent.toFixed(1)}%
              </span>
            </div>
            <p className="mt-1 pl-11 text-xs text-muted-foreground">
              {item.count} {item.count === 1 ? "transação" : "transações"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
