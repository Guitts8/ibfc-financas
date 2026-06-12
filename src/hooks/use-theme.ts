/**
 * O app IBFC Finanças usa sempre o tema CLARO (branco com tons de azul),
 * independente do esquema do sistema — ver decisão de visual em theme.ts.
 */

import { Colors } from '@/constants/theme';

export function useTheme() {
  return Colors.light;
}
