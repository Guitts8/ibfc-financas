import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

export interface DonutSegment {
  color: string;
  /** Participação no total (0–1). A soma das frações deve ser ≤ 1. */
  fraction: number;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  /** Conteúdo centralizado no furo do donut (ex.: total do período). */
  children?: ReactNode;
}

/**
 * Gráfico de rosca desenhado com arcos de círculo (strokeDasharray). Genérico:
 * recebe fatias {cor, fração} e, opcionalmente, um conteúdo central.
 */
export function DonutChart({ segments, size = 180, strokeWidth = 24, children }: DonutChartProps) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Cada arco começa onde os anteriores terminaram. Calculamos o offset de forma
  // funcional (soma das frações anteriores) para não reatribuir variável durante
  // o render — são poucas fatias, então o custo é irrelevante.
  const visible = segments.filter((s) => s.fraction > 0);
  const arcs = visible.map((s, i) => {
    const precedingFraction = visible.slice(0, i).reduce((sum, x) => sum + x.fraction, 0);
    const dash = s.fraction * circumference;
    return (
      <Circle
        key={i}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={s.color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-precedingFraction * circumference}
        strokeLinecap="butt"
        fill="none"
      />
    );
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Trilho de fundo (também cobre o caso "sem dados"). */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.backgroundElement}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Gira -90° para a primeira fatia começar no topo (12h). */}
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {arcs}
        </G>
      </Svg>
      {children != null && (
        <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
