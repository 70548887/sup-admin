<template>
  <div class="page-container">
    <PageHeader title="订单追踪" :subtitle="`订单号: ${orderSn}`">
      <template #actions>
        <el-button @click="$router.back()">返回订单列表</el-button>
      </template>
    </PageHeader>

    <!-- 订单基本信息 -->
    <el-card shadow="never" v-loading="loading">
      <template #header>订单信息</template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ order.orderSn }}</el-descriptions-item>
        <el-descriptions-item label="商品">{{ order.goodsName }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ order.buyNumber }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ formatDecimal(order.amount) }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="statusTagType(order.status)" size="default">
            {{ ORDER_STATUS[order.status] || '未知' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ formatDateTime(order.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 状态时间线 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <template #header>订单进度</template>
      <el-timeline v-if="statusHistory.length > 0">
        <el-timeline-item
          v-for="(item, index) in statusHistory"
          :key="index"
          :timestamp="formatDateTime(item.timestamp)"
          :type="getTimelineType(item.status)"
          :hollow="index !== 0"
          placement="top"
        >
          <div class="timeline-content">
            <el-tag :type="getTimelineType(item.status)" size="small">
              {{ ORDER_STATUS[item.status] || `状态${item.status}` }}
            </el-tag>
            <span v-if="item.note" class="timeline-note">{{ item.note }}</span>
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无状态记录" />
    </el-card>

    <!-- 卡密信息（已完成订单） -->
    <el-card v-if="order.status === 3 && cards.length > 0" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span>卡密信息</span>
          <el-button type="primary" size="small" plain @click="copyAllCards">一键复制全部</el-button>
        </div>
      </template>
      <el-table :data="cards" border stripe>
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column label="卡密内容" min-width="300">
          <template #default="{ row }">
            <code class="card-code">{{ row.content }}</code>
          </template>
        </el-table-column>
        <el-table-column v-if="hasPassword" label="密码" min-width="200">
          <template #default="{ row }">
            <code v-if="row.password" class="card-code">{{ row.password }}</code>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="copyCard(row)">复制</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { formatDateTime, formatDecimal, ORDER_STATUS, apiClient } from '@sup/shared'
import PageHeader from '@sup/shared/components/PageHeader.vue'

interface OrderInfo {
  orderSn: string
  goodsName: string
  buyNumber: number
  amount: string
  status: number
  createdAt: number
}

interface StatusRecord {
  status: number
  timestamp: number
  note: string
}

interface CardItem {
  content: string
  password?: string
}

const route = useRoute()
const orderSn = (route.params.orderSn || route.params.id || '') as string
const loading = ref(false)

const order = ref<OrderInfo>({
  orderSn: '', goodsName: '', buyNumber: 0, amount: '0', status: 0, createdAt: 0,
})
const statusHistory = ref<StatusRecord[]>([])
const cards = ref<CardItem[]>([])

const hasPassword = computed(() => cards.value.some((c) => c.password))

function statusTagType(status: number): string {
  const map: Record<number, string> = { 0: 'info', 1: 'warning', 2: '', 3: 'success', 4: 'info', 5: 'danger', 6: 'danger' }
  return map[status] || 'info'
}

function getTimelineType(status: number): '' | 'success' | 'warning' | 'info' | 'danger' | 'primary' {
  const map: Record<number, '' | 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    0: 'info', 1: 'primary', 2: 'primary', 3: 'success', 4: 'danger', 5: 'danger', 6: 'danger',
  }
  return map[status] ?? 'info'
}

async function copyCard(card: CardItem) {
  const text = card.password ? `${card.content}  密码: ${card.password}` : card.content
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

async function copyAllCards() {
  const text = cards.value
    .map((c, i) => {
      const parts = [`卡密${i + 1}: ${c.content}`]
      if (c.password) parts.push(`密码: ${c.password}`)
      return parts.join('  ')
    })
    .join('\n')
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`已复制 ${cards.value.length} 条卡密`)
  } catch {
    ElMessage.error('复制失败')
  }
}

async function loadOrder() {
  loading.value = true
  try {
    const data = await apiClient.get(`/customer/orders/${orderSn}/track`) as any
    order.value = data.order || data
    statusHistory.value = data.statusHistory || data.timeline || []
    cards.value = data.cards || []
  } catch (e: any) {
    console.error('loadOrder error:', e.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.timeline-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.timeline-note {
  font-size: 13px;
  color: #606266;
}
.card-code {
  font-family: 'Courier New', Courier, monospace;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  letter-spacing: 0.5px;
}
.text-muted {
  color: #909399;
}
</style>
