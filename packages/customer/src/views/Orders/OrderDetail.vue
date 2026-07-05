<template>
  <div class="order-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">返回</el-button>
          <span>订单详情</span>
        </div>
      </template>

      <template v-if="order">
        <!-- 订单基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ order.orderSn }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(order.status)" size="small">
              {{ statusText(order.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品名">{{ order.goodsName }}</el-descriptions-item>
          <el-descriptions-item label="商品ID">{{ order.goodsId }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ order.buyNumber }}</el-descriptions-item>
          <el-descriptions-item label="单价">
            <span>¥{{ formatDecimal(order.unitPrice) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="金额">
            <span class="amount">¥{{ formatDecimal(order.amount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(order.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDateTime(order.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ order.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 购买参数 -->
        <div v-if="hasBuyParams" class="section">
          <h4 class="section-title">购买参数</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item
              v-for="(value, key) in order.buyParams"
              :key="key"
              :label="String(key)"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 状态流转 -->
        <div class="section">
          <h4 class="section-title">状态流转</h4>
          <OrderTimeline :status-changes="statusChanges" />
        </div>

        <!-- 卡密信息 -->
        <div v-if="showCards" class="section">
          <h4 class="section-title">卡密信息</h4>
          <CardViewer :cards="cards" />
        </div>

        <!-- 操作 -->
        <div v-if="canRefund" class="section actions">
          <el-divider />
          <el-button type="danger" :loading="refunding" @click="handleRefund">
            申请退款
          </el-button>
        </div>
      </template>

      <el-empty v-else description="订单不存在或已删除" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ORDER_STATUS, formatDateTime, formatDecimal, OrderTimeline, CardViewer } from '@sup/shared'
import { getOrderShow, orderStatusHandle, type CustomerOrder } from '@/api/orders'

interface StatusChange {
  status: number
  timestamp: number
  operator: string
  note: string
}

interface CardItem {
  content: string
  password?: string
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const refunding = ref(false)
const order = ref<CustomerOrder | null>(null)

const orderId = computed(() => Number(route.params.id))

const hasBuyParams = computed(() => {
  return order.value?.buyParams && Object.keys(order.value.buyParams).length > 0
})

const showCards = computed(() => order.value?.status === 3 && cards.value.length > 0)

const canRefund = computed(() => {
  if (!order.value) return false
  return [0, 1, 2, 4].includes(order.value.status)
})

const cards = computed<CardItem[]>(() => {
  const payload = (order.value as any)?.fulfillment?.payload
  if (!payload || typeof payload !== 'string') return []
  return parseCards(payload)
})

const statusChanges = computed<StatusChange[]>(() => {
  if (!order.value) return []

  const backendChanges = (order.value as any)?.statusChanges as StatusChange[] | undefined
  if (backendChanges && backendChanges.length > 0) {
    return backendChanges
  }

  // 根据当前状态构造基础流转记录
  const changes: StatusChange[] = [
    { status: 0, timestamp: order.value.createdAt, operator: '系统', note: '订单创建' },
  ]

  const { status, updatedAt } = order.value
  if (status >= 1 && status !== 4) {
    changes.push({ status: 1, timestamp: updatedAt, operator: '系统', note: '订单已支付' })
  }
  if (status >= 2 && status !== 4) {
    changes.push({ status: 2, timestamp: updatedAt, operator: '系统', note: '订单处理中' })
  }
  if (status === 3) {
    changes.push({ status: 3, timestamp: updatedAt, operator: '系统', note: '订单已完成' })
  }
  if (status === 4) {
    changes.push({ status: 4, timestamp: updatedAt, operator: '系统', note: '订单已取消' })
  }
  if (status === 5) {
    changes.push({ status: 5, timestamp: updatedAt, operator: '系统', note: '订单已退款' })
  }
  if (status === 6) {
    changes.push({ status: 6, timestamp: updatedAt, operator: '系统', note: '订单部分退款' })
  }

  return changes
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

function parseCards(payload: string): CardItem[] {
  return payload
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const separators = ['----', '——', '\t', ':', '：']
      for (const sep of separators) {
        const idx = line.indexOf(sep)
        if (idx > 0) {
          return {
            content: line.slice(0, idx).trim(),
            password: line.slice(idx + sep.length).trim(),
          }
        }
      }
      const spaceIdx = line.indexOf(' ')
      if (spaceIdx > 0 && line.length > spaceIdx + 1) {
        return {
          content: line.slice(0, spaceIdx).trim(),
          password: line.slice(spaceIdx + 1).trim(),
        }
      }
      return { content: line }
    })
}

async function fetchData() {
  const id = orderId.value
  if (!id) {
    router.replace('/orders')
    return
  }

  loading.value = true
  try {
    order.value = await getOrderShow(id)
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单详情失败')
  } finally {
    loading.value = false
  }
}

async function handleRefund() {
  let reason = ''
  try {
    const { value } = await ElMessageBox.prompt('请输入退款原因', '申请退款', {
      confirmButtonText: '提交',
      cancelButtonText: '取消',
      inputValidator: (val) => (val?.trim() ? true : '请输入退款原因'),
    })
    reason = value.trim()
  } catch {
    return
  }

  refunding.value = true
  try {
    await orderStatusHandle({ id: orderId.value, status: 5, remark: reason })
    ElMessage.success('退款申请已提交')
    await fetchData()
  } catch (error: any) {
    ElMessage.error(error.message || '申请退款失败')
  } finally {
    refunding.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.order-detail {
  padding: 0;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.section {
  margin-top: 24px;
}
.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.amount {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}
.actions {
  display: flex;
  justify-content: center;
}
</style>
