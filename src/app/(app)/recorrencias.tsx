import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecurrencesPanel } from '@/components/finance/recurrences-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRecurrences } from '@/hooks/use-recurrences';

export default function RecorrenciasScreen() {
  const { user } = useAuth();
  const { recurrences, error } = useRecurrences();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="smallBold" style={styles.eyebrow}>
            IBFC FINANÇAS
          </ThemedText>
          <ThemedText type="subtitle">Recorrências</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Lançamentos mensais que viram pendências para você confirmar na Home.
          </ThemedText>
        </View>

        {error && (
          <ThemedText type="small" themeColor="expense">
            {error}
          </ThemedText>
        )}

        {user && <RecurrencesPanel uid={user.uid} recurrences={recurrences} />}
      </SafeAreaView>
    </ThemedView>
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
});
