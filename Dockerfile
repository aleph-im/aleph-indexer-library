FROM node:22-alpine AS build
WORKDIR /app

COPY . .
RUN npm ci
RUN npm run build
RUN npm prune --omit=dev

# Assemble only runtime artifacts
RUN mkdir /runtime && \
    cp package.json cmd.sh /runtime/ && \
    cp -r node_modules /runtime/node_modules && \
    for pkg in packages/*/; do \
      name=$(basename "$pkg") && \
      mkdir -p "/runtime/packages/$name" && \
      cp -r "$pkg/dist" "/runtime/packages/$name/dist" && \
      cp "$pkg/package.json" "/runtime/packages/$name/package.json" \
    ; done

FROM node:22-alpine
WORKDIR /app

COPY --from=build /runtime .

EXPOSE 8081
ENV NODE_ENV=production

CMD ["./cmd.sh"]
