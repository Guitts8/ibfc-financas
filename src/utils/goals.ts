/** Cálculos puros sobre metas de economia. */

import type { Goal } from '@/types/finance';

/** Progresso da meta como fração 0–1 (limitado, seguro contra alvo zero). */
export function goalFraction(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(1, Math.max(0, goal.currentAmount / goal.targetAmount));
}

/** Quanto ainda falta para atingir o alvo (nunca negativo). */
export function goalRemaining(goal: Goal): number {
  return Math.max(0, goal.targetAmount - goal.currentAmount);
}

/** Verdadeiro quando a meta foi atingida. */
export function goalReached(goal: Goal): boolean {
  return goal.currentAmount >= goal.targetAmount && goal.targetAmount > 0;
}
