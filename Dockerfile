# syntax=docker/dockerfile:1.6

# ─── Stage 1: build estático do app web (Expo/Metro) ─────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
# `npm install` em vez de `npm ci` por uma razão pontual: o lockfile foi
# gerado em Windows+OneDrive, que corrompe a árvore transitiva (faltam
# subdeps de @babel/preset-env). `install` recomputa e segue.
# Quando o lockfile for regenerado fora do OneDrive, voltar para `npm ci`.
RUN npm install --no-audit --no-fund --loglevel=error

COPY . .

# Variáveis EXPO_PUBLIC_* são embutidas em build time pelo Metro.
# No Render, basta cadastrar no Environment — ele as repassa como build args.
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY

RUN npx expo export --platform web --output-dir dist

# ─── Stage 2: nginx servindo o bundle estático ───────────────────────────────
FROM nginx:1.27-alpine AS runner

# A imagem oficial do nginx faz envsubst em /etc/nginx/templates/*.template
# antes de iniciar. Limitamos a substituição apenas a $PORT pra não quebrar
# diretivas do nginx (que usam $uri, $http_*, etc).
ENV NGINX_ENVSUBST_FILTER=PORT
ENV PORT=8080

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
