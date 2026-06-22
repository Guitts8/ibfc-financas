/**
 * Hook da aba Finanças: dado um período, devolve os números prontos para os
 * gráficos — totais, despesas por categoria e a série mensal de entradas×saídas.
 * Reaproveita a assinatura única de `useAllTransactions`.
 */

import { useMemo } from 'react';

import { useAllTransactions } from '@/hooks/use-all-transactions';
import {
  expensesByCategory,
  monthlySeries,
  rangeTotals,
  type CategorySlice,
  type MonthBucket,
  type Totals,
} from '@/utils/analytics';
import type { Period } from '@/utils/period';

export interface UseAnalyticsResult {
  totals: Totals;
  /** Despesas por categoria no período (maior → menor). */
  categories: CategorySlice[];
  /** Últimos 6 meses (terminando no mês do período) de entradas e saídas. */
  series: MonthBucket[];
  /** Verdadeiro quando há ao menos uma transação no período. */
  hasData: boolean;
  loading: boolean;
  error: string | null;
}

export function useAnalytics(period: Period): UseAnalyticsResult {
  const { transactions, loading, error } = useAllTransactions();

  const totals = useMemo(() => rangeTotals(transactions, period), [transactions, period]);
  const categories = useMemo(() => expensesByCategory(transactions, period), [transactions, period]);
  const series = useMemo(() => monthlySeries(transactions, period.end), [transactions, period.end]);

  const hasData = totals.income > 0 || totals.expense > 0;

  return { totals, categories, series, hasData, loading, error };
}
