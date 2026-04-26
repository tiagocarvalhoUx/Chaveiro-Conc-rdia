import { supabase } from "@/lib/supabase";
import type { Profile, StatusPedido } from "@/types/database";
import type { PedidoComServico } from "./pedidos";

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface PedidoAdminCompleto extends PedidoComServico {
  cliente: Profile | null;
}

export interface EstatisticasDashboard {
  total: number;
  pendentes: number;
  confirmados: number;
  emAtendimento: number;
  concluidos: number;
  cancelados: number;
  hoje: number;
}

// ─── Funções admin ───────────────────────────────────────────────────────────

/**
 * Lista TODOS os pedidos (requer política RLS de admin aplicada via migration).
 * Traz dados do serviço e do cliente junto.
 */
export async function listarTodosPedidos(): Promise<PedidoAdminCompleto[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, servico:servicos(*), cliente:profiles(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PedidoAdminCompleto[];
}

/**
 * Atualiza o status de um pedido pelo admin.
 */
export async function atualizarStatusPedido(
  id: string,
  status: StatusPedido
): Promise<void> {
  const { error } = await supabase
    .from("pedidos")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Retorna estatísticas resumidas para o dashboard.
 */
export async function buscarEstatisticas(): Promise<EstatisticasDashboard> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("pedidos")
    .select("status, created_at");

  if (error) throw error;

  const pedidos = data ?? [];

  return {
    total: pedidos.length,
    pendentes: pedidos.filter((p) => p.status === "pendente").length,
    confirmados: pedidos.filter((p) => p.status === "confirmado").length,
    emAtendimento: pedidos.filter((p) => p.status === "em_atendimento").length,
    concluidos: pedidos.filter((p) => p.status === "concluido").length,
    cancelados: pedidos.filter((p) => p.status === "cancelado").length,
    hoje: pedidos.filter((p) => p.created_at?.startsWith(today)).length,
  };
}

/**
 * Verifica se o usuário logado é admin consultando o campo is_admin do perfil.
 */
export async function verificarIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (error) return false;
  return (data as Profile & { is_admin: boolean })?.is_admin === true;
}
