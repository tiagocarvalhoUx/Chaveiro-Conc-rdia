import type { CategoriaServico, StatusPedido } from "@/types/database";

export const BRAND = {
  name: "Chaveiro Concórdia",
  tagline: "Automóveis • Empresa • Residência",
  city: "Araçatuba/SP",
  phone: "(18) 99102-0078",
  phoneDigits: "5518991020078",
  whatsappUrl:
    "https://wa.me/5518991020078?text=" +
    encodeURIComponent(
      "Olá! Preciso de um chaveiro 24h em Araçatuba. Pode me ajudar?"
    ),
  emergencyMessage:
    "🚨 EMERGÊNCIA — Chaveiro Concórdia 24h. Preciso de atendimento imediato!",
} as const;

export const COLORS = {
  primary: "#FFD700",
  primaryDark: "#E6C200",
  danger: "#CC0000",
  dangerDark: "#990000",
  dark: "#1A1A1A",
  darker: "#111111",
  darkSurface: "#262626",
  darkElevated: "#333333",
  muted: "#A1A1A1",
  white: "#FFFFFF",
  whatsapp: "#25D366",
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.10)",
  textSub: "rgba(255,255,255,0.65)",
  textMuted: "rgba(255,255,255,0.45)",
} as const;

export const STORAGE_BUCKET = "orcamentos";

export interface CategoryMeta {
  id: CategoriaServico;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "automoveis", label: "Automóveis", icon: "🚗", color: "#FFD700" },
  { id: "empresa", label: "Empresa", icon: "🏢", color: "#FF6B35" },
  { id: "residencia", label: "Residência", icon: "🏠", color: "#4ECDC4" },
];

export interface StatusMeta {
  label: string;
  color: string;
  step: number;
}

export const STATUS_INFO: Record<StatusPedido, StatusMeta> = {
  pendente: { label: "Pendente", color: "#A1A1A1", step: 1 },
  confirmado: { label: "Confirmado", color: "#4ECDC4", step: 2 },
  em_atendimento: { label: "Em andamento", color: "#FF6B35", step: 3 },
  concluido: { label: "Concluído", color: "#51CF66", step: 4 },
  cancelado: { label: "Cancelado", color: "#CC0000", step: 0 },
};

export const HORARIOS = [
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
  "20:00",
  "22:00",
];
