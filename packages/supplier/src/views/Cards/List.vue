<template>
  <div class="page-container">
    <PageHeader title="卡密管理" subtitle="管理您的卡密批次库存">
      <template #actions>
        <el-button type="primary" :icon="Upload" @click="$router.push('/cards/import')">导入卡密</el-button>
      </template>
    </PageHeader>

    <!-- 统计 -->
    <StatCards :stats="statList" />

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="batchName" label="批次名" min-width="150" />
        <el-table-column prop="goodsName" label="商品" min-width="180" />
        <el-table-column label="数量" width="180">
          <template #default="{ row }">
            <span class="text-success">{{ row.unusedCount }}</span> /
            <span class="text-warning">{{ row.usedCount }}</span> /
            <span class="text-info">{{ row.totalCount }}</span>
            <div class="count-legend">未用/已用/总数</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="batchStatusType(row.status)" size="small">{{ batchStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="导入时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { useTable, formatDateTime, apiClient } from '@sup/shared'
import PageHeader from '@sup/shared/components/PageHeader.vue'
import StatCards from '@sup/shared/components/StatCards.vue'

interface CardBatch {
  id: number
  batchName: string
  goodsName: string
  totalCount: number
  usedCount: number
  unusedCount: number
  status: number
  createdAt: number
}

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<CardBatch>('/supplier/cards/batches')

const statsData = ref({ totalStock: 0, totalUsed: 0, totalBatches: 0 })

const statList = computed(() => [
  { label: '未使用库存', value: statsData.value.totalStock },
  { label: '已使用', value: statsData.value.totalUsed },
  { label: '总批次', value: statsData.value.totalBatches },
])

function batchStatusType(status: number): string {
  const map: Record<number, string> = { 0: 'success', 1: 'info', 2: 'danger' }
  return map[status] || 'info'
}

function batchStatusLabel(status: number): string {
  const map: Record<number, string> = { 0: '正常', 1: '已用完', 2: '已作废' }
  return map[status] || '未知'
}

async function loadStats() {
  try {
    const data = await apiClient.get('/supplier/cards/stats') as any
    statsData.value = data || { totalStock: 0, totalUsed: 0, totalBatches: 0 }
  } catch { /* ignore */ }
}

onMounted(() => {
  fetchData()
  loadStats()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.text-success { color: #67c23a; font-weight: bold; }
.text-warning { color: #e6a23c; font-weight: bold; }
.text-info { color: #909399; }
.count-legend { font-size: 11px; color: #c0c4cc; }
</style>
