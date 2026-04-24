import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

export async function buscarPerfil(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function atualizarPerfil(
  userId: string,
  patch: { nome?: string; telefone?: string; endereco?: string }
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
