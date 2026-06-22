/**
 * Hook base que escuta TODAS as transações do usuário logado em tempo real.
 *
 * É a única assinatura do Firestore; os hooks de mais alto nível
 * (`useTransactions` para a Home, `useAnalytics` para a aba Finanças) derivam
 * seus números desta lista, sem abrir novas consultas.
 */

import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { subscribeTransactions } from '@/firebase/transactions';
import type { Transaction } from '@/types/finance';

export interface UseAllTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export function useAllTransactions(): UseAllTransactionsResult {
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

  return { transactions, loading, error };
}
