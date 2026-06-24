/**
 * Camada de acesso ao Firestore para as metas de economia do usuário.
 *
 * Estrutura: users/{uid}/goals/{id} (coberto pelas regras de users/{uid}/**).
 * Uma meta é independente das transações: tem o próprio saldo (currentAmount),
 * alimentado por aportes/retiradas — guardar dinheiro não entra no fluxo do mês.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type FirestoreError,
  type Timestamp,
} from 'firebase/firestore';

import { db } from '@/firebase/config';
import type { Goal, NewGoal } from '@/types/finance';

/** Referência à subcoleção de metas de um usuário. */
function goalsRef(uid: string) {
  return collection(db, 'users', uid, 'goals');
}

/** Escuta as metas do usuário em tempo real (mais novas primeiro). */
export function subscribeGoals(
  uid: string,
  onData: (goals: Goal[]) => void,
  onError?: (error: FirestoreError) => void,
): () => void {
  const q = query(goalsRef(uid), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const goals = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ?? '',
          targetAmount: data.targetAmount ?? 0,
          currentAmount: data.currentAmount ?? 0,
          deadline: (data.deadline as Timestamp | null) ?? null,
          createdAt: (data.createdAt as Timestamp | null) ?? null,
        } as Goal;
      });
      onData(goals);
    },
    onError,
  );
}

/** Cria uma nova meta (saldo inicial opcional, padrão 0). */
export async function addGoal(uid: string, input: NewGoal): Promise<void> {
  await addDoc(goalsRef(uid), {
    name: input.name.trim(),
    targetAmount: input.targetAmount,
    currentAmount: input.currentAmount ?? 0,
    deadline: input.deadline ?? null,
    createdAt: serverTimestamp(),
  });
}

/** Atualiza os campos editáveis de uma meta (preserva o saldo atual). */
export async function updateGoal(uid: string, id: string, input: NewGoal): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'goals', id), {
    name: input.name.trim(),
    targetAmount: input.targetAmount,
    deadline: input.deadline ?? null,
  });
}

/** Exclui uma meta. */
export async function deleteGoal(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'goals', id));
}

/**
 * Registra um aporte (delta positivo) ou retirada (delta negativo) no saldo da
 * meta, de forma atômica. A UI evita deixar o saldo negativo.
 */
export async function contributeToGoal(uid: string, id: string, delta: number): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'goals', id), {
    currentAmount: increment(delta),
  });
}
