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
        <el-descriptions-item label="商品ID">{{ order.goodsId }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ order.buyNumber }}</el-descriptions-item>
        <el-descriptions-item label="单价">¥{{ order.unitPrice }}</el-descriptions-item>
        <el-descriptions-item label="总金额">
          <span class="amount">¥{{ order.amount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(order.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(order.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ order.remark || '无' }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="order?.buyParams && Object.keys(order.buyParams).length" style="margin-top: 20px">
        <h4>购买参数</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="(value, key) in order.buyParams" :key="key" :label="String(key)">
            {{ value }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 状态操作 -->
      <div v-if="order && order.status === 0" style="margin-top: 24px">
        <el-divider />
        <el-button type="danger" :loading="cancelling" @click="handleCancel">取消订单</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderShow, orderStatusHandle, type CustomerOrder } from '@/api/orders'

const route = useRoute()
const loading = ref(false)
const cancelling = ref(false)
const order = ref<CustomerOrder | null>(null)

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
  const id = Number(route.params.id)
  if (!id) return

  loading.value = true
  try {
    order.value = await getOrderShow(id)
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单详情失败')
  } finally {
    loading.value = false
  }
}

async function handleCancel() {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '确认取消', { type: 'warning' })
  } catch {
    return
  }

  const id = Number(route.params.id)
  cancelling.value = true
  try {
    await orderStatusHandle({ id, status: 4 })
    ElMessage.success('订单已取消')
    await fetchData()
  } catch (error: any) {
    ElMessage.error(error.message || '取消失败')
  } finally {
    cancelling.value = false
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

.amount {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}
</style>
