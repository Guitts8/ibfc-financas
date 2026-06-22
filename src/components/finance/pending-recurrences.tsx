import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCategory } from '@/types/finance';
import { formatCurrency } from '@/utils/format';
import { formatPeriodKey } from '@/utils/period';
import type { PendingOccurrence } from '@/utils/recurrence';

interface PendingRecurrencesProps {
  pending: PendingOccurrence[];
  onConfirm: (occurrence: PendingOccurrence) => void;
  onEdit: (occurrence: PendingOccurrence) => void;
  onSkip: (occurrence: PendingOccurrence) => void;
  /** Ids "recurrenceId:periodKey" em processamento (desabilita os botões). */
  busyKeys: Set<string>;
}

/** Chave única de uma ocorrência (recorrência + mês). */
export function occurrenceKey(occurrence: PendingOccurrence): string {
  return `${occurrence.recurrenceId}:${occurrence.periodKey}`;
}

/**
 * Lista de lançamentos recorrentes aguardando confirmação. Cada item pode ser
 * confirmado (vira transação), editado antes de confirmar ou pulado.
 */
export function PendingRecurrences({
  pending,
  onConfirm,
  onEdit,
  onSkip,
  busyKeys,
}: PendingRecurrencesProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { borderColor: theme.tint, backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="smallBold" style={{ color: theme.tint }}>
        Lançamentos pendentes ({pending.length})
      </ThemedText>

      {pending.map((occurrence) => {
        const category = getCategory(occurrence.categoryId);
        const isIncome = occurrence.type === 'income';
        const title = occurrence.description?.trim() || category?.label || 'Recorrência';
        const busy = busyKeys.has(occurrenceKey(occurrence));

        return (
          <View key={occurrenceKey(occurrence)} style={[styles.item, { borderTopColor: theme.border }]}>
            <View style={styles.info}>
              <View style={[styles.dot, { backgroundColor: category?.color ?? theme.textSecondary }]} />
              <View style={styles.infoText}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {formatPeriodKey(occurrence.periodKey)}
                </ThemedText>
              </View>
              <ThemedText type="smallBold" style={{ color: isIncome ? theme.income : theme.expense }}>
                {isIncome ? '+' : '−'} {formatCurrency(occurrence.amount)}
              </ThemedText>
            </View>

            <View style={styles.actions}>
              <Action label="Confirmar" color={theme.tint} disabled={busy} onPress={() => onConfirm(occurrence)} />
              <Action label="Editar" color={theme.text} disabled={busy} onPress={() => onEdit(occurrence)} />
              <Action label="Pular" color={theme.textSecondary} disabled={busy} onPress={() => onSkip(occurrence)} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Action({
  label,
  color,
  onPress,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.action, { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 }]}>
      <ThemedText type="smallBold" style={{ color }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  item: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  infoText: {
    flex: 1,
    gap: Spacing.half,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.four,
    paddingLeft: Spacing.three,
  },
  action: {
    paddingVertical: Spacing.half,
  },
});
