# SUP聚合供货平台 - 前端

> Vue 3 + TypeScript + Element Plus + Pinia + Vite 5

SUP（SKU供货中台）前端管理面板，采用 pnpm monorepo 架构，覆盖平台管理端、租户管理端、供货商端、客户端四个独立应用。

## 项目结构

本项目采用 pnpm monorepo 架构，包含四个独立前端应用：

| 应用 | 路径 | 访问地址 | 功能 |
|------|------|---------|------|
| Admin管理端 | packages/admin | http://localhost:3000/admin/ | 平台全局管理（51个API端点） |
| Tenant-Admin租户端 | packages/tenant-admin | http://localhost:3001/tenant/ | 租户隔离管理（RBAC四角色） |
| Supplier供货商端 | packages/supplier | http://localhost:3002/supplier/ | 供货商运营（Legacy签名认证） |
| Customer客户端 | packages/customer | http://localhost:3003/ | 用户购物（商品浏览+下单） |

> **⚠️ 注意：** Admin、Tenant-Admin、Supplier 三个应用配置了 base URL 前缀，
> 直接访问根路径（如 `http://localhost:3000`）会提示：
> *"The server is configured with a public base URL of /admin/ - did you mean to visit /admin/ instead?"*
> 请确保在URL末尾加上对应的路径前缀访问。Customer客户端 base 为 `/`，可直接访问根路径。

```
sup-admin/
├── packages/
│   ├── shared/          # 共享核心库（API/Store/Hooks/组件/工具）
│   ├── admin/           # 平台管理端
│   ├── tenant-admin/    # 租户管理端
│   ├── supplier/        # 供货商端
│   └── customer/        # 用户端
├── nginx/               # Nginx部署配置
├── Dockerfile           # Docker多阶段构建
└── docker-compose.yml   # 全栈编排（前端+后端+MySQL+Redis）
```

## 快速启动

### 前置要求
- Node.js >= 18
- pnpm >= 8

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
# 启动单个应用
pnpm dev:admin      # Admin管理端    → http://localhost:3000/admin/
pnpm dev:tenant     # 租户管理端     → http://localhost:3001/tenant/
pnpm dev:supplier   # 供货商端       → http://localhost:3002/supplier/
pnpm dev:customer   # 客户端         → http://localhost:3003/
```

### 构建生产版本
```bash
pnpm build:all      # 构建所有四端
pnpm build:admin    # 单独构建管理端
pnpm build:tenant   # 单独构建租户端
pnpm build:supplier # 单独构建供货商端
pnpm build:customer # 单独构建客户端
```

## 后端API配置

前端通过 Vite 代理连接后端API：
- 后端地址：http://localhost:8080
- Admin/Tenant 代理规则：`/api` → `http://localhost:8080`（去除 `/api` 前缀）
- Supplier/Customer 代理规则：`/openapi` → `http://localhost:8080`（保持路径）

代理配置在各应用的 `vite.config.ts` 中，确保后端服务已启动后再访问前端页面。

## 功能模块

### 管理端 (Admin)
- 数据统计大盘（ECharts图表）
- 用户/商品/订单/退款/充值管理
- 定价规则管理（多层优先级）
- API限流配置
- 对账系统
- 计费管理（SaaS套餐）
- 审计日志

### 租户管理端 (Tenant Admin)
- 租户仪表板
- 订单/商品管理（自动租户隔离）
- 管理员RBAC权限（boss/finance/ops/support）
- 订阅管理与用量统计

### 供货商端 (Supplier)
- 商品管理（分页/编辑/价格）
- 订单处理（状态/排期）
- Legacy签名认证

### 客户端 (Customer)
- 商品分类浏览与搜索
- 商品购买（动态参数表单）
- 订单查询与状态追踪
- 账户信息

## 技术栈
- **框架**: Vue 3.4 + TypeScript
- **UI库**: Element Plus 2.7
- **构建**: Vite 5 + pnpm Monorepo
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **图表**: ECharts (vue-echarts)

## 默认登录账号
- **Admin管理端**：admin / admin123456
- 其他端需通过管理端创建用户

## Docker部署

```bash
docker-compose up -d
```

服务端口：
- 前端: http://localhost:3000
- 后端API: http://localhost:8080

## License

MIT
# SUP聚合供货平台 - 前端管理面板

> Vue 3 + TypeScript + Element Plus + Pinia + Vite 5

SUP（SKU供货中台）前端管理面板，采用 pnpm monorepo 架构，覆盖平台管理端、租户管理端、供货商端、用户端四个独立应用。

## 技术栈

- **框架**: Vue 3 + TypeScript
- **UI库**: Element Plus
- **构建**: Vite 5
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **图表**: ECharts (vue-echarts)
- **包管理**: pnpm workspace (Monorepo)

## 项目结构

```
sup-admin/
├── packages/
│   ├── shared/          # 共享核心库（API/Store/Hooks/组件/工具）
│   ├── admin/           # 平台管理端（51个API端点）
│   ├── tenant-admin/    # 租户管理端（11端点，RBAC四角色）
│   ├── supplier/        # 供货商端（9端点，Legacy签名认证）
│   └── customer/        # 用户端（7端点，商品浏览+下单）
├── nginx/               # Nginx部署配置
├── Dockerfile           # Docker多阶段构建
└── docker-compose.yml   # 全栈编排（前端+后端+MySQL+Redis）
```

## 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 8

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
# 管理端 (http://localhost:5173)
pnpm dev:admin

# 租户管理端 (http://localhost:3001)
pnpm dev:tenant

# 供货商端 (http://localhost:3002)
pnpm dev:supplier

# 用户端 (http://localhost:3003)
pnpm dev:customer
```

### 构建生产版本
```bash
pnpm build:all
```

## 功能模块

### 管理端 (Admin)
- 数据统计大盘（ECharts图表）
- 用户/商品/订单/退款/充值管理
- 定价规则管理（多层优先级）
- API限流配置
- 对账系统
- 计费管理（SaaS套餐）
- 审计日志

### 租户管理端 (Tenant Admin)
- 租户仪表板
- 订单/商品管理（自动租户隔离）
- 管理员RBAC权限（boss/finance/ops/support）
- 订阅管理与用量统计

### 供货商端 (Supplier)
- 商品管理（分页/编辑/价格）
- 订单处理（状态/排期）
- Legacy签名认证

### 用户端 (Customer)
- 商品分类浏览与搜索
- 商品购买（动态参数表单）
- 订单查询与状态追踪
- 账户信息

## Docker部署

```bash
docker-compose up -d
```

服务端口：
- 前端: http://localhost:3000
- 后端API: http://localhost:8080

## 后端仓库

[sup-platform](https://github.com/70548887/sup-platform) — Go + Gin + GORM + MySQL + Redis

## License

MIT
