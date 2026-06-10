import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Segura a splash nativa até sabermos se há sessão salva, evitando que a tela
// de login pisque antes de redirecionar um usuário já logado.
SplashScreen.preventAutoHideAsync();

/**
 * Decide qual grupo de rotas o usuário pode ver, em runtime:
 * - logado  -> grupo (app) com as abas; o grupo (auth) fica inacessível.
 * - deslogado -> grupo (auth) com login/cadastro; o (app) fica inacessível.
 * O expo-router redireciona sozinho quem tentar acessar uma rota bloqueada.
 */
function RootNavigator() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing) {
      SplashScreen.hideAsync();
    }
  }, [initializing]);

  // Enquanto carrega o estado inicial de auth, mantém a splash (retorna vazio).
  if (initializing) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}
