<template>
  <div class="dashboard">
    <h2>仪表板</h2>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>今日订单数</span>
              <el-icon class="card-icon" color="#409eff"><ShoppingCart /></el-icon>
            </div>
          </template>
          <div class="stat-value">{{ stats.todayOrders }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>今日收入</span>
              <el-icon class="card-icon" color="#67c23a"><Money /></el-icon>
            </div>
          </template>
          <div class="stat-value">¥{{ formatDecimal(stats.todayIncome) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>本周订单数</span>
              <el-icon class="card-icon" color="#e6a23c"><TrendCharts /></el-icon>
            </div>
          </template>
          <div class="stat-value">{{ stats.weekOrders }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>本周收入</span>
              <el-icon class="card-icon" color="#f56c6c"><Wallet /></el-icon>
            </div>
          </template>
          <div class="stat-value">¥{{ formatDecimal(stats.weekIncome) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 订单状态分布 -->
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header>订单状态分布</template>
          <div class="status-chart">
            <div v-for="item in statusDistribution" :key="item.label" class="status-item">
              <div class="status-label">
                <span>{{ item.label }}</span>
                <span class="status-count">{{ item.count }}</span>
              </div>
              <el-progress
                :percentage="item.percentage"
                :color="item.color"
                :stroke-width="16"
                :text-inside="false"
              />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 快捷操作 -->
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>快捷操作</template>
          <el-space wrap :size="16">
            <el-button type="primary" size="large" @click="$router.push('/goods/create')">
              <el-icon><Plus /></el-icon>新建商品
            </el-button>
            <el-button type="warning" size="large" @click="$router.push({ path: '/orders', query: { status: '1' } })">
              <el-icon><Bell /></el-icon>查看待处理订单
            </el-button>
          </el-space>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近订单 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>最近订单</span>
          <el-button type="primary" link @click="$router.push('/orders')">查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentOrders" v-loading="ordersLoading" stripe style="width: 100%;">
        <el-table-column prop="orderSn" label="订单号" width="200" />
        <el-table-column prop="goodsName" label="商品名称" min-width="180" />
        <el-table-column prop="buyNumber" label="数量" width="80" align="center" />
        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">¥{{ formatDecimal(row.amount) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ShoppingCart, Money, TrendCharts, Wallet, Plus, Bell } from '@element-plus/icons-vue'
import { formatDecimal, formatDateTime } from '@sup/shared'
import { getOrderPaging, SUPPLIER_ORDER_STATUS } from '@/api/orders'
import type { SupplierOrder } from '@/api/orders'

/** 统计数据 */
const stats = ref({
  todayOrders: 0,
  todayIncome: '0.00',
  weekOrders: 0,
  weekIncome: '0.00',
})

/** 最近订单 */
const recentOrders = ref<SupplierOrder[]>([])
const ordersLoading = ref(false)

/** 订单状态分布 */
const statusDistribution = computed(() => {
  const statusCountMap: Record<number, number> = {}
  recentOrders.value.forEach(order => {
    statusCountMap[order.status] = (statusCountMap[order.status] || 0) + 1
  })

  const total = recentOrders.value.length || 1
  const colorMap: Record<number, string> = {
    1: '#409eff', 3: '#e6a23c', 6: '#67c23a', 8: '#f56c6c', 9: '#909399',
  }

  return Object.entries(statusCountMap).map(([status, count]) => ({
    label: SUPPLIER_ORDER_STATUS[Number(status)] || `状态${status}`,
    count,
    percentage: Math.round((count / total) * 100),
    color: colorMap[Number(status)] || '#909399',
  }))
})

/** 状态标签颜色 */
function getStatusTagType(status: number): '' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<number, '' | 'success' | 'warning' | 'info' | 'danger'> = {
    1: '', 2: 'warning', 3: '', 4: 'info', 5: 'danger', 6: 'success', 7: 'info', 8: 'danger', 9: 'danger',
  }
  return map[status] ?? 'info'
}

/** 状态文本 */
function getStatusLabel(status: number): string {
  return SUPPLIER_ORDER_STATUS[status] || `未知(${status})`
}

onMounted(async () => {
  ordersLoading.value = true
  try {
    const res = await getOrderPaging({ page: 1, size: 10 })
    recentOrders.value = res.list || []

    // 从订单数据中简单汇总统计
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000
    const weekStart = todayStart - (now.getDay() * 86400)

    let todayOrders = 0, todayIncome = 0, weekOrders = 0, weekIncome = 0
    for (const order of recentOrders.value) {
      const amount = parseFloat(order.amount) || 0
      if (order.createdAt >= todayStart) {
        todayOrders++
        todayIncome += amount
      }
      if (order.createdAt >= weekStart) {
        weekOrders++
        weekIncome += amount
      }
    }
    stats.value = {
      todayOrders,
      todayIncome: todayIncome.toFixed(2),
      weekOrders,
      weekIncome: weekIncome.toFixed(2),
    }
  } catch (e: any) {
    console.error('加载仪表板数据失败:', e.message)
  } finally {
    ordersLoading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-row {
  margin-top: 16px;
}

.stat-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  text-align: center;
  margin: 8px 0;
}

.status-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-label {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
}

.status-count {
  font-weight: 600;
}
</style>
