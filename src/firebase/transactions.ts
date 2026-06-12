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
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
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
  });
}
