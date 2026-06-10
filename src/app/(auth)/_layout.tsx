import { Stack } from 'expo-router';

/**
 * Layout das telas de autenticação (login e cadastro), exibidas apenas
 * enquanto NÃO há usuário logado. Sem header — cada tela desenha o próprio
 * cabeçalho com a identidade do app.
 */
export const unstable_settings = {
  initialRouteName: 'login',
};

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
