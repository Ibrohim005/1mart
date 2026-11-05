FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci

# These three determine what actually gets built, not just how it's run:
# `apps/host/nuxt.config.ts` only pulls in `layers/api-backend` (the real
# backend) when NUXT_UPSTREAM_BASE is set DURING `nuxt build` — without it
# here the image would build fine and serve mock data forever, silently.
# The two NUXT_PUBLIC_* values get inlined into SEO/sitemap/i18n output.
ARG NUXT_UPSTREAM_BASE
ARG NUXT_PUBLIC_SITE_URL
ARG NUXT_PUBLIC_STOREFRONT_URL
ENV NUXT_UPSTREAM_BASE=$NUXT_UPSTREAM_BASE \
    NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL \
    NUXT_PUBLIC_STOREFRONT_URL=$NUXT_PUBLIC_STOREFRONT_URL

RUN npm run build

# Same base (alpine/musl) as the builder on purpose: @nuxt/image's sharp
# binary is native and built for the builder's libc — a debian/glibc
# runtime here would silently fail to load it.
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0
COPY --from=builder /app/apps/host/.output ./
EXPOSE 3000
CMD ["node", "server/index.mjs"]
