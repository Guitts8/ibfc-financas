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
