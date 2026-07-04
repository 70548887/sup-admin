<template>
  <div class="page-container">
    <h2>商品管理</h2>
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" @submit.prevent="onSearch">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="搜索商品" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">¥{{ formatDecimal(row.price) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ GOODS_STATUS[row.status] || '未知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 1" type="warning" size="small" link @click="handleToggle(row.id, 0)">下架</el-button>
            <el-button v-else type="success" size="small" link @click="handleToggle(row.id, 1)">上架</el-button>
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
import { ElMessage } from 'element-plus'
import { useTable, formatDecimal, GOODS_STATUS } from '@sup/shared'
import type { Goods } from '@sup/shared'
import { updateGoodsStatus } from '../../api/goods'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange, handleSearch, handleReset } = useTable<Goods>('/tenant-admin/goods')

const searchForm = reactive({ name: '' })

function onSearch() {
  const params: Record<string, any> = {}
  if (searchForm.name) params.name = searchForm.name
  handleSearch(params)
}

function onReset() {
  searchForm.name = ''
  handleReset()
}

async function handleToggle(id: number, status: number) {
  try {
    await updateGoodsStatus(id, status)
    ElMessage.success(status === 1 ? '已上架' : '已下架')
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
