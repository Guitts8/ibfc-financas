import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MonthBucket } from '@/utils/analytics';

const CHART_HEIGHT = 120;

/**
 * Barras de entradas × saídas dos últimos meses. Sem dependência de gráfico:
 * cada barra é uma View com altura proporcional ao maior valor da série.
 */
export function MonthlyBars({ series }: { series: MonthBucket[] }) {
  const theme = useTheme();
  const max = Math.max(1, ...series.flatMap((b) => [b.income, b.expense]));

  return (
    <View style={styles.wrapper}>
      <View style={styles.legend}>
        <Legend color={theme.income} label="Entradas" />
        <Legend color={theme.expense} label="Saídas" />
      </View>

      <View style={styles.chart}>
        {series.map((bucket) => (
          <View key={bucket.label + bucket.monthStart.getFullYear()} style={styles.column}>
            <View style={styles.bars}>
              <Bar height={(bucket.income / max) * CHART_HEIGHT} color={theme.income} />
              <Bar height={(bucket.expense / max) * CHART_HEIGHT} color={theme.expense} />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {bucket.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Uma barra individual; mantém 2px mínimos quando há valor, para não sumir. */
function Bar({ height, color }: { height: number; color: string }) {
  return <View style={[styles.bar, { height: height > 0 ? Math.max(height, 2) : 0, backgroundColor: color }]} />;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.three,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT + 24,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: CHART_HEIGHT,
  },
  bar: {
    width: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});
