/**
 * Augmentation de tipos para @firebase/auth.
 *
 * O build de React Native do @firebase/auth exporta `getReactNativePersistence`
 * (carregado pelo Metro no celular), mas os tipos públicos padrão usados pelo
 * TypeScript não o declaram, porque a chave "types" no mapa de exports vem
 * antes da condição "react-native". Declaramos a função aqui para o TS — isso
 * não tem efeito em runtime.
 */

import type { Persistence } from '@firebase/auth';

declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
