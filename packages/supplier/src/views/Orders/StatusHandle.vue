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
          <el-descriptions-item label="金额">¥{{ order.amount }}</el-descriptions-item>
        </el-descriptions>

        <el-form label-width="100px" style="max-width: 500px">
          <el-form-item label="操作">
            <el-select v-model="nextStatus" placeholder="选择操作">
              <el-option v-if="order.status === 0" label="确认订单" :value="1" />
              <el-option v-if="order.status <= 1" label="标记发货" :value="2" />
              <el-option v-if="order.status <= 2" label="标记完成" :value="3" />
              <el-option label="取消订单" :value="4" />
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderShow, orderStatusHandle, type SupplierOrder } from '@/api/orders'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const order = ref<SupplierOrder | null>(null)
const nextStatus = ref<number | undefined>(undefined)
const remark = ref('')

function statusText(status: number): string {
  const map: Record<number, string> = { 0: '待确认', 1: '已确认', 2: '已发货', 3: '已完成', 4: '已取消' }
  return map[status] || '未知'
}

function statusType(status: number): string {
  const map: Record<number, string> = { 0: 'warning', 1: 'primary', 2: 'info', 3: 'success', 4: 'danger' }
  return map[status] || 'info'
}

async function fetchData() {
  const id = Number(route.params.id)
  if (!id) return

  loading.value = true
  try {
    order.value = await getOrderShow(id)
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单信息失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (nextStatus.value === undefined) return

  const id = Number(route.params.id)
  submitting.value = true
  try {
    await orderStatusHandle({
      id,
      status: nextStatus.value,
      remark: remark.value || undefined,
    })
    ElMessage.success('操作成功')
    router.push(`/orders/${id}`)
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
