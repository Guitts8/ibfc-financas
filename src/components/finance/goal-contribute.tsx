import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Goal } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

interface GoalContributeProps {
  /** Meta sendo movimentada; null fecha o modal. */
  goal: Goal | null;
  onClose: () => void;
  /** Aplica o delta (positivo = aporte, negativo = retirada). */
  onSubmit: (delta: number) => Promise<void>;
}

/** Modal para registrar um aporte ou uma retirada no saldo de uma meta. */
export function GoalContribute({ goal, onClose, onSubmit }: GoalContributeProps) {
  const theme = useTheme();
  const [amountDigits, setAmountDigits] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const amount = Number(amountDigits || '0') / 100;

  function reset() {
    setAmountDigits('');
    setError(null);
    setLoading(false);
  }

  function close() {
    reset();
    onClose();
  }

  async function apply(sign: 1 | -1) {
    if (loading || !goal) return;
    setError(null);
    if (amount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    // Retirada nunca deixa o saldo negativo.
    const delta = sign === -1 ? -Math.min(amount, goal.currentAmount) : amount;
    setLoading(true);
    try {
      await onSubmit(delta);
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
      setLoading(false);
    }
  }

  return (
    <Modal visible={goal != null} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.backdrop}>
        <ThemedView style={styles.sheet}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handle} />
            <ThemedText type="subtitle" style={styles.title}>
              {goal?.name || 'Meta'}
            </ThemedText>
            {goal && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                Saldo atual: {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
              </ThemedText>
            )}

            <TextInput
              value={amountDigits ? formatCurrency(amount) : ''}
              onChangeText={(text) => setAmountDigits(text.replace(/\D/g, '').slice(0, 9))}
              placeholder={formatCurrency(0)}
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              inputMode="numeric"
              autoFocus
              style={[styles.amountInput, { color: theme.tint }]}
            />

            {error && (
              <ThemedText type="small" themeColor="expense" style={styles.error}>
                {error}
              </ThemedText>
            )}

            <PrimaryButton label="Adicionar aporte" loading={loading} onPress={() => apply(1)} />

            <Pressable
              accessibilityRole="button"
              onPress={() => apply(-1)}
              disabled={loading}
              style={({ pressed }) => [styles.secondary, { borderColor: theme.border, opacity: pressed ? 0.6 : 1 }]}>
              <ThemedText type="smallBold" themeColor="text">
                Retirar
              </ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={close}
              disabled={loading}
              style={({ pressed }) => [styles.cancel, { opacity: pressed ? 0.6 : 1 }]}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Cancelar
              </ThemedText>
            </Pressable>
          </SafeAreaView>
        </ThemedView>
      </View>
    </Modal>
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
    marginBottom: Spacing.half,
  },
  subtitle: {
    marginBottom: Spacing.three,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
  error: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  secondary: {
    height: 52,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  cancel: {
    alignSelf: 'center',
    paddingVertical: Spacing.three,
  },
});
