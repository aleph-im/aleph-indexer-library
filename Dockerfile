FROM node:22-alpine AS build
WORKDIR /app

COPY . .
RUN npm ci
RUN npm run build

# Remove devDependencies after build
RUN npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app

# Copy only production node_modules and built output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/cmd.sh ./cmd.sh

EXPOSE 8081
ENV NODE_ENV=production

CMD ["./cmd.sh"]
