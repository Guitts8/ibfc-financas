import { Timestamp } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DEFAULT_CATEGORIES, type NewTransaction, type TransactionType } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

export interface TransactionFormProps {
  /** Persiste a transação; deve lançar em caso de falha. */
  onSubmit: (input: NewTransaction) => Promise<void>;
  onCancel: () => void;
}

/** Primeira categoria disponível para um tipo (usada como padrão). */
function firstCategoryId(type: TransactionType): string {
  return DEFAULT_CATEGORIES.find((c) => c.type === type)!.id;
}

/**
 * Formulário de nova transação: tipo (entrada/saída), valor, categoria e uma
 * descrição opcional. O valor é digitado em centavos e exibido formatado.
 */
export function TransactionForm({ onSubmit, onCancel }: TransactionFormProps) {
  const theme = useTheme();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountDigits, setAmountDigits] = useState('');
  const [categoryId, setCategoryId] = useState(() => firstCategoryId('expense'));
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        date: Timestamp.now(),
      });
      // Sucesso: a tela que chamou fecha o modal.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
      setLoading(false);
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

      <PrimaryButton label="Salvar" loading={loading} onPress={handleSubmit} />

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
  cancel: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
});
