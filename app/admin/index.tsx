import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import {
  buscarEstatisticas,
  buscarReceitaMensal,
  listarTodosPedidos,
  type EstatisticasDashboard,
  type PedidoAdminCompleto,
  type ReceitaMensal,
} from "@/services/admin";
import { exportarPlanilha } from "@/lib/excelExport";
import { BRAND, COLORS, STATUS_INFO } from "@/lib/constants";
import { formatBRL as formatarValor, formatDateBR as formatarData } from "@/lib/format";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: string;
  onPress?: () => void;
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function StatCard({ label, value, icon, color, onPress }: StatCardProps) {
  const content = (
    <View style={[styles.statCard, color ? { borderLeftColor: color, borderLeftWidth: 3 } : {}]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={{ flex: 1 }} onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={{ flex: 1 }}>{content}</View>;
}

function ReceitaCard({
  receita,
  loading,
}: {
  receita: ReceitaMensal | null;
  loading: boolean;
}) {
  return (
    <View style={styles.receitaCard}>
      <View style={styles.receitaHeader}>
        <View>
          <Text style={styles.receitaTitle}>Entrada de vendas</Text>
          <Text style={styles.receitaMes}>
            {loading ? "Carregando..." : receita?.mes ?? "—"}
          </Text>
        </View>
        <View style={styles.receitaBadge}>
          <Text style={styles.receitaBadgeText}>📈 Mensal</Text>
        </View>
      </View>

      <Text style={styles.receitaValor}>
        {loading
          ? "—"
          : receita
          ? formatarValor(receita.total)
          : "R$ 0,00"}
      </Text>

      <View style={styles.receitaFooter}>
        <View style={styles.receitaStatItem}>
          <Text style={styles.receitaStatValue}>
            {loading ? "—" : receita?.quantidade ?? 0}
          </Text>
          <Text style={styles.receitaStatLabel}>pedidos no mês</Text>
        </View>
        <View style={styles.receitaDivider} />
        <View style={styles.receitaStatItem}>
          <Text style={styles.receitaStatValue}>
            {loading || !receita || receita.quantidade === 0
              ? "—"
              : formatarValor(receita.total / receita.quantidade)}
          </Text>
          <Text style={styles.receitaStatLabel}>ticket médio</Text>
        </View>
      </View>
    </View>
  );
}

function PedidoRecenteCard({
  pedido,
  onPress,
}: {
  pedido: PedidoAdminCompleto;
  onPress: () => void;
}) {
  const status = STATUS_INFO[pedido.status];
  const tipoBadge: Record<string, string> = {
    agendamento: "📅",
    orcamento: "📸",
    emergencia: "🚨",
  };

  return (
    <TouchableOpacity
      style={styles.recentCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.recentCardLeft}>
        <Text style={styles.recentCardTipo}>{tipoBadge[pedido.tipo] ?? "📋"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.recentCardNome} numberOfLines={1}>
            {pedido.cliente?.nome ?? "Cliente"}
          </Text>
          <Text style={styles.recentCardServico} numberOfLines={1}>
            {pedido.servico?.titulo ?? pedido.observacoes ?? "—"}
          </Text>
          <Text style={styles.recentCardData}>
            {formatarData(pedido.created_at)}
          </Text>
        </View>
      </View>
      <View style={[styles.statusPill, { backgroundColor: status.color + "25" }]}>
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Tela principal ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<EstatisticasDashboard | null>(null);
  const [receita, setReceita] = useState<ReceitaMensal | null>(null);
  const [recentes, setRecentes] = useState<PedidoAdminCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      const [statsData, pedidosData, receitaData] = await Promise.all([
        buscarEstatisticas(),
        listarTodosPedidos(),
        buscarReceitaMensal(),
      ]);
      setStats(statsData);
      setRecentes(pedidosData.slice(0, 6));
      setReceita(receitaData);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    intervalRef.current = setInterval(carregarDados, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [carregarDados]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const handleExport = async () => {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      const [pedidos, statsData, receitaData] = await Promise.all([
        listarTodosPedidos(),
        buscarEstatisticas(),
        buscarReceitaMensal(),
      ]);
      await exportarPlanilha(pedidos, {
        stats: statsData,
        receita: receitaData,
      });
    } catch (err) {
      console.error("Erro ao exportar:", err);
      Alert.alert(
        "Erro na exportação",
        "Não foi possível gerar a planilha. Tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setExportLoading(false);
    }
  };

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerGreeting}>Painel Administrativo</Text>
          <Text style={styles.headerDate}>{hoje}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.exportBtn, exportLoading && styles.exportBtnDisabled]}
            onPress={handleExport}
            disabled={exportLoading}
            activeOpacity={0.8}
          >
            {exportLoading ? (
              <ActivityIndicator color={COLORS.dark} size="small" />
            ) : (
              <Text style={styles.exportBtnText}>⬇ Excel</Text>
            )}
          </TouchableOpacity>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{BRAND.city}</Text>
          </View>
        </View>
      </View>

      {/* Card de receita mensal */}
      <ReceitaCard receita={receita} loading={loading} />

      {/* Stat Cards — linha 1 */}
      <View style={styles.statsRow}>
        <StatCard
          label="Total de pedidos"
          value={loading ? "—" : stats?.total ?? 0}
          icon="📦"
        />
        <StatCard
          label="Recebidos hoje"
          value={loading ? "—" : stats?.hoje ?? 0}
          icon="📅"
          color={COLORS.primary}
        />
      </View>

      {/* Stat Cards — linha 2 */}
      <View style={styles.statsRow}>
        <StatCard
          label="Pendentes"
          value={loading ? "—" : stats?.pendentes ?? 0}
          icon="⏳"
          color="#A1A1A1"
          onPress={() => router.push("/admin/pedidos" as never)}
        />
        <StatCard
          label="Em andamento"
          value={loading ? "—" : stats?.emAtendimento ?? 0}
          icon="🔧"
          color="#FF6B35"
          onPress={() => router.push("/admin/pedidos" as never)}
        />
      </View>

      {/* Stat Cards — linha 3 */}
      <View style={styles.statsRow}>
        <StatCard
          label="Confirmados"
          value={loading ? "—" : stats?.confirmados ?? 0}
          icon="✅"
          color="#4ECDC4"
        />
        <StatCard
          label="Concluídos"
          value={loading ? "—" : stats?.concluidos ?? 0}
          icon="🏆"
          color="#51CF66"
        />
      </View>

      {/* Ações rápidas */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.ctaBtn, { flex: 1 }]}
          onPress={() => router.push("/admin/pedidos" as never)}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>📋  Gerenciar pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportCtaBtn, exportLoading && styles.exportBtnDisabled]}
          onPress={handleExport}
          disabled={exportLoading}
          activeOpacity={0.85}
        >
          {exportLoading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.exportCtaBtnText}>⬇ Planilha</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Pedidos recentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pedidos recentes</Text>
          <TouchableOpacity onPress={() => router.push("/admin/pedidos" as never)}>
            <Text style={styles.sectionLink}>Ver todos →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Carregando...</Text>
          </View>
        ) : recentes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nenhum pedido ainda.</Text>
          </View>
        ) : (
          <View style={styles.recentList}>
            {recentes.map((p) => (
              <PedidoRecenteCard
                key={p.id}
                pedido={p}
                onPress={() => router.push("/admin/pedidos" as never)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 12,
  },
  headerGreeting: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
  },
  headerDate: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 3,
    textTransform: "capitalize",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  headerBadge: {
    backgroundColor: "rgba(255,215,0,0.12)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
  },
  headerBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  exportBtn: {
    backgroundColor: "#2A6E3F",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#3DA85C",
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  exportBtnDisabled: {
    opacity: 0.55,
  },
  exportBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Receita mensal
  receitaCard: {
    backgroundColor: "#0D2B1A",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1F6B3A",
    gap: 12,
  },
  receitaHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  receitaTitle: {
    color: "#4ADE80",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  receitaMes: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    marginTop: 3,
    textTransform: "capitalize",
  },
  receitaBadge: {
    backgroundColor: "rgba(74,222,128,0.12)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
  },
  receitaBadgeText: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "600",
  },
  receitaValor: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  receitaFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
  },
  receitaStatItem: {
    gap: 2,
  },
  receitaStatValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  receitaStatLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
  },
  receitaDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  // Stat cards
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    backgroundColor: COLORS.darkSurface,
    borderRadius: 14,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statIcon: {
    fontSize: 22,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },

  // Ações rápidas
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  ctaBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  ctaBtnText: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: "700",
  },
  exportCtaBtn: {
    backgroundColor: "#2A6E3F",
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3DA85C",
    minWidth: 100,
  },
  exportCtaBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Section
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
  },
  sectionLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  recentList: {
    gap: 8,
  },
  recentCard: {
    backgroundColor: COLORS.darkSurface,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  recentCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  recentCardTipo: {
    fontSize: 22,
  },
  recentCardNome: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  recentCardServico: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  recentCardData: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },

  // Status pill
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  emptyBox: {
    backgroundColor: COLORS.darkSurface,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});
