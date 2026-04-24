import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { GlassCard } from "@/components/GlassCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { CATEGORIES } from "@/lib/constants";
import { formatBRLRange, categoriaIcon } from "@/lib/format";
import { useServicos } from "@/hooks/useServicos";
import type { CategoriaServico } from "@/types/database";

export default function Catalogo() {
  const router = useRouter();
  const { servicos, loading, error, reload } = useServicos();
  const [active, setActive] = useState<CategoriaServico>("automoveis");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => servicos.filter((s) => s.categoria === active),
    [servicos, active]
  );

  return (
    <View className="flex-1 bg-dark">
      <ScreenHeader title="Catálogo de Serviços" onBack={() => router.back()} />

      {/* Category tabs */}
      <View
        className="flex-row gap-2 border-b border-white/10 px-4 py-3"
        style={{ backgroundColor: "#1A1A1A" }}
      >
        {CATEGORIES.map((c) => {
          const isActive = active === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                setActive(c.id);
                setSelectedId(null);
              }}
              className="flex-1 items-center rounded-xl px-1 py-2"
              style={{
                backgroundColor: isActive ? "#FFD700" : "rgba(255,255,255,0.06)",
              }}
            >
              <Text style={{ fontSize: 20 }}>{c.icon}</Text>
              <Text
                className="mt-0.5 text-[10px] font-extrabold"
                style={{ color: isActive ? "#1A1A1A" : "rgba(255,255,255,0.65)" }}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScreenContainer showTabBar>
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
              <Text className="text-sm font-bold text-primary">
                Tentar novamente
              </Text>
            </Pressable>
          </View>
        ) : filtered.length === 0 ? (
          <GlassCard className="mt-4 items-center py-8">
            <Text className="text-sm text-white/60">
              Nenhum serviço cadastrado nesta categoria.
            </Text>
          </GlassCard>
        ) : (
          <View className="gap-3">
            {filtered.map((s) => {
              const selected = selectedId === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setSelectedId(selected ? null : s.id)}
                >
                  <GlassCard selected={selected} accent="primary">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-sm font-extrabold text-white">
                          {s.titulo}
                        </Text>
                        <Text
                          className="mt-1 text-xs text-white/50"
                          numberOfLines={2}
                        >
                          {s.descricao}
                        </Text>
                        <View className="mt-2 flex-row flex-wrap gap-2">
                          <View
                            className="rounded-lg px-2 py-1"
                            style={{ backgroundColor: "rgba(255,215,0,0.12)" }}
                          >
                            <Text className="text-[11px] font-extrabold text-primary">
                              {formatBRLRange(s.preco_minimo, null)}
                            </Text>
                          </View>
                          {s.duracao_minutos ? (
                            <View
                              className="rounded-lg px-2 py-1"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.06)",
                              }}
                            >
                              <Text className="text-[11px] text-white/65">
                                ⏱ ~{s.duracao_minutos} min
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                      <View
                        className="h-11 w-11 items-center justify-center rounded-xl"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      >
                        <Text style={{ fontSize: 22 }}>
                          {categoriaIcon(s.categoria)}
                        </Text>
                      </View>
                    </View>

                    {selected ? (
                      <View className="mt-3 flex-row gap-2">
                        <PrimaryButton
                          label="Agendar"
                          icon="calendar"
                          small
                          fullWidth={false}
                          className="flex-1"
                          onPress={() =>
                            router.push({
                              pathname: "/(app)/agendamento",
                              params: { servicoId: s.id },
                            })
                          }
                        />
                        <PrimaryButton
                          label="Orçamento"
                          icon="chatbubbles"
                          variant="ghost"
                          small
                          fullWidth={false}
                          className="flex-1"
                          onPress={() => router.push("/(app)/orcamento")}
                        />
                      </View>
                    ) : null}
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScreenContainer>
    </View>
  );
}
