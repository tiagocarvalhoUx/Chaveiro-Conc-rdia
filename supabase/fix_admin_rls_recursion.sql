-- ============================================================
-- HOTFIX: Recursao infinita nas policies de RLS (admin)
-- Sintoma: GET /profiles e /pedidos retornavam 500
-- Causa: policy de profiles fazia subquery em profiles dentro de si mesma
-- Solucao: funcao SECURITY DEFINER que bypassa RLS na checagem de is_admin
-- ============================================================
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Funcao para checar admin sem disparar RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 2. Recria policies de pedidos usando a funcao
DROP POLICY IF EXISTS "Pedidos: leitura por dono ou admin" ON pedidos;
DROP POLICY IF EXISTS "Pedidos: criação pelo cliente" ON pedidos;
DROP POLICY IF EXISTS "Pedidos: atualização pelo dono ou admin" ON pedidos;

CREATE POLICY "Pedidos: leitura por dono ou admin" ON pedidos
  FOR SELECT USING (
    auth.uid() = cliente_id OR public.is_admin()
  );

CREATE POLICY "Pedidos: criação pelo cliente" ON pedidos
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Pedidos: atualização pelo dono ou admin" ON pedidos
  FOR UPDATE USING (
    auth.uid() = cliente_id OR public.is_admin()
  );

-- 3. Recria policies de profiles usando a funcao
DROP POLICY IF EXISTS "Perfis: leitura pelo dono ou admin" ON profiles;
DROP POLICY IF EXISTS "Perfis: atualização pelo dono ou admin" ON profiles;

CREATE POLICY "Perfis: leitura pelo dono ou admin" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin()
  );

CREATE POLICY "Perfis: atualização pelo dono ou admin" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin()
  );
