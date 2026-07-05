<template>
  <div class="page-container">
    <div class="page-header">
      <h2>编辑商品</h2>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <el-card v-loading="pageLoading" shadow="never" style="margin-top: 16px;">
      <!-- 审批状态 -->
      <el-alert
        v-if="goods.approvalStatus !== undefined"
        :title="approvalText"
        :type="approvalType"
        show-icon
        :closable="false"
        style="margin-bottom: 20px;"
      />

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        style="max-width: 700px;"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商品名称" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择分类" filterable clearable style="width: 100%;">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="售价" prop="price">
          <el-input-number v-model="formData.price" :precision="2" :min="0" :step="0.01" controls-position="right" style="width: 200px;" />
          <span class="form-suffix">元</span>
        </el-form-item>

        <el-form-item label="成本价" prop="costPrice">
          <el-input-number v-model="formData.costPrice" :precision="2" :min="0" :step="0.01" controls-position="right" style="width: 200px;" />
          <span class="form-suffix">元</span>
        </el-form-item>

        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="formData.stock" :min="0" :step="1" controls-position="right" style="width: 200px;" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" style="width: 200px;">
            <el-option v-for="(label, key) in GOODS_STATUS" :key="key" :label="label" :value="Number(key)" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入商品描述" maxlength="500" show-word-limit />
        </el-form-item>

        <!-- 审批操作（管理端特有） -->
        <el-form-item label="审批状态">
          <el-select v-model="formData.approvalStatus" style="width: 200px;">
            <el-option label="待审批" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="formData.approvalStatus === 2" label="拒绝原因">
          <el-input v-model="formData.rejectReason" type="textarea" :rows="2" placeholder="请输入拒绝原因" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存修改</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { apiClient, GOODS_STATUS } from '@sup/shared'

const route = useRoute()
const router = useRouter()
const goodsId = Number(route.params.id)
const pageLoading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

interface CategoryOption {
  id: number
  name: string
}

const categories = ref<CategoryOption[]>([])

const goods = reactive({
  approvalStatus: undefined as number | undefined,
})

const formData = reactive({
  name: '',
  categoryId: undefined as number | undefined,
  price: 0,
  costPrice: 0,
  stock: 0,
  status: 1,
  description: '',
  approvalStatus: 0,
  rejectReason: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur', type: 'number' }],
  costPrice: [{ required: true, message: '请输入成本价', trigger: 'blur', type: 'number' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur', type: 'number' }],
}

const approvalText = computed(() => {
  const map: Record<number, string> = { 0: '待审批', 1: '已通过', 2: '已拒绝' }
  return `审批状态：${map[goods.approvalStatus ?? 0] || '未知'}`
})

const approvalType = computed(() => {
  const map: Record<number, 'warning' | 'success' | 'error' | 'info'> = { 0: 'warning', 1: 'success', 2: 'error' }
  return map[goods.approvalStatus ?? 0] || 'info'
})

async function fetchCategories() {
  try {
    const data = await apiClient.get('/admin/categories') as any
    categories.value = (data?.list || data || []) as CategoryOption[]
  } catch (_) { /* ignore */ }
}

async function fetchDetail() {
  pageLoading.value = true
  try {
    const data = await apiClient.get(`/admin/goods/${goodsId}`) as any
    Object.assign(formData, {
      name: data.name || '',
      categoryId: data.categoryId,
      price: Number(data.price) || 0,
      costPrice: Number(data.costPrice) || 0,
      stock: data.stock || 0,
      status: data.status ?? 1,
      description: data.description || '',
      approvalStatus: data.approvalStatus ?? 0,
      rejectReason: data.rejectReason || '',
    })
    goods.approvalStatus = data.approvalStatus
  } catch (e: any) {
    ElMessage.error(e.message || '获取商品详情失败')
  } finally {
    pageLoading.value = false
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请完善表单信息')
    return
  }
  submitting.value = true
  try {
    await apiClient.put(`/admin/goods/${goodsId}`, {
      name: formData.name,
      categoryId: formData.categoryId,
      price: formData.price,
      costPrice: formData.costPrice,
      stock: formData.stock,
      status: formData.status,
      description: formData.description,
      approvalStatus: formData.approvalStatus,
      rejectReason: formData.rejectReason,
    })
    ElMessage.success('保存成功')
    router.push('/goods')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchDetail()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.form-suffix {
  margin-left: 8px;
  color: #909399;
}
</style>
