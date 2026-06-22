/**
 * Lógica pura das transações recorrentes.
 *
 * Uma recorrência é só a regra; aqui calculamos quais ocorrências mensais estão
 * PENDENTES — devidas (do mês inicial até o mês atual), ainda não confirmadas
 * (não há transação com aquele recurrenceId+periodKey) e não puladas. É puro e
 * idempotente: depende apenas dos dados já carregados.
 */

import type { Recurrence, Transaction, TransactionType } from '@/types/finance';
import { dateForPeriod, enumeratePeriods, periodKey } from '@/utils/period';

/** Uma ocorrência ainda não lançada de uma recorrência. */
export interface PendingOccurrence {
  recurrenceId: string;
  /** Chave "AAAA-MM" do mês devido. */
  periodKey: string;
  /** Data sugerida do lançamento (dia da regra, limitado ao fim do mês). */
  date: Date;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
}

/**
 * Pendências de todas as recorrências ativas, em ordem cronológica (mais antiga
 * primeiro), para o usuário confirmar/editar/pular.
 */
export function pendingOccurrences(
  recurrences: Recurrence[],
  transactions: Transaction[],
  now: Date = new Date(),
): PendingOccurrence[] {
  const currentKey = periodKey(now);

  // Mapa recurrenceId -> conjunto de períodos já lançados (confirmados).
  const confirmed = new Map<string, Set<string>>();
  for (const t of transactions) {
    if (!t.recurrenceId || !t.periodKey) continue;
    let set = confirmed.get(t.recurrenceId);
    if (!set) {
      set = new Set();
      confirmed.set(t.recurrenceId, set);
    }
    set.add(t.periodKey);
  }

  const pending: PendingOccurrence[] = [];
  for (const rule of recurrences) {
    if (!rule.active) continue;
    const done = confirmed.get(rule.id) ?? new Set<string>();
    const skipped = new Set(rule.skippedPeriods);

    for (const key of enumeratePeriods(rule.startPeriod, currentKey)) {
      if (done.has(key) || skipped.has(key)) continue;
      pending.push({
        recurrenceId: rule.id,
        periodKey: key,
        date: dateForPeriod(key, rule.dayOfMonth),
        type: rule.type,
        amount: rule.amount,
        categoryId: rule.categoryId,
        description: rule.description,
      });
    }
  }

  return pending.sort((a, b) => a.date.getTime() - b.date.getTime());
}
