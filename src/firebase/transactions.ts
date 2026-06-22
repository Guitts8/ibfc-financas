/**
 * Camada de acesso ao Firestore para as transações do usuário.
 *
 * Estrutura: users/{uid}/transactions/{id} — cada membro só acessa os próprios
 * dados (ver firestore.rules). Toda função recebe o `uid` explicitamente para
 * deixar claro de quem são os dados e facilitar testes.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type FirestoreError,
} from 'firebase/firestore';

import { db } from '@/firebase/config';
import type { NewTransaction, Transaction } from '@/types/finance';

/** Referência à subcoleção de transações de um usuário. */
function transactionsRef(uid: string) {
  return collection(db, 'users', uid, 'transactions');
}

/**
 * Escuta as transações do usuário em tempo real (ordenadas da mais recente para
 * a mais antiga). Retorna a função de cancelamento da inscrição.
 */
export function subscribeTransactions(
  uid: string,
  onData: (transactions: Transaction[]) => void,
  onError?: (error: FirestoreError) => void,
): () => void {
  const q = query(transactionsRef(uid), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const transactions = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          amount: data.amount,
          categoryId: data.categoryId,
          description: data.description ?? '',
          // createdAt pode chegar null por um instante (serverTimestamp pendente).
          date: data.date as Timestamp,
          createdAt: (data.createdAt as Timestamp | null) ?? (data.date as Timestamp),
          recurrenceId: data.recurrenceId as string | undefined,
          periodKey: data.periodKey as string | undefined,
        } satisfies Transaction;
      });
      onData(transactions);
    },
    onError,
  );
}

/** Cria uma nova transação na subcoleção do usuário. */
export async function addTransaction(uid: string, input: NewTransaction): Promise<void> {
  await addDoc(transactionsRef(uid), {
    type: input.type,
    amount: input.amount,
    categoryId: input.categoryId,
    description: input.description.trim(),
    date: input.date ?? Timestamp.now(),
    createdAt: serverTimestamp(),
    // Campos de origem só são gravados quando a transação vem de uma recorrência
    // (o Firestore rejeita valores `undefined`).
    ...(input.recurrenceId ? { recurrenceId: input.recurrenceId } : {}),
    ...(input.periodKey ? { periodKey: input.periodKey } : {}),
  });
}

/** Atualiza uma transação existente (preserva o createdAt original). */
export async function updateTransaction(
  uid: string,
  id: string,
  input: NewTransaction,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'transactions', id), {
    type: input.type,
    amount: input.amount,
    categoryId: input.categoryId,
    description: input.description.trim(),
    date: input.date ?? Timestamp.now(),
  });
}

/** Exclui uma transação do usuário. */
export async function deleteTransaction(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'transactions', id));
}
