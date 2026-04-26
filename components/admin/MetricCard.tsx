import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/lib/constants";

interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  variacaoPct?: number | null;
  hint?: string;
}

const POSITIVE = "#51CF66";
const NEGATIVE = "#FF5252";
const NEUTRAL = COLORS.muted;

function formatVariacao(p: number): string {
  const sign = p >= 0 ? "+" : "";
  return `${sign}${p.toFixed(1)}%`;
}

export function MetricCard({
  label,
  value,
  icon,
  variacaoPct,
  hint,
}: MetricCardProps) {
  const hasVariacao = variacaoPct != null && Number.isFinite(variacaoPct);
  const isPositive = hasVariacao && (variacaoPct as number) >= 0;
  const trendColor = !hasVariacao ? NEUTRAL : isPositive ? POSITIVE : NEGATIVE;
  const arrow = !hasVariacao ? "—" : isPositive ? "↑" : "↓";

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        {hasVariacao && (
          <View style={[styles.trendPill, { backgroundColor: `${trendColor}20` }]}>
            <Text style={[styles.trendText, { color: trendColor }]}>
              {arrow} {formatVariacao(variacaoPct as number)}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 8,
    minHeight: 120,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    fontSize: 22,
  },
  trendPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 11,
    fontWeight: "700",
  },
  value: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  label: {
    color: COLORS.muted,
    fontSize: 12,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
