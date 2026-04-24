import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { GlassCard } from "@/components/GlassCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/hooks/useAuth";
import { BRAND, CATEGORIES } from "@/lib/constants";
import { criarOrcamento } from "@/services/pedidos";
import type { CategoriaServico } from "@/types/database";

interface FotoSelecionada {
  uri: string;
  blob: Blob;
  mimeType: string;
  name: string;
  size: string;
}

async function uriParaBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

export default function Orcamento() {
  const router = useRouter();
  const { user } = useAuth();

  const [categoria, setCategoria] = useState<CategoriaServico | "">("");
  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [foto, setFoto] = useState<FotoSelecionada | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function escolherFoto(source: "camera" | "galeria") {
    setErro(null);
    try {
      const launcher =
        source === "camera"
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;
      const perm =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setErro(
          source === "camera"
            ? "Permissão da câmera negada."
            : "Permissão da galeria negada."
        );
        return;
      }
      const result = await launcher({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const blob = await uriParaBlob(asset.uri);
        setFoto({
          uri: asset.uri,
          blob,
          mimeType: asset.mimeType ?? "image/jpeg",
          name: asset.fileName ?? "foto.jpg",
          size: `${Math.round(blob.size / 1024)} KB`,
        });
      }
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível selecionar a imagem."
      );
    }
  }

  async function enviar() {
    setErro(null);
    if (!user) {
      setErro("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!categoria) {
      setErro("Selecione uma categoria.");
      return;
    }
    if (descricao.trim().length < 10) {
      setErro("Descreva o problema (mínimo 10 caracteres).");
      return;
    }
    setLoading(true);
    try {
      await criarOrcamento({
        clienteId: user.id,
        descricao: descricao.trim(),
        endereco: endereco.trim() || undefined,
        fotoBlob: foto?.blob,
        fotoMimeType: foto?.mimeType,
      });
      setEnviado(true);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível enviar o orçamento."
      );
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <View className="flex-1 items-center justify-center bg-dark px-8">
        <Text style={{ fontSize: 64 }}>📋</Text>
        <Text className="mt-4 text-2xl font-black text-white">
          Orçamento enviado!
        </Text>
        <Text className="mt-2 text-center text-sm text-white/50">
          Retornaremos via WhatsApp em até 2 horas com o orçamento detalhado.
        </Text>
        <View
          className="mt-5 w-full rounded-2xl border px-4 py-4"
          style={{
            backgroundColor: "rgba(37,211,102,0.1)",
            borderColor: "rgba(37,211,102,0.3)",
          }}
        >
          <Text
            className="text-center text-sm font-extrabold"
            style={{ color: "#25D366" }}
          >
            📱 {BRAND.phone}
          </Text>
          <Text className="mt-1 text-center text-xs text-white/50">
            WhatsApp disponível 24h
          </Text>
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
      <ScreenHeader title="Solicitar Orçamento" onBack={() => router.back()} />
      <ScreenContainer showTabBar>
        <Text className="mb-5 text-sm text-white/50">
          Descreva o problema e, se quiser, envie uma foto para agilizar o
          orçamento.
        </Text>

        <Text
          className="mb-2 text-xs font-bold uppercase text-white/65"
          style={{ letterSpacing: 0.5 }}
        >
          Categoria
        </Text>
        <View className="flex-row gap-2">
          {CATEGORIES.map((c) => {
            const isActive = categoria === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategoria(c.id)}
                className="flex-1 items-center rounded-xl border p-3"
                style={{
                  backgroundColor: isActive
                    ? "#FFD700"
                    : "rgba(255,255,255,0.06)",
                  borderColor: isActive ? "#FFD700" : "rgba(255,255,255,0.1)",
                }}
              >
                <Text style={{ fontSize: 20 }}>{c.icon}</Text>
                <Text
                  className="mt-1 text-[10px] font-extrabold"
                  style={{ color: isActive ? "#1A1A1A" : "rgba(255,255,255,0.65)" }}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-5 gap-3">
          <TextField
            label="Descrição do problema"
            icon="document-text"
            placeholder="Ex: Chave quebrou na fechadura, preciso abrir e copiar..."
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />
          <TextField
            label="Endereço (opcional)"
            icon="location"
            placeholder="Bairro, referência..."
            value={endereco}
            onChangeText={setEndereco}
          />
        </View>

        <Text
          className="mb-2 mt-5 text-xs font-bold uppercase text-white/65"
          style={{ letterSpacing: 0.5 }}
        >
          Foto (opcional)
        </Text>
        {foto ? (
          <GlassCard className="flex-row items-center gap-3">
            <Image
              source={{ uri: foto.uri }}
              style={{ width: 56, height: 56, borderRadius: 8 }}
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text
                className="text-sm font-semibold text-white"
                numberOfLines={1}
              >
                {foto.name}
              </Text>
              <Text className="mt-0.5 text-[11px] text-white/45">
                {foto.size}
              </Text>
            </View>
            <Pressable onPress={() => setFoto(null)} hitSlop={10}>
              <Ionicons name="close" size={22} color="#CC0000" />
            </Pressable>
          </GlassCard>
        ) : (
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => escolherFoto("camera")}
              className="flex-1 items-center justify-center rounded-2xl border border-white/10 py-6"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              <Ionicons name="camera" size={28} color="#FFD700" />
              <Text className="mt-2 text-sm font-extrabold text-white">
                Câmera
              </Text>
            </Pressable>
            <Pressable
              onPress={() => escolherFoto("galeria")}
              className="flex-1 items-center justify-center rounded-2xl border border-white/10 py-6"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              <Ionicons name="images" size={28} color="#FFD700" />
              <Text className="mt-2 text-sm font-extrabold text-white">
                Galeria
              </Text>
            </Pressable>
          </View>
        )}

        <GlassCard className="mt-5">
          <Text className="text-sm font-semibold text-white">
            Retorno de contato
          </Text>
          <View
            className="mt-2 flex-row items-center gap-3 py-2"
            style={{ borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            <View>
              <Text className="text-sm text-white">WhatsApp</Text>
              <Text className="text-[11px] text-white/45">{BRAND.phone}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3 pt-2">
            <Ionicons name="mail" size={22} color="#FFD700" />
            <View>
              <Text className="text-sm text-white">E-mail</Text>
              <Text className="text-[11px] text-white/45">
                Enviado ao seu cadastro
              </Text>
            </View>
          </View>
        </GlassCard>

        {erro ? (
          <Text className="mt-3 text-center text-sm text-danger">{erro}</Text>
        ) : null}

        <PrimaryButton
          className="mt-5"
          label="Enviar solicitação"
          icon="paper-plane"
          loading={loading}
          onPress={enviar}
        />
      </ScreenContainer>
    </View>
  );
}
