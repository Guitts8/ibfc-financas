import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CategorySlice } from '@/utils/analytics';
import { formatCurrency } from '@/utils/format';

/** Lista de despesas por categoria: cor, rótulo, percentual e valor. */
export function CategoryBreakdown({ slices }: { slices: CategorySlice[] }) {
  const theme = useTheme();

  return (
    <View style={styles.list}>
      {slices.map((slice) => (
        <View key={slice.categoryId} style={styles.row}>
          <View style={styles.head}>
            <View style={[styles.dot, { backgroundColor: slice.color }]} />
            <ThemedText type="smallBold" numberOfLines={1} style={styles.label}>
              {slice.label}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {Math.round(slice.fraction * 100)}%
            </ThemedText>
            <ThemedText type="smallBold" style={styles.value}>
              {formatCurrency(slice.total)}
            </ThemedText>
          </View>
          {/* Barra proporcional à participação da categoria. */}
          <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: slice.color, width: `${Math.max(slice.fraction * 100, 2)}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  row: {
    gap: Spacing.one,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    flex: 1,
  },
  value: {
    minWidth: 90,
    textAlign: 'right',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
