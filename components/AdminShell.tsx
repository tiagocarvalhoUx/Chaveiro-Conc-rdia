import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";

import { BRAND, COLORS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

// ─── Constantes ──────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 236;
const BREAKPOINT_DESKTOP = 768;

const NAV_ITEMS = [
  { label: "Dashboard", path: "/(admin)/", icon: "📊" },
  { label: "Pedidos", path: "/(admin)/pedidos", icon: "📋" },
] as const;

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface AdminShellProps {
  children: React.ReactNode;
  /** Badge de contagem de novos pedidos na nav (exibido no item Pedidos) */
  newOrdersCount?: number;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function AdminShell({ children, newOrdersCount = 0 }: AdminShellProps) {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );

  // Atualiza largura ao redimensionar (web)
  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => sub?.remove();
  }, []);

  const isDesktop =
    Platform.OS === "web" && windowWidth >= BREAKPOINT_DESKTOP;

  function isActive(path: string) {
    if (path === "/(admin)/") {
      // Ativo apenas na raiz do admin, não em sub-rotas
      return pathname === "/" || pathname === "/(admin)/" || pathname === "/admin/";
    }
    return pathname.includes("pedidos");
  }

  // ── Sidebar (Desktop Web) ────────────────────────────────────────────────

  const sidebar = (
    <View
      style={[
        styles.sidebar,
        { paddingTop: Math.max(insets.top, 20) },
      ]}
    >
      {/* Logo */}
      <View style={styles.sidebarLogo}>
        <Text style={styles.sidebarLogoIcon}>🔑</Text>
        <View>
          <Text style={styles.sidebarLogoTitle}>Admin Panel</Text>
          <Text style={styles.sidebarLogoSub} numberOfLines={1}>
            {BRAND.name}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Nav items */}
      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const showBadge = item.label === "Pedidos" && newOrdersCount > 0;
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as never)}
              style={[styles.navItem, active && styles.navItemActive]}
              activeOpacity={0.7}
            >
              <Text style={styles.navItemIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.navItemLabel,
                  active && styles.navItemLabelActive,
                ]}
              >
                {item.label}
              </Text>
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {newOrdersCount > 9 ? "9+" : newOrdersCount}
                  </Text>
                </View>
              )}
              {active && <View style={styles.navActiveBar} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer — usuário + logout */}
      <View style={styles.sidebarFooter}>
        <View style={styles.divider} />
        <View style={styles.userRow}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.email?.[0]?.toUpperCase() ?? "A"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email ?? "Admin"}
            </Text>
            <Text style={styles.userRole}>Administrador</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>↩</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ── Layout Mobile — header + tabs ────────────────────────────────────────

  const mobileHeader = (
    <View style={[styles.mobileHeader, { paddingTop: insets.top + 8 }]}>
      <View style={styles.mobileHeaderTop}>
        <Text style={styles.mobileHeaderTitle}>🔑 Admin</Text>
        <TouchableOpacity onPress={signOut} style={styles.mobileLogout}>
          <Text style={styles.mobileLogoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
      {/* Tabs */}
      <View style={styles.mobileTabs}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const showBadge = item.label === "Pedidos" && newOrdersCount > 0;
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as never)}
              style={[styles.mobileTab, active && styles.mobileTabActive]}
              activeOpacity={0.75}
            >
              <Text style={styles.mobileTabIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.mobileTabLabel,
                  active && styles.mobileTabLabelActive,
                ]}
              >
                {item.label}
              </Text>
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {newOrdersCount > 9 ? "9+" : newOrdersCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        {sidebar}
        <View style={styles.desktopContent}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.mobileRoot}>
      {mobileHeader}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Desktop
  desktopRoot: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.dark,
  },
  desktopContent: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

  // Sidebar
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.darker,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.07)",
    paddingBottom: 16,
  },
  sidebarLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sidebarLogoIcon: {
    fontSize: 28,
  },
  sidebarLogoTitle: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  sidebarLogoSub: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 1,
  },
  navList: {
    paddingTop: 8,
    paddingHorizontal: 12,
    gap: 2,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    position: "relative",
  },
  navItemActive: {
    backgroundColor: "rgba(255,215,0,0.10)",
  },
  navActiveBar: {
    position: "absolute",
    right: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  navItemIcon: {
    fontSize: 18,
  },
  navItemLabel: {
    flex: 1,
    color: COLORS.textSub,
    fontSize: 14,
    fontWeight: "500",
  },
  navItemLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  // Badge
  badge: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },

  // Sidebar Footer
  sidebarFooter: {
    marginTop: "auto" as never,
    paddingHorizontal: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 12,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: COLORS.dark,
    fontSize: 14,
    fontWeight: "800",
  },
  userEmail: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  userRole: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 1,
  },
  logoutBtn: {
    padding: 6,
  },
  logoutText: {
    fontSize: 18,
    color: COLORS.muted,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginHorizontal: 4,
    marginVertical: 4,
  },

  // Mobile
  mobileRoot: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  mobileHeader: {
    backgroundColor: COLORS.darker,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  mobileHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  mobileHeaderTitle: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "800",
  },
  mobileLogout: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  mobileLogoutText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  mobileTabs: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 0,
  },
  mobileTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  mobileTabActive: {
    borderBottomColor: COLORS.primary,
  },
  mobileTabIcon: {
    fontSize: 14,
  },
  mobileTabLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "500",
  },
  mobileTabLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
