import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from "react-native-svg";

import { COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import type { PontoTemporal } from "@/services/faturamento";

interface RevenueChartProps {
  data: PontoTemporal[];
  title?: string;
}

const CHART_HEIGHT = 200;
const BAR_GAP = 12;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 36;
const PADDING_X = 8;

export function RevenueChart({ data, title }: RevenueChartProps) {
  const max = Math.max(...data.map((d) => d.valor), 1);
  const totalPeriodo = data.reduce((s, d) => s + d.valor, 0);

  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.subtitle}>
        Total no período: <Text style={styles.subtitleStrong}>{formatBRL(totalPeriodo)}</Text>
      </Text>

      <View style={styles.chartWrap}>
        <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${100 * data.length} ${CHART_HEIGHT}`} preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={COLORS.primary} stopOpacity="0.95" />
              <Stop offset="1" stopColor={COLORS.primary} stopOpacity="0.35" />
            </LinearGradient>
          </Defs>

          {data.map((d, i) => {
            const colWidth = 100;
            const usable = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
            const h = max === 0 ? 0 : (d.valor / max) * usable;
            const x = i * colWidth + PADDING_X + BAR_GAP / 2;
            const w = colWidth - PADDING_X * 2 - BAR_GAP;
            const y = CHART_HEIGHT - PADDING_BOTTOM - h;

            return (
              <Rect
                key={i}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={6}
                ry={6}
                fill="url(#barGrad)"
              />
            );
          })}

          {data.map((d, i) => {
            const colWidth = 100;
            const cx = i * colWidth + colWidth / 2;
            return (
              <SvgText
                key={`lbl-${i}`}
                x={cx}
                y={CHART_HEIGHT - 12}
                fill={COLORS.muted}
                fontSize="14"
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            );
          })}

          {data.map((d, i) => {
            if (d.valor === 0) return null;
            const colWidth = 100;
            const usable = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
            const h = (d.valor / max) * usable;
            const cx = i * colWidth + colWidth / 2;
            const cy = CHART_HEIGHT - PADDING_BOTTOM - h - 8;
            return (
              <SvgText
                key={`val-${i}`}
                x={cx}
                y={cy}
                fill={COLORS.white}
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {d.valor >= 1000 ? `${(d.valor / 1000).toFixed(1)}k` : d.valor.toFixed(0)}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 6,
  },
  title: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  subtitleStrong: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  chartWrap: {
    height: CHART_HEIGHT,
    width: "100%",
  },
});
