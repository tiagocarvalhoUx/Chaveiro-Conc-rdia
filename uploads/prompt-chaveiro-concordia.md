# Prompt — App Chaveiro Concórdia

> **Stack:** React Native · Expo · TypeScript · Supabase · NativeWind (TailwindCSS) · PWA

---

## 🔧 Seção 1 — FUNDAÇÃO (Contexto)

### Persona e escopo

Você é um desenvolvedor especialista em React Native, Expo, TypeScript e Supabase, com foco em apps mobile-first production-ready para o mercado brasileiro. Sua tarefa é construir o app completo do **Chaveiro Concórdia** — loja de chaveiro 24h em Araçatuba/SP — voltado para o cliente final, com suporte a PWA.

### Objetivo direto

Criar um app React Native com Expo, TypeScript, NativeWind (TailwindCSS para mobile), Supabase como backend completo, splash screen animada com apresentação de entrada, e configuração PWA para acesso via navegador.

---

## 📥 Seção 2 — ENTRADA & SAÍDA (I/O)

### Stack técnica obrigatória

| Camada          | Tecnologia                              |
|-----------------|-----------------------------------------|
| Framework       | React Native + Expo SDK                 |
| Linguagem       | TypeScript (strict mode)                |
| Estilização     | NativeWind (TailwindCSS)                |
| Banco de dados  | Supabase (PostgreSQL)                   |
| Autenticação    | Supabase Auth (e-mail + senha)          |
| Storage         | Supabase Storage (fotos de orçamento)   |
| Tempo real      | Supabase Realtime (status do pedido)    |
| PWA             | Expo Web + manifest.json configurado    |
| Deploy mobile   | Expo EAS Build                          |

---

### Sequência de apresentação ao abrir o app

```
1. Splash Screen (1s)
   └── Logo Chaveiro Concórdia + fundo amarelo #FFD700

2. Intro Animada (2–3s)
   └── Mascote da chave entra em cena
   └── Tagline aparece com fade: "Automóveis • Empresa • Residência"
   └── Número 24h pulsa: (18) 99102-0078

3. Transição suave → Tela de Login / Cadastro
```

---

### Telas obrigatórias (10 telas)

| #  | Tela                    | Recurso Supabase        |
|----|-------------------------|-------------------------|
| 0  | Splash + Intro animada  | —                       |
| 1  | Login / Cadastro        | Supabase Auth           |
| 2  | Home                    | Realtime                |
| 3  | Catálogo de serviços    | DB query                |
| 4  | Agendamento             | Insert DB               |
| 5  | Orçamento + foto        | Supabase Storage        |
| 6  | Status do pedido        | Supabase Realtime       |
| 7  | Contato & Emergência    | —                       |
| 8  | Perfil do cliente       | DB query                |
| 9  | Avaliações (1–5 estrelas)| Insert DB              |

### Formato de saída

Projeto estruturado em arquivos separados por responsabilidade:

```
/app             → telas (Expo Router)
/components      → componentes reutilizáveis
/lib
  supabase.ts    → client Supabase tipado
/types           → tipos TypeScript globais
/hooks           → hooks de dados e auth
/services        → chamadas ao banco isoladas
tailwind.config.js
app.json         → configuração PWA incluída
```

---

## 🛡️ Seção 3 — GUARD RAILS (Qualidade)

### Identidade visual obrigatória

- Cores Tailwind customizadas no `tailwind.config.js`:
  - `primary: #FFD700`
  - `danger: #CC0000`
  - `dark: #1A1A1A`
- Splash e intro: fundo `#FFD700`, mascote centralizada, animação com `Animated` API do React Native
- Glassmorphism nas telas internas com acentos amarelos e vermelhos
- Nome **"Chaveiro Concórdia"** sempre em destaque
- Tagline: *"Automóveis • Empresa • Residência"*
- Número **(18) 99102-0078** visível em todas as telas pós-login

### Configuração PWA obrigatória

```json
// app.json (trecho web)
"web": {
  "output": "static",
  "themeColor": "#FFD700",
  "backgroundColor": "#1A1A1A",
  "display": "standalone",
  "shortName": "Chaveiro",
  "name": "Chaveiro Concórdia"
}
```

### Critérios de qualidade

- TypeScript strict — sem `any` implícito
- Supabase client em `lib/supabase.ts` com tipagem das tabelas via tipo `Database`
- Autenticação persistente com `AsyncStorage`
- Botão de emergência flutuante (WhatsApp) visível em todas as telas pós-login
- Avaliação liberada apenas para pedidos com status `concluido`
- Estados de loading e erro tratados em todas as telas
- Todos os textos em português brasileiro

### Proibições

- Sem `any` não tipado no TypeScript
- Sem textos em inglês visíveis ao usuário
- Sem chamadas diretas ao banco fora dos hooks/services
- Não omitir nenhuma das 10 telas
- Não ignorar a sequência de apresentação animada

---

## 📋 Checklist de entrega

- [ ] Splash screen com logo e fundo `#FFD700`
- [ ] Intro animada com mascote, tagline e número 24h
- [ ] Login e cadastro com Supabase Auth
- [ ] Home com botão de emergência flutuante
- [ ] Catálogo com categorias: Automóveis / Empresa / Residência
- [ ] Agendamento com seleção de data, horário e serviço
- [ ] Orçamento com upload de foto via Supabase Storage
- [ ] Status do pedido com atualização em tempo real
- [ ] Contato com link direto para WhatsApp `(18) 99102-0078`
- [ ] Perfil com histórico de serviços
- [ ] Avaliação com estrelas (1–5) para pedidos concluídos
- [ ] PWA configurado no `app.json`
- [ ] NativeWind configurado com cores da marca
- [ ] TypeScript strict sem erros

---

*Chaveiro Concórdia — Automóveis • Empresa • Residência — 24h — (18) 99102-0078*
