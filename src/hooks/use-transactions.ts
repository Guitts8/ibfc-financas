/**
 * Hook que escuta as transações do usuário logado em tempo real e calcula os
 * totais do mês corrente (entradas, saídas e saldo).
 */

import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { subscribeTransactions } from '@/firebase/transactions';
import type { Transaction } from '@/types/finance';

export interface MonthTotals {
  income: number;
  expense: number;
  balance: number;
}

export interface UseTransactionsResult {
  transactions: Transaction[];
  /** Totais apenas do mês corrente. */
  totals: MonthTotals;
  loading: boolean;
  error: string | null;
}

/** Verdadeiro se a data está no mesmo mês/ano de `ref`. */
function isSameMonth(date: Date, ref: Date): boolean {
  return date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth();
}

export function useTransactions(): UseTransactionsResult {
  const { user } = useAuth();
  const uid = user?.uid;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sincroniza estado React com uma fonte externa (Firestore). As chamadas
    // síncronas de setState ao trocar/limpar o usuário são intencionais — o
    // lint as veria como cascading render, mas aqui é o reset da assinatura.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!uid) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    const unsubscribe = subscribeTransactions(
      uid,
      (data) => {
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        console.warn('[IBFC] Erro ao carregar transações:', err);
        setError('Não foi possível carregar suas transações.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [uid]);

  const totals = useMemo<MonthTotals>(() => {
    const now = new Date();
    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      // date pode estar pendente em escritas otimistas; ignora se ausente.
      const when = t.date?.toDate?.();
      if (!when || !isSameMonth(when, now)) continue;
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }

    return { income, expense, balance: income - expense };
  }, [transactions]);

  return { transactions, totals, loading, error };
}
