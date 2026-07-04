# 构建阶段
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY packages/admin/package.json packages/admin/
COPY packages/tenant-admin/package.json packages/tenant-admin/
COPY packages/supplier/package.json packages/supplier/
COPY packages/customer/package.json packages/customer/
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
RUN pnpm build:all

# 运行阶段
FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/admin/dist /usr/share/nginx/html/admin
COPY --from=builder /app/packages/tenant-admin/dist /usr/share/nginx/html/tenant-admin
COPY --from=builder /app/packages/supplier/dist /usr/share/nginx/html/supplier
COPY --from=builder /app/packages/customer/dist /usr/share/nginx/html/customer
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
