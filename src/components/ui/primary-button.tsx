import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';

export type PrimaryButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /** Mostra um spinner e bloqueia o toque enquanto uma ação está em andamento. */
  loading?: boolean;
};

/** Botão de ação principal (azul da marca), com estado de carregamento. */
export function PrimaryButton({ label, loading, disabled, ...rest }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1 },
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <ThemedText type="default" style={styles.label}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: Spacing.three,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
