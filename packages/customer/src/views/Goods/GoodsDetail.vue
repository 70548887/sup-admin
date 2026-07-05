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
          <el-descriptions-item label="库存">
            <el-tag :type="stockTagType">{{ stockText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="销量">{{ goods.salesCount }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ goods.description || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>购买商品</el-divider>

        <el-form ref="formRef" :model="buyForm" label-width="120px" style="max-width: 600px;">
          <el-form-item
            v-for="param in goods.buyParams"
            :key="param.key"
            :label="param.name"
            :prop="'params.' + param.key"
            :rules="param.required ? [{ required: true, message: `请输入${param.name}`, trigger: 'blur' }] : []"
          >
            <el-select
              v-if="param.type === 'select' && param.options"
              v-model="buyForm.params[param.key]"
              :placeholder="param.placeholder || `请选择${param.name}`"
              style="width: 100%;"
            >
              <el-option v-for="opt in param.options" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-input
              v-else
              v-model="buyForm.params[param.key]"
              :placeholder="param.placeholder || `请输入${param.name}`"
            />
          </el-form-item>

          <el-form-item label="购买数量">
            <el-input-number v-model="buyForm.buyNumber" :min="1" :max="maxBuyNumber" />
          </el-form-item>

          <el-form-item label="总价">
            <span class="total-price">¥{{ totalPrice }}</span>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" @click="handleBuy">
              立即购买
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getGoodsShow, type CustomerGoods } from '@/api/goods'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
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

const maxBuyNumber = computed(() => {
  if (!goods.value) return 1
  return Math.max(1, goods.value.stock)
})

const stockTagType = computed(() => {
  if (!goods.value) return 'info'
  if (goods.value.stock <= 0) return 'danger'
  if (goods.value.stock < 10) return 'warning'
  return 'success'
})

const stockText = computed(() => {
  if (!goods.value) return '-'
  if (goods.value.stock <= 0) return '无货'
  return goods.value.stock.toString()
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

  if (!goods.value || goods.value.stock <= 0) {
    ElMessage.warning('商品库存不足')
    return
  }

  router.push({
    path: '/order/create',
    query: {
      goodsId: goods.value.id.toString(),
      buyNumber: buyForm.buyNumber.toString(),
      params: encodeURIComponent(JSON.stringify(buyForm.params)),
    },
  })
}

onMounted(fetchData)
</script>

<style scoped>
.goods-detail {
  padding: 0;
}

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
