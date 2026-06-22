/**
 * Modelo de período usado pela aba de análise (Finanças).
 *
 * Um período é um intervalo de datas [start, end] inclusivo. Há dois modos:
 *  - `month`: um único mês (navegável com setas ‹ ›);
 *  - `custom`: um intervalo livre entre o início de um mês e o fim de outro.
 *
 * A granularidade é de MÊS (não de dia), o que cobre bem o uso de finanças
 * pessoais e evita depender de um seletor de data nativo.
 */

import { formatMonthYear } from '@/utils/format';

export type PeriodKind = 'month' | 'custom';

export interface Period {
  /** Início do intervalo, no primeiro instante do dia (inclusivo). */
  start: Date;
  /** Fim do intervalo, no último instante do dia (inclusivo). */
  end: Date;
  kind: PeriodKind;
}

/** Primeiro instante do mês de `date`. */
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/** Último instante do mês de `date`. */
function endOfMonth(date: Date): Date {
  // Dia 0 do mês seguinte = último dia do mês atual.
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Período de um único mês (padrão: mês atual). */
export function monthPeriod(date: Date = new Date()): Period {
  return { start: startOfMonth(date), end: endOfMonth(date), kind: 'month' };
}

/** Desloca um período de mês em `delta` meses (negativo = passado). */
export function shiftMonth(period: Period, delta: number): Period {
  const ref = new Date(period.start.getFullYear(), period.start.getMonth() + delta, 1);
  return monthPeriod(ref);
}

/** Período custom cobrindo do início de `startMonth` ao fim de `endMonth`. */
export function customPeriod(startMonth: Date, endMonth: Date): Period {
  // Garante start <= end mesmo se o usuário inverter os meses.
  const a = startOfMonth(startMonth);
  const b = endOfMonth(endMonth);
  return a <= b
    ? { start: a, end: b, kind: 'custom' }
    : { start: startOfMonth(endMonth), end: endOfMonth(startMonth), kind: 'custom' };
}

/** Verdadeiro se `date` está dentro do período (limites inclusivos). */
export function isInPeriod(date: Date, period: Period): boolean {
  return date >= period.start && date <= period.end;
}

/** Verdadeiro se o período de mês é o mês corrente (desabilita a seta "avançar"). */
export function isCurrentMonth(period: Period, now: Date = new Date()): boolean {
  return (
    period.kind === 'month' &&
    period.start.getFullYear() === now.getFullYear() &&
    period.start.getMonth() === now.getMonth()
  );
}

/** Rótulo legível do período: "Junho 2026" ou "Jan 2026 – Jun 2026". */
export function formatPeriodLabel(period: Period): string {
  if (period.kind === 'month') return formatMonthYear(period.start);
  return `${formatMonthYear(period.start)} – ${formatMonthYear(period.end)}`;
}

/**
 * Chave de período mensal no formato "AAAA-MM" (mês 1–12, com zero à esquerda).
 * O formato é ordenável como string e serve de identidade de uma ocorrência
 * recorrente (ver utils/recurrence.ts).
 */
export function periodKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Primeiro dia do mês de uma chave "AAAA-MM". */
export function periodKeyToDate(key: string): Date {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

/** Rótulo legível de uma chave de período, ex.: "Junho 2026". */
export function formatPeriodKey(key: string): string {
  return formatMonthYear(periodKeyToDate(key));
}

/**
 * Lista as chaves de período de `startKey` até `endKey` (inclusive), em ordem
 * crescente. Retorna vazio se o início for posterior ao fim.
 */
export function enumeratePeriods(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  const end = periodKeyToDate(endKey);
  const cursor = periodKeyToDate(startKey);
  while (cursor <= end) {
    keys.push(periodKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return keys;
}

/**
 * Data de uma ocorrência mensal: o `dayOfMonth` dentro do mês da chave,
 * limitado ao último dia do mês (ex.: dia 31 em fevereiro vira 28/29).
 */
export function dateForPeriod(key: string, dayOfMonth: number): Date {
  const base = periodKeyToDate(key);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  return new Date(base.getFullYear(), base.getMonth(), Math.min(dayOfMonth, lastDay));
}
