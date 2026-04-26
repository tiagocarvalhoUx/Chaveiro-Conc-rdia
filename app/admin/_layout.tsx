import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Slot, useRouter } from "expo-router";

import { useAuth } from "@/hooks/useAuth";
import { verificarIsAdmin } from "@/services/admin";
import { AdminShell } from "@/components/AdminShell";
import { useAdminPedidos } from "@/hooks/useAdminPedidos";
import { COLORS } from "@/lib/constants";

// ─── Layout admin: verifica autenticação + permissão de admin ────────────────

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      router.replace("/(auth)/login");
      return;
    }

    verificarIsAdmin(session.user.id).then((result) => {
      if (!result) {
        router.replace("/(app)/home");
      } else {
        setIsAdmin(true);
      }
    });
  }, [session, authLoading, router]);

  if (authLoading || isAdmin === null) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.dark }}
      >
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

// ─── Shell com badge de novos pedidos ────────────────────────────────────────

function AdminShellWithBadge({ children }: { children: React.ReactNode }) {
  const { newIds, clearNewIds } = useAdminPedidos();

  useEffect(() => {
    if (newIds.size > 0) {
      // Limpa o highlight após 8 segundos
      const timer = setTimeout(clearNewIds, 8000);
      return () => clearTimeout(timer);
    }
  }, [newIds, clearNewIds]);

  return (
    <AdminShell newOrdersCount={newIds.size}>{children}</AdminShell>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────

export default function AdminLayout() {
  return (
    <AdminGuard>
      <AdminShellWithBadge>
        <Slot />
      </AdminShellWithBadge>
    </AdminGuard>
  );
}
