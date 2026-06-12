/**
 * Formatação para pt-BR (moeda e datas) usada na UI do IBFC Finanças.
 */

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Formata um valor em reais: 1234.5 -> "R$ 1.234,50". */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

const dayMonthFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
});

/** Formata uma data como "12 de jun." (dia e mês abreviado). */
export function formatDayMonth(date: Date): string {
  return dayMonthFormatter.format(date);
}

/** Nome do mês atual capitalizado, ex.: "Junho". */
export function currentMonthLabel(date = new Date()): string {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
