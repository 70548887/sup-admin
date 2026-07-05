<template>
  <div class="page-container">
    <PageHeader title="供货商管理" subtitle="管理平台供货商账号及其商品供货情况" />

    <!-- 统计卡片 -->
    <StatCards :stats="statList" />

    <!-- 搜索 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" @submit.prevent="onSearch">
        <el-form-item label="供货商名称">
          <el-input v-model="searchForm.name" placeholder="搜索名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column prop="goodsCount" label="商品数" width="90" align="center" />
        <el-table-column prop="orderCount" label="订单数" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="goDetail(row.id)">详情</el-button>
            <el-button
              :type="row.status === 1 ? 'danger' : 'success'"
              size="small"
              link
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable, formatDateTime, apiClient } from '@sup/shared'
import PageHeader from '@sup/shared/components/PageHeader.vue'
import StatCards from '@sup/shared/components/StatCards.vue'

interface Supplier {
  id: number
  name: string
  contactName: string
  contactPhone: string
  goodsCount: number
  orderCount: number
  status: number
  createdAt: number
}

const router = useRouter()
const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange, handleSearch, handleReset } = useTable<Supplier>('/admin/suppliers')

const searchForm = reactive({
  name: '',
  status: undefined as number | undefined,
})

const statsData = ref({ activeCount: 0, totalGoods: 0, totalOrders: 0 })

const statList = computed(() => [
  { label: '活跃供货商', value: statsData.value.activeCount },
  { label: '总商品数', value: statsData.value.totalGoods },
  { label: '总订单数', value: statsData.value.totalOrders },
])

function onSearch() {
  const params: Record<string, any> = {}
  if (searchForm.name) params.name = searchForm.name
  if (searchForm.status !== undefined) params.status = searchForm.status
  handleSearch(params)
}

function onReset() {
  searchForm.name = ''
  searchForm.status = undefined
  handleReset()
}

function goDetail(id: number) {
  router.push(`/suppliers/${id}`)
}

async function toggleStatus(row: Supplier) {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${action}供货商「${row.name}」？`, `确认${action}`, { type: 'warning' })
    await apiClient.post(`/admin/suppliers/${row.id}/toggle-status`, { status: row.status === 1 ? 0 : 1 })
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

async function loadStats() {
  try {
    const data = await apiClient.get('/admin/suppliers/stats') as any
    statsData.value = data || { activeCount: 0, totalGoods: 0, totalOrders: 0 }
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
.search-card {
  margin-top: 16px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
