import { supabase } from "@/lib/supabase";
import type { Avaliacao } from "@/types/database";

export async function criarAvaliacao(input: {
  pedidoId: string;
  clienteId: string;
  nota: number;
  comentario?: string;
}): Promise<Avaliacao> {
  const { data, error } = await supabase
    .from("avaliacoes")
    .insert({
      pedido_id: input.pedidoId,
      cliente_id: input.clienteId,
      nota: input.nota,
      comentario: input.comentario ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function buscarAvaliacaoDoPedido(
  pedidoId: string
): Promise<Avaliacao | null> {
  const { data, error } = await supabase
    .from("avaliacoes")
    .select("*")
    .eq("pedido_id", pedidoId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
