import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMonthYear } from '@/utils/format';
import {
  customPeriod,
  formatPeriodLabel,
  isCurrentMonth,
  monthPeriod,
  shiftMonth,
  type Period,
} from '@/utils/period';

interface PeriodSelectorProps {
  period: Period;
  onChange: (period: Period) => void;
}

/** Primeiro dia de um mês deslocado em `delta` meses a partir de hoje. */
function monthFromNow(delta: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + delta, 1);
}

/** Atalhos de período oferecidos no modal. */
const PRESETS: { label: string; build: () => Period }[] = [
  { label: 'Este mês', build: () => monthPeriod() },
  { label: 'Mês passado', build: () => shiftMonth(monthPeriod(), -1) },
  { label: 'Últimos 3 meses', build: () => customPeriod(monthFromNow(-2), monthFromNow(0)) },
  { label: 'Últimos 6 meses', build: () => customPeriod(monthFromNow(-5), monthFromNow(0)) },
  { label: 'Este ano', build: () => customPeriod(new Date(new Date().getFullYear(), 0, 1), monthFromNow(0)) },
];

/**
 * Cabeçalho de período: navega mês a mês com setas (‹ Junho 2026 ›) e abre um
 * modal com atalhos e um intervalo custom (por mês). A seta "avançar" é
 * desabilitada no mês corrente.
 */
export function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const isMonth = period.kind === 'month';
  const atCurrent = isCurrentMonth(period);

  return (
    <>
      <View style={styles.bar}>
        <Arrow
          label="‹"
          disabled={!isMonth}
          onPress={() => onChange(shiftMonth(period, -1))}
          color={theme.text}
          mutedColor={theme.textSecondary}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.labelButton, { opacity: pressed ? 0.6 : 1 }]}>
          <ThemedText type="smallBold">{formatPeriodLabel(period)}</ThemedText>
          <ThemedText type="small" themeColor="tint">
            alterar
          </ThemedText>
        </Pressable>
        <Arrow
          label="›"
          disabled={!isMonth || atCurrent}
          onPress={() => onChange(shiftMonth(period, 1))}
          color={theme.text}
          mutedColor={theme.textSecondary}
        />
      </View>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <ThemedView style={styles.sheet}>
            <SafeAreaView edges={['bottom']}>
              <View style={styles.handle} />
              <ThemedText type="subtitle" style={styles.sheetTitle}>
                Período
              </ThemedText>
              <CustomRange
                initial={period}
                onApply={(p) => {
                  onChange(p);
                  setOpen(false);
                }}
                onPreset={(p) => {
                  onChange(p);
                  setOpen(false);
                }}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setOpen(false)}
                style={({ pressed }) => [styles.cancel, { opacity: pressed ? 0.6 : 1 }]}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Fechar
                </ThemedText>
              </Pressable>
            </SafeAreaView>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

/** Conteúdo do modal: atalhos rápidos + intervalo custom por mês. */
function CustomRange({
  initial,
  onApply,
  onPreset,
}: {
  initial: Period;
  onApply: (period: Period) => void;
  onPreset: (period: Period) => void;
}) {
  const theme = useTheme();
  const [from, setFrom] = useState(() => new Date(initial.start.getFullYear(), initial.start.getMonth(), 1));
  const [to, setTo] = useState(() => new Date(initial.end.getFullYear(), initial.end.getMonth(), 1));

  return (
    <View style={styles.rangeBody}>
      <ThemedText type="smallBold">Atalhos</ThemedText>
      <View style={styles.chips}>
        {PRESETS.map((preset) => (
          <Pressable
            key={preset.label}
            accessibilityRole="button"
            onPress={() => onPreset(preset.build())}
            style={[styles.chip, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <ThemedText type="small">{preset.label}</ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText type="smallBold" style={styles.rangeTitle}>
        Intervalo personalizado
      </ThemedText>
      <MonthStepper label="De" value={from} onChange={setFrom} />
      <MonthStepper label="Até" value={to} onChange={setTo} />

      <PrimaryButton label="Aplicar intervalo" onPress={() => onApply(customPeriod(from, to))} />
    </View>
  );
}

/** Stepper de mês: ‹ Junho 2026 ›. Não permite avançar além do mês corrente. */
function MonthStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}) {
  const theme = useTheme();
  const now = new Date();
  const atCurrent = value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth();

  function shift(delta: number) {
    onChange(new Date(value.getFullYear(), value.getMonth() + delta, 1));
  }

  return (
    <View style={[styles.stepper, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.stepperLabel}>
        {label}
      </ThemedText>
      <Arrow label="‹" onPress={() => shift(-1)} color={theme.text} mutedColor={theme.textSecondary} />
      <ThemedText type="smallBold" style={styles.stepperValue}>
        {formatMonthYear(value)}
      </ThemedText>
      <Arrow
        label="›"
        disabled={atCurrent}
        onPress={() => shift(1)}
        color={theme.text}
        mutedColor={theme.textSecondary}
      />
    </View>
  );
}

function Arrow({
  label,
  onPress,
  disabled,
  color,
  mutedColor,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color: string;
  mutedColor: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.arrow, { opacity: disabled ? 0.3 : pressed ? 0.5 : 1 }]}>
      <ThemedText style={[styles.arrowText, { color: disabled ? mutedColor : color }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelButton: {
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.three,
  },
  arrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },
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
    maxHeight: '90%',
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
  sheetTitle: {
    marginBottom: Spacing.three,
  },
  rangeBody: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    borderWidth: 1,
  },
  rangeTitle: {
    marginTop: Spacing.three,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  stepperLabel: {
    width: 36,
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
  },
  cancel: {
    alignSelf: 'center',
    paddingVertical: Spacing.three,
  },
});
