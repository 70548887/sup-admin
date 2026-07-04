<template>
  <div class="page-container">
    <div class="page-header">
      <el-button @click="$router.back()">返回</el-button>
      <h2 style="margin-left: 16px;">订单详情</h2>
    </div>

    <el-card v-loading="loading" shadow="never" style="margin-top: 16px;">
      <el-descriptions title="订单信息" :column="2" border>
        <el-descriptions-item label="订单号">{{ detail.orderSn }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detail.status)">
            {{ ORDER_STATUS[detail.status] || '未知' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="商品">{{ detail.goodsName }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ detail.buyNumber }}</el-descriptions-item>
        <el-descriptions-item label="单价">¥{{ formatDecimal(detail.unitPrice) }}</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ formatDecimal(detail.amount) }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ detail.customerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ detail.supplierName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ detail.paymentMethod || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detail.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ formatDateTime(detail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ formatDateTime(detail.paidAt) }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ formatDateTime(detail.completedAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(detail.updatedAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 状态变更操作 -->
    <el-card v-if="canChangeStatus" shadow="never" style="margin-top: 16px;">
      <template #header>状态变更</template>
      <el-space>
        <el-button
          v-if="detail.status === 1"
          type="primary"
          @click="handleChangeStatus(2)"
        >开始处理</el-button>
        <el-button
          v-if="detail.status === 2"
          type="success"
          @click="handleChangeStatus(3)"
        >标记完成</el-button>
        <el-button
          v-if="detail.status === 0 || detail.status === 1"
          type="danger"
          @click="handleChangeStatus(4)"
        >取消订单</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime, formatDecimal, ORDER_STATUS } from '@sup/shared'
import { getOrderDetail, updateOrderStatus } from '../../api/orders'
import type { OrderDetail } from '../../api/orders'

const route = useRoute()
const loading = ref(false)
const detail = ref<OrderDetail>({
  id: 0,
  tenantId: 0,
  orderSn: '',
  customerId: 0,
  supplierId: 0,
  goodsId: 0,
  goodsName: '',
  status: 0,
  amount: '0',
  buyNumber: 0,
  unitPrice: '0',
  createdAt: 0,
  updatedAt: 0,
  customerName: '',
  supplierName: '',
  paymentMethod: '',
  paidAt: 0,
  completedAt: 0,
  remark: '',
})

const canChangeStatus = computed(() => {
  return [0, 1, 2].includes(detail.value.status)
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

async function loadDetail() {
  const id = Number(route.params.id)
  if (!id) return
  loading.value = true
  try {
    detail.value = await getOrderDetail(id)
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function handleChangeStatus(status: number) {
  const statusName = ORDER_STATUS[status] || '未知'
  try {
    await ElMessageBox.confirm(`确定要将订单状态变更为 "${statusName}" 吗？`, '确认操作', {
      type: 'warning',
    })
    await updateOrderStatus(detail.value.id, status)
    ElMessage.success('状态变更成功')
    loadDetail()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '操作失败')
    }
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.page-header {
  display: flex;
  align-items: center;
}
</style>
