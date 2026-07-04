<template>
  <div class="page-container">
    <h2>套餐管理</h2>
    <el-card shadow="never" class="search-card">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="showCreate = true">新建套餐</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="套餐名称" min-width="140" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="billingCycle" label="计费周期" width="100">
          <template #default="{ row }">{{ row.billingCycle === 'monthly' ? '月付' : '年付' }}</template>
        </el-table-column>
        <el-table-column prop="maxOrders" label="订单上限" width="100" />
        <el-table-column prop="maxGoods" label="商品上限" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" v-model:current-page="pagination.page" v-model:page-size="pagination.size" :total="pagination.total" :page-sizes="[20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @current-change="handlePageChange" @size-change="handleSizeChange" />
    </el-card>

    <!-- 新建套餐对话框 -->
    <el-dialog v-model="showCreate" title="新建套餐" width="550px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="套餐名称"><el-input v-model="createForm.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="createForm.description" type="textarea" /></el-form-item>
        <el-form-item label="价格"><el-input-number v-model="createForm.price" :min="0" :step="10" /></el-form-item>
        <el-form-item label="计费周期">
          <el-select v-model="createForm.billingCycle">
            <el-option value="monthly" label="月付" />
            <el-option value="yearly" label="年付" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单上限"><el-input-number v-model="createForm.maxOrders" :min="0" :step="100" /></el-form-item>
        <el-form-item label="商品上限"><el-input-number v-model="createForm.maxGoods" :min="0" :step="100" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="creating">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable } from '@sup/shared'
import { createBillingPlan } from '../../api/billing'
import type { BillingPlan } from '../../api/billing'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<BillingPlan>('/admin/billing/plans')

const showCreate = ref(false)
const creating = ref(false)
const createForm = reactive({ name: '', description: '', price: 0, billingCycle: 'monthly' as 'monthly' | 'yearly', maxOrders: 1000, maxGoods: 500 })

async function handleCreate() {
  if (!createForm.name) { ElMessage.warning('请输入套餐名称'); return }
  creating.value = true
  try {
    await createBillingPlan(createForm)
    ElMessage.success('创建成功')
    showCreate.value = false
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    creating.value = false
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-container { padding: 20px; }
.search-card { margin-top: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
