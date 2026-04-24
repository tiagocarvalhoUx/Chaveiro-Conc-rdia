export type CategoriaServico = "automoveis" | "empresa" | "residencia";

export type StatusPedido =
  | "pendente"
  | "confirmado"
  | "em_atendimento"
  | "concluido"
  | "cancelado";

export type TipoPedido = "agendamento" | "orcamento" | "emergencia";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          telefone: string | null;
          endereco: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          nome: string;
          telefone?: string | null;
          endereco?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          telefone?: string | null;
          endereco?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      servicos: {
        Row: {
          id: string;
          categoria: CategoriaServico;
          titulo: string;
          descricao: string;
          preco_minimo: number | null;
          duracao_minutos: number | null;
          ativo: boolean;
          ordem: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          categoria: CategoriaServico;
          titulo: string;
          descricao: string;
          preco_minimo?: number | null;
          duracao_minutos?: number | null;
          ativo?: boolean;
          ordem?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          categoria?: CategoriaServico;
          titulo?: string;
          descricao?: string;
          preco_minimo?: number | null;
          duracao_minutos?: number | null;
          ativo?: boolean;
          ordem?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      pedidos: {
        Row: {
          id: string;
          cliente_id: string;
          servico_id: string | null;
          tipo: TipoPedido;
          status: StatusPedido;
          data_agendada: string | null;
          horario_agendado: string | null;
          endereco: string | null;
          observacoes: string | null;
          foto_url: string | null;
          valor_estimado: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          servico_id?: string | null;
          tipo: TipoPedido;
          status?: StatusPedido;
          data_agendada?: string | null;
          horario_agendado?: string | null;
          endereco?: string | null;
          observacoes?: string | null;
          foto_url?: string | null;
          valor_estimado?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          servico_id?: string | null;
          tipo?: TipoPedido;
          status?: StatusPedido;
          data_agendada?: string | null;
          horario_agendado?: string | null;
          endereco?: string | null;
          observacoes?: string | null;
          foto_url?: string | null;
          valor_estimado?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey";
            columns: ["cliente_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedidos_servico_id_fkey";
            columns: ["servico_id"];
            referencedRelation: "servicos";
            referencedColumns: ["id"];
          },
        ];
      };
      avaliacoes: {
        Row: {
          id: string;
          pedido_id: string;
          cliente_id: string;
          nota: number;
          comentario: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          cliente_id: string;
          nota: number;
          comentario?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          cliente_id?: string;
          nota?: number;
          comentario?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "avaliacoes_pedido_id_fkey";
            columns: ["pedido_id"];
            referencedRelation: "pedidos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avaliacoes_cliente_id_fkey";
            columns: ["cliente_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      categoria_servico: CategoriaServico;
      status_pedido: StatusPedido;
      tipo_pedido: TipoPedido;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Servico = Database["public"]["Tables"]["servicos"]["Row"];
export type Pedido = Database["public"]["Tables"]["pedidos"]["Row"];
export type Avaliacao = Database["public"]["Tables"]["avaliacoes"]["Row"];
