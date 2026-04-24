import { supabase } from "@/lib/supabase";
import { STORAGE_BUCKET } from "@/lib/constants";
import type {
  Pedido,
  Servico,
  StatusPedido,
  TipoPedido,
} from "@/types/database";

export interface PedidoComServico extends Pedido {
  servico: Servico | null;
}

export async function listarPedidosDoCliente(
  clienteId: string
): Promise<PedidoComServico[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, servico:servicos(*)")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PedidoComServico[];
}

export async function buscarPedido(id: string): Promise<PedidoComServico | null> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, servico:servicos(*)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as PedidoComServico;
}

export interface CriarAgendamentoInput {
  clienteId: string;
  servicoId: string;
  dataAgendada: string; // YYYY-MM-DD
  horarioAgendado: string; // HH:MM
  endereco: string;
  observacoes?: string;
}

export async function criarAgendamento(
  input: CriarAgendamentoInput
): Promise<Pedido> {
  const { data, error } = await supabase
    .from("pedidos")
    .insert({
      cliente_id: input.clienteId,
      servico_id: input.servicoId,
      tipo: "agendamento" satisfies TipoPedido,
      status: "pendente" satisfies StatusPedido,
      data_agendada: input.dataAgendada,
      horario_agendado: input.horarioAgendado,
      endereco: input.endereco,
      observacoes: input.observacoes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface CriarOrcamentoInput {
  clienteId: string;
  descricao: string;
  endereco?: string;
  fotoUri?: string;
  fotoBlob?: Blob;
  fotoMimeType?: string;
}

export async function uploadFotoOrcamento(
  clienteId: string,
  fotoBlob: Blob,
  mimeType = "image/jpeg"
): Promise<string> {
  const ext = mimeType.split("/")[1] ?? "jpg";
  const path = `${clienteId}/${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, fotoBlob, {
      contentType: mimeType,
      upsert: false,
    });

  if (upErr) throw upErr;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function criarOrcamento(
  input: CriarOrcamentoInput
): Promise<Pedido> {
  let fotoUrl: string | null = null;

  if (input.fotoBlob) {
    fotoUrl = await uploadFotoOrcamento(
      input.clienteId,
      input.fotoBlob,
      input.fotoMimeType
    );
  }

  const { data, error } = await supabase
    .from("pedidos")
    .insert({
      cliente_id: input.clienteId,
      tipo: "orcamento" satisfies TipoPedido,
      status: "pendente" satisfies StatusPedido,
      observacoes: input.descricao,
      endereco: input.endereco ?? null,
      foto_url: fotoUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
