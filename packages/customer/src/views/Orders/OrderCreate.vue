<template>
  <div class="order-create">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">返回</el-button>
          <span>确认下单</span>
        </div>
      </template>

      <el-alert
        v-if="!goodsId || !buyNumber"
        title="参数错误，请重新选择商品"
        type="error"
        :closable="false"
      />

      <template v-else>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品名称">{{ goods?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="商品编号">{{ goods?.serialNumber || '-' }}</el-descriptions-item>
          <el-descriptions-item label="单价">
            <span class="price">¥{{ goods?.price || '0.00' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="购买数量">{{ buyNumber }}</el-descriptions-item>
          <el-descriptions-item label="总价" :span="2">
            <span class="total-price">¥{{ totalPrice }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="Object.keys(buyParams).length > 0" style="margin-top: 20px;">
          <h4>购买参数</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item
              v-for="(value, key) in buyParams"
              :key="key"
              :label="String(key)"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="actions">
          <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
            确认下单
          </el-button>
          <el-button size="large" @click="$router.push('/goods')">返回商品列表</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getGoodsShow, buyGoods, type CustomerGoods } from '@/api/goods'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const goods = ref<CustomerGoods | null>(null)

const goodsId = computed(() => {
  const id = Number(route.query.goodsId)
  return isNaN(id) || id <= 0 ? 0 : id
})

const buyNumber = computed(() => {
  const num = Number(route.query.buyNumber)
  return isNaN(num) || num <= 0 ? 1 : num
})

const buyParams = computed<Record<string, any>>(() => {
  const raw = route.query.params
  if (!raw || typeof raw !== 'string') return {}
  try {
    return JSON.parse(decodeURIComponent(raw)) || {}
  } catch {
    return {}
  }
})

const totalPrice = computed(() => {
  const price = parseFloat(goods.value?.price || '0') || 0
  return (price * buyNumber.value).toFixed(2)
})

async function fetchGoods() {
  if (!goodsId.value) return
  loading.value = true
  try {
    goods.value = await getGoodsShow(goodsId.value)
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品信息失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!goodsId.value || !buyNumber.value) {
    ElMessage.warning('参数错误，请重新选择商品')
    return
  }

  submitting.value = true
  try {
    const res = await buyGoods({
      goodsId: goodsId.value,
      buyNumber: buyNumber.value,
      buyParams: Object.keys(buyParams.value).length > 0 ? buyParams.value : undefined,
    })
    ElMessage.success('下单成功，请完成支付')
    router.push(`/order/pay/${res.orderSn}`)
  } catch (error: any) {
    ElMessage.error(error.message || '下单失败')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchGoods)
</script>

<style scoped>
.order-create {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.total-price {
  font-size: 22px;
  font-weight: bold;
  color: #e6a23c;
}

.actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}
</style>
