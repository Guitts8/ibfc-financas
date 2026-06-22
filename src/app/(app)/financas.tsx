import { useState, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBreakdown } from '@/components/finance/category-breakdown';
import { DonutChart } from '@/components/finance/donut-chart';
import { MonthlyBars } from '@/components/finance/monthly-bars';
import { PeriodSelector } from '@/components/finance/period-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAnalytics } from '@/hooks/use-analytics';
import { formatCurrency } from '@/utils/format';
import { monthPeriod, type Period } from '@/utils/period';

export default function FinancasScreen() {
  const theme = useTheme();
  const [period, setPeriod] = useState<Period>(() => monthPeriod());
  const { totals, categories, series, hasData, loading, error } = useAnalytics(period);

  const donutSegments = categories.map((c) => ({ color: c.color, fraction: c.fraction }));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="smallBold" style={styles.eyebrow}>
            IBFC FINANÇAS
          </ThemedText>
          <ThemedText type="subtitle">Análise</ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <PeriodSelector period={period} onChange={setPeriod} />

          {error && (
            <ThemedText type="small" themeColor="expense">
              {error}
            </ThemedText>
          )}

          {/* Resumo do período: entradas, saídas e saldo. */}
          <View style={[styles.statsCard, { borderColor: theme.border }]}>
            <Stat label="Entradas" value={totals.income} color={theme.income} />
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <Stat label="Saídas" value={totals.expense} color={theme.expense} />
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <Stat label="Saldo" value={totals.balance} color={Brand.blue} />
          </View>

          {loading && !hasData ? (
            <View style={styles.placeholder}>
              <ActivityIndicator color={Brand.blue} />
            </View>
          ) : !hasData ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              Nenhuma transação neste período. Escolha outro período ou registre lançamentos na Home.
            </ThemedText>
          ) : (
            <>
              {/* Despesas por categoria */}
              <Card title="Despesas por categoria">
                {categories.length > 0 ? (
                  <>
                    <View style={styles.donutWrap}>
                      <DonutChart segments={donutSegments}>
                        <ThemedText type="small" themeColor="textSecondary">
                          Despesas
                        </ThemedText>
                        <ThemedText type="smallBold" style={styles.donutValue}>
                          {formatCurrency(totals.expense)}
                        </ThemedText>
                      </DonutChart>
                    </View>
                    <CategoryBreakdown slices={categories} />
                  </>
                ) : (
                  <ThemedText type="small" themeColor="textSecondary">
                    Sem despesas neste período.
                  </ThemedText>
                )}
              </Card>

              {/* Evolução mensal */}
              <Card title="Entradas × Saídas (6 meses)">
                <MonthlyBars series={series} />
              </Card>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/** Cartão branco com título, usado nas seções de análise. */
function Card({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <ThemedView style={[styles.card, { borderColor: theme.border }]}>
      <ThemedText type="smallBold" style={styles.cardTitle}>
        {title}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={{ color }}>
        {formatCurrency(value)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.half,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  eyebrow: {
    color: Brand.blue,
    letterSpacing: 1.5,
  },
  content: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.half,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  cardTitle: {
    marginBottom: Spacing.half,
  },
  donutWrap: {
    alignItems: 'center',
  },
  donutValue: {
    fontSize: 18,
    lineHeight: 24,
  },
  placeholder: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  empty: {
    paddingVertical: Spacing.four,
    textAlign: 'center',
  },
});
