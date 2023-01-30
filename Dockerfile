FROM node:16-alpine AS appbuild
ARG INDEXER
ENV INDEXER=$INDEXER
WORKDIR /app
COPY . .

RUN npm ci

FROM node:16-alpine
ARG INDEXER
ENV INDEXER=$INDEXER
WORKDIR /app

COPY --from=appbuild /app/packages/${INDEXER}/dist ./packages/${INDEXER}/dist
COPY --from=appbuild /app/packages/${INDEXER}/node_modules ./packages/${INDEXER}/node_modules
COPY --from=appbuild /app/cmd.sh ./cmd.sh

EXPOSE 8080
ENV NODE_ENV=production

CMD ["./cmd.sh"]
