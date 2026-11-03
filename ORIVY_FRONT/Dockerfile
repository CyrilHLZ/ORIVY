# =====================================================================
# Image Docker du front ORIVY : le site construit (npm run build), servi par Caddy.
# Caddy fait aussi le HTTPS tout seul (certificat Let's Encrypt) et transmet /api au back.
# =====================================================================

# ---- 1. Construction du site ----
FROM node:24-alpine AS construction
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- 2. Serveur web ----
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=construction /src/dist /srv
