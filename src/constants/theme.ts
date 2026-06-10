/**
 * Tema do app IBFC Finanças.
 * As cores de marca vêm do logo da igreja (vermelho, azul e verde-água
 * sobre cinza escuro). Há cores semânticas para finanças: receita (verde),
 * despesa (vermelho) e o azul como cor de ação principal.
 *
 * Estilização: o template usa NativeWind (ver global.css). Também é possível
 * usar StyleSheet normal do React Native consumindo estas constantes.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Cores da identidade visual da IBFC (extraídas do logo). */
export const Brand = {
  red: '#E5392E',
  blue: '#1E66E0',
  teal: '#18C29C',
  /** Cinza escuro de fundo do logo. */
  charcoal: '#1F2123',
  charcoalElevated: '#2B2D31',
} as const;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    border: '#E2E4E9',
    tint: Brand.blue,
    income: '#0FA37F',
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
