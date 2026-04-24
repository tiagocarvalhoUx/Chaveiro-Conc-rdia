export function formatBRL(value: number | null | undefined): string {
  if (value == null) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    em_atendimento: "Em atendimento",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };
  return map[status] ?? status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    pendente: "#A1A1A1",
    confirmado: "#FFD700",
    em_atendimento: "#3B82F6",
    concluido: "#22C55E",
    cancelado: "#CC0000",
  };
  return map[status] ?? "#A1A1A1";
}

export function categoriaLabel(categoria: string): string {
  const map: Record<string, string> = {
    automoveis: "Automóveis",
    empresa: "Empresa",
    residencia: "Residência",
  };
  return map[categoria] ?? categoria;
}
