<template>
  <div class="dashboard">
    <h2>仪表板</h2>
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>今日订单</span>
              <el-icon class="card-icon" color="#409eff"><ShoppingCart /></el-icon>
            </div>
          </template>
          <div class="stat-value">{{ stats.today.totalOrders }}</div>
          <div class="stat-sub">昨日: {{ stats.yesterday.totalOrders }}</div>
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
          <div class="stat-value">¥{{ formatDecimal(stats.today.totalAmount) }}</div>
          <div class="stat-sub">昨日: ¥{{ formatDecimal(stats.yesterday.totalAmount) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>今日退款</span>
              <el-icon class="card-icon" color="#e6a23c"><RefreshLeft /></el-icon>
            </div>
          </template>
          <div class="stat-value">{{ stats.today.totalRefunds }}</div>
          <div class="stat-sub">金额: ¥{{ formatDecimal(stats.today.refundAmount) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>本月订单</span>
              <el-icon class="card-icon" color="#f56c6c"><TrendCharts /></el-icon>
            </div>
          </template>
          <div class="stat-value">{{ stats.month.totalOrders }}</div>
          <div class="stat-sub">金额: ¥{{ formatDecimal(stats.month.totalAmount) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>本周概览</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单数">{{ stats.week.totalOrders }}</el-descriptions-item>
            <el-descriptions-item label="订单金额">¥{{ formatDecimal(stats.week.totalAmount) }}</el-descriptions-item>
            <el-descriptions-item label="退款数">{{ stats.week.totalRefunds }}</el-descriptions-item>
            <el-descriptions-item label="退款金额">¥{{ formatDecimal(stats.week.refundAmount) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>本月概览</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单数">{{ stats.month.totalOrders }}</el-descriptions-item>
            <el-descriptions-item label="订单金额">¥{{ formatDecimal(stats.month.totalAmount) }}</el-descriptions-item>
            <el-descriptions-item label="退款数">{{ stats.month.totalRefunds }}</el-descriptions-item>
            <el-descriptions-item label="退款金额">¥{{ formatDecimal(stats.month.refundAmount) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ShoppingCart, Money, RefreshLeft, TrendCharts } from '@element-plus/icons-vue'
import { formatDecimal } from '@sup/shared'
import type { DashboardStats } from '@sup/shared'
import { getDashboardStats } from '../api/analytics'

const stats = ref<DashboardStats>({
  today: { totalOrders: 0, totalAmount: '0', totalRefunds: 0, refundAmount: '0' },
  yesterday: { totalOrders: 0, totalAmount: '0', totalRefunds: 0, refundAmount: '0' },
  week: { totalOrders: 0, totalAmount: '0', totalRefunds: 0, refundAmount: '0' },
  month: { totalOrders: 0, totalAmount: '0', totalRefunds: 0, refundAmount: '0' },
})

onMounted(async () => {
  try {
    const data = await getDashboardStats()
    stats.value = data
  } catch (e: any) {
    console.error('Failed to load dashboard stats:', e.message)
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

.stat-sub {
  font-size: 13px;
  color: #909399;
  text-align: center;
}
</style>
