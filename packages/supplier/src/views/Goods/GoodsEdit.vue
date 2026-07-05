<template>
  <div class="goods-edit">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="handleBack">返回</el-button>
          <span>{{ mode === 'create' ? '新建商品' : '编辑商品' }}</span>
        </div>
      </template>

      <GoodsForm
        :mode="mode"
        :goods="goodsData"
        :categories="categories"
        @submit="handleSubmit"
        @cancel="handleBack"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { GoodsForm } from '@sup/shared'
import { getGoodsShow, editGoods, createGoods, type SupplierGoods, type BuyParam } from '@/api/goods'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const goodsSn = ref('')
const categories = ref<{ id: number; name: string }[]>([])

/** 模式：通过路由名称区分新建/编辑 */
const mode = computed<'create' | 'edit'>(() => {
  return route.name === 'GoodsCreate' ? 'create' : 'edit'
})

/** 传给 GoodsForm 的商品数据（需映射为组件期望的 camelCase 格式） */
const goodsData = ref<Record<string, any>>({})

/** 将后端返回的 buy_params 映射为 GoodsForm 的 purchaseParams 格式 */
function mapBuyParams(buyParams: any[]): BuyParam[] {
  if (!Array.isArray(buyParams)) return []
  return buyParams.map((p) => ({
    key: p.key || p.name || '',
    label: p.label || p.name || '',
    required: !!p.required,
    placeholder: p.placeholder || p.default || '',
    type: p.type,
  }))
}

/** 编辑模式：加载商品数据并映射给 GoodsForm */
async function loadData() {
  if (mode.value !== 'edit') return

  const sn = route.params.id as string
  if (!sn) return

  goodsSn.value = sn
  loading.value = true
  try {
    const goods: SupplierGoods = await getGoodsShow(sn)
    // 映射后端 snake_case → GoodsForm 期望的 camelCase
    goodsData.value = {
      id: goods.id,
      name: goods.name,
      price: parseFloat(goods.price) || 0,
      stock: goods.stock,
      status: goods.status,
      description: goods.description || '',
      purchaseParams: mapBuyParams(goods.buy_params),
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品信息失败')
  } finally {
    loading.value = false
  }
}

/** 提交表单：根据模式调用创建或编辑 API */
async function handleSubmit(formData: any) {
  loading.value = true
  try {
    if (mode.value === 'create') {
      await createGoods({
        name: formData.name,
        price: String(formData.price),
        stock: formData.stock,
        status: formData.status,
        description: formData.description,
        buy_params: formData.purchaseParams,
      })
      ElMessage.success('创建成功')
    } else {
      await editGoods({
        goods_sn: goodsSn.value,
        price: String(formData.price),
        is_close: formData.status === 0,
      })
      ElMessage.success('保存成功')
    }
    router.push('/goods')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

function handleBack() {
  router.back()
}

onMounted(loadData)
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
