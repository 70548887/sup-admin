<template>
  <div class="goods-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">返回</el-button>
          <span>商品详情</span>
        </div>
      </template>

      <div v-if="goods" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品名称">{{ goods.name }}</el-descriptions-item>
          <el-descriptions-item label="编号">{{ goods.serialNumber }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ goods.categoryName }}</el-descriptions-item>
          <el-descriptions-item label="价格">
            <span class="price">¥{{ goods.price }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="库存">{{ goods.stock }}</el-descriptions-item>
          <el-descriptions-item label="销量">{{ goods.salesCount }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ goods.description || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 购买表单 -->
        <el-divider>购买商品</el-divider>

        <el-form ref="formRef" :model="buyForm" label-width="120px" style="max-width: 600px">
          <!-- 动态参数 -->
          <el-form-item
            v-for="param in goods.buyParams"
            :key="param.key"
            :label="param.name"
            :prop="'params.' + param.key"
            :rules="param.required ? [{ required: true, message: `请输入${param.name}`, trigger: 'blur' }] : []"
          >
            <el-select v-if="param.type === 'select' && param.options" v-model="buyForm.params[param.key]" :placeholder="param.placeholder || `请选择${param.name}`">
              <el-option v-for="opt in param.options" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-input v-else v-model="buyForm.params[param.key]" :placeholder="param.placeholder || `请输入${param.name}`" />
          </el-form-item>

          <el-form-item label="购买数量">
            <el-input-number v-model="buyForm.buyNumber" :min="1" :max="goods.stock" />
          </el-form-item>

          <el-form-item label="总价">
            <span class="total-price">¥{{ totalPrice }}</span>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleBuy">
              确认购买
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 确认对话框 -->
    <el-dialog v-model="confirmVisible" title="确认购买" width="400px">
      <p>商品：{{ goods?.name }}</p>
      <p>单价：¥{{ goods?.price }}</p>
      <p>数量：{{ buyForm.buyNumber }}</p>
      <p><strong>总价：¥{{ totalPrice }}</strong></p>
      <template #footer>
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmBuy">确认支付</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getGoodsShow, buyGoods, type CustomerGoods } from '@/api/goods'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const confirmVisible = ref(false)
const goods = ref<CustomerGoods | null>(null)

const buyForm = reactive({
  buyNumber: 1,
  params: {} as Record<string, any>,
})

const totalPrice = computed(() => {
  if (!goods.value) return '0.00'
  const price = parseFloat(goods.value.price) || 0
  return (price * buyForm.buyNumber).toFixed(2)
})

async function fetchData() {
  const id = Number(route.params.id)
  if (!id) return

  loading.value = true
  try {
    goods.value = await getGoodsShow(id)
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品详情失败')
  } finally {
    loading.value = false
  }
}

async function handleBuy() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  confirmVisible.value = true
}

async function confirmBuy() {
  if (!goods.value) return

  submitting.value = true
  try {
    const res = await buyGoods({
      goodsId: goods.value.id,
      buyNumber: buyForm.buyNumber,
      buyParams: Object.keys(buyForm.params).length > 0 ? buyForm.params : undefined,
    })
    ElMessage.success(`购买成功！订单号: ${res.orderSn}`)
    confirmVisible.value = false
    router.push(`/orders/${res.orderId}`)
  } catch (error: any) {
    ElMessage.error(error.message || '购买失败')
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

.price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.total-price {
  font-size: 22px;
  font-weight: bold;
  color: #e6a23c;
}
</style>
