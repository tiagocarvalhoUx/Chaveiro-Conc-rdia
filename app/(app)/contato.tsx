import { Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { BRAND } from "@/lib/constants";

interface ContatoOpcao {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
  acao: () => void;
  variant?: "primary" | "danger";
}

export default function Contato() {
  const router = useRouter();

  const ligar = () => Linking.openURL(`tel:${BRAND.phoneDigits}`);
  const whatsapp = () => Linking.openURL(BRAND.whatsappUrl);
  const emergencia = () =>
    Linking.openURL(
      `https://wa.me/${BRAND.phoneDigits}?text=${encodeURIComponent(
        BRAND.emergencyMessage
      )}`
    );

  const opcoes: ContatoOpcao[] = [
    {
      icon: "alert",
      titulo: "EMERGÊNCIA 24h",
      descricao: "Atendimento imediato via WhatsApp",
      acao: emergencia,
      variant: "danger",
    },
    {
      icon: "logo-whatsapp",
      titulo: "WhatsApp",
      descricao: BRAND.phone,
      acao: whatsapp,
    },
    {
      icon: "call",
      titulo: "Ligação direta",
      descricao: BRAND.phone,
      acao: ligar,
    },
  ];

  return (
    <View className="flex-1 bg-dark">
      <BrandHeader subtitle="Contato & Emergência" onBack={() => router.back()} />
      <ScreenContainer>
        <Text className="text-2xl font-extrabold text-white">
          Estamos disponíveis 24h
        </Text>
        <Text className="mt-1 text-sm text-muted">
          {BRAND.name} — {BRAND.city}. Resposta imediata em emergências.
        </Text>

        <View className="mt-6 gap-3">
          {opcoes.map((o) => {
            const danger = o.variant === "danger";
            return (
              <Pressable
                key={o.titulo}
                onPress={o.acao}
                className={`flex-row items-center gap-4 rounded-2xl border p-4 ${
                  danger
                    ? "border-danger bg-danger/15"
                    : "border-primary/40 bg-white/5"
                }`}
              >
                <View
                  className={`h-12 w-12 items-center justify-center rounded-full ${
                    danger ? "bg-danger" : "bg-primary"
                  }`}
                >
                  <Ionicons
                    name={o.icon}
                    size={22}
                    color={danger ? "#FFFFFF" : "#1A1A1A"}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-extrabold ${
                      danger ? "text-danger" : "text-white"
                    }`}
                  >
                    {o.titulo}
                  </Text>
                  <Text className="text-xs text-muted">{o.descricao}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#A1A1A1" />
              </Pressable>
            );
          })}
        </View>

        <GlassCard className="mt-6">
          <Text className="text-xs uppercase tracking-widest text-primary">
            Atendimento
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <Ionicons name="time" size={16} color="#FFD700" />
            <Text className="text-sm text-white">24 horas, 7 dias por semana</Text>
          </View>
          <View className="mt-1 flex-row items-center gap-2">
            <Ionicons name="location" size={16} color="#FFD700" />
            <Text className="text-sm text-white">Araçatuba e região</Text>
          </View>
          <View className="mt-1 flex-row items-center gap-2">
            <Ionicons name="construct" size={16} color="#FFD700" />
            <Text className="text-sm text-white">{BRAND.tagline}</Text>
          </View>
        </GlassCard>
      </ScreenContainer>
    </View>
  );
}
