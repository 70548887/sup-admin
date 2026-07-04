<template>
  <div class="page-container">
    <h2>定价规则</h2>
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" @submit.prevent="onSearch">
        <el-form-item label="规则名称">
          <el-input v-model="searchForm.name" placeholder="搜索规则名" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable>
            <el-option value="markup" label="加价" />
            <el-option value="discount" label="折扣" />
            <el-option value="fixed" label="固定价" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button type="success" @click="$router.push('/pricing/create')">新建规则</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="规则名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="customerGroupName" label="客户分组" width="140" />
        <el-table-column prop="adjustType" label="调整方式" width="100">
          <template #default="{ row }">{{ row.adjustType === 'percentage' ? '百分比' : '固定值' }}</template>
        </el-table-column>
        <el-table-column prop="adjustValue" label="调整值" width="100" />
        <el-table-column prop="priority" label="优先级" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="$router.push(`/pricing/edit/${row.id}`)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useTable } from '@sup/shared'
import { deletePricingRule } from '../../api/pricing'
import type { PricingRule } from '../../api/pricing'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange, handleSearch, handleReset } = useTable<PricingRule>('/admin/pricing/rules')

const searchForm = reactive({ name: '', type: '' })

function onSearch() {
  const params: Record<string, any> = {}
  if (searchForm.name) params.name = searchForm.name
  if (searchForm.type) params.type = searchForm.type
  handleSearch(params)
}

function onReset() {
  searchForm.name = ''
  searchForm.type = ''
  handleReset()
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确认删除该定价规则？', '提示', { type: 'warning' })
  await deletePricingRule(id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-container { padding: 20px; }
.search-card { margin-top: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
