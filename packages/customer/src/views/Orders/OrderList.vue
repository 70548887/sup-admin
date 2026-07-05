<template>
  <div class="order-list">
    <el-card>
      <template #header>
        <span>我的订单</span>
      </template>

      <!-- 状态标签筛选 -->
      <el-tabs v-model="activeStatus" type="card" @tab-change="handleTabChange">
        <el-tab-pane label="全部" :name="undefined" />
        <el-tab-pane label="待处理" :name="0" />
        <el-tab-pane label="处理中" :name="2" />
        <el-tab-pane label="已完成" :name="3" />
        <el-tab-pane label="已退款" :name="5" />
      </el-tabs>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderSn"
            placeholder="请输入订单号"
            clearable
            style="width: 240px;"
            @keyup.enter="fetchData"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 订单表格 -->
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="orderSn" label="订单号" min-width="180" />
        <el-table-column prop="goodsName" label="商品名" min-width="160" show-overflow-tooltip />
        <el-table-column prop="buyNumber" label="数量" width="80" align="center" />
        <el-table-column prop="amount" label="金额" width="110" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ formatDecimal(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="170" align="center">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="goDetail(row.id)">
              详情
            </el-button>
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ORDER_STATUS, formatDateTime, formatDecimal } from '@sup/shared'
import { getOrderList, type CustomerOrder } from '@/api/orders'

const router = useRouter()
const loading = ref(false)
const tableData = ref<CustomerOrder[]>([])

const activeStatus = ref<number | undefined>(undefined)

const searchForm = reactive({
  orderSn: '',
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

function statusText(status: number): string {
  return ORDER_STATUS[status] || '未知'
}

function statusType(status: number): '' | 'success' | 'warning' | 'info' | 'danger' | 'primary' {
  const map: Record<number, '' | 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    0: 'warning',
    1: 'info',
    2: 'primary',
    3: 'success',
    4: 'info',
    5: 'danger',
    6: 'danger',
  }
  return map[status] ?? 'info'
}

function handleTabChange() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  activeStatus.value = undefined
  searchForm.orderSn = ''
  pagination.page = 1
  fetchData()
}

async function fetchData() {
  loading.value = true
  try {
    const status = activeStatus.value
    const res = await getOrderList({
      page: pagination.page,
      size: pagination.size,
      orderSn: searchForm.orderSn || undefined,
      status: typeof status === 'number' ? status : undefined,
    })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单列表失败')
  } finally {
    loading.value = false
  }
}

function goDetail(id: number) {
  router.push(`/orders/${id}`)
}

onMounted(fetchData)
</script>

<style scoped>
.order-list {
  padding: 0;
}
.search-form {
  margin-bottom: 16px;
}
.amount {
  font-weight: 600;
  color: #f56c6c;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
