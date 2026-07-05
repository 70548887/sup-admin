<template>
  <el-drawer
    :model-value="visible"
    title="订单详情"
    size="600px"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div v-loading="loading" class="drawer-content">
      <template v-if="order">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ order.orderSn }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(order.status)">{{ statusText(order.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品">{{ order.goodsName }}</el-descriptions-item>
          <el-descriptions-item label="商品编号">{{ order.goodsSn }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ order.buyNumber }}</el-descriptions-item>
          <el-descriptions-item label="单价">¥{{ formatDecimal(order.unitPrice) }}</el-descriptions-item>
          <el-descriptions-item label="总金额">¥{{ formatDecimal(order.amount) }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ order.customerName || order.customerSn || '-' }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ formatDateTime(order.paidAt) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(order.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ order.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="order.buyParams && Object.keys(order.buyParams).length" class="section">
          <h4>购买参数</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item v-for="(value, key) in order.buyParams" :key="key" :label="String(key)">
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="section">
          <h4>操作</h4>
          <el-space>
            <el-button
              v-if="order.status === 1"
              type="primary"
              :loading="actionLoading"
              @click="handleAction(2, '开始处理')"
            >
              处理订单
            </el-button>
            <el-button
              v-if="order.status === 2 || order.status === 3"
              type="success"
              :loading="actionLoading"
              @click="handleAction(3, '标记完成')"
            >
              标记完成
            </el-button>
            <el-button
              v-if="order.status === 1 || order.status === 2 || order.status === 3"
              type="danger"
              :loading="actionLoading"
              @click="handleAction(5, '退款')"
            >
              退款
            </el-button>
            <el-button type="primary" plain @click="goSchedule">
              进度处理
            </el-button>
          </el-space>
        </div>

        <div v-if="mappedStatusChanges.length" class="section">
          <h4>状态流转历史</h4>
          <OrderTimeline :status-changes="mappedStatusChanges" />
        </div>

        <div v-if="order.cards?.length" class="section">
          <h4>已发卡密</h4>
          <CardViewer :cards="order.cards" />
        </div>
      </template>

      <el-empty v-else description="未加载到订单信息" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime, formatDecimal, OrderTimeline, CardViewer } from '@sup/shared'
import {
  getOrderShow,
  orderStatusHandle,
  SUPPLIER_ORDER_STATUS,
  mapSupplierStatusToShared,
  type SupplierOrderDetail,
  type OrderStatusChangeItem,
} from '@/api/orders'

const props = defineProps<{
  visible: boolean
  orderSn?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'refresh'): void
}>()

const router = useRouter()
const loading = ref(false)
const actionLoading = ref(false)
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

function handleClose() {
  emit('update:visible', false)
}

function goSchedule() {
  if (!order.value) return
  handleClose()
  router.push(`/orders/${order.value.orderSn}/schedule`)
}

async function loadDetail() {
  if (!props.orderSn) {
    order.value = null
    return
  }
  loading.value = true
  try {
    order.value = await getOrderShow(props.orderSn)
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单详情失败')
  } finally {
    loading.value = false
  }
}

async function handleAction(status: number, actionName: string) {
  if (!order.value) return
  try {
    await ElMessageBox.confirm(`确定要对该订单执行 "${actionName}" 操作吗？`, '确认操作', {
      type: 'warning',
    })
    actionLoading.value = true
    await orderStatusHandle({
      orderSn: order.value.orderSn,
      status,
    })
    ElMessage.success('操作成功')
    emit('refresh')
    await loadDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    actionLoading.value = false
  }
}

watch(
  () => [props.visible, props.orderSn],
  ([visible]) => {
    if (visible) {
      loadDetail()
    } else {
      order.value = null
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.drawer-content {
  padding: 0 8px 16px;
}
.section {
  margin-top: 24px;
}
.section h4 {
  margin-bottom: 12px;
  color: #303133;
  font-weight: 600;
}
</style>
