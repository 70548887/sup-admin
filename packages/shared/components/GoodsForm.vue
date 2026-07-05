<template>
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
      <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入商品描述" maxlength="500" show-word-limit />
    </el-form-item>

    <!-- 购买参数配置 -->
    <el-form-item label="购买参数配置">
      <div class="purchase-params">
        <div v-for="(param, index) in formData.purchaseParams" :key="index" class="param-row">
          <el-input v-model="param.key" placeholder="参数键名" style="width: 140px;" />
          <el-input v-model="param.label" placeholder="显示名称" style="width: 140px;" />
          <el-select v-model="param.required" style="width: 100px;">
            <el-option :value="true" label="必填" />
            <el-option :value="false" label="选填" />
          </el-select>
          <el-input v-model="param.placeholder" placeholder="输入提示语" style="flex: 1;" />
          <el-button type="danger" size="small" link @click="removeParam(index)">删除</el-button>
        </div>
        <el-button type="primary" size="small" plain @click="addParam">+ 添加参数</el-button>
      </div>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ mode === 'edit' ? '保存修改' : '创建商品' }}
      </el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { GOODS_STATUS } from '../constants'

/** 商品分类选项 */
interface CategoryOption {
  id: number
  name: string
}

/** 购买参数项 */
interface PurchaseParam {
  key: string
  label: string
  required: boolean
  placeholder: string
}

/** 商品表单数据 */
interface GoodsFormData {
  name: string
  categoryId: number | undefined
  price: number
  costPrice: number
  stock: number
  status: number
  description: string
  purchaseParams: PurchaseParam[]
}

const props = withDefaults(defineProps<{
  /** 编辑时传入的商品数据 */
  goods?: Partial<GoodsFormData> & { id?: number }
  /** 模式：新建或编辑 */
  mode: 'create' | 'edit'
  /** 分类列表 */
  categories?: CategoryOption[]
}>(), {
  goods: () => ({}),
  categories: () => [],
})

const emit = defineEmits<{
  (e: 'submit', data: GoodsFormData): void
  (e: 'cancel'): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const formData = reactive<GoodsFormData>({
  name: '',
  categoryId: undefined,
  price: 0,
  costPrice: 0,
  stock: 0,
  status: 1,
  description: '',
  purchaseParams: [],
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur', type: 'number' }],
  costPrice: [{ required: true, message: '请输入成本价', trigger: 'blur', type: 'number' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur', type: 'number' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 编辑模式下，回填商品数据
watch(
  () => props.goods,
  (val) => {
    if (val && props.mode === 'edit') {
      Object.assign(formData, {
        name: val.name ?? '',
        categoryId: val.categoryId,
        price: val.price ?? 0,
        costPrice: val.costPrice ?? 0,
        stock: val.stock ?? 0,
        status: val.status ?? 1,
        description: val.description ?? '',
        purchaseParams: val.purchaseParams ? [...val.purchaseParams] : [],
      })
    }
  },
  { immediate: true, deep: true },
)

function addParam() {
  formData.purchaseParams.push({
    key: '',
    label: '',
    required: false,
    placeholder: '',
  })
}

function removeParam(index: number) {
  formData.purchaseParams.splice(index, 1)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请完善表单信息')
    return
  }
  submitting.value = true
  emit('submit', { ...formData, purchaseParams: [...formData.purchaseParams] })
  submitting.value = false
}

function handleCancel() {
  formRef.value?.resetFields()
  emit('cancel')
}
</script>

<style scoped>
.form-suffix {
  margin-left: 8px;
  color: #909399;
}
.purchase-params {
  width: 100%;
}
.param-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
</style>
