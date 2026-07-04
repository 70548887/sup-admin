<template>
  <div class="page-container">
    <h2>订单管理</h2>
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
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="orderSn" label="订单号" width="180" />
        <el-table-column prop="goodsName" label="商品" min-width="180" />
        <el-table-column prop="buyNumber" label="数量" width="80" />
        <el-table-column prop="amount" label="总额" width="110">
          <template #default="{ row }">¥{{ formatDecimal(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag>{{ ORDER_STATUS[row.status] || '未知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="$router.push(`/orders/${row.id}`)">详情</el-button>
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
import { useTable, formatDateTime, formatDecimal, ORDER_STATUS } from '@sup/shared'
import type { Order } from '@sup/shared'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange, handleSearch, handleReset } = useTable<Order>('/tenant-admin/orders')

const searchForm = reactive({
  orderSn: '',
  status: undefined as number | undefined,
})

function onSearch() {
  const params: Record<string, any> = {}
  if (searchForm.orderSn) params.orderSn = searchForm.orderSn
  if (searchForm.status !== undefined && searchForm.status !== null) params.status = searchForm.status
  handleSearch(params)
}

function onReset() {
  searchForm.orderSn = ''
  searchForm.status = undefined
  handleReset()
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-container { padding: 20px; }
.search-card { margin-top: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
