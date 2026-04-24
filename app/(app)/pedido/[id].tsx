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

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
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
  statusLabel,
} from "@/lib/format";
import {
  buscarAvaliacaoDoPedido,
  criarAvaliacao,
} from "@/services/avaliacoes";
import type { Avaliacao, StatusPedido } from "@/types/database";

const TIMELINE: { status: StatusPedido; label: string; icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap }[] = [
  { status: "pendente", label: "Pedido recebido", icon: "document-text" },
  { status: "confirmado", label: "Confirmado pela equipe", icon: "checkmark-done" },
  { status: "em_atendimento", label: "Em atendimento", icon: "construct" },
  { status: "concluido", label: "Concluído", icon: "trophy" },
];

function indiceStatus(status: StatusPedido): number {
  if (status === "cancelado") return -1;
  return TIMELINE.findIndex((t) => t.status === status);
}

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
  const [sucesso, setSucesso] = useState(false);

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
      setSucesso(true);
    } catch (e) {
      setErroAvaliacao(
        e instanceof Error
          ? "Não foi possível enviar a avaliação. Tente novamente."
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
        <BrandHeader subtitle="Pedido" onBack={() => router.back()} />
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

  const idxAtual = indiceStatus(pedido.status);
  const cancelado = pedido.status === "cancelado";
  const concluido = pedido.status === "concluido";

  return (
    <View className="flex-1 bg-dark">
      <BrandHeader subtitle="Status do pedido" onBack={() => router.back()} />
      <ScreenContainer>
        <GlassCard accent={cancelado ? "danger" : "primary"}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xs uppercase tracking-widest text-primary">
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
                <Text className="text-xs text-muted">
                  {categoriaLabel(pedido.servico.categoria)} •{" "}
                  {formatBRL(pedido.servico.preco_minimo)}
                </Text>
              ) : null}
            </View>
            <StatusBadge status={pedido.status} />
          </View>

          <View className="mt-3 gap-1">
            <Text className="text-xs text-muted">
              Criado em {formatDateTimeBR(pedido.created_at)}
            </Text>
            {pedido.data_agendada ? (
              <Text className="text-xs text-muted">
                Agendado: {pedido.data_agendada} {pedido.horario_agendado ?? ""}
              </Text>
            ) : null}
            {pedido.endereco ? (
              <Text className="text-xs text-muted">
                Endereço: {pedido.endereco}
              </Text>
            ) : null}
          </View>
        </GlassCard>

        {pedido.foto_url ? (
          <GlassCard className="mt-4">
            <Text className="mb-2 text-xs uppercase tracking-widest text-primary">
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
            <Text className="text-xs uppercase tracking-widest text-primary">
              Observações
            </Text>
            <Text className="mt-1 text-sm text-white">{pedido.observacoes}</Text>
          </GlassCard>
        ) : null}

        <Text className="mt-6 text-xs uppercase tracking-widest text-primary">
          Acompanhamento em tempo real
        </Text>

        <View className="mt-3 gap-3">
          {TIMELINE.map((step, i) => {
            const ativo = !cancelado && i <= idxAtual;
            const atual = !cancelado && i === idxAtual;
            return (
              <View key={step.status} className="flex-row items-center gap-3">
                <View
                  className={`h-10 w-10 items-center justify-center rounded-full border ${
                    ativo
                      ? "border-primary bg-primary"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  <Ionicons
                    name={step.icon}
                    size={18}
                    color={ativo ? "#1A1A1A" : "#A1A1A1"}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-sm font-bold ${
                      ativo ? "text-white" : "text-muted"
                    }`}
                  >
                    {step.label}
                  </Text>
                  {atual ? (
                    <Text className="text-xs text-primary">
                      {statusLabel(step.status)} agora
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
          {cancelado ? (
            <View className="rounded-xl border border-danger/40 bg-danger/10 p-3">
              <Text className="text-sm font-bold text-danger">
                Este pedido foi cancelado.
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={() => Linking.openURL(BRAND.whatsappUrl)}
          className="mt-6 flex-row items-center justify-center gap-2 rounded-xl border border-primary py-3"
        >
          <Ionicons name="logo-whatsapp" size={18} color="#FFD700" />
          <Text className="text-sm font-bold text-primary">
            Falar com a equipe
          </Text>
        </Pressable>

        {/* Avaliação — liberada apenas quando concluido */}
        {concluido ? (
          <View className="mt-6">
            <Text className="text-xs uppercase tracking-widest text-primary">
              Avaliação
            </Text>
            {carregandoAvaliacao ? (
              <ActivityIndicator color="#FFD700" style={{ marginTop: 16 }} />
            ) : avaliacao ? (
              <GlassCard className="mt-2">
                <Text className="mb-2 text-sm font-bold text-white">
                  Sua avaliação
                </Text>
                <StarRating value={avaliacao.nota} readOnly />
                {avaliacao.comentario ? (
                  <Text className="mt-3 text-sm text-muted">
                    “{avaliacao.comentario}”
                  </Text>
                ) : null}
                <Text className="mt-3 text-xs text-muted">
                  Enviada em {formatDateTimeBR(avaliacao.created_at)}
                </Text>
              </GlassCard>
            ) : sucesso ? (
              <GlassCard className="mt-2 items-center">
                <Ionicons name="checkmark-circle" size={32} color="#FFD700" />
                <Text className="mt-2 text-sm font-bold text-white">
                  Obrigado pela avaliação!
                </Text>
              </GlassCard>
            ) : (
              <GlassCard className="mt-2">
                <Text className="text-sm text-muted">
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
                  loading={enviando}
                  onPress={enviarAvaliacao}
                />
              </GlassCard>
            )}
          </View>
        ) : (
          <Text className="mt-6 text-center text-xs text-muted">
            A avaliação será liberada quando o pedido for concluído.
          </Text>
        )}
      </ScreenContainer>
    </View>
  );
}
