# Chaveiro Concórdia — App Mobile + PWA

> **Stack:** React Native · Expo SDK 51 · TypeScript (strict) · Supabase · NativeWind (TailwindCSS) · PWA
>
> **24h • (18) 99102-0078 • Araçatuba/SP**
> *Automóveis • Empresa • Residência*

App do cliente final do **Chaveiro Concórdia**, com agendamentos, orçamentos com foto, acompanhamento em tempo real e avaliações 1–5 estrelas. Roda em iOS, Android e Web (PWA instalável).

---

## 🚀 Como rodar

### 1) Instalar dependências
```bash
npm install
```

### 2) Configurar Supabase
Copie o `.env.example` para `.env` e preencha as credenciais do seu projeto Supabase:
```bash
cp .env.example .env
```
```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3) Criar o schema no Supabase
No painel do Supabase → **SQL Editor** → cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e execute.
Isso cria tabelas, enums, RLS, trigger de novo usuário, bucket de Storage e seed de serviços.

### 4) Subir o app
```bash
npm run start          # mobile (iOS/Android via Expo Go)
npm run web            # PWA (http://localhost:8081)
npm run build:web      # build estático (deploy em Vercel/Netlify/Hostinger)
```

### 5) Build de produção (mobile)
```bash
npx eas build --platform android
npx eas build --platform ios
```

### 6) Docker (PWA)

Há dois targets no [`docker-compose.yml`](docker-compose.yml):

**Produção — nginx servindo o bundle estático em http://localhost:8080**
```bash
# garanta as variáveis em .env (EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY)
docker compose --profile prod up web --build
```

**Desenvolvimento — Expo Web com hot reload em http://localhost:8081**
```bash
docker compose --profile dev up dev
```

Arquivos relevantes: [`Dockerfile`](Dockerfile) (multi-stage: build + nginx), [`Dockerfile.dev`](Dockerfile.dev), [`nginx.conf`](nginx.conf), [`.dockerignore`](.dockerignore).

### 7) Deploy na Vercel

1. Crie o projeto na Vercel e conecte o repositório Git (ou faça push e importe).
2. Em **Project Settings → Environment Variables**, cadastre nos escopos `Production`, `Preview` e `Development`:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. O [`vercel.json`](vercel.json) já define:
   - `buildCommand`: `npx expo export --platform web --output-dir dist`
   - `outputDirectory`: `dist`
   - rewrite de todas as rotas para `/index.html` (Expo Router é SPA)
   - cache agressivo em `/_expo/static` e `/assets` (arquivos com hash)

Deploy via CLI local:
```bash
npm i -g vercel
vercel link        # primeira vez
vercel             # preview
vercel --prod      # produção
```

⚠️ Variáveis `EXPO_PUBLIC_*` são embutidas em **build time**, não runtime. Alterou credenciais? → novo deploy.

---

## 📁 Estrutura

```
app/                      → telas (Expo Router)
  index.tsx               → Splash + Intro animada (Tela 0)
  intro.tsx               → Transição auth/app
  +html.tsx               → Documento HTML do PWA
  +not-found.tsx          → 404
  (auth)/                 → Login + Cadastro (Tela 1)
  (app)/                  → Telas autenticadas (2 a 9)
    home.tsx
    catalogo.tsx
    agendamento.tsx
    orcamento.tsx
    pedidos.tsx
    pedido/[id].tsx       → Status em tempo real + Avaliação
    contato.tsx
    perfil.tsx
    avaliacoes.tsx

components/               → componentes reutilizáveis
hooks/                    → useAuth, usePedidos, usePedido, useProfile, useServicos
services/                 → chamadas Supabase isoladas (sem chamada direta nas telas)
lib/
  supabase.ts             → client tipado com Database
  constants.ts            → marca, telefone, cores
  format.ts               → BRL, data, status
types/database.ts         → tipo Database derivado das tabelas
supabase/schema.sql       → schema completo (DDL + RLS + seed)
public/manifest.json      → PWA manifest
app.json                  → Expo + bloco web (PWA)
tailwind.config.js        → cores da marca
```

---

## 🎨 Identidade visual

| Token        | Cor       |
|--------------|-----------|
| `primary`    | `#FFD700` |
| `danger`     | `#CC0000` |
| `dark`       | `#1A1A1A` |

- Splash + Intro: fundo amarelo, mascote SVG da chave entrando em cena, tagline em fade, número 24h pulsando
- Glassmorphism (cartões translúcidos com borda amarela/vermelha) em todas as telas internas
- Botão flutuante de **Emergência 24h** (WhatsApp) em todas as telas pós-login

---

## ✅ Checklist de entrega

- [x] Splash screen com logo e fundo `#FFD700`
- [x] Intro animada com mascote, tagline e número 24h
- [x] Login e cadastro com Supabase Auth
- [x] Home com botão de emergência flutuante
- [x] Catálogo com categorias: Automóveis / Empresa / Residência
- [x] Agendamento com seleção de data, horário e serviço
- [x] Orçamento com upload de foto via Supabase Storage
- [x] Status do pedido com atualização em tempo real (Realtime)
- [x] Contato com link direto para WhatsApp `(18) 99102-0078`
- [x] Perfil com histórico de serviços
- [x] Avaliação com estrelas (1–5) liberada apenas para `concluido`
- [x] PWA configurado em `app.json` + `public/manifest.json` + `app/+html.tsx`
- [x] NativeWind configurado com cores da marca
- [x] TypeScript **strict** sem `any` implícito
- [x] Persistência de sessão com `AsyncStorage`
- [x] Todos os textos em **português brasileiro**
- [x] Zero chamadas diretas ao banco fora de `services/` e `hooks/`

---

## 🔐 Segurança

- Row Level Security ativado em todas as tabelas
- Cliente só lê/edita os próprios pedidos, perfil e avaliações
- Catálogo de serviços é leitura pública (apenas registros `ativo = true`)
- Upload de fotos restrito ao próprio `cliente_id` (pasta no bucket)
- Avaliação com check no banco: só permite insert se o pedido for `concluido` e do próprio cliente

---

## 📱 PWA

Após `npm run build:web`, sirva a pasta `dist/` em qualquer host estático.
O Chrome/Edge oferecerá **"Instalar app"** automaticamente. Em iOS, use **Compartilhar → Adicionar à Tela de Início**.

Atalho rápido `Emergência 24h` configurado em `manifest.json > shortcuts`.

---

## 🧩 Próximos passos sugeridos

1. Adicionar **push notifications** (Expo Notifications) quando o status do pedido mudar
2. **Dashboard administrativo** (web) para a equipe atualizar `status` dos pedidos
3. **Pagamento online** com Stripe ou Pix
4. **Mapa** com geolocalização do atendimento (Mapbox / Google Maps)

---

*Chaveiro Concórdia — Automóveis • Empresa • Residência — 24h — (18) 99102-0078*
