import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
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
import {
  buscarCustoVendasPorCliente,
  buscarFaturamentoDashboard,
  buscarFaturamentoUltimos6Meses,
  buscarTopClientes,
  type ClienteFaturamento,
  type FaturamentoDashboard,
  type PontoTemporal,
} from "@/services/faturamento";
import { exportarPlanilhaAdmin } from "@/lib/exportExcel";
import { MetricCard } from "@/components/admin/MetricCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { TopClientes } from "@/components/admin/TopClientes";
import { BRAND, COLORS, STATUS_INFO } from "@/lib/constants";
import {
  formatBRL as formatarValor,
  formatDateBR as formatarData,
} from "@/lib/format";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: string;
  onPress?: () => void;
}

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
    <TouchableOpacity style={styles.recentCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.recentCardLeft}>
        <Text style={styles.recentCardTipo}>{tipoBadge[pedido.tipo] ?? "📋"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.recentCardNome} numberOfLines={1}>
            {pedido.cliente?.nome ?? "Cliente"}
          </Text>
          <Text style={styles.recentCardServico} numberOfLines={1}>
            {pedido.servico?.titulo ?? pedido.observacoes ?? "—"}
          </Text>
          <Text style={styles.recentCardData}>{formatarData(pedido.created_at)}</Text>
        </View>
      </View>
      <View style={[styles.statusPill, { backgroundColor: status.color + "25" }]}>
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<EstatisticasDashboard | null>(null);
  const [recentes, setRecentes] = useState<PedidoAdminCompleto[]>([]);
  const [faturamento, setFaturamento] = useState<FaturamentoDashboard | null>(null);
  const [serie6m, setSerie6m] = useState<PontoTemporal[]>([]);
  const [topClientes, setTopClientes] = useState<ClienteFaturamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportando, setExportando] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const [statsData, pedidosData, fatData, serie, top] = await Promise.all([
        buscarEstatisticas(),
        listarTodosPedidos(),
        buscarFaturamentoDashboard(),
        buscarFaturamentoUltimos6Meses(),
        buscarTopClientes(5),
      ]);
      setStats(statsData);
      setRecentes(pedidosData.slice(0, 6));
      setFaturamento(fatData);
      setSerie6m(serie);
      setTopClientes(top);
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

  const handleExportar = async () => {
    if (Platform.OS !== "web") {
      Alert.alert("Exportar Excel", "A exportação está disponível apenas na versão web.");
      return;
    }
    try {
      setExportando(true);
      const linhas = await buscarCustoVendasPorCliente();
      await exportarPlanilhaAdmin({ linhas, serieFaturamento: serie6m });
    } catch (err) {
      console.error("Erro ao exportar:", err);
      Alert.alert("Erro", "Não foi possível gerar a planilha.");
    } finally {
      setExportando(false);
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
      {/* Header com botão exportar */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerGreeting}>Painel Administrativo</Text>
          <Text style={styles.headerDate}>{hoje}</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{BRAND.city}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.exportBtn, exportando && { opacity: 0.6 }]}
        onPress={handleExportar}
        disabled={exportando}
        activeOpacity={0.85}
      >
        {exportando ? (
          <ActivityIndicator color={COLORS.dark} />
        ) : (
          <Text style={styles.exportBtnText}>📊  Exportar Excel</Text>
        )}
      </TouchableOpacity>

      {/* ───── Painel de Faturamento ───── */}
      <View style={styles.sectionDivider}>
        <Text style={styles.sectionTitle}>Faturamento</Text>
        <Text style={styles.sectionSubtitle}>
          Apenas pedidos concluídos · variação vs. mês anterior
        </Text>
      </View>

      <View style={styles.statsRow}>
        <MetricCard
          label="Faturamento total"
          value={loading || !faturamento ? "—" : formatarValor(faturamento.totalAcumulado)}
          icon="💰"
          hint={`${faturamento?.pedidosConcluidos ?? 0} pedidos concluídos`}
        />
        <MetricCard
          label="Faturamento do mês"
          value={loading || !faturamento ? "—" : formatarValor(faturamento.faturamentoMes.valor)}
          icon="📈"
          variacaoPct={faturamento?.faturamentoMes.variacaoPct ?? null}
        />
      </View>

      <View style={styles.statsRow}>
        <MetricCard
          label="Ticket médio"
          value={loading || !faturamento ? "—" : formatarValor(faturamento.ticketMedio.valor)}
          icon="🎯"
          variacaoPct={faturamento?.ticketMedio.variacaoPct ?? null}
        />
        <MetricCard
          label="Total de clientes"
          value={loading || !faturamento ? "—" : String(faturamento.totalClientes.valor)}
          icon="👥"
          variacaoPct={faturamento?.totalClientes.variacaoPct ?? null}
          hint="únicos com pedidos concluídos"
        />
      </View>

      <RevenueChart data={serie6m} title="Faturamento — últimos 6 meses" />

      <TopClientes clientes={topClientes} />

      {/* ───── Operacional (mantido) ───── */}
      <View style={styles.sectionDivider}>
        <Text style={styles.sectionTitle}>Operacional</Text>
        <Text style={styles.sectionSubtitle}>Status atual da operação</Text>
      </View>

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

      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => router.push("/admin/pedidos" as never)}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaBtnText}>📋  Gerenciar todos os pedidos</Text>
      </TouchableOpacity>

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

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 12,
  },
  headerActions: {
    alignItems: "flex-end",
    gap: 8,
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

  exportBtn: {
    backgroundColor: "#1B5E20",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  exportBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },

  sectionDivider: {
    marginTop: 12,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },

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
