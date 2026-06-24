import { Pressable, StyleSheet, View } from 'react-native';

import { DonutChart } from '@/components/finance/donut-chart';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Goal } from '@/types/finance';
import { formatCurrency, formatMonthYear } from '@/utils/format';
import { goalFraction, goalReached, goalRemaining } from '@/utils/goals';

interface GoalCardProps {
  goal: Goal;
  onContribute: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
}

/** Cartão de uma meta: anel de progresso, valores e ações (aporte/editar). */
export function GoalCard({ goal, onContribute, onEdit }: GoalCardProps) {
  const theme = useTheme();
  const fraction = goalFraction(goal);
  const reached = goalReached(goal);
  const remaining = goalRemaining(goal);
  const ringColor = reached ? theme.income : theme.tint;
  const deadline = goal.deadline?.toDate?.();

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.top}>
        <DonutChart segments={[{ color: ringColor, fraction }]} size={76} strokeWidth={10}>
          <ThemedText type="smallBold" style={{ color: ringColor }}>
            {Math.round(fraction * 100)}%
          </ThemedText>
        </DonutChart>

        <View style={styles.info}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {goal.name || 'Meta'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
          </ThemedText>
          <ThemedText type="small" style={{ color: reached ? theme.income : theme.textSecondary }}>
            {reached ? 'Meta atingida 🎉' : `Faltam ${formatCurrency(remaining)}`}
          </ThemedText>
          {deadline && (
            <ThemedText type="small" themeColor="textSecondary">
              Prazo: {formatMonthYear(deadline)}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={[styles.actions, { borderTopColor: theme.border }]}>
        <Action label="Aporte" color={theme.tint} onPress={() => onContribute(goal)} />
        <Action label="Editar" color={theme.text} onPress={() => onEdit(goal)} />
      </View>
    </View>
  );
}

function Action({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
      <ThemedText type="smallBold" style={{ color }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.five,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
  },
  action: {
    paddingVertical: Spacing.half,
  },
});
