import { supabase } from "@/lib/supabase";
import type { PedidoAdminCompleto } from "./admin";

export interface MetricaCrescimento {
  valor: number;
  variacaoPct: number | null;
}

export interface FaturamentoDashboard {
  totalAcumulado: number;
  faturamentoMes: MetricaCrescimento;
  ticketMedio: MetricaCrescimento;
  totalClientes: MetricaCrescimento;
  pedidosConcluidos: number;
}

export interface PontoTemporal {
  label: string;
  valor: number;
}

export interface ClienteFaturamento {
  cliente_id: string;
  nome: string;
  telefone: string | null;
  totalPedidos: number;
  totalFaturado: number;
}

interface PedidoFaturamento {
  id: string;
  cliente_id: string;
  status: string;
  valor_estimado: number | null;
  servico_preco: number | null;
  created_at: string;
  cliente_nome: string;
  cliente_telefone: string | null;
}

function valorPedido(p: { valor_estimado: number | null; servico_preco: number | null }): number {
  return p.valor_estimado ?? p.servico_preco ?? 0;
}

async function buscarPedidosFaturaveis(): Promise<PedidoFaturamento[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "id, cliente_id, status, valor_estimado, created_at, servico:servicos(preco_minimo), cliente:profiles(nome, telefone)"
    )
    .eq("status", "concluido")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      cliente_id: string;
      status: string;
      valor_estimado: number | null;
      created_at: string;
      servico: { preco_minimo: number | null } | null;
      cliente: { nome: string; telefone: string | null } | null;
    };
    return {
      id: r.id,
      cliente_id: r.cliente_id,
      status: r.status,
      valor_estimado: r.valor_estimado,
      servico_preco: r.servico?.preco_minimo ?? null,
      created_at: r.created_at,
      cliente_nome: r.cliente?.nome ?? "Cliente",
      cliente_telefone: r.cliente?.telefone ?? null,
    };
  });
}

function inicioDoMes(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function variacaoPct(atual: number, anterior: number): number | null {
  if (anterior === 0) return atual > 0 ? 100 : null;
  return ((atual - anterior) / anterior) * 100;
}

export async function buscarFaturamentoDashboard(): Promise<FaturamentoDashboard> {
  const pedidos = await buscarPedidosFaturaveis();

  const agora = new Date();
  const inicioMesAtual = inicioDoMes(agora);
  const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);

  const concluidosMesAtual: PedidoFaturamento[] = [];
  const concluidosMesAnterior: PedidoFaturamento[] = [];
  const clientesMesAtual = new Set<string>();
  const clientesMesAnterior = new Set<string>();
  const clientesGeral = new Set<string>();

  let totalAcumulado = 0;

  for (const p of pedidos) {
    const v = valorPedido(p);
    const dt = new Date(p.created_at);
    totalAcumulado += v;
    clientesGeral.add(p.cliente_id);

    if (dt >= inicioMesAtual) {
      concluidosMesAtual.push(p);
      clientesMesAtual.add(p.cliente_id);
    } else if (dt >= inicioMesAnterior && dt < inicioMesAtual) {
      concluidosMesAnterior.push(p);
      clientesMesAnterior.add(p.cliente_id);
    }
  }

  const faturamentoMesAtual = concluidosMesAtual.reduce((s, p) => s + valorPedido(p), 0);
  const faturamentoMesAnterior = concluidosMesAnterior.reduce(
    (s, p) => s + valorPedido(p),
    0
  );
  const ticketAtual =
    concluidosMesAtual.length > 0 ? faturamentoMesAtual / concluidosMesAtual.length : 0;
  const ticketAnterior =
    concluidosMesAnterior.length > 0
      ? faturamentoMesAnterior / concluidosMesAnterior.length
      : 0;

  return {
    totalAcumulado,
    faturamentoMes: {
      valor: faturamentoMesAtual,
      variacaoPct: variacaoPct(faturamentoMesAtual, faturamentoMesAnterior),
    },
    ticketMedio: {
      valor: ticketAtual,
      variacaoPct: variacaoPct(ticketAtual, ticketAnterior),
    },
    totalClientes: {
      valor: clientesGeral.size,
      variacaoPct: variacaoPct(clientesMesAtual.size, clientesMesAnterior.size),
    },
    pedidosConcluidos: pedidos.length,
  };
}

export async function buscarFaturamentoUltimos6Meses(): Promise<PontoTemporal[]> {
  const pedidos = await buscarPedidosFaturaveis();

  const agora = new Date();
  const meses: PontoTemporal[] = [];

  for (let i = 5; i >= 0; i--) {
    const inicio = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const fim = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);
    const total = pedidos
      .filter((p) => {
        const d = new Date(p.created_at);
        return d >= inicio && d < fim;
      })
      .reduce((s, p) => s + valorPedido(p), 0);

    const label = inicio
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "")
      .toLowerCase();
    meses.push({ label, valor: total });
  }

  return meses;
}

export async function buscarTopClientes(limite = 5): Promise<ClienteFaturamento[]> {
  const pedidos = await buscarPedidosFaturaveis();

  const map = new Map<string, ClienteFaturamento>();

  for (const p of pedidos) {
    const v = valorPedido(p);
    const existente = map.get(p.cliente_id);
    if (existente) {
      existente.totalFaturado += v;
      existente.totalPedidos += 1;
    } else {
      map.set(p.cliente_id, {
        cliente_id: p.cliente_id,
        nome: p.cliente_nome,
        telefone: p.cliente_telefone,
        totalPedidos: 1,
        totalFaturado: v,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.totalFaturado - a.totalFaturado)
    .slice(0, limite);
}

export interface LinhaCustoVenda {
  cliente: string;
  produto: string;
  quantidade: number;
  custoUnitario: number;
  custoTotal: number;
  data: string;
  categoria: string;
}

export async function buscarCustoVendasPorCliente(): Promise<LinhaCustoVenda[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "id, status, valor_estimado, created_at, servico:servicos(titulo, preco_minimo, categoria), cliente:profiles(nome)"
    )
    .eq("status", "concluido")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      valor_estimado: number | null;
      created_at: string;
      servico: { titulo: string; preco_minimo: number | null; categoria: string } | null;
      cliente: { nome: string } | null;
    };
    const custoUnitario = r.valor_estimado ?? r.servico?.preco_minimo ?? 0;
    return {
      cliente: r.cliente?.nome ?? "Cliente",
      produto: r.servico?.titulo ?? "—",
      quantidade: 1,
      custoUnitario,
      custoTotal: custoUnitario,
      data: r.created_at,
      categoria: r.servico?.categoria ?? "—",
    };
  });
}
