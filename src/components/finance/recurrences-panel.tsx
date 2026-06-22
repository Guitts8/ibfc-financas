import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { RecurrenceForm } from '@/components/finance/recurrence-form';
import { ThemedText } from '@/components/themed-text';
import { Brand, BottomTabInset, Spacing } from '@/constants/theme';
import { addRecurrence, deleteRecurrence, updateRecurrence } from '@/firebase/recurrences';
import { useTheme } from '@/hooks/use-theme';
import { getCategory, type NewRecurrence, type Recurrence } from '@/types/finance';
import { formatCurrency, formatMonthYear } from '@/utils/format';
import { periodKeyToDate } from '@/utils/period';

/**
 * Conteúdo de gerenciamento das recorrências (sem chrome de tela/modal):
 * alterna entre a LISTA das regras e o FORMULÁRIO (criar/editar). Usado pela
 * aba Recorrências. As gravações vão direto ao Firestore; a lista se atualiza
 * pela assinatura em tempo real do chamador.
 */
export function RecurrencesPanel({ uid, recurrences }: { uid: string; recurrences: Recurrence[] }) {
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

  if (mode === 'form') {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
        <ThemedText type="smallBold" style={styles.formTitle}>
          {editing ? 'Editar recorrência' : 'Nova recorrência'}
        </ThemedText>
        <RecurrenceForm
          key={editing?.id ?? 'new'}
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={backToList}
          onDelete={editing ? handleDelete : undefined}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
      {recurrences.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
          Nenhuma recorrência ainda. Crie uma para automatizar lançamentos como salário, dízimo ou
          aluguel.
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
    </ScrollView>
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
  listContent: {
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  formContent: {
    paddingBottom: BottomTabInset + Spacing.six,
  },
  formTitle: {
    marginBottom: Spacing.three,
    color: Brand.blue,
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
});
