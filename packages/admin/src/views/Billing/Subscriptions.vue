<template>
  <div class="page-container">
    <h2>订阅管理</h2>
    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="tenantName" label="租户" min-width="140" />
        <el-table-column prop="planName" label="套餐" width="140" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'expired' ? 'danger' : 'info'">{{ row.status === 'active' ? '生效中' : row.status === 'expired' ? '已过期' : '已取消' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="到期日期" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" v-model:current-page="pagination.page" v-model:page-size="pagination.size" :total="pagination.total" :page-sizes="[20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @current-change="handlePageChange" @size-change="handleSizeChange" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTable, formatDateTime } from '@sup/shared'
import type { Subscription } from '../../api/billing'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<Subscription>('/admin/billing/subscriptions')
onMounted(() => fetchData())
</script>

<style scoped>
.page-container { padding: 20px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
