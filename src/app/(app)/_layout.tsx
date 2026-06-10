import AppTabs from '@/components/app-tabs';

/**
 * Layout do app autenticado: as abas principais (Home, Explore...).
 * Só é acessível quando há usuário logado — o porteiro fica no _layout raiz
 * (ver src/app/_layout.tsx, com Stack.Protected).
 */
export default function AppLayout() {
  return <AppTabs />;
}
