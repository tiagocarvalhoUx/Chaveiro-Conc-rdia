import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import type { ClienteFaturamento } from "@/services/faturamento";

interface TopClientesProps {
  clientes: ClienteFaturamento[];
}

export function TopClientes({ clientes }: TopClientesProps) {
  const total = clientes.reduce((s, c) => s + c.totalFaturado, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top clientes por faturamento</Text>
      <Text style={styles.subtitle}>
        Ranking pelos {clientes.length} maiores volumes acumulados
      </Text>

      {clientes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Sem pedidos concluídos ainda — quando você marcar pedidos como
            concluídos, eles aparecem aqui.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {clientes.map((c, i) => {
            const pct = total > 0 ? (c.totalFaturado / total) * 100 : 0;
            return (
              <View key={c.cliente_id} style={styles.row}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{i + 1}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.nome} numberOfLines={1}>
                    {c.nome}
                  </Text>
                  <Text style={styles.meta}>
                    {c.totalPedidos} pedido{c.totalPedidos === 1 ? "" : "s"} concluído
                    {c.totalPedidos === 1 ? "" : "s"}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                </View>
                <View style={styles.values}>
                  <Text style={styles.valor}>{formatBRL(c.totalFaturado)}</Text>
                  <Text style={styles.pct}>{pct.toFixed(1)}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
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
    marginBottom: 10,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,215,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nome: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  meta: {
    color: COLORS.muted,
    fontSize: 11,
  },
  barTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 2,
  },
  barFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  values: {
    alignItems: "flex-end",
  },
  valor: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  pct: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  empty: {
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
