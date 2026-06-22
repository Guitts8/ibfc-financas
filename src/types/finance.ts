/**
 * Modelos de dados do app IBFC Finanças (finanças pessoais de cada membro).
 *
 * Estrutura no Firestore (cada usuário só acessa os próprios dados):
 *   users/{uid}/transactions/{id}
 *   users/{uid}/goals/{id}
 */

import type { Timestamp } from 'firebase/firestore';

/** Tipo de movimentação: entrada (receita) ou saída (despesa). */
export type TransactionType = 'income' | 'expense';

/** Uma movimentação financeira do usuário. */
export interface Transaction {
  id: string;
  type: TransactionType;
  /** Valor em reais (sempre positivo; o sinal vem do `type`). */
  amount: number;
  /** Id da categoria (ver DEFAULT_CATEGORIES). */
  categoryId: string;
  description: string;
  /** Data do lançamento. */
  date: Timestamp;
  createdAt: Timestamp;
  /** Recorrência que originou esta transação (ausente em lançamentos avulsos). */
  recurrenceId?: string;
  /** Chave "AAAA-MM" da ocorrência recorrente; deduplica a geração mensal. */
  periodKey?: string;
}

/** Dados para criar uma transação (sem campos gerados pelo servidor). */
export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>;

/**
 * Regra de transação recorrente (mensal). Não é uma movimentação em si — o app
 * gera transações pendentes a partir dela ao abrir (ver utils/recurrence.ts).
 */
export interface Recurrence {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  /** Dia do mês do lançamento (1–31; limitado ao fim do mês quando necessário). */
  dayOfMonth: number;
  /** Primeiro mês a gerar, chave "AAAA-MM". */
  startPeriod: string;
  /** Quando falso, não gera novas pendências. */
  active: boolean;
  /** Períodos ("AAAA-MM") que o usuário pulou e não devem reaparecer. */
  skippedPeriods: string[];
  createdAt: Timestamp;
}

/** Dados para criar uma recorrência (sem campos gerados/derivados). */
export type NewRecurrence = Omit<Recurrence, 'id' | 'createdAt' | 'skippedPeriods'>;

/** Meta de economia ("guardar dinheiro"). */
export interface Goal {
  id: string;
  name: string;
  /** Quanto se pretende juntar. */
  targetAmount: number;
  /** Quanto já foi guardado. */
  currentAmount: number;
  /** Prazo opcional para alcançar a meta. */
  deadline?: Timestamp | null;
  createdAt: Timestamp;
}

export type NewGoal = Omit<Goal, 'id' | 'createdAt' | 'currentAmount'> & {
  currentAmount?: number;
};

/** Categoria de movimentação. */
export interface Category {
  id: string;
  label: string;
  type: TransactionType;
  /** Nome de um ícone (ex.: SF Symbols / Ionicons) usado na UI. */
  icon: string;
  /** Cor de destaque em hexadecimal. */
  color: string;
}

/**
 * Categorias padrão. As de receita incluem itens do contexto da igreja
 * (dízimo, oferta), mas o app é de finanças PESSOAIS de cada membro.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  // Receitas
  { id: 'salario', label: 'Salário', type: 'income', icon: 'wallet', color: '#0FA37F' },
  { id: 'renda-extra', label: 'Renda extra', type: 'income', icon: 'cash', color: '#18C29C' },
  { id: 'presente', label: 'Presente', type: 'income', icon: 'gift', color: '#1E66E0' },
  { id: 'outras-receitas', label: 'Outras receitas', type: 'income', icon: 'add-circle', color: '#60646C' },

  // Despesas
  { id: 'dizimo', label: 'Dízimo', type: 'expense', icon: 'heart', color: '#E5392E' },
  { id: 'oferta', label: 'Oferta', type: 'expense', icon: 'gift', color: '#E5392E' },
  { id: 'alimentacao', label: 'Alimentação', type: 'expense', icon: 'restaurant', color: '#F4A300' },
  { id: 'moradia', label: 'Moradia', type: 'expense', icon: 'home', color: '#8B5CF6' },
  { id: 'transporte', label: 'Transporte', type: 'expense', icon: 'car', color: '#1E66E0' },
  { id: 'saude', label: 'Saúde', type: 'expense', icon: 'medkit', color: '#0FA37F' },
  { id: 'educacao', label: 'Educação', type: 'expense', icon: 'school', color: '#18C29C' },
  { id: 'lazer', label: 'Lazer', type: 'expense', icon: 'happy', color: '#F4A300' },
  { id: 'outras-despesas', label: 'Outras despesas', type: 'expense', icon: 'ellipsis-horizontal', color: '#60646C' },
];

/** Busca uma categoria pelo id (com fallback seguro). */
export function getCategory(id: string): Category | undefined {
  return DEFAULT_CATEGORIES.find((c) => c.id === id);
}
