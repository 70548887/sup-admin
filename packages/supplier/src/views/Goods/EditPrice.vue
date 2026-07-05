<template>
  <div class="goods-edit-price">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">返回</el-button>
          <span>编辑价格</span>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 500px">
        <el-form-item label="商品名称">
          <span>{{ goodsName }}</span>
        </el-form-item>
        <el-form-item label="当前售价">
          <span class="current-price">¥{{ currentPrice }}</span>
        </el-form-item>
        <el-form-item label="新售价" prop="price">
          <el-input v-model="form.price" placeholder="请输入新售价">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存价格</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { formatDecimal } from '@sup/shared'
import { getGoodsShow, editGoodsPrice } from '@/api/goods'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const currentPrice = ref('0.00')
const goodsName = ref('')
const goodsSn = ref('')

const form = reactive({
  price: '',
})

const rules: FormRules = {
  price: [{ required: true, message: '请输入新售价', trigger: 'blur' }],
}

async function fetchData() {
  const sn = route.params.id as string
  if (!sn) return

  goodsSn.value = sn
  loading.value = true
  try {
    const goods = await getGoodsShow(sn)
    goodsName.value = goods.name
    currentPrice.value = formatDecimal(goods.price)
    form.price = goods.price
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品信息失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await editGoodsPrice({
      goods_sn: goodsSn.value,
      price: form.price,
    })
    ElMessage.success('价格更新成功')
    router.push(`/goods/${goodsSn.value}`)
  } catch (error: any) {
    ElMessage.error(error.message || '保存价格失败')
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
.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #e6a23c;
}
</style>
