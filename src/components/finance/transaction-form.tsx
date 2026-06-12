import { Timestamp } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  DEFAULT_CATEGORIES,
  type NewTransaction,
  type Transaction,
  type TransactionType,
} from '@/types/finance';
import { formatCurrency } from '@/utils/format';

export interface TransactionFormProps {
  /** Persiste a transação (criação ou edição); deve lançar em caso de falha. */
  onSubmit: (input: NewTransaction) => Promise<void>;
  onCancel: () => void;
  /** Quando presente, o formulário entra em modo de edição (campos preenchidos). */
  initial?: Transaction;
  /** Exclui a transação em edição; quando ausente, o botão de excluir não aparece. */
  onDelete?: () => Promise<void>;
}

/** Primeira categoria disponível para um tipo (usada como padrão). */
function firstCategoryId(type: TransactionType): string {
  return DEFAULT_CATEGORIES.find((c) => c.type === type)!.id;
}

/**
 * Formulário de transação: tipo (entrada/saída), valor, categoria e uma
 * descrição opcional. O valor é digitado em centavos e exibido formatado.
 * Em modo de edição (prop `initial`), os campos vêm preenchidos e a data
 * original é preservada.
 */
export function TransactionForm({ onSubmit, onCancel, initial, onDelete }: TransactionFormProps) {
  const theme = useTheme();
  const editing = !!initial;

  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const [amountDigits, setAmountDigits] = useState(
    initial ? String(Math.round(initial.amount * 100)) : '',
  );
  const [categoryId, setCategoryId] = useState(
    () => initial?.categoryId ?? firstCategoryId('expense'),
  );
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const amount = Number(amountDigits || '0') / 100;
  const categories = useMemo(() => DEFAULT_CATEGORIES.filter((c) => c.type === type), [type]);

  function changeType(next: TransactionType) {
    if (next === type) return;
    setType(next);
    setCategoryId(firstCategoryId(next)); // a categoria atual pode não valer para o novo tipo
  }

  function changeAmount(text: string) {
    // Mantém só dígitos e limita para evitar overflow visual (até R$ 9.999.999,99).
    setAmountDigits(text.replace(/\D/g, '').slice(0, 9));
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
        // Em edição, preserva a data original do lançamento.
        date: initial?.date ?? Timestamp.now(),
      });
      // Sucesso: a tela que chamou fecha o modal.
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
      {/* Seletor de tipo */}
      <View style={[styles.segment, { backgroundColor: theme.backgroundElement }]}>
        <SegmentButton
          label="Saída"
          active={type === 'expense'}
          activeColor={theme.expense}
          onPress={() => changeType('expense')}
        />
        <SegmentButton
          label="Entrada"
          active={type === 'income'}
          activeColor={theme.income}
          onPress={() => changeType('income')}
        />
      </View>

      {/* Valor */}
      <View style={styles.amountBlock}>
        <ThemedText type="smallBold">Valor</ThemedText>
        <TextInput
          value={amountDigits ? formatCurrency(amount) : ''}
          onChangeText={changeAmount}
          placeholder={formatCurrency(0)}
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          inputMode="numeric"
          style={[
            styles.amountInput,
            { color: type === 'income' ? theme.income : theme.expense },
          ]}
        />
      </View>

      {/* Categoria */}
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
                <ThemedText
                  type="small"
                  style={{ color: selected ? '#FFFFFF' : theme.text }}>
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
        placeholder="Ex.: Mercado da semana"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      {error && (
        <ThemedText type="small" themeColor="expense">
          {error}
        </ThemedText>
      )}

      <PrimaryButton
        label={editing ? 'Salvar alterações' : 'Salvar'}
        loading={loading}
        onPress={handleSubmit}
      />

      {editing && onDelete && (
        <Pressable
          accessibilityRole="button"
          onPress={handleDelete}
          disabled={loading}
          style={({ pressed }) => [styles.delete, { opacity: pressed ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" themeColor="expense">
            {confirmingDelete ? 'Toque novamente para confirmar a exclusão' : 'Excluir transação'}
          </ThemedText>
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        disabled={loading}
        style={({ pressed }) => [styles.cancel, { opacity: pressed ? 0.6 : 1 }]}>
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
  delete: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
  cancel: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
});
