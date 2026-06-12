import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCategory, type Transaction } from '@/types/finance';
import { formatCurrency, formatDayMonth } from '@/utils/format';

/** Uma linha da lista de transações: categoria, descrição, data e valor. */
export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const theme = useTheme();
  const category = getCategory(transaction.categoryId);
  const isIncome = transaction.type === 'income';

  const when = transaction.date?.toDate?.();
  const title = transaction.description?.trim() || category?.label || 'Transação';

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: category?.color ?? theme.textSecondary }]} />

      <View style={styles.middle}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {category?.label ?? 'Sem categoria'}
          {when ? ` · ${formatDayMonth(when)}` : ''}
        </ThemedText>
      </View>

      <ThemedText
        type="smallBold"
        style={{ color: isIncome ? theme.income : theme.expense }}>
        {isIncome ? '+' : '−'} {formatCurrency(transaction.amount)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
});
