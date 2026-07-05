<template>
  <div class="order-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">返回</el-button>
          <span>订单详情</span>
        </div>
      </template>

      <el-descriptions v-if="order" :column="2" border>
        <el-descriptions-item label="订单号">{{ order.orderSn }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(order.status)">{{ statusText(order.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="商品">{{ order.goodsName }}</el-descriptions-item>
        <el-descriptions-item label="商品编号">{{ order.goodsSn }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ order.buyNumber }}</el-descriptions-item>
        <el-descriptions-item label="单价">¥{{ formatDecimal(order.unitPrice) }}</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ formatDecimal(order.amount) }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ order.customerName || order.customerSn }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(order.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(order.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ order.remark || '无' }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="order?.buyParams && Object.keys(order.buyParams).length" style="margin-top: 20px">
        <h4>购买参数</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="(value, key) in order.buyParams" :key="key" :label="String(key)">
            {{ value }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-if="order?.statusChanges?.length" style="margin-top: 20px">
        <h4>状态流转</h4>
        <OrderTimeline :status-changes="mappedStatusChanges" />
      </div>

      <div v-if="order?.cards?.length" style="margin-top: 20px">
        <h4>已发卡密</h4>
        <CardViewer :cards="order.cards" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { formatDateTime, formatDecimal, OrderTimeline, CardViewer } from '@sup/shared'
import {
  getOrderShow,
  SUPPLIER_ORDER_STATUS,
  mapSupplierStatusToShared,
  type SupplierOrderDetail,
  type OrderStatusChangeItem,
} from '@/api/orders'

const route = useRoute()
const loading = ref(false)
const order = ref<SupplierOrderDetail | null>(null)

const mappedStatusChanges = computed(() => {
  if (!order.value?.statusChanges) return []
  return order.value.statusChanges.map((item: OrderStatusChangeItem) => ({
    ...item,
    status: mapSupplierStatusToShared(item.status),
  }))
})

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
  const orderSn = route.params.orderSn as string
  if (!orderSn) return

  loading.value = true
  try {
    order.value = await getOrderShow(orderSn)
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
