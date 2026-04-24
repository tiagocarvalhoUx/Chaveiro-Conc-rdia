import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAdminPedidos } from "@/hooks/useAdminPedidos";
import { atualizarStatusPedido, type PedidoAdminCompleto } from "@/services/admin";
import { BRAND, COLORS, STATUS_INFO } from "@/lib/constants";
import { formatDateBR as formatarData, formatBRL as formatarValor } from "@/lib/format";
import type { StatusPedido } from "@/types/database";

// ─── Constantes ──────────────────────────────────────────────────────────────

const STATUS_FILTERS: Array<{ key: StatusPedido | "todos"; label: string; icon: string }> = [
  { key: "todos", label: "Todos", icon: "📦" },
  { key: "pendente", label: "Pendentes", icon: "⏳" },
  { key: "confirmado", label: "Confirmados", icon: "✅" },
  { key: "em_atendimento", label: "Em andamento", icon: "🔧" },
  { key: "concluido", label: "Concluídos", icon: "🏆" },
  { key: "cancelado", label: "Cancelados", icon: "❌" },
];

const TIPO_ICONS: Record<string, string> = {
  agendamento: "📅",
  orcamento: "📸",
  emergencia: "🚨",
};

const TIPO_LABELS: Record<string, string> = {
  agendamento: "Agendamento",
  orcamento: "Orçamento",
  emergencia: "Emergência",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Próximo status possível a partir do status atual */
function proximoStatus(status: StatusPedido): StatusPedido | null {
  const fluxo: StatusPedido[] = [
    "pendente",
    "confirmado",
    "em_atendimento",
    "concluido",
  ];
  const idx = fluxo.indexOf(status);
  if (idx === -1 || idx === fluxo.length - 1) return null;
  return fluxo[idx + 1];
}

function whatsappUrl(telefone: string, nome: string, pedidoId: string) {
  const msg = encodeURIComponent(
    `Olá, ${nome}! Aqui é o ${BRAND.name}. ` +
      `Temos uma atualização sobre o seu pedido #${pedidoId.slice(0, 8)}. `
  );
  const digits = telefone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${number}?text=${msg}`;
}

// ─── Componente de card de pedido ─────────────────────────────────────────────

function PedidoCard({
  pedido,
  isNew,
  onStatusChange,
}: {
  pedido: PedidoAdminCompleto;
  isNew: boolean;
  onStatusChange: (id: string, status: StatusPedido) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const glowAnim = useRef(new Animated.Value(isNew ? 1 : 0)).current;

  // Animação de glow para pedidos novos
  useEffect(() => {
    if (!isNew) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
      ]),
      { iterations: 5 }
    ).start();
  }, [isNew, glowAnim]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.cardBorder, COLORS.primary],
  });

  const status = STATUS_INFO[pedido.status];
  const proximo = proximoStatus(pedido.status);
  const proxStatus = proximo ? STATUS_INFO[proximo] : null;

  const handleAdvance = useCallback(async () => {
    if (!proximo) return;
    setUpdating(true);
    try {
      await onStatusChange(pedido.id, proximo);
    } finally {
      setUpdating(false);
    }
  }, [pedido.id, proximo, onStatusChange]);

  const handleCancel = useCallback(async () => {
    setUpdating(true);
    try {
      await onStatusChange(pedido.id, "cancelado");
    } finally {
      setUpdating(false);
    }
  }, [pedido.id, onStatusChange]);

  const handleWhatsApp = useCallback(() => {
    const tel = pedido.cliente?.telefone;
    if (!tel) return;
    const url = whatsappUrl(tel, pedido.cliente?.nome ?? "Cliente", pedido.id);
    Linking.openURL(url);
  }, [pedido]);

  return (
    <Animated.View
      style={[
        styles.card,
        isNew && { borderColor },
      ]}
    >
      {/* Topo do card — sempre visível */}
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.8}
        style={styles.cardHeader}
      >
        {/* Ícone + info principal */}
        <View style={styles.cardHeaderLeft}>
          <View style={styles.cardTipoBox}>
            <Text style={styles.cardTipoIcon}>
              {TIPO_ICONS[pedido.tipo] ?? "📋"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardNome} numberOfLines={1}>
              {pedido.cliente?.nome ?? "—"}
            </Text>
            <Text style={styles.cardServico} numberOfLines={1}>
              {pedido.servico?.titulo ??
                (pedido.observacoes
                  ? pedido.observacoes.slice(0, 40)
                  : TIPO_LABELS[pedido.tipo])}
            </Text>
            <Text style={styles.cardData}>
              {formatarData(pedido.created_at)}
              {pedido.data_agendada
                ? ` · 📅 ${formatarData(pedido.data_agendada)}`
                : ""}
            </Text>
          </View>
        </View>

        {/* Status badge + expand chevron */}
        <View style={styles.cardHeaderRight}>
          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NOVO</Text>
            </View>
          )}
          <View style={[styles.statusPill, { backgroundColor: status.color + "22" }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
        </View>
      </TouchableOpacity>

      {/* Detalhes expandidos */}
      {expanded && (
        <View style={styles.cardBody}>
          <View style={styles.divider} />

          {/* Info do cliente */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>👤 Cliente</Text>
            <DetailRow label="Nome" value={pedido.cliente?.nome ?? "—"} />
            <DetailRow
              label="Telefone"
              value={pedido.cliente?.telefone ?? "—"}
            />
            <DetailRow label="Tipo" value={TIPO_LABELS[pedido.tipo]} />
            {pedido.valor_estimado !== null && (
              <DetailRow
                label="Valor estimado"
                value={formatarValor(pedido.valor_estimado)}
              />
            )}
          </View>

          {/* Info do serviço / endereço */}
          {(pedido.servico || pedido.endereco) && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>🔑 Serviço</Text>
              {pedido.servico && (
                <>
                  <DetailRow label="Serviço" value={pedido.servico.titulo} />
                  <DetailRow
                    label="Categoria"
                    value={pedido.servico.categoria}
                  />
                  {pedido.horario_agendado && (
                    <DetailRow
                      label="Horário"
                      value={`${pedido.data_agendada ?? ""} às ${pedido.horario_agendado}`}
                    />
                  )}
                </>
              )}
              {pedido.endereco && (
                <DetailRow label="Endereço" value={pedido.endereco} />
              )}
            </View>
          )}

          {/* Observações */}
          {pedido.observacoes && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📝 Observações</Text>
              <Text style={styles.obsText}>{pedido.observacoes}</Text>
            </View>
          )}

          {/* Foto do orçamento */}
          {pedido.foto_url && (
            <TouchableOpacity
              onPress={() => Linking.openURL(pedido.foto_url!)}
              style={styles.fotoBtn}
            >
              <Text style={styles.fotoBtnText}>📷  Ver foto do orçamento</Text>
            </TouchableOpacity>
          )}

          {/* Ações */}
          <View style={styles.actionsRow}>
            {/* WhatsApp */}
            {pedido.cliente?.telefone ? (
              <TouchableOpacity
                style={styles.wppBtn}
                onPress={handleWhatsApp}
                activeOpacity={0.85}
              >
                <Text style={styles.wppBtnText}>💬 WhatsApp</Text>
              </TouchableOpacity>
            ) : null}

            {/* Avançar status */}
            {proximo && pedido.status !== "cancelado" && (
              <TouchableOpacity
                style={[
                  styles.advanceBtn,
                  { backgroundColor: proxStatus!.color },
                ]}
                onPress={handleAdvance}
                disabled={updating}
                activeOpacity={0.85}
              >
                {updating ? (
                  <ActivityIndicator color={COLORS.dark} size="small" />
                ) : (
                  <Text style={styles.advanceBtnText}>
                    → {proxStatus!.label}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* Cancelar */}
            {pedido.status !== "cancelado" && pedido.status !== "concluido" && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancel}
                disabled={updating}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </Animated.View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// ─── Tela principal ──────────────────────────────────────────────────────────

export default function AdminPedidos() {
  const { pedidos, loading, error, newIds, reload, clearNewIds } =
    useAdminPedidos();

  const [filtroStatus, setFiltroStatus] = useState<StatusPedido | "todos">(
    "todos"
  );
  const [busca, setBusca] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Limpa highlight de novos após 8s
  useEffect(() => {
    if (newIds.size > 0) {
      const t = setTimeout(clearNewIds, 8000);
      return () => clearTimeout(t);
    }
  }, [newIds, clearNewIds]);

  // Filtra e busca
  const pedidosFiltrados = useMemo(() => {
    return pedidos
      .filter((p) =>
        filtroStatus === "todos" ? true : p.status === filtroStatus
      )
      .filter((p) => {
        if (!busca.trim()) return true;
        const q = busca.toLowerCase();
        return (
          p.cliente?.nome?.toLowerCase().includes(q) ||
          p.cliente?.telefone?.includes(q) ||
          p.servico?.titulo?.toLowerCase().includes(q) ||
          p.observacoes?.toLowerCase().includes(q) ||
          p.id.startsWith(q)
        );
      });
  }, [pedidos, filtroStatus, busca]);

  const handleStatusChange = useCallback(
    async (id: string, status: StatusPedido) => {
      setUpdatingId(id);
      try {
        await atualizarStatusPedido(id, status);
        // Realtime vai disparar o reload automaticamente
      } catch (err) {
        console.error("Erro ao atualizar status:", err);
      } finally {
        setUpdatingId(null);
      }
    },
    []
  );

  // Contagem por status para badges nos filtros
  const contagemPorStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of pedidos) {
      counts[p.status] = (counts[p.status] ?? 0) + 1;
    }
    return counts;
  }, [pedidos]);

  return (
    <View style={styles.root}>
      {/* Cabeçalho fixo */}
      <View style={styles.topBar}>
        <View style={styles.topBarTitle}>
          <Text style={styles.pageTitle}>Pedidos</Text>
          {newIds.size > 0 && (
            <View style={styles.newAlertBadge}>
              <Text style={styles.newAlertText}>
                🔔 {newIds.size} novo{newIds.size > 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>

        {/* Busca */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, telefone, serviço…"
            placeholderTextColor={COLORS.muted}
            value={busca}
            onChangeText={setBusca}
            autoCorrect={false}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca("")}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros de status */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {STATUS_FILTERS.map((f) => {
            const active = filtroStatus === f.key;
            const count =
              f.key === "todos"
                ? pedidos.length
                : (contagemPorStatus[f.key] ?? 0);
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFiltroStatus(f.key)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                activeOpacity={0.75}
              >
                <Text style={styles.filterChipIcon}>{f.icon}</Text>
                <Text
                  style={[
                    styles.filterChipLabel,
                    active && styles.filterChipLabelActive,
                  ]}
                >
                  {f.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterCount,
                      active && styles.filterCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        active && styles.filterCountTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista de pedidos */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>Carregando pedidos…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={reload}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={reload}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {pedidosFiltrados.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {busca
                  ? "Tente outra busca."
                  : "Nenhum pedido nesta categoria ainda."}
              </Text>
            </View>
          ) : (
            pedidosFiltrados.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                isNew={newIds.has(pedido.id)}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

  // Top bar
  topBar: {
    backgroundColor: COLORS.dark,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 0,
    gap: 12,
  },
  topBarTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pageTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
  },
  newAlertBadge: {
    backgroundColor: "#CC000030",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#CC000060",
  },
  newAlertText: {
    color: "#FF6060",
    fontSize: 12,
    fontWeight: "700",
  },

  // Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkSurface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "web" ? 10 : 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 8,
  },
  searchIcon: {
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {}),
  },
  searchClear: {
    color: COLORS.muted,
    fontSize: 13,
    paddingHorizontal: 4,
  },

  // Filtros
  filterScroll: {
    marginBottom: 4,
  },
  filterContent: {
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.darkSurface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: {
    backgroundColor: "rgba(255,215,0,0.12)",
    borderColor: COLORS.primary,
  },
  filterChipIcon: {
    fontSize: 13,
  },
  filterChipLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "500",
  },
  filterChipLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  filterCount: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  filterCountActive: {
    backgroundColor: COLORS.primary,
  },
  filterCountText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  filterCountTextActive: {
    color: COLORS.dark,
  },

  // Lista
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 40,
  },

  // Card
  card: {
    backgroundColor: COLORS.darkSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardTipoBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,215,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTipoIcon: {
    fontSize: 20,
  },
  cardNome: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  cardServico: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 2,
  },
  cardData: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  cardHeaderRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  newBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
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
  chevron: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },

  // Card body (expandido)
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: 4,
  },
  detailSection: {
    gap: 5,
  },
  detailSectionTitle: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: "row",
    gap: 8,
  },
  detailLabel: {
    color: COLORS.muted,
    fontSize: 13,
    width: 110,
  },
  detailValue: {
    color: COLORS.white,
    fontSize: 13,
    flex: 1,
  },
  obsText: {
    color: COLORS.textSub,
    fontSize: 13,
    lineHeight: 20,
  },

  // Foto btn
  fotoBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  fotoBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  // Actions
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  wppBtn: {
    flex: 1,
    backgroundColor: "#25D36620",
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#25D36640",
  },
  wppBtnText: {
    color: "#25D366",
    fontSize: 13,
    fontWeight: "700",
  },
  advanceBtn: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  advanceBtnText: {
    color: COLORS.dark,
    fontSize: 13,
    fontWeight: "800",
  },
  cancelBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#CC000020",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CC000040",
  },
  cancelBtnText: {
    color: "#CC0000",
    fontSize: 14,
    fontWeight: "700",
  },

  // Estados
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 8,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 4,
  },
  retryText: {
    color: COLORS.dark,
    fontSize: 14,
    fontWeight: "700",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
  },
});
