/** Hook que escuta as metas de economia do usuário em tempo real. */

import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { subscribeGoals } from '@/firebase/goals';
import type { Goal } from '@/types/finance';

export interface UseGoalsResult {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

export function useGoals(): UseGoalsResult {
  const { user } = useAuth();
  const uid = user?.uid;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!uid) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    const unsubscribe = subscribeGoals(
      uid,
      (data) => {
        setGoals(data);
        setLoading(false);
      },
      (err) => {
        console.warn('[IBFC] Erro ao carregar metas:', err);
        setError('Não foi possível carregar suas metas.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [uid]);

  return { goals, loading, error };
}
