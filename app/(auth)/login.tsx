import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { KeyMascot } from "@/components/KeyMascot";
import { MagicLinkAccess } from "@/components/MagicLinkAccess";
import { BRAND } from "@/lib/constants";

export default function Login() {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: "#111111" }}
    >
      <View
        style={{
          backgroundColor: "#FFD700",
          paddingTop: 48,
          paddingHorizontal: 28,
          paddingBottom: 48,
        }}
      >
        <View className="flex-row items-center gap-3">
          <KeyMascot size={46} />
          <View>
            <Text className="text-lg font-black text-dark">{BRAND.name}</Text>
            <Text
              className="text-[11px] font-bold text-dark/70"
              style={{ letterSpacing: 1 }}
            >
              {BRAND.tagline}
            </Text>
          </View>
        </View>
      </View>

      <View className="min-h-[460px] flex-1">
        <MagicLinkAccess
          showBack={false}
          title="Acesse com seu e-mail"
          subtitle="Enviaremos um link magico para voce entrar no painel sem senha."
        />
      </View>

      <View className="items-center border-t border-white/10 px-6 pb-8 pt-5">
        <Text className="text-xs text-white/40">Emergencia 24h</Text>
        <Pressable
          onPress={() => Linking.openURL(`tel:${BRAND.phoneDigits}`)}
          className="mt-1"
        >
          <Text className="text-base font-extrabold text-danger">
            {BRAND.phone}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
