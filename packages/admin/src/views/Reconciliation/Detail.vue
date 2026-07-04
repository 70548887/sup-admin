<template>
  <div class="page-container">
    <h2>对账任务详情</h2>
    <el-button @click="$router.back()" style="margin-bottom: 16px;">返回列表</el-button>

    <el-card v-if="task" shadow="never">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="任务ID">{{ task.id }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ task.type }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(task.status)">{{ task.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="总记录">{{ task.totalRecords }}</el-descriptions-item>
        <el-descriptions-item label="匹配数">{{ task.matchedRecords }}</el-descriptions-item>
        <el-descriptions-item label="异常数">{{ task.errorRecords }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-if="task && task.errors && task.errors.length > 0" shadow="never" style="margin-top: 16px;">
      <h3>异常记录</h3>
      <el-table :data="task.errors" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="orderSn" label="订单号" width="180" />
        <el-table-column prop="errorType" label="异常类型" width="140" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'resolved' ? 'success' : row.status === 'ignored' ? 'info' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button type="success" size="small" link @click="handleResolve(row.id, 'resolve')">解决</el-button>
              <el-button type="info" size="small" link @click="handleResolve(row.id, 'ignore')">忽略</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getReconciliationTaskDetail, resolveReconciliationError } from '../../api/reconciliation'
import type { ReconciliationTask, ReconciliationError } from '../../api/reconciliation'

const route = useRoute()
const taskId = Number(route.params.id)
const task = ref<(ReconciliationTask & { errors: ReconciliationError[] }) | null>(null)

function statusType(status: string) {
  const map: Record<string, string> = { completed: 'success', running: 'warning', pending: 'info', failed: 'danger' }
  return map[status] || 'info'
}

async function loadDetail() {
  try {
    task.value = await getReconciliationTaskDetail(taskId)
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

async function handleResolve(errorId: number, action: 'resolve' | 'ignore') {
  try {
    await resolveReconciliationError(errorId, { action })
    ElMessage.success(action === 'resolve' ? '已标记为已解决' : '已忽略')
    loadDetail()
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

onMounted(() => loadDetail())
</script>

<style scoped>
.page-container { padding: 20px; }
</style>
