import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MonthTotals } from '@/hooks/use-transactions';
import { currentMonthLabel, formatCurrency } from '@/utils/format';

/** Cartão de resumo com o saldo e as entradas/saídas do mês corrente. */
export function BalanceCard({ totals }: { totals: MonthTotals }) {
  const theme = useTheme();
  const positivo = totals.balance >= 0;

  return (
    <View style={[styles.card, { backgroundColor: Brand.charcoalElevated }]}>
      <ThemedText type="smallBold" style={styles.eyebrow}>
        SALDO DE {currentMonthLabel().toUpperCase()}
      </ThemedText>

      <ThemedText
        style={[styles.balance, { color: positivo ? theme.income : theme.expense }]}>
        {formatCurrency(totals.balance)}
      </ThemedText>

      <View style={styles.row}>
        <View style={styles.col}>
          <ThemedText type="small" style={styles.mutedLabel}>
            Entradas
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: theme.income }}>
            {formatCurrency(totals.income)}
          </ThemedText>
        </View>
        <View style={[styles.col, styles.colRight]}>
          <ThemedText type="small" style={styles.mutedLabel}>
            Saídas
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: theme.expense }}>
            {formatCurrency(totals.expense)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  eyebrow: {
    color: '#9BA1A6',
    letterSpacing: 1.2,
  },
  balance: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    marginTop: Spacing.two,
  },
  col: {
    flex: 1,
    gap: Spacing.half,
  },
  colRight: {
    alignItems: 'flex-end',
  },
  mutedLabel: {
    color: '#9BA1A6',
  },
});
