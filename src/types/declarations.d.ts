/**
 * Declarações de tipos para imports que o Metro entende em runtime, mas que o
 * TypeScript não conhece por padrão (arquivos CSS usados pelo NativeWind/Expo).
 */

declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
