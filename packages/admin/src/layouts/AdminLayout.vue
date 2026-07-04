<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <span v-if="!appStore.sidebarCollapsed">SUP Admin</span>
        <span v-else>S</span>
      </div>
      <el-menu
        :collapse="appStore.sidebarCollapsed"
        :default-active="route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>仪表板</template>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-sub-menu index="goods-menu">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/goods">商品列表</el-menu-item>
          <el-menu-item index="/goods/pending">商品审批</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item index="/refunds">
          <el-icon><RefreshLeft /></el-icon>
          <template #title>退款审核</template>
        </el-menu-item>
        <el-menu-item index="/recharges">
          <el-icon><Wallet /></el-icon>
          <template #title>充值审核</template>
        </el-menu-item>
        <el-menu-item index="/audit">
          <el-icon><Document /></el-icon>
          <template #title>审计日志</template>
        </el-menu-item>
        <el-sub-menu index="analytics-menu">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>数据统计</span>
          </template>
          <el-menu-item index="/analytics/revenue">收入趋势</el-menu-item>
          <el-menu-item index="/analytics/hot-goods">热卖排行</el-menu-item>
          <el-menu-item index="/analytics/order-stats">订单统计</el-menu-item>
          <el-menu-item index="/analytics/customer-stats">客户统计</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="pricing-menu">
          <template #title>
            <el-icon><PriceTag /></el-icon>
            <span>定价管理</span>
          </template>
          <el-menu-item index="/pricing">规则列表</el-menu-item>
          <el-menu-item index="/pricing/preview">价格预览</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/customer-groups">
          <el-icon><UserFilled /></el-icon>
          <template #title>客户分组</template>
        </el-menu-item>
        <el-menu-item index="/api-config">
          <el-icon><Connection /></el-icon>
          <template #title>API限流</template>
        </el-menu-item>
        <el-menu-item index="/reconciliation">
          <el-icon><Checked /></el-icon>
          <template #title>对账管理</template>
        </el-menu-item>
        <el-menu-item index="/docking-tasks">
          <el-icon><Link /></el-icon>
          <template #title>对接任务</template>
        </el-menu-item>
        <el-sub-menu index="billing-menu">
          <template #title>
            <el-icon><Medal /></el-icon>
            <span>计费管理</span>
          </template>
          <el-menu-item index="/billing/plans">套餐管理</el-menu-item>
          <el-menu-item index="/billing/subscriptions">订阅管理</el-menu-item>
          <el-menu-item index="/billing/invoices">账单管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="appStore.toggleSidebar">
            <Expand v-if="appStore.sidebarCollapsed" />
            <Fold v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              管理员
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, Expand, Fold, ArrowDown, User, Goods, List, RefreshLeft, Wallet, Document, TrendCharts, PriceTag, UserFilled, Connection, Checked, Link, Medal } from '@element-plus/icons-vue'
import { useAppStore, useAuthStore } from '@sup/shared'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  background-color: #263445;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 4px;
}

.main-content {
  background: #f0f2f5;
  min-height: 0;
}
</style>
