import { useCallback, useEffect, useState } from "react";

import { listarServicos } from "@/services/servicos";
import type { Servico } from "@/types/database";

interface State {
  servicos: Servico[];
  loading: boolean;
  error: string | null;
}

export function useServicos() {
  const [state, setState] = useState<State>({
    servicos: [],
    loading: true,
    error: null,
  });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await listarServicos();
      setState({ servicos: data, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar serviços.";
      setState({ servicos: [], loading: false, error: message });
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}
