import { useCallback, useEffect, useState } from "react";

import { atualizarPerfil, buscarPerfil } from "@/services/profile";
import type { Profile } from "@/types/database";

interface State {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useProfile(userId: string | undefined) {
  const [state, setState] = useState<State>({
    profile: null,
    loading: true,
    error: null,
  });

  const reload = useCallback(async () => {
    if (!userId) {
      setState({ profile: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await buscarPerfil(userId);
      setState({ profile: data, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar perfil.";
      setState({ profile: null, loading: false, error: message });
    }
  }, [userId]);

  const update = useCallback(
    async (patch: { nome?: string; telefone?: string; endereco?: string }) => {
      if (!userId) throw new Error("Usuário não autenticado.");
      const updated = await atualizarPerfil(userId, patch);
      setState((s) => ({ ...s, profile: updated }));
      return updated;
    },
    [userId]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload, update };
}
