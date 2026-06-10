import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const nome = user?.displayName?.trim() || user?.email || 'irmão(ã)';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <ThemedText type="smallBold" style={styles.eyebrow}>
            IBFC FINANÇAS
          </ThemedText>
          <ThemedText type="subtitle">Olá, {nome}</ThemedText>
          <ThemedText themeColor="textSecondary">
            Seu painel de finanças aparecerá aqui em breve.
          </ThemedText>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={signOut}
          style={({ pressed }) => [styles.logout, { opacity: pressed ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" themeColor="expense">
            Sair
          </ThemedText>
        </Pressable>
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
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.one,
  },
  eyebrow: {
    color: Brand.blue,
    letterSpacing: 1.5,
  },
  logout: {
    alignSelf: 'center',
    paddingVertical: Spacing.three,
  },
});
