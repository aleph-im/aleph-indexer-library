FROM node:22-alpine AS build
WORKDIR /app

COPY . .
RUN npm ci
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/cmd.sh ./cmd.sh

# Copy only built output and package metadata from each package
COPY --from=build /app/packages/aleph-credit/dist ./packages/aleph-credit/dist
COPY --from=build /app/packages/aleph-credit/package.json ./packages/aleph-credit/package.json
COPY --from=build /app/packages/aleph-holders/dist ./packages/aleph-holders/dist
COPY --from=build /app/packages/aleph-holders/package.json ./packages/aleph-holders/package.json
COPY --from=build /app/packages/aleph-messages/dist ./packages/aleph-messages/dist
COPY --from=build /app/packages/aleph-messages/package.json ./packages/aleph-messages/package.json
COPY --from=build /app/packages/aleph-vouchers/dist ./packages/aleph-vouchers/dist
COPY --from=build /app/packages/aleph-vouchers/package.json ./packages/aleph-vouchers/package.json
COPY --from=build /app/packages/indexer-generator/dist ./packages/indexer-generator/dist
COPY --from=build /app/packages/indexer-generator/package.json ./packages/indexer-generator/package.json
COPY --from=build /app/packages/marinade-finance/dist ./packages/marinade-finance/dist
COPY --from=build /app/packages/marinade-finance/package.json ./packages/marinade-finance/package.json
COPY --from=build /app/packages/spl-lending/dist ./packages/spl-lending/dist
COPY --from=build /app/packages/spl-lending/package.json ./packages/spl-lending/package.json
COPY --from=build /app/packages/spl-token/dist ./packages/spl-token/dist
COPY --from=build /app/packages/spl-token/package.json ./packages/spl-token/package.json
COPY --from=build /app/packages/token/dist ./packages/token/dist
COPY --from=build /app/packages/token/package.json ./packages/token/package.json

EXPOSE 8081
ENV NODE_ENV=production

CMD ["./cmd.sh"]
