<template>
  <div class="page-container">
    <div class="page-header">
      <h2>结算详情</h2>
      <el-button @click="$router.back()">返回列表</el-button>
    </div>

    <!-- 结算单信息 -->
    <el-card v-loading="pageLoading" shadow="never" style="margin-top: 16px;">
      <el-descriptions title="结算单信息" :column="3" border>
        <el-descriptions-item label="结算单号">{{ detail.settlementSn }}</el-descriptions-item>
        <el-descriptions-item label="供货商">{{ detail.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(detail.status)">{{ statusText(detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="结算周期">{{ detail.periodStart }} ~ {{ detail.periodEnd }}</el-descriptions-item>
        <el-descriptions-item label="订单数量">{{ detail.orderCount }}</el-descriptions-item>
        <el-descriptions-item label="结算金额">
          <span class="amount">¥{{ formatDecimal(detail.amount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="结算时间">{{ detail.settledAt ? formatDateTime(detail.settledAt) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ detail.paidAt ? formatDateTime(detail.paidAt) : '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 金额明细 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <template #header>
        <span>金额明细</span>
      </template>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="商品总额">¥{{ formatDecimal(detail.goodsAmount) }}</el-descriptions-item>
        <el-descriptions-item label="平台服务费">¥{{ formatDecimal(detail.serviceFee) }}</el-descriptions-item>
        <el-descriptions-item label="退款扣除">¥{{ formatDecimal(detail.refundAmount) }}</el-descriptions-item>
        <el-descriptions-item label="实际结算">
          <span class="amount">¥{{ formatDecimal(detail.amount) }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 操作按钮 -->
    <el-card v-if="detail.status === 0 || detail.status === 1" shadow="never" style="margin-top: 16px;">
      <el-space>
        <el-button
          v-if="detail.status === 0"
          type="success"
          @click="handleConfirm"
        >确认结算</el-button>
        <el-button
          v-if="detail.status === 1"
          type="warning"
          @click="handlePay"
        >标记已支付</el-button>
        <el-button :icon="Download" @click="handleExport">导出明细</el-button>
      </el-space>
    </el-card>

    <!-- 订单列表 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <template #header>
        <span>关联订单（{{ orders.length }}）</span>
      </template>
      <el-table :data="orders" border stripe>
        <el-table-column prop="orderSn" label="订单号" width="180" />
        <el-table-column prop="goodsName" label="商品" min-width="150" />
        <el-table-column prop="buyNumber" label="数量" width="70" />
        <el-table-column prop="amount" label="金额" width="110">
          <template #default="{ row }">¥{{ formatDecimal(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag size="small">{{ ORDER_STATUS[row.status] || '未知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { apiClient, formatDateTime, formatDecimal, ORDER_STATUS } from '@sup/shared'

const route = useRoute()
const router = useRouter()
const settlementId = Number(route.params.id)
const pageLoading = ref(false)

const detail = reactive({
  settlementSn: '',
  supplierName: '',
  status: 0,
  periodStart: '',
  periodEnd: '',
  orderCount: 0,
  amount: '0',
  goodsAmount: '0',
  serviceFee: '0',
  refundAmount: '0',
  createdAt: 0,
  settledAt: 0,
  paidAt: 0,
})

const orders = ref<any[]>([])

function statusText(status: number): string {
  const map: Record<number, string> = { 0: '待结算', 1: '已结算', 2: '已支付' }
  return map[status] || '未知'
}

function statusType(status: number): string {
  const map: Record<number, string> = { 0: 'warning', 1: 'info', 2: 'success' }
  return map[status] || 'info'
}

async function fetchDetail() {
  pageLoading.value = true
  try {
    const data = await apiClient.get(`/admin/settlements/${settlementId}`) as any
    Object.assign(detail, {
      settlementSn: data.settlementSn || '',
      supplierName: data.supplierName || '',
      status: data.status ?? 0,
      periodStart: data.periodStart || '',
      periodEnd: data.periodEnd || '',
      orderCount: data.orderCount || 0,
      amount: data.amount || '0',
      goodsAmount: data.goodsAmount || '0',
      serviceFee: data.serviceFee || '0',
      refundAmount: data.refundAmount || '0',
      createdAt: data.createdAt || 0,
      settledAt: data.settledAt || 0,
      paidAt: data.paidAt || 0,
    })
    orders.value = data.orders || []
  } catch (e: any) {
    ElMessage.error(e.message || '获取结算详情失败')
  } finally {
    pageLoading.value = false
  }
}

async function handleConfirm() {
  try {
    await ElMessageBox.confirm('确定确认此结算单吗？', '确认结算', { type: 'warning' })
    await apiClient.post(`/admin/settlements/${settlementId}/confirm`)
    ElMessage.success('结算确认成功')
    fetchDetail()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

async function handlePay() {
  try {
    await ElMessageBox.confirm('确定标记为已支付吗？', '标记支付', { type: 'warning' })
    await apiClient.post(`/admin/settlements/${settlementId}/pay`)
    ElMessage.success('标记支付成功')
    fetchDetail()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

function handleExport() {
  if (!orders.value.length) {
    ElMessage.warning('暂无订单数据可导出')
    return
  }
  const headers = ['订单号', '商品', '数量', '金额', '状态', '下单时间']
  const rows = orders.value.map(row => [
    row.orderSn,
    row.goodsName,
    row.buyNumber,
    row.amount,
    ORDER_STATUS[row.status] || '未知',
    row.createdAt ? new Date(row.createdAt * 1000).toLocaleString('zh-CN') : '-',
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `结算明细_${detail.settlementSn}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.amount {
  font-weight: bold;
  color: #f56c6c;
  font-size: 16px;
}
</style>
