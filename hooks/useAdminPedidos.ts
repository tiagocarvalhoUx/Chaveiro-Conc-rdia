import { useCallback, useEffect, useId, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import { listarTodosPedidos, type PedidoAdminCompleto } from "@/services/admin";
import { playNewOrderNotification } from "@/lib/adminNotification";

interface State {
  pedidos: PedidoAdminCompleto[];
  loading: boolean;
  error: string | null;
  /** IDs de pedidos novos chegados via Realtime (para highlight visual) */
  newIds: Set<string>;
}

/**
 * Hook para o admin: lista TODOS os pedidos em tempo real.
 * Detecta pedidos novos e emite notificação sonora/visual.
 */
export function useAdminPedidos() {
  const [state, setState] = useState<State>({
    pedidos: [],
    loading: true,
    error: null,
    newIds: new Set(),
  });

  const hookId = useId();
  const isFirstLoad = useRef(true);
  const knownIdsRef = useRef<Set<string>>(new Set());

  const reload = useCallback(async (fromRealtime = false) => {
    if (!fromRealtime) {
      setState((s) => ({ ...s, loading: true, error: null }));
    }

    try {
      const data = await listarTodosPedidos();

      const incomingIds = new Set(data.map((p) => p.id));
      const newIds = new Set<string>();

      // Detecta pedidos novos somente após o primeiro carregamento
      if (!isFirstLoad.current) {
        for (const id of incomingIds) {
          if (!knownIdsRef.current.has(id)) {
            newIds.add(id);
          }
        }
        if (newIds.size > 0) {
          playNewOrderNotification();
        }
      }

      knownIdsRef.current = incomingIds;
      isFirstLoad.current = false;

      setState({
        pedidos: data,
        loading: false,
        error: null,
        newIds,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar pedidos.";
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  }, []);

  const reloadRef = useRef(reload);
  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  // Carga inicial
  useEffect(() => {
    reload();
  }, [reload]);

  // Subscrição Realtime — escuta QUALQUER mudança na tabela pedidos
  useEffect(() => {
    const channel = supabase
      .channel(`admin:pedidos:all:${hookId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          reloadRef.current(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hookId]);

  /** Limpa o highlight de novos pedidos após o admin visualizá-los */
  const clearNewIds = useCallback(() => {
    setState((s) => ({ ...s, newIds: new Set() }));
  }, []);

  return {
    pedidos: state.pedidos,
    loading: state.loading,
    error: state.error,
    newIds: state.newIds,
    reload: () => reload(false),
    clearNewIds,
  };
}
