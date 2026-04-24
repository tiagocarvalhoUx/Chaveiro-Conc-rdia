import { STATUS_INFO } from "@/lib/constants";
import type { CategoriaServico, StatusPedido } from "@/types/database";

export function formatBRL(value: number | null | undefined): string {
  if (value == null) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatBRLRange(
  min: number | null | undefined,
  max: number | null | undefined
): string {
  if (min == null && max == null) return "Sob consulta";
  if (min != null && max != null) return `${formatBRL(min)} – ${formatBRL(max)}`;
  if (min != null) return `A partir de ${formatBRL(min)}`;
  return formatBRL(max);
}

export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTimeBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusLabel(status: StatusPedido | string): string {
  return STATUS_INFO[status as StatusPedido]?.label ?? status;
}

export function statusColor(status: StatusPedido | string): string {
  return STATUS_INFO[status as StatusPedido]?.color ?? "#A1A1A1";
}

export function statusStep(status: StatusPedido | string): number {
  return STATUS_INFO[status as StatusPedido]?.step ?? 0;
}

export function categoriaLabel(categoria: CategoriaServico | string): string {
  const map: Record<string, string> = {
    automoveis: "Automóveis",
    empresa: "Empresa",
    residencia: "Residência",
  };
  return map[categoria] ?? categoria;
}

export function categoriaIcon(categoria: CategoriaServico | string): string {
  const map: Record<string, string> = {
    automoveis: "🚗",
    empresa: "🏢",
    residencia: "🏠",
  };
  return map[categoria] ?? "🔑";
}

export function greetingByHour(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
