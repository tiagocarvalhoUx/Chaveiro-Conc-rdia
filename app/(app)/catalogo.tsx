import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useServicos } from "@/hooks/useServicos";
import { categoriaLabel, formatBRL } from "@/lib/format";
import type { CategoriaServico } from "@/types/database";

const CATEGORIAS: { id: CategoriaServico; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "automoveis", icon: "car-sport" },
  { id: "empresa", icon: "business" },
  { id: "residencia", icon: "home" },
];

export default function Catalogo() {
  const router = useRouter();
  const { servicos, loading, error, reload } = useServicos();
  const [ativa, setAtiva] = useState<CategoriaServico>("automoveis");

  const filtrados = useMemo(
    () => servicos.filter((s) => s.categoria === ativa),
    [servicos, ativa]
  );

  return (
    <View className="flex-1 bg-dark">
      <BrandHeader subtitle="Catálogo de serviços" onBack={() => router.back()} />
      <ScreenContainer>
        <View className="flex-row gap-2">
          {CATEGORIAS.map((c) => {
            const active = ativa === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setAtiva(c.id)}
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border p-3 ${
                  active
                    ? "border-primary bg-primary"
                    : "border-primary/30 bg-white/5"
                }`}
              >
                <Ionicons
                  name={c.icon}
                  size={18}
                  color={active ? "#1A1A1A" : "#FFD700"}
                />
                <Text
                  className={`text-xs font-bold ${
                    active ? "text-dark" : "text-white"
                  }`}
                >
                  {categoriaLabel(c.id)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#FFD700" />
          </View>
        ) : error ? (
          <View className="mt-6 items-center gap-3">
            <Text className="text-center text-sm text-danger">{error}</Text>
            <Pressable
              onPress={reload}
              className="rounded-full border border-primary px-4 py-2"
            >
              <Text className="text-sm font-bold text-primary">Tentar novamente</Text>
            </Pressable>
          </View>
        ) : filtrados.length === 0 ? (
          <View className="mt-6 items-center">
            <Text className="text-sm text-muted">
              Nenhum serviço cadastrado nesta categoria.
            </Text>
          </View>
        ) : (
          <View className="mt-5 gap-3">
            {filtrados.map((s) => (
              <Pressable
                key={s.id}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/agendamento",
                    params: { servicoId: s.id },
                  })
                }
              >
                <GlassCard>
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-white">
                        {s.titulo}
                      </Text>
                      <Text className="mt-1 text-sm text-muted">
                        {s.descricao}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs text-muted">A partir de</Text>
                      <Text className="text-base font-extrabold text-primary">
                        {formatBRL(s.preco_minimo)}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3 flex-row items-center justify-between">
                    {s.duracao_minutos ? (
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="time-outline" size={14} color="#A1A1A1" />
                        <Text className="text-xs text-muted">
                          ~{s.duracao_minutos} min
                        </Text>
                      </View>
                    ) : (
                      <View />
                    )}
                    <Text className="text-xs font-bold text-primary">
                      Agendar →
                    </Text>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        )}
      </ScreenContainer>
    </View>
  );
}
