<template>
  <div class="page-container">
    <h2>价格计算预览</h2>
    <el-card shadow="never" style="margin-top: 16px; max-width: 600px;">
      <el-form :model="form" label-width="100px" @submit.prevent="handlePreview">
        <el-form-item label="商品ID">
          <el-input-number v-model="form.goodsId" :min="1" placeholder="请输入商品ID" />
        </el-form-item>
        <el-form-item label="客户ID">
          <el-input-number v-model="form.customerId" :min="0" placeholder="可选，为空则预览默认价格" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handlePreview" :loading="loading">计算预览</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="result" shadow="never" style="margin-top: 16px; max-width: 600px;">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="原始价格">¥{{ result.originalPrice }}</el-descriptions-item>
        <el-descriptions-item label="最终价格">¥{{ result.finalPrice }}</el-descriptions-item>
      </el-descriptions>
      <h4 style="margin-top: 16px;">应用的规则</h4>
      <el-table :data="result.appliedRules" border stripe size="small">
        <el-table-column prop="ruleId" label="规则ID" width="80" />
        <el-table-column prop="ruleName" label="规则名称" />
        <el-table-column prop="adjustment" label="调整金额" width="120">
          <template #default="{ row }">¥{{ row.adjustment }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { calcPricePreview } from '../../api/pricing'
import type { PricePreview } from '../../api/pricing'

const loading = ref(false)
const form = reactive({ goodsId: 1, customerId: 0 })
const result = ref<PricePreview | null>(null)

async function handlePreview() {
  if (!form.goodsId) { ElMessage.warning('请输入商品ID'); return }
  loading.value = true
  try {
    const data: { goodsId: number; customerId?: number } = { goodsId: form.goodsId }
    if (form.customerId) data.customerId = form.customerId
    result.value = await calcPricePreview(data)
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-container { padding: 20px; }
</style>
