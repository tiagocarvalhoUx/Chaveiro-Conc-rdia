import { Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { GlassCard } from "@/components/GlassCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BRAND } from "@/lib/constants";

interface ContatoOpcao {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  action: () => void;
}

const SERVICES_24H = [
  { icon: "🚗", text: "Abertura de veículo" },
  { icon: "🏠", text: "Abertura residencial" },
  { icon: "🏢", text: "Emergência empresarial" },
  { icon: "🔑", text: "Chave quebrada na fechadura" },
];

export default function Contato() {
  const router = useRouter();

  const opcoes: ContatoOpcao[] = [
    {
      icon: "logo-whatsapp",
      label: "WhatsApp 24h",
      value: BRAND.phone,
      color: "#25D366",
      action: () => Linking.openURL(BRAND.whatsappUrl),
    },
    {
      icon: "call",
      label: "Ligação direta",
      value: BRAND.phone,
      color: "#4ECDC4",
      action: () => Linking.openURL(`tel:${BRAND.phoneDigits}`),
    },
    {
      icon: "location",
      label: "Endereço",
      value: BRAND.city,
      color: "#FFD700",
      action: () =>
        Linking.openURL(
          `https://maps.google.com/?q=${encodeURIComponent(BRAND.city)}`
        ),
    },
  ];

  return (
    <View className="flex-1 bg-dark">
      <ScreenHeader title="Contato & Emergência" onBack={() => router.back()} />
      <ScreenContainer showTabBar showEmergency={false}>
        {/* Emergency hero */}
        <View
          className="items-center rounded-3xl border px-5 py-6"
          style={{
            backgroundColor: "rgba(204,0,0,0.18)",
            borderColor: "rgba(204,0,0,0.4)",
          }}
        >
          <Text style={{ fontSize: 40 }}>🚨</Text>
          <Text className="mt-2 text-lg font-black text-white">
            Emergência Chaveiro
          </Text>
          <Text className="mt-1 text-center text-xs text-white/50">
            Atendimento 24 horas — 7 dias por semana
          </Text>
          <Pressable
            onPress={() =>
              Linking.openURL(
                `https://wa.me/${BRAND.phoneDigits}?text=${encodeURIComponent(
                  BRAND.emergencyMessage
                )}`
              )
            }
            className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl px-6 py-3.5"
            style={{ backgroundColor: "#25D366" }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text className="text-base font-black text-white">
              Chamar no WhatsApp
            </Text>
          </Pressable>
        </View>

        <Text className="mt-6 text-sm font-extrabold text-white">
          Formas de contato
        </Text>
        <View className="mt-3 gap-2">
          {opcoes.map((o) => (
            <Pressable key={o.label} onPress={o.action}>
              <GlassCard className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: o.color + "22" }}
                >
                  <Ionicons name={o.icon} size={22} color={o.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-extrabold text-white">
                    {o.label}
                  </Text>
                  <Text
                    className="mt-0.5 text-sm font-bold"
                    style={{ color: o.color }}
                  >
                    {o.value}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.45)"
                />
              </GlassCard>
            </Pressable>
          ))}
        </View>

        <Text className="mt-6 text-sm font-extrabold text-white">
          Atendemos 24h para:
        </Text>
        <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
          {SERVICES_24H.map((s) => (
            <GlassCard
              key={s.text}
              className="flex-row items-center gap-2"
              style={{ width: "48%", paddingVertical: 10, paddingHorizontal: 12 }}
            >
              <Text style={{ fontSize: 18 }}>{s.icon}</Text>
              <Text className="flex-1 text-xs font-semibold text-white/75">
                {s.text}
              </Text>
            </GlassCard>
          ))}
        </View>

        <GlassCard className="mt-4 flex-row items-center gap-2">
          <Ionicons name="location" size={20} color="#FFD700" />
          <View>
            <Text className="text-sm font-semibold text-white">
              Área de atendimento
            </Text>
            <Text className="mt-0.5 text-xs text-white/50">
              {BRAND.city} e região
            </Text>
          </View>
        </GlassCard>
      </ScreenContainer>
    </View>
  );
}
