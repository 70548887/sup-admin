<template>
  <div class="order-schedule">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">返回</el-button>
          <span>订单进度处理</span>
        </div>
      </template>

      <div v-if="order">
        <el-descriptions :column="2" border style="margin-bottom: 24px">
          <el-descriptions-item label="订单号">{{ order.orderSn }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="statusType(order.status)">{{ statusText(order.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品">{{ order.goodsName }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ order.buyNumber }}</el-descriptions-item>
          <el-descriptions-item label="总金额">¥{{ formatDecimal(order.amount) }}</el-descriptions-item>
          <el-descriptions-item label="当前进度">
            {{ order.callbackCurrentNum }} / {{ order.callbackStartNum }}
          </el-descriptions-item>
        </el-descriptions>

        <el-progress
          v-if="order.callbackStartNum > 0"
          :percentage="Math.round((order.callbackCurrentNum / order.callbackStartNum) * 100)"
          :status="progressStatus"
          style="margin-bottom: 24px"
        />

        <el-form :model="form" label-width="100px" style="max-width: 600px">
          <el-form-item label="状态更新">
            <el-select v-model="form.status" placeholder="选择要变更的状态" clearable style="width: 100%">
              <el-option
                v-for="opt in availableStatusOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="总进度">
            <el-input-number v-model="form.callbackStartNum" :min="0" />
          </el-form-item>
          <el-form-item label="当前进度">
            <el-input-number v-model="form.callbackCurrentNum" :min="0" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选备注" />
          </el-form-item>
          <el-form-item label="附件">
            <el-upload
              action="#"
              :auto-upload="false"
              :limit="3"
              :file-list="fileList"
              @change="handleFileChange"
            >
              <el-button type="primary" plain>选择文件</el-button>
              <template #tip>
                <div class="upload-tip">仅做前端展示，实际交付请通过备注说明</div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">提交更新</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-empty v-else description="未加载到订单信息" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { formatDecimal } from '@sup/shared'
import type { UploadFile } from 'element-plus'
import {
  getOrderShow,
  orderStatusHandle,
  orderScheduleHandle,
  SUPPLIER_ORDER_STATUS,
  type SupplierOrder,
} from '@/api/orders'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const order = ref<SupplierOrder | null>(null)
const fileList = ref<UploadFile[]>([])

const form = ref({
  status: undefined as number | undefined,
  callbackStartNum: 0,
  callbackCurrentNum: 0,
  remark: '',
})

const availableStatusOptions = computed(() => {
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

const progressStatus = computed(() => {
  if (!order.value || order.value.callbackStartNum === 0) return ''
  if (order.value.callbackCurrentNum >= order.value.callbackStartNum) return 'success'
  return ''
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

function handleFileChange(file: UploadFile) {
  fileList.value.push(file)
}

async function fetchData() {
  const orderSn = route.params.orderSn as string
  if (!orderSn) return

  loading.value = true
  try {
    order.value = await getOrderShow(orderSn)
    form.value.callbackStartNum = order.value.callbackStartNum || 0
    form.value.callbackCurrentNum = order.value.callbackCurrentNum || 0
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单信息失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!order.value) return

  submitting.value = true
  try {
    const tasks: Promise<void>[] = []

    if (form.value.status !== undefined) {
      tasks.push(
        orderStatusHandle({
          orderSn: order.value.orderSn,
          status: form.value.status,
          remark: form.value.remark || undefined,
        }),
      )
    }

    tasks.push(
      orderScheduleHandle({
        orderSn: order.value.orderSn,
        callbackStartNum: form.value.callbackStartNum,
        callbackCurrentNum: form.value.callbackCurrentNum,
      }),
    )

    await Promise.all(tasks)
    ElMessage.success('进度更新成功')
    form.value.status = undefined
    await fetchData()
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
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
.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
