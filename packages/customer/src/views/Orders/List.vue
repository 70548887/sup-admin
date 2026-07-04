<template>
  <div class="orders-list">
    <el-card>
      <template #header>
        <span>我的订单</span>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderSn" placeholder="搜索订单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="待确认" :value="0" />
            <el-option label="已确认" :value="1" />
            <el-option label="已发货" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">搜索</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="orderSn" label="订单号" width="180" />
        <el-table-column prop="goodsName" label="商品" min-width="150" />
        <el-table-column prop="buyNumber" label="数量" width="70" />
        <el-table-column prop="unitPrice" label="单价" width="90" />
        <el-table-column prop="amount" label="总额" width="100" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push(`/orders/${row.id}`)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrderList, type CustomerOrder } from '@/api/orders'

const loading = ref(false)
const tableData = ref<CustomerOrder[]>([])

const searchForm = reactive({
  orderSn: '',
  status: undefined as number | undefined,
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

function statusText(status: number): string {
  const map: Record<number, string> = { 0: '待确认', 1: '已确认', 2: '已发货', 3: '已完成', 4: '已取消' }
  return map[status] || '未知'
}

function statusType(status: number): string {
  const map: Record<number, string> = { 0: 'warning', 1: 'primary', 2: 'info', 3: 'success', 4: 'danger' }
  return map[status] || 'info'
}

function formatTime(ts: number): string {
  if (!ts) return '-'
  return new Date(ts * 1000).toLocaleString('zh-CN')
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getOrderList({
      page: pagination.page,
      size: pagination.size,
      orderSn: searchForm.orderSn || undefined,
      status: searchForm.status,
    })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.search-form {
  margin-bottom: 16px;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
