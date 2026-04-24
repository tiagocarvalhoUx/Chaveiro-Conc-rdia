import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { buscarPedido, type PedidoComServico } from "@/services/pedidos";

interface State {
  pedido: PedidoComServico | null;
  loading: boolean;
  error: string | null;
}

/**
 * Busca um pedido por id e ouve mudanças via Realtime (status do pedido).
 */
export function usePedido(pedidoId: string | undefined) {
  const [state, setState] = useState<State>({
    pedido: null,
    loading: true,
    error: null,
  });

  const reload = useCallback(async () => {
    if (!pedidoId) {
      setState({ pedido: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await buscarPedido(pedidoId);
      setState({ pedido: data, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar pedido.";
      setState({ pedido: null, loading: false, error: message });
    }
  }, [pedidoId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!pedidoId) return;
    const channel = supabase
      .channel(`pedido:${pedidoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pedidos",
          filter: `id=eq.${pedidoId}`,
        },
        () => {
          reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pedidoId, reload]);

  return { ...state, reload };
}
