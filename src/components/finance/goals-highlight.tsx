import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { DonutChart } from '@/components/finance/donut-chart';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useGoals } from '@/hooks/use-goals';
import type { Goal } from '@/types/finance';
import { formatCurrency } from '@/utils/format';
import { goalFraction, goalReached } from '@/utils/goals';

/**
 * Faixa compacta de metas na Home: anéis de progresso roláveis que levam à aba
 * Metas. Não renderiza nada enquanto carrega ou quando não há metas — a Home
 * permanece focada nas transações de quem ainda não usa metas.
 */
export function GoalsHighlight() {
  const router = useRouter();
  const { goals, loading } = useGoals();

  if (loading || goals.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <ThemedText type="smallBold">Metas</ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver todas as metas"
          onPress={() => router.navigate('/metas')}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <ThemedText type="small" themeColor="tint">
            Ver todas
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {goals.map((goal) => (
          <GoalChip key={goal.id} goal={goal} onPress={() => router.navigate('/metas')} />
        ))}
      </ScrollView>
    </View>
  );
}

function GoalChip({ goal, onPress }: { goal: Goal; onPress: () => void }) {
  const theme = useTheme();
  const fraction = goalFraction(goal);
  const reached = goalReached(goal);
  const ringColor = reached ? theme.income : theme.tint;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.chip, { borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
      <DonutChart segments={[{ color: ringColor, fraction }]} size={56} strokeWidth={7}>
        <ThemedText type="smallBold" style={{ color: ringColor, fontSize: 11 }}>
          {Math.round(fraction * 100)}%
        </ThemedText>
      </DonutChart>
      <ThemedText type="small" numberOfLines={1} style={styles.chipName}>
        {goal.name || 'Meta'}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {formatCurrency(goal.currentAmount)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    gap: Spacing.three,
    paddingVertical: Spacing.half,
  },
  chip: {
    width: 116,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.four,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    gap: Spacing.one,
  },
  chipName: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
