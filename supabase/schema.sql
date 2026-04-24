-- =====================================================================
-- Chaveiro Concórdia — Schema Supabase
-- Execute este arquivo no SQL Editor do Supabase para criar todo o backend.
-- =====================================================================

-- 1) Enums ------------------------------------------------------------
create type categoria_servico as enum ('automoveis', 'empresa', 'residencia');
create type status_pedido as enum (
  'pendente', 'confirmado', 'em_atendimento', 'concluido', 'cancelado'
);
create type tipo_pedido as enum ('agendamento', 'orcamento', 'emergencia');

-- 2) Tabelas ----------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  telefone text,
  endereco text,
  created_at timestamptz default now() not null
);

create table public.servicos (
  id uuid primary key default gen_random_uuid(),
  categoria categoria_servico not null,
  titulo text not null,
  descricao text not null,
  preco_minimo numeric(10, 2),
  duracao_minutos integer,
  ativo boolean default true not null,
  ordem integer default 0 not null,
  created_at timestamptz default now() not null
);

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  servico_id uuid references public.servicos(id) on delete set null,
  tipo tipo_pedido not null,
  status status_pedido default 'pendente' not null,
  data_agendada date,
  horario_agendado time,
  endereco text,
  observacoes text,
  foto_url text,
  valor_estimado numeric(10, 2),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  nota integer not null check (nota between 1 and 5),
  comentario text,
  created_at timestamptz default now() not null,
  unique (pedido_id)
);

-- 3) Índices ----------------------------------------------------------
create index idx_pedidos_cliente on public.pedidos(cliente_id, created_at desc);
create index idx_pedidos_status on public.pedidos(status);
create index idx_servicos_categoria on public.servicos(categoria) where ativo = true;

-- 4) Trigger de updated_at -------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_pedidos_updated_at
  before update on public.pedidos
  for each row execute function public.handle_updated_at();

-- 5) Trigger de novo usuário (cria perfil automaticamente) -----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, telefone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', 'Cliente'),
    new.raw_user_meta_data->>'telefone'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) Row Level Security ----------------------------------------------
alter table public.profiles enable row level security;
alter table public.servicos enable row level security;
alter table public.pedidos enable row level security;
alter table public.avaliacoes enable row level security;

-- profiles: cada usuário lê e atualiza apenas o próprio perfil
create policy "perfil próprio - select" on public.profiles
  for select using (auth.uid() = id);
create policy "perfil próprio - update" on public.profiles
  for update using (auth.uid() = id);
create policy "perfil próprio - insert" on public.profiles
  for insert with check (auth.uid() = id);

-- servicos: leitura pública (catálogo)
create policy "servicos - leitura pública" on public.servicos
  for select using (ativo = true);

-- pedidos: usuário só vê e cria os próprios
create policy "pedidos próprios - select" on public.pedidos
  for select using (auth.uid() = cliente_id);
create policy "pedidos próprios - insert" on public.pedidos
  for insert with check (auth.uid() = cliente_id);
create policy "pedidos próprios - update" on public.pedidos
  for update using (auth.uid() = cliente_id);

-- avaliacoes: usuário só avalia os próprios pedidos concluídos
create policy "avaliacoes próprias - select" on public.avaliacoes
  for select using (auth.uid() = cliente_id);
create policy "avaliacoes próprias - insert" on public.avaliacoes
  for insert with check (
    auth.uid() = cliente_id
    and exists (
      select 1 from public.pedidos
      where id = pedido_id
        and cliente_id = auth.uid()
        and status = 'concluido'
    )
  );

-- 7) Realtime (status do pedido) -------------------------------------
alter publication supabase_realtime add table public.pedidos;

-- 8) Storage bucket para fotos de orçamento --------------------------
insert into storage.buckets (id, name, public)
values ('orcamentos', 'orcamentos', true)
on conflict (id) do nothing;

create policy "orcamentos - upload autenticado" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'orcamentos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "orcamentos - leitura pública" on storage.objects
  for select using (bucket_id = 'orcamentos');

-- 9) Seed de serviços -----------------------------------------------
insert into public.servicos (categoria, titulo, descricao, preco_minimo, duracao_minutos, ordem) values
  ('automoveis', 'Abertura de veículo', 'Abrimos seu carro sem danos quando a chave está trancada dentro.', 80.00, 30, 1),
  ('automoveis', 'Cópia de chave codificada', 'Cópia de chave automotiva com chip ou transponder.', 250.00, 60, 2),
  ('automoveis', 'Confecção de chave canivete', 'Fabricação completa de chave canivete original.', 450.00, 90, 3),
  ('automoveis', 'Reparo de miolo de ignição', 'Reparo ou troca completa do miolo de ignição.', 350.00, 120, 4),
  ('empresa', 'Troca de fechadura comercial', 'Substituição de fechaduras de portas comerciais e escritórios.', 120.00, 60, 1),
  ('empresa', 'Cópia de chave em massa', 'Cópias para equipes, condomínios e empresas.', 15.00, 15, 2),
  ('empresa', 'Sistema de chave-mestra', 'Projeto e instalação de sistema com chave mestra.', 800.00, 240, 3),
  ('empresa', 'Manutenção preventiva', 'Lubrificação e ajuste de fechaduras e portas comerciais.', 150.00, 90, 4),
  ('residencia', 'Abertura de porta', 'Abertura de porta residencial sem danos à fechadura.', 100.00, 30, 1),
  ('residencia', 'Troca de fechadura', 'Substituição completa de fechaduras residenciais.', 130.00, 45, 2),
  ('residencia', 'Cópia de chave', 'Cópia de chaves comuns e tetra.', 12.00, 10, 3),
  ('residencia', 'Instalação de fechadura digital', 'Instalação de fechaduras eletrônicas e digitais.', 600.00, 180, 4)
on conflict do nothing;
