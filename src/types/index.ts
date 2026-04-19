import type { Transaction, Category, Receipt, PaymentMethod } from "@/app/generated/prisma/client";

export type TransactionWithCategory = Transaction & {
  category: Category;
  receipt?: Receipt | null;
};

export type CategoryWithTotal = Category & {
  total: number;
};

export type DailyTotal = {
  date: string; // YYYY-MM-DD
  total: number; // centavos
  count: number;
};

export type MonthSummary = {
  total: number;
  count: number;
  previousTotal: number;
  previousCount: number;
  changePercent: number;
  todayTotal: number;
  todayCount: number;
};

export type CumulativePoint = {
  day: number;
  current: number;
  previous: number;
};

export type WeekdayAverage = {
  weekday: string; // "Seg", "Ter", etc.
  average: number;
  isMax: boolean;
};

export type PaymentMethodTotal = {
  method: PaymentMethod;
  total: number; // centavos
  count: number;
  percent: number; // 0..100
};

export type ExtractionResult = {
  date: string;
  amount_cents: number;
  merchant: string;
  payment_method: PaymentMethod;
  description_suggestion: string;
  confidence: "high" | "medium" | "low";
};

export type ExtractionResponse =
  | { success: true; data: ExtractionResult }
  | { success: false; error: string };
