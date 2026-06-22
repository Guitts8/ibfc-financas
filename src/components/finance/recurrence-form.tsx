import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  DEFAULT_CATEGORIES,
  type NewRecurrence,
  type Recurrence,
  type TransactionType,
} from '@/types/finance';
import { formatCurrency, formatMonthYear } from '@/utils/format';
import { periodKey, periodKeyToDate } from '@/utils/period';

export interface RecurrenceFormProps {
  onSubmit: (input: NewRecurrence) => Promise<void>;
  onCancel: () => void;
  /** Quando presente, edita a recorrência (campos preenchidos). */
  initial?: Recurrence;
  onDelete?: () => Promise<void>;
}

function firstCategoryId(type: TransactionType): string {
  return DEFAULT_CATEGORIES.find((c) => c.type === type)!.id;
}

/**
 * Formulário de recorrência mensal: tipo, valor, categoria, descrição, dia do
 * mês, mês inicial e se está ativa. Espelha o TransactionForm, mas grava uma
 * regra (NewRecurrence), não uma transação.
 */
export function RecurrenceForm({ onSubmit, onCancel, initial, onDelete }: RecurrenceFormProps) {
  const theme = useTheme();

  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const [amountDigits, setAmountDigits] = useState(
    initial ? String(Math.round(initial.amount * 100)) : '',
  );
  const [categoryId, setCategoryId] = useState(() => initial?.categoryId ?? firstCategoryId('expense'));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [dayOfMonth, setDayOfMonth] = useState(initial?.dayOfMonth ?? new Date().getDate());
  const [startMonth, setStartMonth] = useState(() =>
    periodKeyToDate(initial?.startPeriod ?? periodKey(new Date())),
  );
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const amount = Number(amountDigits || '0') / 100;
  const categories = useMemo(() => DEFAULT_CATEGORIES.filter((c) => c.type === type), [type]);

  function changeType(next: TransactionType) {
    if (next === type) return;
    setType(next);
    setCategoryId(firstCategoryId(next));
  }

  function changeAmount(text: string) {
    setAmountDigits(text.replace(/\D/g, '').slice(0, 9));
  }

  function changeDay(delta: number) {
    setDayOfMonth((d) => Math.min(31, Math.max(1, d + delta)));
  }

  function shiftStart(delta: number) {
    setStartMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  async function handleSubmit() {
    if (loading) return;
    setError(null);
    if (amount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        type,
        amount,
        categoryId,
        description,
        dayOfMonth,
        startPeriod: periodKey(startMonth),
        active,
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
      <View style={[styles.segment, { backgroundColor: theme.backgroundElement }]}>
        <SegmentButton label="Saída" active={type === 'expense'} activeColor={theme.expense} onPress={() => changeType('expense')} />
        <SegmentButton label="Entrada" active={type === 'income'} activeColor={theme.income} onPress={() => changeType('income')} />
      </View>

      <View style={styles.amountBlock}>
        <ThemedText type="smallBold">Valor</ThemedText>
        <TextInput
          value={amountDigits ? formatCurrency(amount) : ''}
          onChangeText={changeAmount}
          placeholder={formatCurrency(0)}
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          inputMode="numeric"
          style={[styles.amountInput, { color: type === 'income' ? theme.income : theme.expense }]}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Categoria</ThemedText>
        <View style={styles.chips}>
          {categories.map((c) => {
            const selected = c.id === categoryId;
            return (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                onPress={() => setCategoryId(c.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? c.color : theme.backgroundElement,
                    borderColor: selected ? c.color : theme.border,
                  },
                ]}>
                <ThemedText type="small" style={{ color: selected ? '#FFFFFF' : theme.text }}>
                  {c.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TextField
        label="Descrição (opcional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Ex.: Salário, Dízimo, Aluguel"
      />

      {/* Dia do mês */}
      <View style={styles.field}>
        <ThemedText type="smallBold">Dia do mês</ThemedText>
        <View style={[styles.stepper, { backgroundColor: theme.backgroundElement }]}>
          <Stepper label="‹" onPress={() => changeDay(-1)} color={theme.text} />
          <ThemedText type="smallBold" style={styles.stepperValue}>
            Dia {dayOfMonth}
          </ThemedText>
          <Stepper label="›" onPress={() => changeDay(1)} color={theme.text} />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Em meses mais curtos, ajusta para o último dia.
        </ThemedText>
      </View>

      {/* Mês inicial */}
      <View style={styles.field}>
        <ThemedText type="smallBold">A partir de</ThemedText>
        <View style={[styles.stepper, { backgroundColor: theme.backgroundElement }]}>
          <Stepper label="‹" onPress={() => shiftStart(-1)} color={theme.text} />
          <ThemedText type="smallBold" style={styles.stepperValue}>
            {formatMonthYear(startMonth)}
          </ThemedText>
          <Stepper label="›" onPress={() => shiftStart(1)} color={theme.text} />
        </View>
      </View>

      {/* Ativa */}
      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <ThemedText type="smallBold">Ativa</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Quando desligada, não gera novas pendências.
          </ThemedText>
        </View>
        <Switch
          value={active}
          onValueChange={setActive}
          trackColor={{ true: Brand.blue, false: theme.border }}
        />
      </View>

      {error && (
        <ThemedText type="small" themeColor="expense">
          {error}
        </ThemedText>
      )}

      <PrimaryButton
        label={initial ? 'Salvar alterações' : 'Criar recorrência'}
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
            {confirmingDelete ? 'Toque novamente para confirmar a exclusão' : 'Excluir recorrência'}
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

function SegmentButton({
  label,
  active,
  activeColor,
  onPress,
}: {
  label: string;
  active: boolean;
  activeColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.segmentButton, active && { backgroundColor: activeColor }]}>
      <ThemedText type="smallBold" style={{ color: active ? '#FFFFFF' : undefined }}>
        {label}
      </ThemedText>
    </Pressable>
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
  segment: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.half,
  },
  segmentButton: {
    flex: 1,
    height: 44,
    borderRadius: Spacing.two + Spacing.half,
    alignItems: 'center',
    justifyContent: 'center',
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
  field: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    borderWidth: 1,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  switchText: {
    flex: 1,
    gap: Spacing.half,
  },
  textAction: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
});
