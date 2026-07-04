<template>
  <div class="page-container">
    <h2>对接任务监控</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="6">
        <el-card shadow="never"><el-statistic title="总失败数" :value="stats.totalFailed" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><el-statistic title="今日失败" :value="stats.todayFailed" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><el-statistic title="今日已解决" :value="stats.resolvedToday" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><el-statistic title="平均重试次数" :value="stats.avgRetryCount" /></el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="taskType" label="任务类型" width="120" />
        <el-table-column prop="supplierName" label="供应商" width="140" />
        <el-table-column prop="orderSn" label="订单号" width="180" />
        <el-table-column prop="errorMessage" label="错误信息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="retryCount" label="重试次数" width="90" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'resolved' ? 'success' : row.status === 'retrying' ? 'warning' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="failedAt" label="失败时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.failedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'failed'" type="warning" size="small" link @click="handleRetry(row.id)">重试</el-button>
          </template>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable, formatDateTime } from '@sup/shared'
import { retryDockingTask, getDockingStats } from '../../api/docking'
import type { DockingTask, DockingStats } from '../../api/docking'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<DockingTask>('/admin/docking-tasks/failed')

const stats = reactive<DockingStats>({ totalFailed: 0, todayFailed: 0, resolvedToday: 0, avgRetryCount: 0 })

async function loadStats() {
  try {
    const res = await getDockingStats()
    Object.assign(stats, res)
  } catch (e) { /* ignore */ }
}

async function handleRetry(taskId: number) {
  try {
    await retryDockingTask(taskId)
    ElMessage.success('重试已触发')
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

onMounted(() => { fetchData(); loadStats() })
</script>

<style scoped>
.page-container { padding: 20px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
