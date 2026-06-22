import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecurrenceForm } from '@/components/finance/recurrence-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { addRecurrence, deleteRecurrence, updateRecurrence } from '@/firebase/recurrences';
import { useTheme } from '@/hooks/use-theme';
import { getCategory, type NewRecurrence, type Recurrence } from '@/types/finance';
import { formatCurrency, formatMonthYear } from '@/utils/format';
import { periodKeyToDate } from '@/utils/period';

interface RecurrencesManagerProps {
  visible: boolean;
  onClose: () => void;
  uid: string;
  recurrences: Recurrence[];
}

/**
 * Modal para gerenciar as recorrências: alterna entre a LISTA das regras e o
 * FORMULÁRIO (criar/editar), sem modais aninhados. As gravações vão direto ao
 * Firestore; a lista se atualiza pela assinatura em tempo real do chamador.
 */
export function RecurrencesManager({ visible, onClose, uid, recurrences }: RecurrencesManagerProps) {
  const theme = useTheme();
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [editing, setEditing] = useState<Recurrence | null>(null);

  function openCreate() {
    setEditing(null);
    setMode('form');
  }

  function openEdit(recurrence: Recurrence) {
    setEditing(recurrence);
    setMode('form');
  }

  function backToList() {
    setMode('list');
    setEditing(null);
  }

  function handleClose() {
    backToList();
    onClose();
  }

  async function handleSubmit(input: NewRecurrence) {
    if (editing) await updateRecurrence(uid, editing.id, input);
    else await addRecurrence(uid, input);
    backToList();
  }

  async function handleDelete() {
    if (!editing) return;
    await deleteRecurrence(uid, editing.id);
    backToList();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <ThemedView style={styles.sheet}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handle} />
            <ThemedText type="subtitle" style={styles.title}>
              {mode === 'form' ? (editing ? 'Editar recorrência' : 'Nova recorrência') : 'Recorrências'}
            </ThemedText>

            {mode === 'form' ? (
              <RecurrenceForm
                key={editing?.id ?? 'new'}
                initial={editing ?? undefined}
                onSubmit={handleSubmit}
                onCancel={backToList}
                onDelete={editing ? handleDelete : undefined}
              />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                {recurrences.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                    Nenhuma recorrência ainda. Crie uma para automatizar lançamentos como salário,
                    dízimo ou aluguel.
                  </ThemedText>
                ) : (
                  recurrences.map((recurrence) => (
                    <RecurrenceRow key={recurrence.id} recurrence={recurrence} onPress={() => openEdit(recurrence)} />
                  ))
                )}

                <Pressable
                  accessibilityRole="button"
                  onPress={openCreate}
                  style={({ pressed }) => [
                    styles.addButton,
                    { borderColor: theme.tint, opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <ThemedText type="smallBold" style={{ color: theme.tint }}>
                    + Nova recorrência
                  </ThemedText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleClose}
                  style={({ pressed }) => [styles.close, { opacity: pressed ? 0.6 : 1 }]}>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    Fechar
                  </ThemedText>
                </Pressable>
              </ScrollView>
            )}
          </SafeAreaView>
        </ThemedView>
      </View>
    </Modal>
  );
}

function RecurrenceRow({ recurrence, onPress }: { recurrence: Recurrence; onPress: () => void }) {
  const theme = useTheme();
  const category = getCategory(recurrence.categoryId);
  const isIncome = recurrence.type === 'income';
  const title = recurrence.description?.trim() || category?.label || 'Recorrência';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, { borderColor: theme.border }, pressed && { opacity: 0.6 }]}>
      <View style={[styles.dot, { backgroundColor: category?.color ?? theme.textSecondary }]} />
      <View style={styles.rowText}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          Dia {recurrence.dayOfMonth} · desde {formatMonthYear(periodKeyToDate(recurrence.startPeriod))}
          {recurrence.active ? '' : ' · pausada'}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" style={{ color: isIncome ? theme.income : theme.expense }}>
        {isIncome ? '+' : '−'} {formatCurrency(recurrence.amount)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    maxHeight: '90%',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9BA1A6',
    marginBottom: Spacing.three,
  },
  title: {
    marginBottom: Spacing.three,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  empty: {
    paddingVertical: Spacing.four,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  addButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  close: {
    alignSelf: 'center',
    paddingVertical: Spacing.three,
  },
});
