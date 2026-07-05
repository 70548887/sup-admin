<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>申请退款</span>
      </template>

      <!-- 选择订单 -->
      <div v-if="!selectedOrder" class="order-select-section">
        <el-alert
          title="请选择需要退款的订单"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 16px;"
        />

        <el-table :data="refundableOrders" v-loading="loadingOrders" border stripe>
          <el-table-column prop="orderSn" label="订单号" width="180" />
          <el-table-column prop="goodsName" label="商品" min-width="150" />
          <el-table-column prop="buyNumber" label="数量" width="70" />
          <el-table-column prop="amount" label="金额" width="100" />
          <el-table-column prop="createdAt" label="下单时间" width="170">
            <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="selectOrder(row)">选择</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loadingOrders && refundableOrders.length === 0" description="暂无可退款订单" />
      </div>

      <!-- 退款表单 -->
      <div v-else class="refund-form-section">
        <el-descriptions :column="2" border style="margin-bottom: 24px;">
          <el-descriptions-item label="订单号">{{ selectedOrder.orderSn }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ selectedOrder.goodsName }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ selectedOrder.amount }}</el-descriptions-item>
          <el-descriptions-item label="购买数量">{{ selectedOrder.buyNumber }}</el-descriptions-item>
        </el-descriptions>

        <el-form
          ref="refundFormRef"
          :model="refundForm"
          :rules="refundRules"
          label-width="100px"
          style="max-width: 600px;"
        >
          <el-form-item label="退款原因" prop="reason">
            <el-select v-model="refundForm.reason" placeholder="请选择退款原因" style="width: 100%;">
              <el-option label="商品质量问题" value="商品质量问题" />
              <el-option label="发货延迟" value="发货延迟" />
              <el-option label="商品与描述不符" value="商品与描述不符" />
              <el-option label="买错了/不想要了" value="买错了/不想要了" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>

          <el-form-item label="详细说明" prop="description">
            <el-input
              v-model="refundForm.description"
              type="textarea"
              :rows="4"
              placeholder="请详细描述退款原因"
              maxlength="300"
              show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">提交退款申请</el-button>
            <el-button @click="cancelSelect">重新选择订单</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 退款进度 -->
    <el-card v-if="refundRecords.length > 0" shadow="never" style="margin-top: 16px;">
      <template #header>
        <span>我的退款记录</span>
      </template>
      <el-table :data="refundRecords" border stripe>
        <el-table-column prop="orderSn" label="订单号" width="180" />
        <el-table-column prop="goodsName" label="商品" min-width="150" />
        <el-table-column prop="amount" label="退款金额" width="100" />
        <el-table-column prop="reason" label="退款原因" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="refundStatusType(row.status)">{{ refundStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="处理备注" min-width="150" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getOrderList, type CustomerOrder } from '@/api/orders'
import { customerClient } from '@/api/client'

const loadingOrders = ref(false)
const submitting = ref(false)
const refundFormRef = ref<FormInstance>()
const refundableOrders = ref<CustomerOrder[]>([])
const selectedOrder = ref<CustomerOrder | null>(null)
const refundRecords = ref<any[]>([])

const refundForm = reactive({
  reason: '',
  description: '',
})

const refundRules: FormRules = {
  reason: [{ required: true, message: '请选择退款原因', trigger: 'change' }],
  description: [{ required: true, message: '请填写详细说明', trigger: 'blur' }],
}

function formatTime(ts: number): string {
  if (!ts) return '-'
  return new Date(ts * 1000).toLocaleString('zh-CN')
}

function refundStatusText(status: number): string {
  const map: Record<number, string> = { 0: '待处理', 1: '已同意', 2: '已拒绝', 3: '已退款' }
  return map[status] || '未知'
}

function refundStatusType(status: number): string {
  const map: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'info' }
  return map[status] || 'info'
}

function selectOrder(order: CustomerOrder) {
  selectedOrder.value = order
}

function cancelSelect() {
  selectedOrder.value = null
  refundForm.reason = ''
  refundForm.description = ''
}

async function fetchRefundableOrders() {
  loadingOrders.value = true
  try {
    // 获取已完成/已支付的订单（可退款状态）
    const res = await getOrderList({ page: 1, size: 50, status: 3 })
    refundableOrders.value = res.list || []
  } catch (e: any) {
    ElMessage.error(e.message || '获取订单列表失败')
  } finally {
    loadingOrders.value = false
  }
}

async function fetchRefundRecords() {
  try {
    const data = await customerClient.post('/openapi/customer/Refund/List', { page: 1, size: 20 }) as any
    refundRecords.value = data?.list || data || []
  } catch (_) { /* ignore */ }
}

async function handleSubmit() {
  const valid = await refundFormRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!selectedOrder.value) return

  submitting.value = true
  try {
    await customerClient.post('/openapi/customer/Refund/Apply', {
      orderId: selectedOrder.value.id,
      reason: refundForm.reason,
      description: refundForm.description,
    })
    ElMessage.success('退款申请提交成功')
    cancelSelect()
    fetchRefundableOrders()
    fetchRefundRecords()
  } catch (e: any) {
    ElMessage.error(e.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchRefundableOrders()
  fetchRefundRecords()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
