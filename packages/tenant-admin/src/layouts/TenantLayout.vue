<template>
  <el-container class="tenant-layout">
    <!-- 侧边栏 -->
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <span v-if="!appStore.sidebarCollapsed">{{ tenantName }}</span>
        <span v-else>T</span>
      </div>
      <el-menu
        :collapse="appStore.sidebarCollapsed"
        :default-active="route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <template v-for="item in filteredMenus" :key="item.path">
          <el-menu-item :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
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
              {{ authStore.userInfo?.username || '管理员' }}
              <el-tag size="small" style="margin-left: 8px;">{{ authStore.userInfo?.role || '' }}</el-tag>
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Expand, Fold, ArrowDown, DataAnalysis, List, Goods, User, Medal } from '@element-plus/icons-vue'
import { useAppStore, useAuthStore } from '@sup/shared'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const tenantName = computed(() => authStore.userInfo?.tenantName || '租户管理')

const allMenus = [
  { path: '/dashboard', title: '仪表板', icon: 'DataAnalysis', roles: ['boss', 'finance', 'ops', 'support'] },
  { path: '/orders', title: '订单管理', icon: 'List', roles: ['boss', 'finance', 'ops', 'support'] },
  { path: '/goods', title: '商品管理', icon: 'Goods', roles: ['boss', 'ops'] },
  { path: '/admins', title: '管理员', icon: 'User', roles: ['boss'] },
  { path: '/subscription', title: '订阅管理', icon: 'Medal', roles: ['boss', 'finance'] },
]

const filteredMenus = computed(() => {
  const userRole = authStore.userInfo?.role || ''
  return allMenus.filter(m => m.roles.includes(userRole))
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.tenant-layout {
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
  font-size: 18px;
  font-weight: bold;
  background-color: #263445;
  white-space: nowrap;
  overflow: hidden;
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
