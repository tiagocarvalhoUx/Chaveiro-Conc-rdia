import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { GlassCard } from "@/components/GlassCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/hooks/useAuth";
import { useServicos } from "@/hooks/useServicos";
import { CATEGORIES, HORARIOS } from "@/lib/constants";
import { categoriaLabel, formatBRLRange } from "@/lib/format";
import { criarAgendamento } from "@/services/pedidos";

interface Dia {
  iso: string;
  label: string;
}

function nextDays(qtd: number): Dia[] {
  const hoje = new Date();
  return Array.from({ length: qtd }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i + 1);
    return {
      iso: d.toISOString().slice(0, 10),
      label: d
        .toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
        })
        .replace(".", ""),
    };
  });
}

const STEPS = ["Serviço", "Data & Hora", "Confirmar"];

export default function Agendamento() {
  const router = useRouter();
  const { user } = useAuth();
  const { servicoId } = useLocalSearchParams<{ servicoId?: string }>();
  const { servicos, loading: loadingServicos } = useServicos();

  const dias = useMemo(() => nextDays(10), []);
  const [step, setStep] = useState(0);
  const [selecionado, setSelecionado] = useState<string | undefined>(servicoId);
  const [data, setData] = useState<string>("");
  const [horario, setHorario] = useState<string>("");
  const [endereco, setEndereco] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!selecionado && servicos.length > 0 && servicoId) {
      setSelecionado(servicoId);
    }
  }, [servicoId, servicos, selecionado]);

  const servico = servicos.find((s) => s.id === selecionado);
  const diaLabel = dias.find((d) => d.iso === data)?.label ?? "—";

  async function confirmar() {
    setErro(null);
    if (!user) {
      setErro("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!selecionado || !data || !horario) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (!endereco.trim()) {
      setErro("Informe o endereço.");
      return;
    }
    setLoading(true);
    try {
      await criarAgendamento({
        clienteId: user.id,
        servicoId: selecionado,
        dataAgendada: data,
        horarioAgendado: horario,
        endereco: endereco.trim(),
        observacoes: observacoes.trim() || undefined,
      });
      setSucesso(true);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível criar o agendamento."
      );
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <View className="flex-1 items-center justify-center bg-dark px-8">
        <Text style={{ fontSize: 64 }}>✅</Text>
        <Text className="mt-4 text-2xl font-black text-white">Agendado!</Text>
        <Text className="mt-2 text-center text-sm text-white/50">
          Seu serviço foi agendado com sucesso. Você receberá uma confirmação via
          WhatsApp em até 30 minutos.
        </Text>
        <GlassCard className="mt-5 w-full">
          <Text className="text-xs text-white/45">Detalhes</Text>
          <Text className="mt-1 text-sm font-extrabold text-white">
            {servico?.titulo}
          </Text>
          <Text className="mt-1 text-xs text-white/65">
            {diaLabel} às {horario}
          </Text>
        </GlassCard>
        <PrimaryButton
          className="mt-6"
          label="Ver meus pedidos"
          onPress={() => router.replace("/(app)/pedidos")}
        />
        <Pressable onPress={() => router.replace("/(app)/home")} className="mt-3">
          <Text className="text-sm font-bold text-primary">Voltar ao início</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      <ScreenHeader
        title="Agendar Serviço"
        onBack={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
      />

      {/* Progress */}
      <View className="flex-row gap-2 px-5 py-3">
        {STEPS.map((label, i) => (
          <View key={label} className="flex-1 items-center">
            <View
              className="mb-1 h-1 w-full rounded-full"
              style={{
                backgroundColor: step >= i ? "#FFD700" : "rgba(255,255,255,0.1)",
              }}
            />
            <Text
              className="text-[10px]"
              style={{
                color: step >= i ? "#FFD700" : "rgba(255,255,255,0.45)",
                fontWeight: step === i ? "700" : "500",
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <ScreenContainer showEmergency={false}>
        {step === 0 ? (
          <View>
            <Text className="text-base font-extrabold text-white">
              Qual serviço você precisa?
            </Text>
            {loadingServicos ? (
              <ActivityIndicator color="#FFD700" style={{ marginTop: 20 }} />
            ) : (
              <View className="mt-3 gap-2">
                {servicos.map((s) => {
                  const isSelected = selecionado === s.id;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => setSelecionado(s.id)}
                    >
                      <GlassCard selected={isSelected} accent="primary">
                        <View className="flex-row items-center gap-3">
                          <View
                            className="h-9 w-9 items-center justify-center rounded-lg"
                            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                          >
                            <Text style={{ fontSize: 18 }}>
                              {
                                CATEGORIES.find((c) => c.id === s.categoria)
                                  ?.icon
                              }
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text
                              className="text-sm font-semibold text-white"
                              numberOfLines={1}
                            >
                              {s.titulo}
                            </Text>
                            <Text className="mt-0.5 text-[11px] font-extrabold text-primary">
                              {formatBRLRange(s.preco_minimo, null)}
                            </Text>
                          </View>
                          {isSelected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color="#FFD700"
                            />
                          ) : null}
                        </View>
                      </GlassCard>
                    </Pressable>
                  );
                })}
              </View>
            )}
            <PrimaryButton
              className="mt-4"
              label="Continuar →"
              onPress={() => {
                if (!selecionado) {
                  setErro("Selecione um serviço.");
                  return;
                }
                setErro(null);
                setStep(1);
              }}
            />
            {erro ? (
              <Text className="mt-2 text-center text-sm text-danger">{erro}</Text>
            ) : null}
          </View>
        ) : null}

        {step === 1 ? (
          <View>
            <Text className="text-base font-extrabold text-white">
              Escolha data e horário
            </Text>

            <Text
              className="mt-4 mb-2 text-xs font-bold uppercase text-white/65"
              style={{ letterSpacing: 0.5 }}
            >
              Data
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            >
              {dias.map((d) => {
                const isActive = data === d.iso;
                return (
                  <Pressable
                    key={d.iso}
                    onPress={() => setData(d.iso)}
                    className="rounded-xl border px-4 py-2"
                    style={{
                      backgroundColor: isActive
                        ? "#FFD700"
                        : "rgba(255,255,255,0.06)",
                      borderColor: isActive ? "#FFD700" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text
                      className="text-[11px] font-extrabold"
                      style={{ color: isActive ? "#1A1A1A" : "rgba(255,255,255,0.65)" }}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text
              className="mt-4 mb-2 text-xs font-bold uppercase text-white/65"
              style={{ letterSpacing: 0.5 }}
            >
              Horário
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {HORARIOS.map((h) => {
                const isActive = horario === h;
                return (
                  <Pressable
                    key={h}
                    onPress={() => setHorario(h)}
                    className="items-center rounded-xl border"
                    style={{
                      width: "23%",
                      paddingVertical: 10,
                      backgroundColor: isActive
                        ? "#FFD700"
                        : "rgba(255,255,255,0.06)",
                      borderColor: isActive ? "#FFD700" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text
                      className="text-sm font-bold"
                      style={{ color: isActive ? "#1A1A1A" : "#FFFFFF" }}
                    >
                      {h}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-5 gap-3">
              <TextField
                label="Endereço completo"
                icon="location"
                placeholder="Rua, número, bairro"
                value={endereco}
                onChangeText={setEndereco}
              />
              <TextField
                label="Observações (opcional)"
                icon="document-text"
                placeholder="Descreva detalhes do serviço..."
                value={observacoes}
                onChangeText={setObservacoes}
                multiline
                numberOfLines={3}
                style={{ minHeight: 80, textAlignVertical: "top" }}
              />
            </View>

            {erro ? (
              <Text className="mt-3 text-center text-sm text-danger">{erro}</Text>
            ) : null}

            <View className="mt-4 flex-row gap-2">
              <PrimaryButton
                label="← Voltar"
                variant="ghost"
                fullWidth={false}
                onPress={() => setStep(0)}
              />
              <PrimaryButton
                label="Confirmar →"
                className="flex-1"
                onPress={() => {
                  if (!data || !horario) {
                    setErro("Escolha data e horário.");
                    return;
                  }
                  if (!endereco.trim()) {
                    setErro("Informe o endereço.");
                    return;
                  }
                  setErro(null);
                  setStep(2);
                }}
              />
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View>
            <Text className="text-base font-extrabold text-white">
              Confirmar agendamento
            </Text>

            <GlassCard className="mt-4">
              {[
                { label: "Serviço", value: servico?.titulo ?? "—" },
                {
                  label: "Categoria",
                  value: servico ? categoriaLabel(servico.categoria) : "—",
                },
                {
                  label: "Valor estimado",
                  value: formatBRLRange(servico?.preco_minimo, null),
                },
                { label: "Data", value: diaLabel },
                { label: "Horário", value: horario },
                { label: "Endereço", value: endereco },
              ].map((row, idx, arr) => (
                <View
                  key={row.label}
                  className="flex-row justify-between py-2.5"
                  style={{
                    borderBottomWidth: idx === arr.length - 1 ? 0 : 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text className="text-sm text-white/50">{row.label}</Text>
                  <Text
                    className="ml-3 flex-1 text-right text-sm font-semibold text-white"
                    numberOfLines={2}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
              {observacoes ? (
                <View className="mt-2 border-t border-white/10 pt-3">
                  <Text className="text-xs text-white/45">Observações</Text>
                  <Text className="mt-1 text-sm text-white/65">
                    {observacoes}
                  </Text>
                </View>
              ) : null}
            </GlassCard>

            <GlassCard
              className="mt-3 flex-row items-start gap-3"
              style={{ paddingVertical: 12 }}
            >
              <Ionicons name="information-circle" size={22} color="#FFD700" />
              <Text className="flex-1 text-xs text-white/65">
                Um profissional confirmará seu agendamento via WhatsApp em até 30
                minutos.
              </Text>
            </GlassCard>

            {erro ? (
              <Text className="mt-3 text-center text-sm text-danger">{erro}</Text>
            ) : null}

            <View className="mt-4 flex-row gap-2">
              <PrimaryButton
                label="← Editar"
                variant="ghost"
                fullWidth={false}
                onPress={() => setStep(1)}
              />
              <PrimaryButton
                label="Confirmar"
                icon="checkmark"
                loading={loading}
                className="flex-1"
                onPress={confirmar}
              />
            </View>
          </View>
        ) : null}
      </ScreenContainer>
    </View>
  );
}
