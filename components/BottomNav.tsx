import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";

type TabId = "home" | "catalogo" | "agendamento" | "perfil";

interface TabDef {
  id: TabId;
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabDef[] = [
  { id: "home", label: "Início", route: "/(app)/home", icon: "home" },
  { id: "catalogo", label: "Serviços", route: "/(app)/catalogo", icon: "key" },
  {
    id: "agendamento",
    label: "Agendar",
    route: "/(app)/agendamento",
    icon: "calendar",
  },
  { id: "perfil", label: "Perfil", route: "/(app)/perfil", icon: "person" },
];

function activeTabFromPath(pathname: string): TabId | null {
  if (pathname.endsWith("/home")) return "home";
  if (pathname.endsWith("/catalogo")) return "catalogo";
  if (pathname.endsWith("/agendamento")) return "agendamento";
  if (pathname.endsWith("/perfil")) return "perfil";
  return null;
}

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const active = activeTabFromPath(pathname);

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0"
      style={{ zIndex: 40 }}
    >
      <View
        className="h-[74px] flex-row items-center border-t border-white/10"
        style={{ backgroundColor: "rgba(20,20,20,0.96)" }}
      >
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => router.push(t.route as never)}
              className="flex-1 items-center justify-center gap-1 py-2"
              accessibilityRole="button"
              accessibilityLabel={t.label}
            >
              <Ionicons
                name={t.icon}
                size={22}
                color={isActive ? "#FFD700" : "rgba(255,255,255,0.45)"}
              />
              <Text
                className="text-[10px]"
                style={{
                  color: isActive ? "#FFD700" : "rgba(255,255,255,0.45)",
                  fontWeight: isActive ? "700" : "500",
                }}
              >
                {t.label}
              </Text>
              {isActive ? (
                <View
                  className="mt-0.5 h-1 w-1 rounded-full"
                  style={{ backgroundColor: "#FFD700" }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
