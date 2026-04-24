import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/hooks/useAuth";
import { criarOrcamento } from "@/services/pedidos";

interface FotoSelecionada {
  uri: string;
  blob: Blob;
  mimeType: string;
}

async function uriParaBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

export default function Orcamento() {
  const router = useRouter();
  const { user } = useAuth();

  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [foto, setFoto] = useState<FotoSelecionada | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function escolherFoto(source: "camera" | "galeria") {
    setErro(null);
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setErro("Permissão da câmera negada.");
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
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
          });
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          setErro("Permissão da galeria negada.");
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
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
          });
        }
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
    if (descricao.trim().length < 10) {
      setErro("Descreva o que você precisa (mínimo 10 caracteres).");
      return;
    }
    setLoading(true);
    try {
      const pedido = await criarOrcamento({
        clienteId: user.id,
        descricao: descricao.trim(),
        endereco: endereco.trim() || undefined,
        fotoBlob: foto?.blob,
        fotoMimeType: foto?.mimeType,
      });
      router.replace(`/(app)/pedido/${pedido.id}`);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível enviar o orçamento."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-dark">
      <BrandHeader subtitle="Solicitar orçamento" onBack={() => router.back()} />
      <ScreenContainer>
        <Text className="text-xl font-extrabold text-white">
          Conte o que você precisa
        </Text>
        <Text className="mt-1 text-sm text-muted">
          Envie uma foto da fechadura, chave ou veículo. Retornamos com o orçamento via WhatsApp.
        </Text>

        <View className="mt-5 gap-3">
          <TextField
            label="Descrição"
            placeholder="Ex.: Fechadura travando, marca X, porta de entrada..."
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

        <Text className="mt-5 text-xs uppercase tracking-widest text-primary">
          Foto do serviço
        </Text>

        {foto ? (
          <GlassCard className="mt-2">
            <Image
              source={{ uri: foto.uri }}
              style={{ width: "100%", height: 220, borderRadius: 12 }}
              resizeMode="cover"
            />
            <Pressable
              onPress={() => setFoto(null)}
              className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-danger px-4 py-2"
            >
              <Ionicons name="trash" size={16} color="#CC0000" />
              <Text className="text-sm font-bold text-danger">Remover foto</Text>
            </Pressable>
          </GlassCard>
        ) : (
          <View className="mt-2 flex-row gap-3">
            <Pressable
              onPress={() => escolherFoto("camera")}
              className="flex-1 items-center justify-center rounded-2xl border border-primary/40 bg-white/5 p-5"
            >
              <Ionicons name="camera" size={28} color="#FFD700" />
              <Text className="mt-2 text-sm font-bold text-white">Câmera</Text>
            </Pressable>
            <Pressable
              onPress={() => escolherFoto("galeria")}
              className="flex-1 items-center justify-center rounded-2xl border border-primary/40 bg-white/5 p-5"
            >
              <Ionicons name="images" size={28} color="#FFD700" />
              <Text className="mt-2 text-sm font-bold text-white">Galeria</Text>
            </Pressable>
          </View>
        )}

        {erro ? (
          <Text className="mt-3 text-center text-sm text-danger">{erro}</Text>
        ) : null}

        <PrimaryButton
          className="mt-6"
          label="Enviar orçamento"
          loading={loading}
          onPress={enviar}
        />
      </ScreenContainer>
    </View>
  );
}
