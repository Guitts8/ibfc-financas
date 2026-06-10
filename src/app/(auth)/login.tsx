import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (loading) return;
    setError(null);

    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, password });
      // Em caso de sucesso, o AuthContext atualiza o usuário e o porteiro
      // (Stack.Protected no _layout raiz) redireciona para o app sozinho.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar.');
      setLoading(false);
    }
  }

  return (
    <AuthScaffold title="Entrar" subtitle="Acesse para controlar suas finanças.">
      <View style={styles.form}>
        <TextField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@exemplo.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          inputMode="email"
          returnKeyType="next"
        />
        <TextField
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          autoCapitalize="none"
          autoComplete="current-password"
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {error && (
          <ThemedText type="small" themeColor="expense">
            {error}
          </ThemedText>
        )}

        <PrimaryButton label="Entrar" loading={loading} onPress={handleSubmit} />
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          Ainda não tem conta?{' '}
        </ThemedText>
        <Link href="/cadastro" replace>
          <ThemedText type="smallBold" themeColor="tint">
            Criar conta
          </ThemedText>
        </Link>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
