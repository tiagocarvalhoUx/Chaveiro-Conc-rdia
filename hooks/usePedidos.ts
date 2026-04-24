import { useCallback, useEffect, useId, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import {
  listarPedidosDoCliente,
  type PedidoComServico,
} from "@/services/pedidos";

interface State {
  pedidos: PedidoComServico[];
  loading: boolean;
  error: string | null;
}

/**
 * Lista todos os pedidos do cliente e mantém em sync via Realtime.
 */
export function usePedidos(clienteId: string | undefined) {
  const [state, setState] = useState<State>({
    pedidos: [],
    loading: true,
    error: null,
  });
  // Nome único por instância — evita colisão quando várias telas usam o hook.
  const hookId = useId();

  const reload = useCallback(async () => {
    if (!clienteId) {
      setState({ pedidos: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await listarPedidosDoCliente(clienteId);
      setState({ pedidos: data, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar pedidos.";
      setState({ pedidos: [], loading: false, error: message });
    }
  }, [clienteId]);

  const reloadRef = useRef(reload);
  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!clienteId) return;
    const channel = supabase
      .channel(`pedidos:cliente=${clienteId}:${hookId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          filter: `cliente_id=eq.${clienteId}`,
        },
        () => {
          reloadRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clienteId, hookId]);

  return { ...state, reload };
}
