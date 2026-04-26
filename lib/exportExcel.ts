import type { LinhaCustoVenda, PontoTemporal } from "@/services/faturamento";

const HEADER_COLOR_BY_COLUMN: Record<string, string> = {
  Cliente: "FF1A237E",
  Produto: "FF1B5E20",
  Quantidade: "FFE65100",
  "Custo Unitário": "FF6A1B9A",
  "Custo Total": "FFB71C1C",
  Data: "FF424242",
  Categoria: "FF004D40",
};

const HEADERS: (keyof typeof HEADER_COLOR_BY_COLUMN)[] = [
  "Cliente",
  "Produto",
  "Categoria",
  "Quantidade",
  "Custo Unitário",
  "Custo Total",
  "Data",
];

const ZEBRA_COLOR = "FF1F1F1F";
const ZEBRA_ALT = "FF2A2A2A";
const TOTAL_COLOR = "FFFFD700";
const FONT_LIGHT = "FFFFFFFF";

interface ExportPayload {
  linhas: LinhaCustoVenda[];
  serieFaturamento: PontoTemporal[];
}

function formatDataBR(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportarPlanilhaAdmin(payload: ExportPayload): Promise<void> {
  const ExcelJSModule = await import("exceljs");
  const ExcelJS = ExcelJSModule.default ?? ExcelJSModule;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Chaveiro Concórdia — Painel Admin";
  workbook.created = new Date();

  // ──────────────────────────────────────────────────────────────────────
  // Aba 1: Custo de Vendas por Cliente
  // ──────────────────────────────────────────────────────────────────────
  const ws = workbook.addWorksheet("Custo de Vendas", {
    properties: { defaultRowHeight: 18 },
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "Cliente", key: "cliente", width: 28 },
    { header: "Produto", key: "produto", width: 32 },
    { header: "Categoria", key: "categoria", width: 14 },
    { header: "Quantidade", key: "quantidade", width: 12 },
    { header: "Custo Unitário", key: "custoUnitario", width: 16 },
    { header: "Custo Total", key: "custoTotal", width: 16 },
    { header: "Data", key: "data", width: 14 },
  ];

  // Estilo do cabeçalho
  const headerRow = ws.getRow(1);
  headerRow.height = 26;
  HEADERS.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: FONT_LIGHT }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_COLOR_BY_COLUMN[h] ?? "FF333333" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
    };
  });

  payload.linhas.forEach((l, i) => {
    const row = ws.addRow({
      cliente: l.cliente,
      produto: l.produto,
      categoria: l.categoria,
      quantidade: l.quantidade,
      custoUnitario: l.custoUnitario,
      custoTotal: l.custoTotal,
      data: formatDataBR(l.data),
    });

    const isZebra = i % 2 === 0;
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isZebra ? ZEBRA_COLOR : ZEBRA_ALT },
      };
      cell.font = { color: { argb: FONT_LIGHT }, size: 11 };
      cell.alignment = { vertical: "middle" };
    });

    row.getCell("custoUnitario").numFmt = '"R$" #,##0.00';
    row.getCell("custoTotal").numFmt = '"R$" #,##0.00';
    row.getCell("quantidade").alignment = { horizontal: "center", vertical: "middle" };
    row.getCell("data").alignment = { horizontal: "center", vertical: "middle" };
  });

  // Linha de total
  const lastDataRow = ws.rowCount;
  const totalQtd = payload.linhas.reduce((s, l) => s + l.quantidade, 0);
  const totalValor = payload.linhas.reduce((s, l) => s + l.custoTotal, 0);

  const totalRow = ws.addRow({
    cliente: "TOTAL",
    produto: "",
    categoria: "",
    quantidade: totalQtd,
    custoUnitario: "",
    custoTotal: totalValor,
    data: "",
  });
  totalRow.height = 24;
  totalRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FF000000" }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TOTAL_COLOR },
    };
    cell.border = { top: { style: "medium", color: { argb: "FF000000" } } };
    cell.alignment = { vertical: "middle" };
  });
  totalRow.getCell("custoTotal").numFmt = '"R$" #,##0.00';
  totalRow.getCell("custoTotal").alignment = { horizontal: "right", vertical: "middle" };
  totalRow.getCell("quantidade").alignment = { horizontal: "center", vertical: "middle" };

  // Auto-filter (header até última linha de dados)
  if (lastDataRow >= 1) {
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: lastDataRow, column: HEADERS.length },
    };
  }

  // ──────────────────────────────────────────────────────────────────────
  // Aba 2: Resumo + gráfico
  // ──────────────────────────────────────────────────────────────────────
  const wsRes = workbook.addWorksheet("Resumo", {
    properties: { defaultRowHeight: 18 },
  });

  wsRes.columns = [
    { header: "Mês", key: "mes", width: 16 },
    { header: "Faturamento", key: "valor", width: 20 },
  ];

  const headerRowRes = wsRes.getRow(1);
  headerRowRes.height = 24;
  ["Mês", "Faturamento"].forEach((h, idx) => {
    const cell = headerRowRes.getCell(idx + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: FONT_LIGHT }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A237E" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  payload.serieFaturamento.forEach((p, i) => {
    const row = wsRes.addRow({ mes: p.label, valor: p.valor });
    const isZebra = i % 2 === 0;
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isZebra ? ZEBRA_COLOR : ZEBRA_ALT },
      };
      cell.font = { color: { argb: FONT_LIGHT } };
    });
    row.getCell("valor").numFmt = '"R$" #,##0.00';
    row.getCell("valor").alignment = { horizontal: "right", vertical: "middle" };
    row.getCell("mes").alignment = { horizontal: "center", vertical: "middle" };
  });

  // Linha em branco + dica
  wsRes.addRow([]);
  const dicaRow = wsRes.addRow([
    "💡 Use a aba 'Custo de Vendas' para ver detalhes por pedido. Filtros automáticos habilitados.",
  ]);
  wsRes.mergeCells(`A${dicaRow.number}:B${dicaRow.number}`);
  dicaRow.getCell(1).font = { italic: true, color: { argb: "FFA1A1A1" }, size: 11 };
  dicaRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

  // ──────────────────────────────────────────────────────────────────────
  // Download
  // ──────────────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `chaveiro-relatorio-${stamp}.xlsx`);
}
