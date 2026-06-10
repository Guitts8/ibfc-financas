import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';

type AuthScaffoldProps = {
  /** Título da tela, ex.: "Entrar" ou "Criar conta". */
  title: string;
  /** Linha de apoio abaixo do título. */
  subtitle: string;
  children: ReactNode;
};

/**
 * Estrutura comum das telas de autenticação: marca, título, e o conteúdo
 * (formulário) dentro de um ScrollView que respeita o teclado.
 */
export function AuthScaffold({ title, subtitle, children }: AuthScaffoldProps) {
  return (
    <ThemedView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <ThemedText type="smallBold" style={styles.brand}>
                IBFC FINANÇAS
              </ThemedText>
              <ThemedText type="subtitle">{title}</ThemedText>
              <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>
            </View>

            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.one,
  },
  brand: {
    color: Brand.blue,
    letterSpacing: 1.5,
  },
});
