import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { GlassCard } from "@/components/GlassCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StarRating } from "@/components/StarRating";
import { StatusBadge } from "@/components/StatusBadge";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/hooks/useAuth";
import { usePedido } from "@/hooks/usePedido";
import { BRAND } from "@/lib/constants";
import {
  categoriaLabel,
  formatBRL,
  formatDateTimeBR,
  statusColor,
  statusStep,
} from "@/lib/format";
import { buscarAvaliacaoDoPedido, criarAvaliacao } from "@/services/avaliacoes";
import type { Avaliacao, StatusPedido } from "@/types/database";

const TIMELINE: {
  status: StatusPedido;
  label: string;
  emoji: string;
}[] = [
  { status: "pendente", label: "Pedido recebido", emoji: "📅" },
  { status: "confirmado", label: "Confirmado", emoji: "✅" },
  { status: "em_atendimento", label: "Em andamento", emoji: "🔧" },
  { status: "concluido", label: "Concluído", emoji: "🎉" },
];

export default function StatusPedidoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { pedido, loading, error, reload } = usePedido(id);

  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [carregandoAvaliacao, setCarregandoAvaliacao] = useState(false);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState<string | null>(null);

  useEffect(() => {
    if (!pedido?.id || pedido.status !== "concluido") return;
    setCarregandoAvaliacao(true);
    buscarAvaliacaoDoPedido(pedido.id)
      .then((a) => setAvaliacao(a))
      .catch(() => undefined)
      .finally(() => setCarregandoAvaliacao(false));
  }, [pedido?.id, pedido?.status]);

  async function enviarAvaliacao() {
    setErroAvaliacao(null);
    if (!user || !pedido) return;
    if (nota < 1) {
      setErroAvaliacao("Selecione de 1 a 5 estrelas.");
      return;
    }
    setEnviando(true);
    try {
      const a = await criarAvaliacao({
        pedidoId: pedido.id,
        clienteId: user.id,
        nota,
        comentario: comentario.trim() || undefined,
      });
      setAvaliacao(a);
    } catch (e) {
      setErroAvaliacao(
        e instanceof Error
          ? "Não foi possível enviar a avaliação."
          : "Falha desconhecida."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-dark">
        <ActivityIndicator color="#FFD700" />
      </View>
    );
  }

  if (error || !pedido) {
    return (
      <View className="flex-1 bg-dark">
        <ScreenHeader title="Pedido" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-center text-sm text-danger">
            {error ?? "Pedido não encontrado."}
          </Text>
          <Pressable
            onPress={reload}
            className="rounded-full border border-primary px-4 py-2"
          >
            <Text className="text-sm font-bold text-primary">Recarregar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const currentStep = statusStep(pedido.status);
  const cancelado = pedido.status === "cancelado";
  const concluido = pedido.status === "concluido";
  const color = statusColor(pedido.status);

  return (
    <View className="flex-1 bg-dark">
      <ScreenHeader title="Status do pedido" onBack={() => router.back()} />
      <ScreenContainer>
        <GlassCard accent={cancelado ? "danger" : "primary"}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text
                className="text-[11px] font-bold uppercase text-primary"
                style={{ letterSpacing: 0.5 }}
              >
                {pedido.tipo === "orcamento"
                  ? "Orçamento"
                  : pedido.tipo === "agendamento"
                    ? "Agendamento"
                    : "Emergência"}
              </Text>
              <Text className="mt-1 text-lg font-extrabold text-white">
                {pedido.servico?.titulo ?? "Atendimento personalizado"}
              </Text>
              {pedido.servico ? (
                <Text className="text-xs text-white/45">
                  {categoriaLabel(pedido.servico.categoria)} •{" "}
                  {formatBRL(pedido.servico.preco_minimo)}
                </Text>
              ) : null}
            </View>
            <StatusBadge status={pedido.status} />
          </View>

          <View className="mt-3 gap-0.5">
            <Text className="text-xs text-white/45">
              Criado em {formatDateTimeBR(pedido.created_at)}
            </Text>
            {pedido.data_agendada ? (
              <Text className="text-xs text-white/45">
                Agendado: {pedido.data_agendada} {pedido.horario_agendado ?? ""}
              </Text>
            ) : null}
            {pedido.endereco ? (
              <Text className="text-xs text-white/45">
                Endereço: {pedido.endereco}
              </Text>
            ) : null}
          </View>
        </GlassCard>

        {pedido.foto_url ? (
          <GlassCard className="mt-4">
            <Text
              className="mb-2 text-[11px] font-bold uppercase text-primary"
              style={{ letterSpacing: 0.5 }}
            >
              Foto enviada
            </Text>
            <Image
              source={{ uri: pedido.foto_url }}
              style={{ width: "100%", height: 200, borderRadius: 12 }}
              resizeMode="cover"
            />
          </GlassCard>
        ) : null}

        {pedido.observacoes ? (
          <GlassCard className="mt-4">
            <Text
              className="text-[11px] font-bold uppercase text-primary"
              style={{ letterSpacing: 0.5 }}
            >
              Observações
            </Text>
            <Text className="mt-1 text-sm text-white">{pedido.observacoes}</Text>
          </GlassCard>
        ) : null}

        <GlassCard className="mt-4">
          <Text
            className="text-[11px] font-bold uppercase text-primary"
            style={{ letterSpacing: 0.5 }}
          >
            Acompanhamento em tempo real
          </Text>
          <View className="mt-3 pl-7">
            {TIMELINE.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep - 1;
              const dot = done || active ? color : "rgba(255,255,255,0.15)";
              return (
                <View
                  key={step.status}
                  style={{
                    position: "relative",
                    paddingBottom: i < TIMELINE.length - 1 ? 22 : 0,
                  }}
                >
                  {i < TIMELINE.length - 1 ? (
                    <View
                      style={{
                        position: "absolute",
                        left: -22,
                        top: 18,
                        width: 2,
                        height: 22,
                        backgroundColor: done ? color : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ) : null}
                  <View
                    style={{
                      position: "absolute",
                      left: -29,
                      top: 2,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: dot,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {done ? (
                      <Ionicons name="checkmark" size={8} color="#fff" />
                    ) : null}
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text style={{ fontSize: 14 }}>{step.emoji}</Text>
                    <Text
                      className="text-sm"
                      style={{
                        color: done || active ? "#fff" : "rgba(255,255,255,0.45)",
                        fontWeight: active ? "700" : "500",
                      }}
                    >
                      {step.label}
                    </Text>
                  </View>
                </View>
              );
            })}
            {cancelado ? (
              <View
                className="mt-2 rounded-xl border px-3 py-2"
                style={{
                  backgroundColor: "rgba(204,0,0,0.1)",
                  borderColor: "rgba(204,0,0,0.4)",
                }}
              >
                <Text className="text-sm font-extrabold text-danger">
                  Este pedido foi cancelado.
                </Text>
              </View>
            ) : null}
          </View>
        </GlassCard>

        <Pressable
          onPress={() => Linking.openURL(BRAND.whatsappUrl)}
          className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl border py-3"
          style={{ borderColor: "#25D366", backgroundColor: "rgba(37,211,102,0.08)" }}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          <Text className="text-sm font-extrabold" style={{ color: "#25D366" }}>
            Falar com a equipe
          </Text>
        </Pressable>

        {concluido ? (
          <View className="mt-6">
            <Text
              className="text-[11px] font-bold uppercase text-primary"
              style={{ letterSpacing: 0.5 }}
            >
              Avaliação
            </Text>
            {carregandoAvaliacao ? (
              <ActivityIndicator color="#FFD700" style={{ marginTop: 14 }} />
            ) : avaliacao ? (
              <GlassCard className="mt-2">
                <Text className="mb-2 text-sm font-extrabold text-white">
                  Sua avaliação
                </Text>
                <StarRating value={avaliacao.nota} readOnly />
                {avaliacao.comentario ? (
                  <Text className="mt-3 text-sm text-white/65">
                    “{avaliacao.comentario}”
                  </Text>
                ) : null}
                <Text className="mt-3 text-xs text-white/45">
                  Enviada em {formatDateTimeBR(avaliacao.created_at)}
                </Text>
              </GlassCard>
            ) : (
              <GlassCard className="mt-2">
                <Text className="text-sm text-white/65">
                  Como foi nosso atendimento?
                </Text>
                <View className="mt-3 items-center">
                  <StarRating value={nota} onChange={setNota} />
                </View>
                <View className="mt-4">
                  <TextField
                    label="Comentário (opcional)"
                    placeholder="Conte como foi o serviço..."
                    value={comentario}
                    onChangeText={setComentario}
                    multiline
                    numberOfLines={3}
                    style={{ minHeight: 80, textAlignVertical: "top" }}
                  />
                </View>
                {erroAvaliacao ? (
                  <Text className="mt-2 text-center text-sm text-danger">
                    {erroAvaliacao}
                  </Text>
                ) : null}
                <PrimaryButton
                  className="mt-4"
                  label="Enviar avaliação"
                  icon="star"
                  loading={enviando}
                  onPress={enviarAvaliacao}
                />
              </GlassCard>
            )}
          </View>
        ) : (
          <Text className="mt-6 text-center text-xs text-white/45">
            A avaliação será liberada quando o pedido for concluído.
          </Text>
        )}
      </ScreenContainer>
    </View>
  );
}
