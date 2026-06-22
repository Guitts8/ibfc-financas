/**
 * Agregações puras sobre as transações, usadas pela aba de análise (Finanças).
 *
 * Tudo aqui é função pura (sem React, sem Firestore): recebe a lista de
 * transações já carregada e devolve os números prontos para os gráficos.
 * Mantém a lógica testável e separada da UI.
 */

import { getCategory, type Transaction } from '@/types/finance';
import { isInPeriod, type Period } from '@/utils/period';
import { formatMonthShort } from '@/utils/format';

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

/** Uma fatia do gráfico de categorias (já com cor, rótulo e percentual). */
export interface CategorySlice {
  categoryId: string;
  label: string;
  color: string;
  total: number;
  /** Participação no total (0–1). */
  fraction: number;
}

/** Um mês na série temporal de entradas × saídas. */
export interface MonthBucket {
  /** Primeiro dia do mês, para chave/ordenação. */
  monthStart: Date;
  /** Rótulo curto, ex.: "Jun". */
  label: string;
  income: number;
  expense: number;
}

/** Converte o Timestamp da transação em Date, ou null se ainda pendente. */
function toDate(t: Transaction): Date | null {
  return t.date?.toDate?.() ?? null;
}

/** Soma de entradas, saídas e saldo das transações dentro do período. */
export function rangeTotals(transactions: Transaction[], period: Period): Totals {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    const when = toDate(t);
    if (!when || !isInPeriod(when, period)) continue;
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

/**
 * Despesas agrupadas por categoria no período, ordenadas da maior para a menor.
 * `fraction` é a participação no total de despesas (para rótulos de %).
 */
export function expensesByCategory(transactions: Transaction[], period: Period): CategorySlice[] {
  const totals = new Map<string, number>();
  let grandTotal = 0;

  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const when = toDate(t);
    if (!when || !isInPeriod(when, period)) continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
    grandTotal += t.amount;
  }

  const slices: CategorySlice[] = [];
  for (const [categoryId, total] of totals) {
    const category = getCategory(categoryId);
    slices.push({
      categoryId,
      label: category?.label ?? 'Sem categoria',
      color: category?.color ?? '#60646C',
      total,
      fraction: grandTotal > 0 ? total / grandTotal : 0,
    });
  }

  return slices.sort((a, b) => b.total - a.total);
}

/**
 * Série dos últimos `count` meses (terminando no mês de `endMonth`), com o total
 * de entradas e saídas de cada mês. Usada no gráfico de barras de evolução.
 */
export function monthlySeries(
  transactions: Transaction[],
  endMonth: Date = new Date(),
  count = 6,
): MonthBucket[] {
  // Cria os baldes vazios, do mais antigo para o mais recente.
  const buckets: MonthBucket[] = [];
  const index = new Map<string, MonthBucket>();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(endMonth.getFullYear(), endMonth.getMonth() - i, 1);
    const bucket: MonthBucket = { monthStart: d, label: formatMonthShort(d), income: 0, expense: 0 };
    buckets.push(bucket);
    index.set(monthKey(d), bucket);
  }

  for (const t of transactions) {
    const when = toDate(t);
    if (!when) continue;
    const bucket = index.get(monthKey(when));
    if (!bucket) continue;
    if (t.type === 'income') bucket.income += t.amount;
    else bucket.expense += t.amount;
  }

  return buckets;
}

/** Chave "ano-mês" para indexar um balde mensal. */
function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}
