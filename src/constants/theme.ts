/**
 * Tema do app IBFC Finanças.
 *
 * Visual: claro e leve — fundo branco com tons de azul (é um app para a
 * igreja). O azul da marca é a cor de ação e de destaque. Há cores semânticas
 * para finanças: receita (verde) e despesa (vermelho).
 *
 * O app roda sempre no tema claro (ver app.json `userInterfaceStyle: "light"`
 * e `useTheme()`); a paleta `dark` é mantida apenas por compatibilidade de
 * tipos e uso futuro.
 *
 * Estilização: o template usa NativeWind (ver global.css). Também é possível
 * usar StyleSheet normal do React Native consumindo estas constantes.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Cores da identidade visual da IBFC (azul como cor principal). */
export const Brand = {
  red: '#E5392E',
  blue: '#1E66E0',
  /** Azul mais escuro, para gradientes/realces sobre o azul principal. */
  blueDeep: '#1450B0',
  /** Azul bem claro, para superfícies e cartões suaves sobre o branco. */
  blueSurface: '#EAF1FF',
  teal: '#18C29C',
  /** Cinza escuro do logo (usado em ícones/splash, não na UI clara). */
  charcoal: '#1F2123',
  charcoalElevated: '#2B2D31',
} as const;

export const Colors = {
  light: {
    text: '#15233B',
    background: '#FFFFFF',
    /** Superfície clara levemente azulada (campos, cartões secundários). */
    backgroundElement: '#EEF3FC',
    backgroundSelected: '#D9E6FB',
    textSecondary: '#5B6B82',
    border: '#DCE6F4',
    tint: Brand.blue,
    income: '#0E9F76',
    expense: '#D8362B',
  },
  dark: {
    text: '#ECEDEE',
    background: Brand.charcoal,
    backgroundElement: Brand.charcoalElevated,
    backgroundSelected: '#3A3D42',
    textSecondary: '#9BA1A6',
    border: '#3A3D42',
    tint: Brand.blue,
    income: Brand.teal,
    expense: Brand.red,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
