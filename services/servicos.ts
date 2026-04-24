import { supabase } from "@/lib/supabase";
import type { CategoriaServico, Servico } from "@/types/database";

export async function listarServicos(): Promise<Servico[]> {
  const { data, error } = await supabase
    .from("servicos")
    .select("*")
    .eq("ativo", true)
    .order("categoria", { ascending: true })
    .order("ordem", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listarServicosPorCategoria(
  categoria: CategoriaServico
): Promise<Servico[]> {
  const { data, error } = await supabase
    .from("servicos")
    .select("*")
    .eq("categoria", categoria)
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function buscarServico(id: string): Promise<Servico | null> {
  const { data, error } = await supabase
    .from("servicos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}
