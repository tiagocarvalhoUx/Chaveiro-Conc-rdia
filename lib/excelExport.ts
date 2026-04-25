import { Alert, Platform } from "react-native";
import * as XLSX from "xlsx";

import { STATUS_INFO } from "@/lib/constants";
import { formatDateBR } from "@/lib/format";
import type { EstatisticasDashboard, PedidoAdminCompleto, ReceitaMensal } from "@/services/admin";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ExportContext {
  stats: EstatisticasDashboard;
  receita: ReceitaMensal;
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
  agendamento: "Agendamento",
  orcamento: "Orçamento",
  emergencia: "Emergência",
};

const STATUS_ORDER = [
  "pendente",
  "confirmado",
  "em_atendimento",
  "concluido",
  "cancelado",
] as const;

function brlString(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function buildWorkbook(
  pedidos: PedidoAdminCompleto[],
  ctx: ExportContext
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const geradoEm = new Date().toLocaleString("pt-BR");

  // ── Aba 1: Resumo ──────────────────────────────────────────────────────────

  const totalGeral = pedidos.reduce((acc, p) => acc + (p.valor_estimado ?? 0), 0);
  const pedidosComValor = pedidos.filter((p) => (p.valor_estimado ?? 0) > 0);
  const ticketMedio =
    pedidosComValor.length > 0 ? totalGeral / pedidosComValor.length : 0;

  const resumoRows: (string | number)[][] = [
    ["CHAVEIRO CONCÓRDIA — RELATÓRIO ADMINISTRATIVO"],
    ["Gerado em:", geradoEm],
    [],
    ["VISÃO GERAL — TODOS OS PERÍODOS"],
    ["Descrição", "Valor"],
    ["Total de pedidos", ctx.stats.total],
    ["Pedidos hoje", ctx.stats.hoje],
    ["Pendentes", ctx.stats.pendentes],
    ["Confirmados", ctx.stats.confirmados],
    ["Em atendimento", ctx.stats.emAtendimento],
    ["Concluídos", ctx.stats.concluidos],
    ["Cancelados", ctx.stats.cancelados],
    [],
    [`ENTRADA DE VENDAS — ${ctx.receita.mes.toUpperCase()}`],
    ["Descrição", "Valor"],
    ["Pedidos no mês (excl. cancelados)", ctx.receita.quantidade],
    ["Total de receita no mês (R$)", ctx.receita.total],
    ["Receita no mês (formatado)", brlString(ctx.receita.total)],
    [],
    ["TOTAIS GERAIS (todos os pedidos na planilha)"],
    ["Descrição", "Valor"],
    ["Receita total estimada (R$)", totalGeral],
    ["Receita total estimada (formatado)", brlString(totalGeral)],
    ["Ticket médio (R$)", ticketMedio],
    ["Ticket médio (formatado)", brlString(ticketMedio)],
    [],
    ["DISTRIBUIÇÃO POR STATUS"],
    ["Status", "Quantidade", "Receita Estimada (R$)", "Receita Estimada (formatado)"],
  ];

  for (const status of STATUS_ORDER) {
    const grupo = pedidos.filter((p) => p.status === status);
    const receitaStatus = grupo.reduce(
      (acc, p) => acc + (p.valor_estimado ?? 0),
      0
    );
    resumoRows.push([
      STATUS_INFO[status].label,
      grupo.length,
      receitaStatus,
      brlString(receitaStatus),
    ]);
  }

  const wsResumo = XLSX.utils.aoa_to_sheet(resumoRows);
  wsResumo["!cols"] = [{ wch: 42 }, { wch: 22 }, { wch: 24 }, { wch: 26 }];
  wsResumo["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // ── Aba 2: Pedidos ─────────────────────────────────────────────────────────

  const headers = [
    "ID (abrev.)",
    "Cliente",
    "Telefone",
    "Tipo",
    "Serviço",
    "Status",
    "Valor Estimado (R$)",
    "Valor Estimado (formatado)",
    "Data de Criação",
    "Data Agendada",
    "Horário Agendado",
    "Endereço",
    "Observações",
  ];

  const rows = pedidos.map((p) => [
    p.id.slice(0, 8).toUpperCase(),
    p.cliente?.nome ?? "—",
    p.cliente?.telefone ?? "—",
    TIPO_LABELS[p.tipo] ?? p.tipo,
    p.servico?.titulo ?? "—",
    STATUS_INFO[p.status]?.label ?? p.status,
    p.valor_estimado ?? 0,
    p.valor_estimado != null ? brlString(p.valor_estimado) : "Sob consulta",
    formatDateBR(p.created_at),
    p.data_agendada ? formatDateBR(p.data_agendada) : "—",
    p.horario_agendado ?? "—",
    p.endereco ?? "—",
    p.observacoes ?? "—",
  ]);

  const wsPedidos = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  wsPedidos["!cols"] = [
    { wch: 12 }, // ID
    { wch: 26 }, // Cliente
    { wch: 18 }, // Telefone
    { wch: 14 }, // Tipo
    { wch: 32 }, // Serviço
    { wch: 16 }, // Status
    { wch: 22 }, // Valor numérico
    { wch: 24 }, // Valor formatado
    { wch: 16 }, // Data criação
    { wch: 16 }, // Data agendada
    { wch: 12 }, // Horário
    { wch: 36 }, // Endereço
    { wch: 44 }, // Observações
  ];

  XLSX.utils.book_append_sheet(wb, wsPedidos, "Pedidos");

  return wb;
}

// ─── Exportação web ───────────────────────────────────────────────────────────

function exportarWeb(wb: XLSX.WorkBook, fileName: string): void {
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Exportação nativa ────────────────────────────────────────────────────────

async function exportarNativo(wb: XLSX.WorkBook, fileName: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const FileSystem = require("expo-file-system") as typeof import("expo-file-system");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sharing = require("expo-sharing") as typeof import("expo-sharing");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" }) as string;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert(
      "Exportação",
      "Compartilhamento não disponível neste dispositivo."
    );
    return;
  }

  await Sharing.shareAsync(filePath, {
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    dialogTitle: "Exportar Planilha",
    UTI: "com.microsoft.excel.xlsx",
  });
}

// ─── Ponto de entrada público ────────────────────────────────────────────────

export async function exportarPlanilha(
  pedidos: PedidoAdminCompleto[],
  ctx: ExportContext
): Promise<void> {
  const data = new Date().toISOString().slice(0, 10);
  const fileName = `chaveiro-concordia-${data}.xlsx`;
  const wb = buildWorkbook(pedidos, ctx);

  if (Platform.OS === "web") {
    exportarWeb(wb, fileName);
  } else {
    await exportarNativo(wb, fileName);
  }
}
