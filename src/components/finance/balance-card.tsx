import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import type { MonthTotals } from '@/hooks/use-transactions';
import { currentMonthLabel, formatCurrency } from '@/utils/format';

/** Tons claros que contrastam bem sobre o azul do cartão. */
const ON_BLUE_MUTED = '#C6DBFF';
const ON_BLUE_INCOME = '#9DF0D4';
const ON_BLUE_EXPENSE = '#FFC2BC';

/** Cartão de resumo (destaque azul) com saldo e entradas/saídas do mês. */
export function BalanceCard({ totals }: { totals: MonthTotals }) {
  return (
    <View style={styles.card}>
      <ThemedText type="smallBold" style={styles.eyebrow}>
        SALDO DE {currentMonthLabel().toUpperCase()}
      </ThemedText>

      <ThemedText style={styles.balance}>{formatCurrency(totals.balance)}</ThemedText>

      <View style={styles.row}>
        <View style={styles.col}>
          <ThemedText type="small" style={styles.mutedLabel}>
            Entradas
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: ON_BLUE_INCOME }}>
            {formatCurrency(totals.income)}
          </ThemedText>
        </View>
        <View style={[styles.col, styles.colRight]}>
          <ThemedText type="small" style={styles.mutedLabel}>
            Saídas
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: ON_BLUE_EXPENSE }}>
            {formatCurrency(totals.expense)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.blue,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
    // Sombra azul suave para dar leveza sobre o fundo branco.
    shadowColor: Brand.blueDeep,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  eyebrow: {
    color: ON_BLUE_MUTED,
    letterSpacing: 1.2,
  },
  balance: {
    color: '#FFFFFF',
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
    color: ON_BLUE_MUTED,
  },
});
