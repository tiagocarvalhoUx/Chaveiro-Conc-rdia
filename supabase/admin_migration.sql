-- ============================================================
-- MIGRAÇÃO: Suporte ao Painel Admin — Chaveiro Concórdia
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Adicionar coluna is_admin na tabela profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. Atualizar as políticas RLS de pedidos para permitir acesso admin
--    (drop das políticas antigas e recriação com bypass para admin)

DROP POLICY IF EXISTS "Clientes veem apenas seus pedidos" ON pedidos;
DROP POLICY IF EXISTS "Clientes criam seus pedidos" ON pedidos;
DROP POLICY IF EXISTS "Clientes atualizam seus pedidos" ON pedidos;
DROP POLICY IF EXISTS "Pedidos: leitura por dono ou admin" ON pedidos;
DROP POLICY IF EXISTS "Pedidos: criação pelo cliente" ON pedidos;
DROP POLICY IF EXISTS "Pedidos: atualização pelo dono ou admin" ON pedidos;

-- Leitura: dono do pedido OU admin
CREATE POLICY "Pedidos: leitura por dono ou admin" ON pedidos
  FOR SELECT USING (
    auth.uid() = cliente_id
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

-- Inserção: apenas o próprio cliente
CREATE POLICY "Pedidos: criação pelo cliente" ON pedidos
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

-- Atualização: dono do pedido OU admin
CREATE POLICY "Pedidos: atualização pelo dono ou admin" ON pedidos
  FOR UPDATE USING (
    auth.uid() = cliente_id
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

-- 3. Atualizar RLS de profiles para admin ver todos os perfis
DROP POLICY IF EXISTS "Perfis: leitura pelo dono" ON profiles;
DROP POLICY IF EXISTS "Perfis: leitura pelo dono ou admin" ON profiles;

CREATE POLICY "Perfis: leitura pelo dono ou admin" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

-- 4. Permitir que admin atualize qualquer perfil
DROP POLICY IF EXISTS "Perfis: atualização pelo dono" ON profiles;
DROP POLICY IF EXISTS "Perfis: atualização pelo dono ou admin" ON profiles;

CREATE POLICY "Perfis: atualização pelo dono ou admin" ON profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- PASSO FINAL: Definir o admin
-- Substitua 'seu-email@exemplo.com' pelo e-mail do usuário admin
-- e execute o comando abaixo após criar a conta no app:
-- ============================================================

-- UPDATE profiles
-- SET is_admin = true
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com'
-- );
