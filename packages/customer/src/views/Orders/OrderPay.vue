<template>
  <div class="order-pay">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">返回</el-button>
          <span>订单支付</span>
        </div>
      </template>

      <el-alert
        v-if="!orderSn"
        title="订单号错误"
        type="error"
        :closable="false"
      />

      <template v-else-if="order">
        <el-result
          :icon="resultIcon"
          :title="resultTitle"
          :sub-title="`订单号：${order.orderSn}`"
        />

        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusType(order.status)">{{ statusText(order.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatTime(order.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="商品">{{ order.goodsName }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ order.buyNumber }}</el-descriptions-item>
          <el-descriptions-item label="单价">¥{{ order.unitPrice }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span class="amount">¥{{ order.amount }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 余额支付 -->
        <div v-if="isPending" class="pay-section">
          <el-divider>余额支付</el-divider>
          <div class="balance-info">
            <span>当前余额：</span>
            <span class="balance" :class="{ 'insufficient': !hasEnoughBalance }">¥{{ balance }}</span>
          </div>
          <el-alert
            v-if="!hasEnoughBalance"
            title="余额不足，请先充值"
            type="warning"
            :closable="false"
            style="margin-bottom: 16px;"
          />
          <el-button
            type="primary"
            size="large"
            :loading="paying"
            :disabled="!hasEnoughBalance"
            @click="handlePay"
          >
            确认扣款支付
          </el-button>
        </div>

        <!-- 卡密信息 -->
        <div v-if="showCards" class="cards-section">
          <el-divider>卡密信息</el-divider>
          <CardViewer :cards="cards" />
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <el-button type="primary" @click="$router.push(`/orders/${order.id}`)">
            查看订单详情
          </el-button>
          <el-button @click="$router.push('/goods')">继续购买</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CardViewer } from '@sup/shared'
import { getOrderShowBySn, type CustomerOrder } from '@/api/orders'
import { getAccountShow, type CustomerAccount } from '@/api/account'

interface CardItem {
  content: string
  password?: string
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const paying = ref(false)
const order = ref<CustomerOrder | null>(null)
const account = ref<CustomerAccount | null>(null)

const orderSn = computed(() => {
  const sn = route.params.orderSn
  return typeof sn === 'string' ? sn : ''
})

const balance = computed(() => {
  return account.value?.balance || '0.00'
})

const balanceNum = computed(() => parseFloat(balance.value) || 0)
const amountNum = computed(() => parseFloat(order.value?.amount || '0') || 0)
const hasEnoughBalance = computed(() => balanceNum.value >= amountNum.value)

const pendingStatuses = new Set(['0', 'pending_payment'])
const paidStatuses = new Set(['1', '2', '3', 'paid', 'fulfilling', 'delivered', 'completed'])

const orderStatus = computed(() => String(order.value?.status))

const isPending = computed(() => {
  if (!order.value) return false
  return pendingStatuses.has(orderStatus.value)
})

const isPaid = computed(() => {
  if (!order.value) return false
  return paidStatuses.has(orderStatus.value)
})

const resultIcon = computed(() => (isPaid.value ? 'success' : isPending.value ? 'warning' : 'info'))
const resultTitle = computed(() => {
  if (isPaid.value) return '支付成功'
  if (isPending.value) return '等待支付'
  return statusText(order.value?.status)
})

const showCards = computed(() => isPaid.value && cards.value.length > 0)

const cards = computed<CardItem[]>(() => {
  const payload = (order.value as any)?.fulfillment?.payload
  if (!payload || typeof payload !== 'string') return []
  return parseCards(payload)
})

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
      // 空格分隔作为最后尝试，避免误拆
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

function statusText(status: number | string | undefined): string {
  const map: Record<string, string> = {
    '0': '待确认',
    '1': '已确认',
    '2': '已发货',
    '3': '已完成',
    '4': '已取消',
    pending_payment: '待支付',
    paid: '已支付',
    fulfilling: '发货中',
    delivered: '已发货',
    completed: '已完成',
    canceled: '已取消',
  }
  return map[String(status)] || '未知'
}

function statusType(status: number | string): string {
  const map: Record<string, string> = {
    '0': 'warning',
    '1': 'primary',
    '2': 'info',
    '3': 'success',
    '4': 'danger',
    pending_payment: 'warning',
    paid: 'success',
    fulfilling: 'info',
    delivered: 'info',
    completed: 'success',
    canceled: 'danger',
  }
  return map[String(status)] || 'info'
}

function formatTime(ts: number | string | undefined): string {
  if (!ts) return '-'
  if (typeof ts === 'string') return ts
  return new Date(ts * 1000).toLocaleString('zh-CN')
}

async function fetchOrder() {
  if (!orderSn.value) return
  loading.value = true
  try {
    order.value = await getOrderShowBySn(orderSn.value)
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单信息失败')
  } finally {
    loading.value = false
  }
}

async function fetchAccount() {
  try {
    account.value = await getAccountShow()
  } catch (_) {
    // 余额获取失败不影响支付页面展示
  }
}

async function handlePay() {
  if (!hasEnoughBalance.value) {
    ElMessage.warning('余额不足，请先充值')
    return
  }

  paying.value = true
  try {
    // 当前 customer openapi 暂无独立余额支付接口，
    // 下单后刷新订单状态以获取最新支付结果与卡密。
    await fetchOrder()
    if (isPaid.value) {
      ElMessage.success('支付成功')
    } else {
      ElMessage.info('订单尚未支付完成，请稍后刷新或联系客服')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '支付查询失败')
  } finally {
    paying.value = false
  }
}

onMounted(() => {
  fetchOrder()
  fetchAccount()
})
</script>

<style scoped>
.order-pay {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.pay-section {
  margin-top: 24px;
  text-align: center;
}

.balance-info {
  margin-bottom: 16px;
  font-size: 16px;
}

.balance {
  font-size: 20px;
  font-weight: bold;
  color: #67c23a;
}

.balance.insufficient {
  color: #f56c6c;
}

.cards-section {
  margin-top: 24px;
}

.actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
