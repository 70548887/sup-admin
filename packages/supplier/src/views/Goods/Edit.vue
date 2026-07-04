<template>
  <div class="goods-edit">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">返回</el-button>
          <span>编辑商品</span>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
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
import { getGoodsShow, editGoods } from '@/api/goods'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  name: '',
  description: '',
  stock: 0,
  status: 1,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
}

async function fetchData() {
  const id = Number(route.params.id)
  if (!id) return

  loading.value = true
  try {
    const goods = await getGoodsShow(id)
    form.name = goods.name
    form.description = goods.description || ''
    form.stock = goods.stock
    form.status = goods.status
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品信息失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const id = Number(route.params.id)
  submitting.value = true
  try {
    await editGoods({
      id,
      name: form.name,
      description: form.description,
      stock: form.stock,
      status: form.status,
    })
    ElMessage.success('保存成功')
    router.push(`/goods/${id}`)
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
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
