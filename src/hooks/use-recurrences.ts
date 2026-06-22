/**
 * Hook das recorrências: assina a subcoleção de regras do usuário e, a partir
 * das transações já carregadas (passadas por parâmetro, para não abrir uma
 * segunda assinatura), calcula as ocorrências pendentes.
 */

import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { subscribeRecurrences } from '@/firebase/recurrences';
import type { Recurrence, Transaction } from '@/types/finance';
import { pendingOccurrences, type PendingOccurrence } from '@/utils/recurrence';

export interface UseRecurrencesResult {
  recurrences: Recurrence[];
  pending: PendingOccurrence[];
  loading: boolean;
  error: string | null;
}

export function useRecurrences(transactions: Transaction[]): UseRecurrencesResult {
  const { user } = useAuth();
  const uid = user?.uid;

  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!uid) {
      setRecurrences([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    const unsubscribe = subscribeRecurrences(
      uid,
      (data) => {
        setRecurrences(data);
        setLoading(false);
      },
      (err) => {
        console.warn('[IBFC] Erro ao carregar recorrências:', err);
        setError('Não foi possível carregar suas recorrências.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [uid]);

  const pending = useMemo(
    () => pendingOccurrences(recurrences, transactions),
    [recurrences, transactions],
  );

  return { recurrences, pending, loading, error };
}
