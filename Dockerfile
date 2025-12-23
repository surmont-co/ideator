FROM node:25.2.1-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM deps AS build
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM build AS db
RUN apt-get update \
    && apt-get install -y --no-install-recommends sqlite3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN set -eux; \
    for f in drizzle/*.sql; do \
        sqlite3 /app/database.sqlite < "$f"; \
    done

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=db /app/database.sqlite ./database.sqlite

EXPOSE 3000
CMD ["npm", "run", "start"]
