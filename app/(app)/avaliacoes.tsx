import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { GlassCard } from "@/components/GlassCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StarRating } from "@/components/StarRating";
import { useAuth } from "@/hooks/useAuth";
import { usePedidos } from "@/hooks/usePedidos";
import { categoriaLabel, formatDateBR } from "@/lib/format";
import { buscarAvaliacaoDoPedido, criarAvaliacao } from "@/services/avaliacoes";
import type { PedidoComServico } from "@/services/pedidos";

const ASPECTOS = ["Pontualidade", "Qualidade", "Atendimento", "Preço justo"];

const STAR_LABEL: Record<number, string> = {
  1: "Muito ruim 😔",
  2: "Ruim 😕",
  3: "Regular 😐",
  4: "Bom 😊",
  5: "Excelente! 🤩",
};

export default function Avaliacoes() {
  const router = useRouter();
  const { user } = useAuth();
  const { pedidoId } = useLocalSearchParams<{ pedidoId?: string }>();
  const { pedidos, loading } = usePedidos(user?.id);

  const elegivel = pedidos.filter((p) => p.status === "concluido");
  const [target, setTarget] = useState<PedidoComServico | null>(null);
  const [nota, setNota] = useState(0);
  const [aspectos, setAspectos] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [jaAvaliado, setJaAvaliado] = useState(false);

  useEffect(() => {
    if (target || elegivel.length === 0) return;
    const pre = pedidoId ? elegivel.find((p) => p.id === pedidoId) : null;
    setTarget(pre ?? elegivel[0]);
  }, [pedidoId, elegivel, target]);

  useEffect(() => {
    if (!target?.id) {
      setJaAvaliado(false);
      return;
    }
    buscarAvaliacaoDoPedido(target.id)
      .then((a) => setJaAvaliado(!!a))
      .catch(() => setJaAvaliado(false));
  }, [target?.id]);

  function toggleAspecto(a: string) {
    setAspectos((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  async function enviar() {
    setErro(null);
    if (!user || !target) return;
    if (nota < 1) {
      setErro("Selecione de 1 a 5 estrelas.");
      return;
    }
    setEnviando(true);
    try {
      const textoAspectos =
        aspectos.length > 0 ? `Destaques: ${aspectos.join(", ")}.` : "";
      const comentarioCompleto = [comentario.trim(), textoAspectos]
        .filter(Boolean)
        .join(" ")
        .trim();
      await criarAvaliacao({
        pedidoId: target.id,
        clienteId: user.id,
        nota,
        comentario: comentarioCompleto || undefined,
      });
      setSucesso(true);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível enviar a avaliação."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <View className="flex-1 items-center justify-center bg-dark px-8">
        <Text style={{ fontSize: 64 }}>🙏</Text>
        <Text className="mt-4 text-2xl font-black text-white">
          Obrigado pela avaliação!
        </Text>
        <Text className="mt-2 text-center text-sm text-white/50">
          Sua opinião nos ajuda a melhorar o serviço para todos.
        </Text>
        <View className="mt-4 flex-row">
          {Array.from({ length: 5 }, (_, i) => (
            <Ionicons
              key={i}
              name="star"
              size={30}
              color={i < nota ? "#FFD700" : "rgba(255,255,255,0.2)"}
            />
          ))}
        </View>
        <PrimaryButton
          className="mt-6"
          label="Voltar ao início"
          onPress={() => router.replace("/(app)/home")}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      <ScreenHeader title="Avaliar Serviço" onBack={() => router.back()} />
      <ScreenContainer showTabBar>
        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#FFD700" />
          </View>
        ) : elegivel.length === 0 ? (
          <GlassCard className="mt-4 items-center py-8">
            <Text style={{ fontSize: 44 }}>📋</Text>
            <Text className="mt-2 text-base font-extrabold text-white">
              Nenhum serviço concluído
            </Text>
            <Text className="mt-1 text-center text-xs text-white/50">
              A avaliação estará disponível após a conclusão de um serviço.
            </Text>
          </GlassCard>
        ) : (
          <>
            {elegivel.length > 1 ? (
              <>
                <Text
                  className="mb-2 text-xs font-bold uppercase text-white/65"
                  style={{ letterSpacing: 0.5 }}
                >
                  Selecione o pedido
                </Text>
                <View className="gap-2">
                  {elegivel.map((p) => {
                    const isSelected = target?.id === p.id;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => {
                          setTarget(p);
                          setNota(0);
                          setAspectos([]);
                          setComentario("");
                        }}
                      >
                        <GlassCard selected={isSelected} accent="primary">
                          <Text className="text-sm font-semibold text-white">
                            {p.servico?.titulo ?? "Atendimento"}
                          </Text>
                          <Text className="mt-0.5 text-[11px] text-white/45">
                            {formatDateBR(p.created_at)}
                            {p.servico
                              ? ` • ${categoriaLabel(p.servico.categoria)}`
                              : ""}
                          </Text>
                        </GlassCard>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {target ? (
              jaAvaliado ? (
                <GlassCard className="mt-4 items-center py-8">
                  <Ionicons name="checkmark-circle" size={44} color="#51CF66" />
                  <Text className="mt-2 text-base font-extrabold text-white">
                    Pedido já avaliado
                  </Text>
                  <Text className="mt-1 text-center text-xs text-white/50">
                    Obrigado pelo feedback!
                  </Text>
                </GlassCard>
              ) : (
                <>
                  <GlassCard className="mt-4 items-center">
                    <Text className="text-base font-extrabold text-white">
                      Como foi o atendimento?
                    </Text>
                    <Text className="mt-1 text-xs text-white/50">
                      {target.servico?.titulo ?? "Atendimento"}
                    </Text>
                    <View className="mt-4">
                      <StarRating value={nota} onChange={setNota} size={38} />
                    </View>
                    <Text
                      className="mt-3 text-sm font-bold text-white/65"
                      style={{ minHeight: 20 }}
                    >
                      {STAR_LABEL[nota] ?? ""}
                    </Text>
                  </GlassCard>

                  <Text
                    className="mb-2 mt-4 text-xs font-bold uppercase text-white/65"
                    style={{ letterSpacing: 0.5 }}
                  >
                    O que se destacou?
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {ASPECTOS.map((a) => {
                      const on = aspectos.includes(a);
                      return (
                        <Pressable
                          key={a}
                          onPress={() => toggleAspecto(a)}
                          className="rounded-full border px-4 py-2"
                          style={{
                            backgroundColor: on
                              ? "#FFD700"
                              : "rgba(255,255,255,0.06)",
                            borderColor: on
                              ? "#FFD700"
                              : "rgba(255,255,255,0.1)",
                          }}
                        >
                          <Text
                            className="text-sm"
                            style={{
                              color: on ? "#1A1A1A" : "#FFFFFF",
                              fontWeight: on ? "800" : "500",
                            }}
                          >
                            {a}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text
                    className="mb-2 mt-4 text-xs font-bold uppercase text-white/65"
                    style={{ letterSpacing: 0.5 }}
                  >
                    Comentário (opcional)
                  </Text>
                  <TextInput
                    value={comentario}
                    onChangeText={setComentario}
                    placeholder="Conte sua experiência com o serviço..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline
                    numberOfLines={4}
                    style={
                      {
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderWidth: 1.5,
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        color: "#fff",
                        fontSize: 14,
                        padding: 12,
                        minHeight: 90,
                        textAlignVertical: "top",
                        outlineStyle: "none",
                      } as never
                    }
                  />

                  {erro ? (
                    <Text className="mt-3 text-center text-sm text-danger">
                      {erro}
                    </Text>
                  ) : null}

                  <PrimaryButton
                    className="mt-4"
                    label="Enviar avaliação"
                    icon="star"
                    loading={enviando}
                    onPress={enviar}
                  />
                </>
              )
            ) : null}
          </>
        )}
      </ScreenContainer>
    </View>
  );
}
