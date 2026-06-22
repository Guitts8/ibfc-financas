/**
 * Camada de acesso ao Firestore para as recorrências do usuário.
 *
 * Estrutura: users/{uid}/recurrences/{id} — cada membro só acessa os próprios
 * dados (as regras de users/{uid}/** já cobrem esta subcoleção). Uma recorrência
 * é apenas a REGRA; as transações são geradas a partir dela (ver
 * utils/recurrence.ts e o fluxo de pendências na Home).
 */

import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type FirestoreError,
  type Timestamp,
} from 'firebase/firestore';

import { db } from '@/firebase/config';
import type { NewRecurrence, Recurrence } from '@/types/finance';

/** Referência à subcoleção de recorrências de um usuário. */
function recurrencesRef(uid: string) {
  return collection(db, 'users', uid, 'recurrences');
}

/** Escuta as recorrências do usuário em tempo real (mais novas primeiro). */
export function subscribeRecurrences(
  uid: string,
  onData: (recurrences: Recurrence[]) => void,
  onError?: (error: FirestoreError) => void,
): () => void {
  const q = query(recurrencesRef(uid), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const recurrences = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          amount: data.amount,
          categoryId: data.categoryId,
          description: data.description ?? '',
          dayOfMonth: data.dayOfMonth,
          startPeriod: data.startPeriod,
          active: data.active ?? true,
          skippedPeriods: (data.skippedPeriods as string[] | undefined) ?? [],
          createdAt: (data.createdAt as Timestamp | null) ?? null,
        } as Recurrence;
      });
      onData(recurrences);
    },
    onError,
  );
}

/** Cria uma nova recorrência. */
export async function addRecurrence(uid: string, input: NewRecurrence): Promise<void> {
  await addDoc(recurrencesRef(uid), {
    type: input.type,
    amount: input.amount,
    categoryId: input.categoryId,
    description: input.description.trim(),
    dayOfMonth: input.dayOfMonth,
    startPeriod: input.startPeriod,
    active: input.active,
    skippedPeriods: [],
    createdAt: serverTimestamp(),
  });
}

/** Atualiza os campos editáveis de uma recorrência. */
export async function updateRecurrence(
  uid: string,
  id: string,
  input: NewRecurrence,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'recurrences', id), {
    type: input.type,
    amount: input.amount,
    categoryId: input.categoryId,
    description: input.description.trim(),
    dayOfMonth: input.dayOfMonth,
    startPeriod: input.startPeriod,
    active: input.active,
  });
}

/** Exclui uma recorrência (não remove as transações já geradas). */
export async function deleteRecurrence(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'recurrences', id));
}

/** Marca um período "AAAA-MM" como pulado, para não reaparecer nas pendências. */
export async function skipRecurrencePeriod(
  uid: string,
  id: string,
  periodKey: string,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'recurrences', id), {
    skippedPeriods: arrayUnion(periodKey),
  });
}
