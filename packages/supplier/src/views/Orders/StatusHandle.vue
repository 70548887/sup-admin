<template>
  <div class="order-handle">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">返回</el-button>
          <span>订单状态处理</span>
        </div>
      </template>

      <div v-if="order">
        <el-descriptions :column="2" border style="margin-bottom: 24px">
          <el-descriptions-item label="订单号">{{ order.orderSn }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="statusType(order.status)">{{ statusText(order.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品">{{ order.goodsName }}</el-descriptions-item>
          <el-descriptions-item label="金额">¥{{ formatDecimal(order.amount) }}</el-descriptions-item>
        </el-descriptions>

        <el-form label-width="100px" style="max-width: 500px">
          <el-form-item label="操作">
            <el-select v-model="nextStatus" placeholder="选择操作" style="width: 100%">
              <el-option v-for="opt in availableOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="remark" type="textarea" :rows="3" placeholder="可选备注" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submitting" :disabled="nextStatus === undefined" @click="handleSubmit">
              提交
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { formatDecimal } from '@sup/shared'
import { getOrderShow, orderStatusHandle, SUPPLIER_ORDER_STATUS, type SupplierOrder } from '@/api/orders'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const order = ref<SupplierOrder | null>(null)
const nextStatus = ref<number | undefined>(undefined)
const remark = ref('')

const availableOptions = computed(() => {
  if (!order.value) return []
  const status = order.value.status
  const options: { label: string; value: number }[] = []
  if (status === 1) {
    options.push({ label: '开始处理', value: 2 })
  }
  if (status === 2 || status === 3) {
    options.push({ label: '标记完成', value: 3 })
  }
  if (status === 1 || status === 2 || status === 3) {
    options.push({ label: '退款', value: 5 })
  }
  return options
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
    ElMessage.error(error.message || '获取订单信息失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (nextStatus.value === undefined || !order.value) return

  submitting.value = true
  try {
    await orderStatusHandle({
      orderSn: order.value.orderSn,
      status: nextStatus.value,
      remark: remark.value || undefined,
    })
    ElMessage.success('操作成功')
    router.push(`/orders/${order.value.orderSn}`)
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
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
