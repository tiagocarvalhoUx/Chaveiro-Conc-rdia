import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/hooks/useAuth";
import { useServicos } from "@/hooks/useServicos";
import { categoriaLabel, formatBRL } from "@/lib/format";
import { criarAgendamento } from "@/services/pedidos";

const HORARIOS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

function gerarProximosDias(qtd: number): { iso: string; label: string; weekday: string }[] {
  const dias: { iso: string; label: string; weekday: string }[] = [];
  const hoje = new Date();
  for (let i = 0; i < qtd; i += 1) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const weekday = d
      .toLocaleDateString("pt-BR", { weekday: "short" })
      .replace(".", "");
    dias.push({ iso, label, weekday });
  }
  return dias;
}

export default function Agendamento() {
  const router = useRouter();
  const { user } = useAuth();
  const { servicoId } = useLocalSearchParams<{ servicoId?: string }>();
  const { servicos, loading: loadingServicos } = useServicos();

  const dias = useMemo(() => gerarProximosDias(14), []);

  const [selecionado, setSelecionado] = useState<string | undefined>(servicoId);
  const [data, setData] = useState<string>(dias[0]?.iso ?? "");
  const [horario, setHorario] = useState<string>(HORARIOS[0]);
  const [endereco, setEndereco] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!selecionado && servicos.length > 0) {
      setSelecionado(servicos[0].id);
    }
  }, [selecionado, servicos]);

  const servico = servicos.find((s) => s.id === selecionado);

  async function handleSubmit() {
    setErro(null);
    if (!user) {
      setErro("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!selecionado) {
      setErro("Selecione um serviço.");
      return;
    }
    if (!endereco.trim()) {
      setErro("Informe o endereço do atendimento.");
      return;
    }
    setLoading(true);
    try {
      const pedido = await criarAgendamento({
        clienteId: user.id,
        servicoId: selecionado,
        dataAgendada: data,
        horarioAgendado: horario,
        endereco: endereco.trim(),
        observacoes: observacoes.trim() || undefined,
      });
      router.replace(`/(app)/pedido/${pedido.id}`);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível criar o agendamento."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-dark">
      <BrandHeader subtitle="Agendamento" onBack={() => router.back()} />
      <ScreenContainer>
        <Text className="text-xs uppercase tracking-widest text-primary">
          Etapa 1
        </Text>
        <Text className="mt-1 text-lg font-bold text-white">Escolha o serviço</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 12 }}
        >
          {loadingServicos
            ? null
            : servicos.map((s) => {
                const active = selecionado === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setSelecionado(s.id)}
                    className={`rounded-xl border px-4 py-3 ${
                      active
                        ? "border-primary bg-primary"
                        : "border-primary/30 bg-white/5"
                    }`}
                    style={{ minWidth: 180 }}
                  >
                    <Text
                      className={`text-xs font-bold uppercase ${
                        active ? "text-dark" : "text-primary"
                      }`}
                    >
                      {categoriaLabel(s.categoria)}
                    </Text>
                    <Text
                      className={`mt-1 text-sm font-bold ${
                        active ? "text-dark" : "text-white"
                      }`}
                    >
                      {s.titulo}
                    </Text>
                    <Text
                      className={`mt-1 text-xs ${
                        active ? "text-dark/80" : "text-muted"
                      }`}
                    >
                      {formatBRL(s.preco_minimo)}
                    </Text>
                  </Pressable>
                );
              })}
        </ScrollView>

        <Text className="mt-4 text-xs uppercase tracking-widest text-primary">
          Etapa 2
        </Text>
        <Text className="mt-1 text-lg font-bold text-white">Escolha a data</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
        >
          {dias.map((d) => {
            const active = data === d.iso;
            return (
              <Pressable
                key={d.iso}
                onPress={() => setData(d.iso)}
                className={`items-center rounded-xl border px-4 py-3 ${
                  active
                    ? "border-primary bg-primary"
                    : "border-primary/30 bg-white/5"
                }`}
                style={{ minWidth: 70 }}
              >
                <Text
                  className={`text-xs uppercase ${
                    active ? "text-dark" : "text-muted"
                  }`}
                >
                  {d.weekday}
                </Text>
                <Text
                  className={`text-base font-extrabold ${
                    active ? "text-dark" : "text-white"
                  }`}
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text className="mt-4 text-xs uppercase tracking-widest text-primary">
          Etapa 3
        </Text>
        <Text className="mt-1 text-lg font-bold text-white">Horário</Text>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {HORARIOS.map((h) => {
            const active = horario === h;
            return (
              <Pressable
                key={h}
                onPress={() => setHorario(h)}
                className={`rounded-full border px-4 py-2 ${
                  active
                    ? "border-primary bg-primary"
                    : "border-primary/30 bg-white/5"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    active ? "text-dark" : "text-white"
                  }`}
                >
                  {h}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-6 gap-3">
          <TextField
            label="Endereço completo"
            icon="location"
            placeholder="Rua, número, bairro"
            value={endereco}
            onChangeText={setEndereco}
          />
          <TextField
            label="Observações (opcional)"
            placeholder="Ex.: chave perdida, modelo do veículo..."
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </View>

        {servico ? (
          <GlassCard className="mt-5">
            <View className="flex-row items-center gap-3">
              <Ionicons name="information-circle" size={20} color="#FFD700" />
              <View className="flex-1">
                <Text className="text-xs text-muted">Resumo</Text>
                <Text className="text-sm font-bold text-white">
                  {servico.titulo} — {formatBRL(servico.preco_minimo)}
                </Text>
                <Text className="text-xs text-muted">
                  {data} às {horario}
                </Text>
              </View>
            </View>
          </GlassCard>
        ) : null}

        {erro ? (
          <Text className="mt-3 text-center text-sm text-danger">{erro}</Text>
        ) : null}

        <PrimaryButton
          className="mt-5"
          label="Confirmar agendamento"
          loading={loading}
          onPress={handleSubmit}
        />
      </ScreenContainer>
    </View>
  );
}
