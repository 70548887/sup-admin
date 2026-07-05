<template>
  <div class="page-container">
    <h2>结算管理</h2>

    <!-- 汇总统计 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">结算单总数</div>
          <div class="stat-value">{{ stats.total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">总金额</div>
          <div class="stat-value">¥{{ formatDecimal(stats.totalAmount) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">待结算金额</div>
          <div class="stat-value warning">¥{{ formatDecimal(stats.pendingAmount) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">已支付金额</div>
          <div class="stat-value success">¥{{ formatDecimal(stats.paidAmount) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" @submit.prevent="onSearch">
        <el-form-item label="供货商">
          <el-input v-model="searchForm.supplierName" placeholder="搜索供货商" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="待结算" :value="0" />
            <el-option label="已结算" :value="1" />
            <el-option label="已支付" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
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
        <el-table-column prop="settlementSn" label="结算单号" width="180" />
        <el-table-column prop="supplierName" label="供货商" min-width="150" />
        <el-table-column prop="periodStart" label="结算周期" width="200">
          <template #default="{ row }">
            {{ row.periodStart }} ~ {{ row.periodEnd }}
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="90" />
        <el-table-column prop="amount" label="结算金额" width="120">
          <template #default="{ row }">¥{{ formatDecimal(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="settlementStatusType(row.status)">
              {{ settlementStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="goDetail(row.id)">详情</el-button>
            <el-button
              v-if="row.status === 0"
              type="success"
              size="small"
              link
              @click="handleConfirm(row)"
            >确认结算</el-button>
            <el-button
              v-if="row.status === 1"
              type="warning"
              size="small"
              link
              @click="handlePay(row)"
            >标记已支付</el-button>
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
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable, apiClient, formatDateTime, formatDecimal } from '@sup/shared'

const router = useRouter()

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange, handleSearch, handleReset } = useTable('/admin/settlements')

const stats = reactive({
  total: 0,
  totalAmount: '0',
  pendingAmount: '0',
  paidAmount: '0',
})

const searchForm = reactive({
  supplierName: '',
  status: undefined as number | undefined,
  dateRange: null as [string, string] | null,
})

function settlementStatusText(status: number): string {
  const map: Record<number, string> = { 0: '待结算', 1: '已结算', 2: '已支付' }
  return map[status] || '未知'
}

function settlementStatusType(status: number): string {
  const map: Record<number, string> = { 0: 'warning', 1: 'info', 2: 'success' }
  return map[status] || 'info'
}

function onSearch() {
  const params: Record<string, any> = {}
  if (searchForm.supplierName) params.supplierName = searchForm.supplierName
  if (searchForm.status !== undefined && searchForm.status !== null) params.status = searchForm.status
  if (searchForm.dateRange) {
    params.startDate = searchForm.dateRange[0]
    params.endDate = searchForm.dateRange[1]
  }
  handleSearch(params)
}

function onReset() {
  searchForm.supplierName = ''
  searchForm.status = undefined
  searchForm.dateRange = null
  handleReset()
}

function goDetail(id: number) {
  router.push(`/settlement/${id}`)
}

async function handleConfirm(row: any) {
  try {
    await ElMessageBox.confirm(`确定确认结算单 "${row.settlementSn}" 吗？`, '确认结算', { type: 'warning' })
    await apiClient.post(`/admin/settlements/${row.id}/confirm`)
    ElMessage.success('结算确认成功')
    fetchData()
    fetchStats()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

async function handlePay(row: any) {
  try {
    await ElMessageBox.confirm(`确定标记结算单 "${row.settlementSn}" 为已支付吗？`, '标记支付', { type: 'warning' })
    await apiClient.post(`/admin/settlements/${row.id}/pay`)
    ElMessage.success('标记支付成功')
    fetchData()
    fetchStats()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

async function fetchStats() {
  try {
    const data = await apiClient.get('/admin/settlements/stats') as any
    Object.assign(stats, {
      total: data.total || 0,
      totalAmount: data.totalAmount || '0',
      pendingAmount: data.pendingAmount || '0',
      paidAmount: data.paidAmount || '0',
    })
  } catch (_) { /* ignore */ }
}

onMounted(() => {
  fetchData()
  fetchStats()
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
.stat-card {
  text-align: center;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
.stat-value.warning {
  color: #e6a23c;
}
.stat-value.success {
  color: #67c23a;
}
</style>
