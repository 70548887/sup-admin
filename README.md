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
