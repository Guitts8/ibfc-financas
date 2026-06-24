import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceCard } from '@/components/finance/balance-card';
import { GoalsHighlight } from '@/components/finance/goals-highlight';
import { PendingRecurrences, occurrenceKey } from '@/components/finance/pending-recurrences';
import { TransactionForm } from '@/components/finance/transaction-form';
import { TransactionRow } from '@/components/finance/transaction-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { useRecurrences } from '@/hooks/use-recurrences';
import { useTransactions } from '@/hooks/use-transactions';
import { skipRecurrencePeriod } from '@/firebase/recurrences';
import { addTransaction, deleteTransaction, updateTransaction } from '@/firebase/transactions';
import type { NewTransaction, Transaction } from '@/types/finance';
import type { PendingOccurrence } from '@/utils/recurrence';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const { transactions, totals, loading, error } = useTransactions();
  const { pending } = useRecurrences(transactions);

  const [formOpen, setFormOpen] = useState(false);
  // Transação em edição; null quando o modal está em modo de criação.
  const [editing, setEditing] = useState<Transaction | null>(null);
  // Ocorrência recorrente sendo editada antes de confirmar.
  const [pendingEdit, setPendingEdit] = useState<PendingOccurrence | null>(null);
  // Ocorrências em processamento (desabilita os botões enquanto grava).
  const [busyKeys, setBusyKeys] = useState<Set<string>>(new Set());

  const nome = user?.displayName?.trim().split(' ')[0] || 'irmão(ã)';

  function openCreate() {
    setEditing(null);
    setPendingEdit(null);
    setFormOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction);
    setPendingEdit(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setPendingEdit(null);
  }

  async function handleSubmit(input: NewTransaction) {
    if (!user) return;
    if (editing) {
      await updateTransaction(user.uid, editing.id, input);
    } else if (pendingEdit) {
      // Confirma a ocorrência com os campos editados, marcando a origem.
      await addTransaction(user.uid, {
        ...input,
        recurrenceId: pendingEdit.recurrenceId,
        periodKey: pendingEdit.periodKey,
      });
    } else {
      await addTransaction(user.uid, input);
    }
    closeForm();
  }

  async function handleDelete() {
    if (!user || !editing) return;
    await deleteTransaction(user.uid, editing.id);
    closeForm();
  }

  /** Executa uma ação assíncrona de pendência sinalizando "ocupado". */
  async function withBusy(key: string, action: () => Promise<void>) {
    setBusyKeys((set) => new Set(set).add(key));
    try {
      await action();
    } catch (e) {
      console.warn('[IBFC] Erro ao processar recorrência:', e);
    } finally {
      setBusyKeys((set) => {
        const next = new Set(set);
        next.delete(key);
        return next;
      });
    }
  }

  function handleConfirmPending(occurrence: PendingOccurrence) {
    if (!user) return;
    void withBusy(occurrenceKey(occurrence), () =>
      addTransaction(user.uid, {
        type: occurrence.type,
        amount: occurrence.amount,
        categoryId: occurrence.categoryId,
        description: occurrence.description,
        date: Timestamp.fromDate(occurrence.date),
        recurrenceId: occurrence.recurrenceId,
        periodKey: occurrence.periodKey,
      }),
    );
  }

  function handleEditPending(occurrence: PendingOccurrence) {
    setEditing(null);
    setPendingEdit(occurrence);
    setFormOpen(true);
  }

  function handleSkipPending(occurrence: PendingOccurrence) {
    if (!user) return;
    void withBusy(occurrenceKey(occurrence), () =>
      skipRecurrencePeriod(user.uid, occurrence.recurrenceId, occurrence.periodKey),
    );
  }

  // Valores iniciais do formulário conforme o modo (edição, recorrência ou novo).
  const formInitialValues = editing
    ? editing
    : pendingEdit
      ? {
          type: pendingEdit.type,
          amount: pendingEdit.amount,
          categoryId: pendingEdit.categoryId,
          description: pendingEdit.description,
          date: Timestamp.fromDate(pendingEdit.date),
        }
      : undefined;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="smallBold" style={styles.eyebrow}>
              IBFC FINANÇAS
            </ThemedText>
            <ThemedText type="subtitle">Olá, {nome}</ThemedText>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate('/recorrencias')}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}>
              <ThemedText type="smallBold" themeColor="tint">
                Recorrências
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={signOut}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}>
              <ThemedText type="smallBold" themeColor="expense">
                Sair
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <TransactionRow transaction={item} onPress={() => openEdit(item)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <BalanceCard totals={totals} />
              {pending.length > 0 && (
                <PendingRecurrences
                  pending={pending}
                  onConfirm={handleConfirmPending}
                  onEdit={handleEditPending}
                  onSkip={handleSkipPending}
                  busyKeys={busyKeys}
                />
              )}
              <GoalsHighlight />
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Transações recentes
              </ThemedText>
              {error && (
                <ThemedText type="small" themeColor="expense">
                  {error}
                </ThemedText>
              )}
            </View>
          }
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
          )}
          ListEmptyComponent={
            !loading ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                Nenhuma transação ainda. Toque em “+” para adicionar a primeira.
              </ThemedText>
            ) : null
          }
        />

        {/* Botão flutuante para adicionar transação */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nova transação"
          onPress={openCreate}
          style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}>
          <ThemedText style={styles.fabIcon}>+</ThemedText>
        </Pressable>
      </SafeAreaView>

      <Modal visible={formOpen} animationType="slide" transparent onRequestClose={closeForm}>
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalSheet}>
            <SafeAreaView edges={['bottom']}>
              <View style={styles.modalHandle} />
              <ThemedText type="subtitle" style={styles.modalTitle}>
                {editing ? 'Editar transação' : pendingEdit ? 'Confirmar recorrência' : 'Nova transação'}
              </ThemedText>
              <TransactionForm
                // Recria o formulário ao trocar de modo (reinicia os campos).
                key={editing?.id ?? (pendingEdit ? occurrenceKey(pendingEdit) : 'new')}
                initialValues={formInitialValues}
                onSubmit={handleSubmit}
                onCancel={closeForm}
                onDelete={editing ? handleDelete : undefined}
                submitLabel={
                  editing ? 'Salvar alterações' : pendingEdit ? 'Confirmar lançamento' : 'Salvar'
                }
              />
            </SafeAreaView>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  headerText: {
    gap: Spacing.half,
  },
  eyebrow: {
    color: Brand.blue,
    letterSpacing: 1.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerButton: {
    paddingVertical: Spacing.one,
  },
  listContent: {
    paddingBottom: BottomTabInset + Spacing.six + Spacing.four,
  },
  listHeader: {
    gap: Spacing.three,
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  empty: {
    paddingVertical: Spacing.four,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.one,
    bottom: BottomTabInset + Spacing.three,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '300',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    maxHeight: '90%',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9BA1A6',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    marginBottom: Spacing.three,
  },
});
