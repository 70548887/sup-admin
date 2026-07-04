<template>
  <div class="page-container">
    <h2>账单管理</h2>
    <el-card shadow="never" class="search-card">
      <el-form :inline="true">
        <el-form-item label="账期">
          <el-date-picker v-model="period" type="month" placeholder="选择月份" value-format="YYYY-MM" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleGenerate" :loading="generating">生成账单</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="tenantName" label="租户" min-width="140" />
        <el-table-column prop="amount" label="金额" width="110">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'paid' ? 'success' : row.status === 'overdue' ? 'danger' : 'warning'">{{ row.status === 'paid' ? '已付' : row.status === 'overdue' ? '逾期' : '待付' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="periodStart" label="账期开始" width="120" />
        <el-table-column prop="periodEnd" label="账期结束" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 'paid'" type="success" size="small" link @click="handleMarkPaid(row.id)">标记已付</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" v-model:current-page="pagination.page" v-model:page-size="pagination.size" :total="pagination.total" :page-sizes="[20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @current-change="handlePageChange" @size-change="handleSizeChange" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable, formatDateTime } from '@sup/shared'
import { markInvoicePaid, generateInvoices } from '../../api/billing'
import type { Invoice } from '../../api/billing'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<Invoice>('/admin/billing/invoices')

const period = ref('')
const generating = ref(false)

async function handleGenerate() {
  if (!period.value) { ElMessage.warning('请选择账期'); return }
  generating.value = true
  try {
    const res = await generateInvoices({ period: period.value })
    ElMessage.success(`已生成 ${res.count} 条账单`)
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    generating.value = false
  }
}

async function handleMarkPaid(id: number) {
  try {
    await markInvoicePaid(id)
    ElMessage.success('已标记为已付')
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-container { padding: 20px; }
.search-card { margin-top: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
