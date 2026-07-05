<template>
  <div class="page-container">
    <h2>订单管理</h2>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" @submit.prevent="onSearch">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderSn" placeholder="搜索订单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option v-for="(label, key) in ORDER_STATUS" :key="key" :label="label" :value="Number(key)" />
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
          <el-button type="warning" :icon="Download" @click="handleExport">导出订单</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="orderSn" label="订单号" width="180" />
        <el-table-column prop="goodsName" label="商品" min-width="180" />
        <el-table-column prop="buyNumber" label="数量" width="80" />
        <el-table-column prop="unitPrice" label="单价" width="100">
          <template #default="{ row }">¥{{ formatDecimal(row.unitPrice) }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="总额" width="110">
          <template #default="{ row }">¥{{ formatDecimal(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ ORDER_STATUS[row.status] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="goDetail(row.id)">详情</el-button>
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
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTable, formatDateTime, formatDecimal, ORDER_STATUS } from '@sup/shared'
import type { Order } from '@sup/shared'

const router = useRouter()
const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange, handleSearch, handleReset } = useTable<Order>('/admin/orders')

const searchForm = reactive({
  orderSn: '',
  status: undefined as number | undefined,
  dateRange: null as [string, string] | null,
})

function statusTagType(status: number): string {
  const map: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: '',
    3: 'success',
    4: 'info',
    5: 'danger',
    6: 'danger',
  }
  return map[status] || 'info'
}

function onSearch() {
  const params: Record<string, any> = {}
  if (searchForm.orderSn) params.orderSn = searchForm.orderSn
  if (searchForm.status !== undefined && searchForm.status !== null) params.status = searchForm.status
  if (searchForm.dateRange) {
    params.startTime = searchForm.dateRange[0]
    params.endTime = searchForm.dateRange[1]
  }
  handleSearch(params)
}

function onReset() {
  searchForm.orderSn = ''
  searchForm.status = undefined
  searchForm.dateRange = null
  handleReset()
}

function goDetail(id: number) {
  router.push(`/orders/${id}`)
}

function exportCSV(data: any[], filename: string) {
  if (!data.length) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function handleExport() {
  exportCSV(tableData.value, '订单列表')
}

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
