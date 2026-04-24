# syntax=docker/dockerfile:1.6

# ─── Stage 1: build estático do app web (Expo/Metro) ─────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instala deps a partir do lockfile primeiro (cache eficiente)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do projeto e gera o build estático em /app/dist
COPY . .

# Variáveis do Supabase devem ser passadas em build time para o Metro embutir
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY

RUN npx expo export --platform web --output-dir dist

# ─── Stage 2: nginx servindo o bundle estático ───────────────────────────────
FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
