<template>
  <div class="page-container">
    <PageHeader title="卡密管理" subtitle="管理所有卡密批次的导入、库存和使用情况">
      <template #actions>
        <el-button type="primary" :icon="Upload" @click="$router.push('/cards/import')">导入卡密</el-button>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <StatCards :stats="statList" />

    <!-- 筛选 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" @submit.prevent="onSearch">
        <el-form-item label="商品">
          <el-select v-model="searchForm.goodsId" placeholder="全部商品" clearable filterable>
            <el-option v-for="g in goodsOptions" :key="g.id" :label="g.name" :value="g.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="未使用" :value="0" />
            <el-option label="已使用" :value="1" />
            <el-option label="已过期" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="batchName" label="批次名" min-width="150" />
        <el-table-column prop="goodsName" label="商品" min-width="180" />
        <el-table-column label="数量统计" width="200">
          <template #default="{ row }">
            <span class="text-success">{{ row.unusedCount }}</span> /
            <span class="text-warning">{{ row.usedCount }}</span> /
            <span class="text-info">{{ row.totalCount }}</span>
            <div class="count-legend">未用/已用/总数</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="batchStatusType(row.status)">{{ batchStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="导入时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewBatch(row.id)">详情</el-button>
            <el-button type="danger" size="small" link @click="invalidateBatch(row.id)">作废</el-button>
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

    <!-- 批次详情弹窗 -->
    <el-dialog v-model="detailVisible" title="批次详情" width="700px" destroy-on-close>
      <CardViewer :cards="batchCards" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable, formatDateTime, apiClient, CardViewer } from '@sup/shared'
import PageHeader from '@sup/shared/components/PageHeader.vue'
import StatCards from '@sup/shared/components/StatCards.vue'

interface CardBatch {
  id: number
  batchName: string
  goodsName: string
  goodsId: number
  totalCount: number
  usedCount: number
  unusedCount: number
  status: number
  createdAt: number
}

interface GoodsOption {
  id: number
  name: string
}

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange, handleSearch, handleReset } = useTable<CardBatch>('/admin/cards/batches')

const searchForm = reactive({
  goodsId: undefined as number | undefined,
  status: undefined as number | undefined,
})

const goodsOptions = ref<GoodsOption[]>([])
const detailVisible = ref(false)
const batchCards = ref<Array<{ content: string; password?: string }>>([])

const statsData = ref({ totalStock: 0, totalSold: 0, totalPending: 0 })

const statList = computed(() => [
  { label: '总库存', value: statsData.value.totalStock },
  { label: '已售出', value: statsData.value.totalSold },
  { label: '待发货', value: statsData.value.totalPending },
])

function batchStatusType(status: number): string {
  const map: Record<number, string> = { 0: 'success', 1: 'info', 2: 'danger' }
  return map[status] || 'info'
}

function batchStatusLabel(status: number): string {
  const map: Record<number, string> = { 0: '正常', 1: '已用完', 2: '已作废' }
  return map[status] || '未知'
}

function onSearch() {
  const params: Record<string, any> = {}
  if (searchForm.goodsId !== undefined) params.goodsId = searchForm.goodsId
  if (searchForm.status !== undefined) params.status = searchForm.status
  handleSearch(params)
}

function onReset() {
  searchForm.goodsId = undefined
  searchForm.status = undefined
  handleReset()
}

async function viewBatch(id: number) {
  try {
    const data = await apiClient.get(`/admin/cards/batches/${id}/cards`) as any
    batchCards.value = (data.list || []).map((c: any) => ({ content: c.content, password: c.password }))
    detailVisible.value = true
  } catch (e: any) {
    ElMessage.error(e.message || '获取批次详情失败')
  }
}

async function invalidateBatch(id: number) {
  try {
    await ElMessageBox.confirm('确定作废该批次？作废后所有未使用卡密将不可用', '确认作废', { type: 'warning' })
    await apiClient.post(`/admin/cards/batches/${id}/invalidate`)
    ElMessage.success('批次已作废')
    fetchData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

async function loadGoodsOptions() {
  try {
    const data = await apiClient.get('/admin/goods/options') as any
    goodsOptions.value = data || []
  } catch { /* ignore */ }
}

async function loadStats() {
  try {
    const data = await apiClient.get('/admin/cards/stats') as any
    statsData.value = data || { totalStock: 0, totalSold: 0, totalPending: 0 }
  } catch { /* ignore */ }
}

onMounted(() => {
  fetchData()
  loadGoodsOptions()
  loadStats()
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
.text-success { color: #67c23a; font-weight: bold; }
.text-warning { color: #e6a23c; font-weight: bold; }
.text-info { color: #909399; }
.count-legend { font-size: 11px; color: #c0c4cc; }
</style>
