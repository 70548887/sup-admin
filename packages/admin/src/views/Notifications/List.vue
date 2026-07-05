<template>
  <div class="page-container">
    <PageHeader title="通知管理" subtitle="查看系统通知记录和回调投递状态" />

    <!-- 筛选 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" @submit.prevent="onSearch">
        <el-form-item label="通知类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable>
            <el-option label="订单通知" value="order" />
            <el-option label="充值通知" value="recharge" />
            <el-option label="系统通知" value="system" />
            <el-option label="回调通知" value="callback" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="2" />
            <el-option label="待处理" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="X"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Tab 切换 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="系统通知" name="notifications">
          <el-table :data="tableData" v-loading="loading" border stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ typeLabel(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="180" />
            <el-table-column prop="content" label="内容" min-width="250" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" width="170">
              <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 2"
                  type="warning"
                  size="small"
                  link
                  @click="handleResend(row.id)"
                >重发</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="回调投递记录" name="callbacks">
          <el-table :data="callbackData" v-loading="callbackLoading" border stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="url" label="回调URL" min-width="250" show-overflow-tooltip />
            <el-table-column prop="httpStatus" label="状态码" width="90">
              <template #default="{ row }">
                <el-tag :type="row.httpStatus === 200 ? 'success' : 'danger'" size="small">
                  {{ row.httpStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="retryCount" label="重试次数" width="90" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" width="170">
              <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 2"
                  type="warning"
                  size="small"
                  link
                  @click="handleResendCallback(row.id)"
                >重发</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable, formatDateTime, apiClient } from '@sup/shared'
import PageHeader from '@sup/shared/components/PageHeader.vue'

interface Notification {
  id: number
  type: string
  title: string
  content: string
  status: number
  createdAt: number
}

interface CallbackRecord {
  id: number
  url: string
  httpStatus: number
  retryCount: number
  status: number
  createdAt: number
}

const activeTab = ref('notifications')
const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange, handleSearch, handleReset } = useTable<Notification>('/admin/notifications')

const callbackData = ref<CallbackRecord[]>([])
const callbackLoading = ref(false)

const searchForm = reactive({
  type: '' as string,
  status: undefined as number | undefined,
  dateRange: null as [string, string] | null,
})

function typeLabel(type: string): string {
  const map: Record<string, string> = { order: '订单', recharge: '充值', system: '系统', callback: '回调' }
  return map[type] || type
}

function statusType(status: number): string {
  const map: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

function statusLabel(status: number): string {
  const map: Record<number, string> = { 0: '待处理', 1: '成功', 2: '失败' }
  return map[status] || '未知'
}

function onSearch() {
  const params: Record<string, any> = {}
  if (searchForm.type) params.type = searchForm.type
  if (searchForm.status !== undefined) params.status = searchForm.status
  if (searchForm.dateRange) {
    params.startTime = searchForm.dateRange[0]
    params.endTime = searchForm.dateRange[1]
  }
  handleSearch(params)
}

function onReset() {
  searchForm.type = ''
  searchForm.status = undefined
  searchForm.dateRange = null
  handleReset()
}

async function handleResend(id: number) {
  try {
    await apiClient.post(`/admin/notifications/${id}/resend`)
    ElMessage.success('通知已重新发送')
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.message || '重发失败')
  }
}

async function loadCallbacks() {
  callbackLoading.value = true
  try {
    const data = await apiClient.get('/admin/notifications/callbacks', {
      params: { page: pagination.page, size: pagination.size },
    }) as any
    callbackData.value = data.list || []
  } catch (e: any) {
    console.error('loadCallbacks error:', e.message)
  } finally {
    callbackLoading.value = false
  }
}

async function handleResendCallback(id: number) {
  try {
    await apiClient.post(`/admin/notifications/callbacks/${id}/resend`)
    ElMessage.success('回调已重新投递')
    loadCallbacks()
  } catch (e: any) {
    ElMessage.error(e.message || '重发失败')
  }
}

watch(activeTab, (val) => {
  if (val === 'callbacks') loadCallbacks()
})

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.search-card {
  margin-top: 16px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
