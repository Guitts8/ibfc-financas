/**
 * Hook da Home: expõe as transações do usuário e os totais do mês corrente
 * (entradas, saídas e saldo). A assinatura do Firestore fica em
 * `useAllTransactions`; aqui só derivamos os totais do mês atual.
 */

import { useMemo } from 'react';

import { useAllTransactions } from '@/hooks/use-all-transactions';
import type { Transaction } from '@/types/finance';
import { monthPeriod } from '@/utils/period';
import { rangeTotals, type Totals } from '@/utils/analytics';

/** Totais do mês (mantido como alias por compatibilidade com os componentes). */
export type MonthTotals = Totals;

export interface UseTransactionsResult {
  transactions: Transaction[];
  /** Totais apenas do mês corrente. */
  totals: MonthTotals;
  loading: boolean;
  error: string | null;
}

export function useTransactions(): UseTransactionsResult {
  const { transactions, loading, error } = useAllTransactions();

  const totals = useMemo<MonthTotals>(() => rangeTotals(transactions, monthPeriod()), [transactions]);

  return { transactions, totals, loading, error };
}
