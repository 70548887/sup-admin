<template>
  <div class="page-container">
    <h2>对账管理</h2>
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" @submit.prevent="handleRun">
        <el-form-item label="类型">
          <el-select v-model="runForm.type" placeholder="选择类型">
            <el-option value="order" label="订单对账" />
            <el-option value="payment" label="支付对账" />
            <el-option value="settlement" label="结算对账" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="runForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRun" :loading="running">执行对账</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalRecords" label="总记录" width="100" />
        <el-table-column prop="matchedRecords" label="匹配" width="80" />
        <el-table-column prop="errorRecords" label="异常" width="80" />
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="$router.push(`/reconciliation/${row.id}`)">详情</el-button>
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
import { runReconciliation } from '../../api/reconciliation'
import type { ReconciliationTask } from '../../api/reconciliation'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<ReconciliationTask>('/admin/reconciliation/tasks')

const running = ref(false)
const runForm = reactive({ type: 'order', dateRange: null as [string, string] | null })

function statusType(status: string) {
  const map: Record<string, string> = { completed: 'success', running: 'warning', pending: 'info', failed: 'danger' }
  return map[status] || 'info'
}

async function handleRun() {
  if (!runForm.dateRange) { ElMessage.warning('请选择时间范围'); return }
  running.value = true
  try {
    await runReconciliation({ type: runForm.type, startDate: runForm.dateRange[0], endDate: runForm.dateRange[1] })
    ElMessage.success('对账任务已创建')
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    running.value = false
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-container { padding: 20px; }
.search-card { margin-top: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
