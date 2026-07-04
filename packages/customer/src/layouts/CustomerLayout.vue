<template>
  <el-container class="customer-layout">
    <!-- 顶部导航 -->
    <el-header class="header">
      <div class="header-left">
        <span class="logo">SUP 商城</span>
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          router
          :ellipsis="false"
        >
          <el-menu-item index="/goods">商品</el-menu-item>
          <el-menu-item index="/categories">分类</el-menu-item>
          <el-menu-item index="/orders">我的订单</el-menu-item>
          <el-menu-item index="/account">账户</el-menu-item>
        </el-menu>
      </div>
      <div class="header-right">
        <el-dropdown>
          <span class="user-info">
            我的账户
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/account')">账户信息</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { clearCredentials } from '@/api/legacyAuth'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/goods')) return '/goods'
  if (path.startsWith('/categories')) return '/categories'
  if (path.startsWith('/orders')) return '/orders'
  if (path.startsWith('/account')) return '/account'
  return '/goods'
})

function handleLogout() {
  clearCredentials()
  router.push('/login')
}
</script>

<style scoped>
.customer-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0 24px;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  white-space: nowrap;
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
  background: #f5f7fa;
  flex: 1;
  overflow: auto;
}
</style>
