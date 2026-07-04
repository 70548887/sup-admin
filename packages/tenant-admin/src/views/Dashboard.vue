<template>
  <div class="page-container">
    <h2>仪表板</h2>
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="6">
        <el-card shadow="never"><el-statistic title="总订单" :value="dashboard.totalOrders" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><el-statistic title="今日订单" :value="dashboard.todayOrders" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><el-statistic title="总收入" :value="dashboard.totalRevenue" prefix="¥" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><el-statistic title="今日收入" :value="dashboard.todayRevenue" prefix="¥" /></el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="6">
        <el-card shadow="never"><el-statistic title="总商品" :value="dashboard.totalGoods" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><el-statistic title="在售商品" :value="dashboard.activeGoods" /></el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-top: 16px;">
      <h3>最近订单</h3>
      <el-table :data="dashboard.recentOrders" border stripe size="small">
        <el-table-column prop="orderSn" label="订单号" width="180" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ ORDER_STATUS[row.status] || '未知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { formatDateTime, ORDER_STATUS } from '@sup/shared'
import { getTenantDashboard } from '../api/dashboard'
import type { TenantDashboard } from '../api/dashboard'

const dashboard = reactive<TenantDashboard>({
  totalOrders: 0,
  todayOrders: 0,
  totalRevenue: 0,
  todayRevenue: 0,
  totalGoods: 0,
  activeGoods: 0,
  recentOrders: [],
})

onMounted(async () => {
  try {
    const data = await getTenantDashboard()
    Object.assign(dashboard, data)
  } catch (e) { /* ignore */ }
})
</script>

<style scoped>
.page-container { padding: 20px; }
</style>
