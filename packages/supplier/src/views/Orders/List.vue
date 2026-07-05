<template>
  <div class="orders-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent="onSearch">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderSn" placeholder="搜索订单号" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="客户">
          <el-input v-model="searchForm.customerName" placeholder="搜索客户" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px;">
            <el-option
              v-for="opt in SUPPLIER_ORDER_STATUS_FILTER"
              :key="String(opt.value)"
              :label="opt.label"
              :value="opt.value"
            />
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

      <!-- 批量操作栏 -->
      <div v-if="selectedRows.length" class="batch-bar">
        <span>已选择 {{ selectedRows.length }} 项</span>
        <el-button size="small" type="primary" :loading="batchLoading" @click="handleBatchStatus(2)">
          批量处理
        </el-button>
        <el-button size="small" type="success" :loading="batchLoading" @click="handleBatchStatus(3)">
          批量发货
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="45" />
        <el-table-column prop="orderSn" label="订单号" width="180" />
        <el-table-column prop="goodsName" label="商品" min-width="150" />
        <el-table-column prop="customerName" label="客户" min-width="120">
          <template #default="{ row }">{{ row.customerName || row.customerSn || '-' }}</template>
        </el-table-column>
        <el-table-column prop="buyNumber" label="数量" width="70" />
        <el-table-column prop="unitPrice" label="单价" width="90">
          <template #default="{ row }">¥{{ formatDecimal(row.unitPrice) }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="总额" width="100">
          <template #default="{ row }">¥{{ formatDecimal(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="openDetail(row.orderSn)">查看详情</el-button>
            <el-button size="small" link type="primary" @click="goHandle(row.orderSn)">处理</el-button>
            <el-button size="small" link type="warning" @click="goSchedule(row.orderSn)">进度</el-button>
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
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </el-card>

    <!-- 抽屉详情 -->
    <OrderDetail v-model:visible="detailVisible" :order-sn="detailOrderSn" @refresh="fetchData" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime, formatDecimal } from '@sup/shared'
import {
  getOrderPaging,
  orderStatusHandle,
  SUPPLIER_ORDER_STATUS,
  SUPPLIER_ORDER_STATUS_FILTER,
  type SupplierOrder,
} from '@/api/orders'
import OrderDetail from './OrderDetail.vue'

const router = useRouter()
const loading = ref(false)
const batchLoading = ref(false)
const tableData = ref<SupplierOrder[]>([])
const selectedRows = ref<SupplierOrder[]>([])

const searchForm = reactive({
  orderSn: '',
  customerName: '',
  status: undefined as number | undefined,
  dateRange: null as [string, string] | null,
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const detailVisible = ref(false)
const detailOrderSn = ref('')

function statusText(status: number): string {
  return SUPPLIER_ORDER_STATUS[status] || '未知'
}

function statusType(status: number): string {
  const map: Record<number, string> = {
    1: 'warning',
    2: 'info',
    3: 'primary',
    4: 'info',
    5: 'info',
    6: 'success',
    7: 'danger',
    8: 'danger',
    9: 'danger',
  }
  return map[status] || 'info'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getOrderPaging({
      page: pagination.page,
      size: pagination.size,
      orderSn: searchForm.orderSn || undefined,
      customerName: searchForm.customerName || undefined,
      status: searchForm.status,
      startTime: searchForm.dateRange ? Number(searchForm.dateRange[0]) : undefined,
      endTime: searchForm.dateRange ? Number(searchForm.dateRange[1]) : undefined,
    })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单列表失败')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  pagination.page = 1
  fetchData()
}

function onReset() {
  searchForm.orderSn = ''
  searchForm.customerName = ''
  searchForm.status = undefined
  searchForm.dateRange = null
  pagination.page = 1
  fetchData()
}

function handleSelectionChange(rows: SupplierOrder[]) {
  selectedRows.value = rows
}

async function handleBatchStatus(status: number) {
  if (!selectedRows.value.length) return
  const action = status === 2 ? '批量处理' : '批量发货'
  try {
    await ElMessageBox.confirm(
      `确定要对选中的 ${selectedRows.value.length} 个订单执行"${action}"吗？`,
      '确认操作',
      { type: 'warning' },
    )
    batchLoading.value = true
    const promises = selectedRows.value.map((row) =>
      orderStatusHandle({ orderSn: row.orderSn, status }),
    )
    await Promise.all(promises)
    ElMessage.success(`${action}成功`)
    selectedRows.value = []
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量操作失败')
    }
  } finally {
    batchLoading.value = false
  }
}

function openDetail(orderSn: string) {
  detailOrderSn.value = orderSn
  detailVisible.value = true
}

function goHandle(orderSn: string) {
  router.push(`/orders/${orderSn}/handle`)
}

function goSchedule(orderSn: string) {
  router.push(`/orders/${orderSn}/schedule`)
}

onMounted(fetchData)
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.search-form {
  margin-bottom: 16px;
}
.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 4px;
  font-size: 14px;
  color: #409eff;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
