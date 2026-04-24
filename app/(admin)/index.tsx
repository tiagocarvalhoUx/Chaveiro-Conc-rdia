import { useCallback, useEffect, useState } from "react";
import {
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
  listarTodosPedidos,
  type EstatisticasDashboard,
  type PedidoAdminCompleto,
} from "@/services/admin";
import { BRAND, COLORS, STATUS_INFO } from "@/lib/constants";
import { formatDateBR as formatarData, formatBRL as formatarValor } from "@/lib/format";

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
  const [recentes, setRecentes] = useState<PedidoAdminCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const [statsData, pedidosData] = await Promise.all([
        buscarEstatisticas(),
        listarTodosPedidos(),
      ]);
      setStats(statsData);
      setRecentes(pedidosData.slice(0, 6));
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
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
        <View>
          <Text style={styles.headerGreeting}>Painel Administrativo</Text>
          <Text style={styles.headerDate}>{hoje}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{BRAND.city}</Text>
        </View>
      </View>

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
          onPress={() => router.push("/(admin)/pedidos" as never)}
        />
        <StatCard
          label="Em andamento"
          value={loading ? "—" : stats?.emAtendimento ?? 0}
          icon="🔧"
          color="#FF6B35"
          onPress={() => router.push("/(admin)/pedidos" as never)}
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

      {/* Ação rápida */}
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => router.push("/(admin)/pedidos" as never)}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaBtnText}>📋  Gerenciar todos os pedidos</Text>
      </TouchableOpacity>

      {/* Pedidos recentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pedidos recentes</Text>
          <TouchableOpacity onPress={() => router.push("/(admin)/pedidos" as never)}>
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
                onPress={() => router.push("/(admin)/pedidos" as never)}
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

  // CTA button
  ctaBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  ctaBtnText: {
    color: COLORS.dark,
    fontSize: 15,
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
