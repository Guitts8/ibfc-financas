import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function CadastroScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (loading) return;
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      await signUp({ name, email, password });
      // Sucesso: o AuthContext atualiza o usuário e o porteiro redireciona.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível criar a conta.');
      setLoading(false);
    }
  }

  return (
    <AuthScaffold title="Criar conta" subtitle="Comece a organizar seu dinheiro.">
      <View style={styles.form}>
        <TextField
          label="Nome"
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
        />
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
          placeholder="Mínimo de 6 caracteres"
          autoCapitalize="none"
          autoComplete="new-password"
          secureTextEntry
          returnKeyType="next"
        />
        <TextField
          label="Confirmar senha"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Repita a senha"
          autoCapitalize="none"
          autoComplete="new-password"
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {error && (
          <ThemedText type="small" themeColor="expense">
            {error}
          </ThemedText>
        )}

        <PrimaryButton label="Criar conta" loading={loading} onPress={handleSubmit} />
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          Já tem conta?{' '}
        </ThemedText>
        <Link href="/login" replace>
          <ThemedText type="smallBold" themeColor="tint">
            Entrar
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
