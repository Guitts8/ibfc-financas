import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Goal, NewGoal } from '@/types/finance';
import { formatCurrency, formatMonthYear } from '@/utils/format';

export interface GoalFormProps {
  onSubmit: (input: NewGoal) => Promise<void>;
  onCancel: () => void;
  /** Quando presente, edita a meta (campos preenchidos; saldo é preservado). */
  initial?: Goal;
  onDelete?: () => Promise<void>;
}

/** Primeiro dia do mês de uma data. */
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Formulário de meta: nome, valor-alvo e prazo opcional (por mês). */
export function GoalForm({ onSubmit, onCancel, initial, onDelete }: GoalFormProps) {
  const theme = useTheme();
  const initialDeadline = initial?.deadline?.toDate?.();

  const [name, setName] = useState(initial?.name ?? '');
  const [amountDigits, setAmountDigits] = useState(
    initial ? String(Math.round(initial.targetAmount * 100)) : '',
  );
  const [hasDeadline, setHasDeadline] = useState(!!initialDeadline);
  const [deadlineMonth, setDeadlineMonth] = useState(() =>
    startOfMonth(initialDeadline ?? new Date()),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const targetAmount = Number(amountDigits || '0') / 100;

  function changeAmount(text: string) {
    setAmountDigits(text.replace(/\D/g, '').slice(0, 9));
  }

  function shiftDeadline(delta: number) {
    setDeadlineMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  async function handleSubmit() {
    if (loading) return;
    setError(null);
    if (!name.trim()) {
      setError('Dê um nome para a meta.');
      return;
    }
    if (targetAmount <= 0) {
      setError('Informe um valor-alvo maior que zero.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        name,
        targetAmount,
        deadline: hasDeadline ? Timestamp.fromDate(deadlineMonth) : null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (loading || !onDelete) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onDelete();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível excluir.');
      setLoading(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <TextField
        label="Nome da meta"
        value={name}
        onChangeText={setName}
        placeholder="Ex.: Reserva de emergência"
      />

      <View style={styles.amountBlock}>
        <ThemedText type="smallBold">Valor-alvo</ThemedText>
        <TextInput
          value={amountDigits ? formatCurrency(targetAmount) : ''}
          onChangeText={changeAmount}
          placeholder={formatCurrency(0)}
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          inputMode="numeric"
          style={[styles.amountInput, { color: theme.tint }]}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <ThemedText type="smallBold">Definir prazo</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Mês-alvo opcional para alcançar a meta.
          </ThemedText>
        </View>
        <Switch
          value={hasDeadline}
          onValueChange={setHasDeadline}
          trackColor={{ true: Brand.blue, false: theme.border }}
        />
      </View>

      {hasDeadline && (
        <View style={[styles.stepper, { backgroundColor: theme.backgroundElement }]}>
          <Stepper label="‹" onPress={() => shiftDeadline(-1)} color={theme.text} />
          <ThemedText type="smallBold" style={styles.stepperValue}>
            {formatMonthYear(deadlineMonth)}
          </ThemedText>
          <Stepper label="›" onPress={() => shiftDeadline(1)} color={theme.text} />
        </View>
      )}

      {error && (
        <ThemedText type="small" themeColor="expense">
          {error}
        </ThemedText>
      )}

      <PrimaryButton
        label={initial ? 'Salvar alterações' : 'Criar meta'}
        loading={loading}
        onPress={handleSubmit}
      />

      {onDelete && (
        <Pressable
          accessibilityRole="button"
          onPress={handleDelete}
          disabled={loading}
          style={({ pressed }) => [styles.textAction, { opacity: pressed ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" themeColor="expense">
            {confirmingDelete ? 'Toque novamente para confirmar a exclusão' : 'Excluir meta'}
          </ThemedText>
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        disabled={loading}
        style={({ pressed }) => [styles.textAction, { opacity: pressed ? 0.6 : 1 }]}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Cancelar
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

function Stepper({ label, onPress, color }: { label: string; onPress: () => void; color: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.stepperBtn, { opacity: pressed ? 0.5 : 1 }]}>
      <ThemedText style={[styles.stepperBtnText, { color }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  amountBlock: {
    gap: Spacing.one,
    alignItems: 'center',
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: Spacing.two,
    minWidth: 200,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  switchText: {
    flex: 1,
    gap: Spacing.half,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
  },
  stepperBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },
  textAction: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
});
