import { Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { EmergencyFAB } from "@/components/EmergencyFAB";
import { GlassCard } from "@/components/GlassCard";
import { KeyMascot } from "@/components/KeyMascot";
import { PhoneBadge } from "@/components/PhoneBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { usePedidos } from "@/hooks/usePedidos";
import { useProfile } from "@/hooks/useProfile";
import { greetingByHour, statusColor, statusStep } from "@/lib/format";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";

type QuickActionColor = "primary" | "teal" | "orange" | "purple" | "yellow" | "danger";

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color: QuickActionColor;
}

const ACTION_COLORS: Record<QuickActionColor, string> = {
  primary: "#FFD700",
  teal: "#4ECDC4",
  orange: "#FF6B35",
  purple: "#A78BFA",
  yellow: "#FCD34D",
  danger: "#CC0000",
};

const QUICK_ACTIONS: QuickAction[] = [
  { icon: "key", label: "Serviços", route: "/(app)/catalogo", color: "primary" },
  { icon: "calendar", label: "Agendar", route: "/(app)/agendamento", color: "teal" },
  { icon: "chatbubbles", label: "Orçamento", route: "/(app)/orcamento", color: "orange" },
  { icon: "cube", label: "Pedidos", route: "/(app)/pedidos", color: "purple" },
  { icon: "star", label: "Avaliar", route: "/(app)/avaliacoes", color: "yellow" },
  { icon: "call", label: "Contato", route: "/(app)/contato", color: "danger" },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { pedidos, loading } = usePedidos(user?.id);

  const greeting = greetingByHour();
  const firstName = (profile?.nome ?? user?.email?.split("@")[0] ?? "Cliente").split(" ")[0];
  const initial = firstName[0]?.toUpperCase() ?? "C";

  const ultimo = pedidos[0] ?? null;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 28,
            backgroundColor: "#1A1A1A",
          }}
        >
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-shrink">
              <Text className="text-sm font-semibold text-white/45">
                {greeting},
              </Text>
              <Text
                className="text-xl font-extrabold text-white"
                numberOfLines={1}
              >
                {firstName} 👋
              </Text>
            </View>
            <View className="flex-1 items-center">
              <KeyMascot size={56} />
            </View>
            <Pressable
              onPress={() => router.push("/(app)/perfil")}
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: "#FFD700" }}
            >
              <Text className="text-lg font-black text-dark">{initial}</Text>
            </Pressable>
          </View>

          <View className="mt-4">
            <PhoneBadge />
          </View>

          <GlassCard
            style={{ marginTop: 18 }}
            className="flex-row items-center gap-3"
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(255,215,0,0.15)" }}
            >
              <KeyMascot size={34} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-extrabold text-white">
                Atendimento 24 horas
              </Text>
              <Text className="mt-0.5 text-xs text-white/50">
                Chaveiro em Araçatuba/SP — chegamos rápido
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(app)/contato")}
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: "#FFD700" }}
            >
              <Text className="text-xs font-extrabold text-dark">Chamar</Text>
            </Pressable>
          </GlassCard>
        </View>

        {/* Quick actions */}
        <View className="px-5 pt-5">
          <Text className="text-base font-extrabold text-white">
            O que você precisa?
          </Text>
          <View className="mt-3 flex-row flex-wrap" style={{ gap: 12 }}>
            {QUICK_ACTIONS.map((a) => {
              const color = ACTION_COLORS[a.color];
              return (
                <Pressable
                  key={a.route}
                  onPress={() => router.push(a.route as never)}
                  className="rounded-2xl border border-white/10 p-4"
                  style={{
                    width: "31%",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    alignItems: "center",
                  }}
                >
                  <View
                    className="h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: color + "22" }}
                  >
                    <Ionicons name={a.icon} size={22} color={color} />
                  </View>
                  <Text className="mt-2 text-xs font-semibold text-white">
                    {a.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Last order */}
        <View className="px-5 pt-6">
          <Text className="text-base font-extrabold text-white">
            Último pedido
          </Text>
          {loading ? (
            <GlassCard className="mt-3">
              <Text className="text-sm text-white/50">Carregando...</Text>
            </GlassCard>
          ) : ultimo ? (
            <Pressable
              className="mt-3"
              onPress={() => router.push(`/(app)/pedido/${ultimo.id}`)}
            >
              <GlassCard>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text
                      className="text-sm font-bold text-white"
                      numberOfLines={1}
                    >
                      {ultimo.servico?.titulo ??
                        (ultimo.tipo === "orcamento"
                          ? "Orçamento personalizado"
                          : "Atendimento")}
                    </Text>
                    <Text className="mt-1 text-xs text-white/45">
                      {ultimo.data_agendada ?? new Date(ultimo.created_at).toLocaleDateString("pt-BR")}
                      {ultimo.horario_agendado ? ` às ${ultimo.horario_agendado}` : ""}
                    </Text>
                  </View>
                  <StatusBadge status={ultimo.status} small />
                </View>
                <View
                  className="mt-3 h-1 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                >
                  <View
                    className="h-1 rounded-full"
                    style={{
                      width: `${(statusStep(ultimo.status) / 4) * 100}%`,
                      backgroundColor: statusColor(ultimo.status),
                    }}
                  />
                </View>
              </GlassCard>
            </Pressable>
          ) : (
            <GlassCard className="mt-3 items-center py-6">
              <Ionicons name="clipboard-outline" size={28} color="#FFD700" />
              <Text className="mt-2 text-sm font-bold text-white">
                Você ainda não tem pedidos.
              </Text>
              <Text className="mt-1 text-xs text-white/45">
                Agende um serviço ou solicite um orçamento.
              </Text>
            </GlassCard>
          )}
        </View>
      </ScrollView>
      <EmergencyFAB bottom={90} />
      <BottomNav />
    </SafeAreaView>
  );
}
