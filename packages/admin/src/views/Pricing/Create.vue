<template>
  <div class="page-container">
    <h2>{{ isEdit ? '编辑定价规则' : '新建定价规则' }}</h2>
    <el-card shadow="never" style="margin-top: 16px; max-width: 700px;">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option value="markup" label="加价" />
            <el-option value="discount" label="折扣" />
            <el-option value="fixed" label="固定价" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户分组" prop="customerGroupId">
          <el-select v-model="form.customerGroupId" placeholder="全部客户" clearable>
            <el-option v-for="g in groups" :key="g.id" :value="g.id" :label="g.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="调整方式" prop="adjustType">
          <el-radio-group v-model="form.adjustType">
            <el-radio value="percentage">百分比</el-radio>
            <el-radio value="fixed">固定值</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整值" prop="adjustValue">
          <el-input-number v-model="form.adjustValue" :min="-100" :max="10000" :step="0.01" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="form.priority" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
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
import { createPricingRule, updatePricingRule, getPricingRules } from '../../api/pricing'
import { getCustomerGroups } from '../../api/customerGroups'
import type { CustomerGroup } from '../../api/customerGroups'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const groups = ref<CustomerGroup[]>([])

const form = reactive({
  name: '',
  type: '',
  customerGroupId: undefined as number | undefined,
  adjustType: 'percentage' as 'percentage' | 'fixed',
  adjustValue: 0,
  priority: 1,
  status: 1,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  adjustType: [{ required: true, message: '请选择调整方式', trigger: 'change' }],
  adjustValue: [{ required: true, message: '请输入调整值', trigger: 'blur' }],
}

async function loadGroups() {
  try {
    const res = await getCustomerGroups({ size: 100 })
    groups.value = res.list || []
  } catch (e) { /* ignore */ }
}

async function loadRule() {
  if (!route.params.id) return
  try {
    const res = await getPricingRules({ id: route.params.id })
    if (res.list && res.list.length > 0) {
      const rule = res.list[0]
      Object.assign(form, { name: rule.name, type: rule.type, customerGroupId: rule.customerGroupId, adjustType: rule.adjustType, adjustValue: rule.adjustValue, priority: rule.priority, status: rule.status })
    }
  } catch (e) { /* ignore */ }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (isEdit.value) {
      await updatePricingRule(Number(route.params.id), form)
    } else {
      await createPricingRule(form)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    router.push('/pricing')
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    submitting.value = false
  }
}

onMounted(() => { loadGroups(); loadRule() })
</script>

<style scoped>
.page-container { padding: 20px; }
</style>
