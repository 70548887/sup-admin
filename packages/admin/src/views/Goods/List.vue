<template>
  <div class="page-container">
    <h2>商品管理</h2>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" @submit.prevent="onSearch">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="搜索商品" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option v-for="(label, key) in GOODS_STATUS" :key="key" :label="label" :value="Number(key)" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button type="warning" :icon="Download" @click="handleExport">导出商品</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="serialNumber" label="编号" width="140" />
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="price" label="售价" width="120">
          <template #default="{ row }">¥{{ formatDecimal(row.price) }}</template>
        </el-table-column>
        <el-table-column prop="costPrice" label="成本价" width="120">
          <template #default="{ row }">¥{{ formatDecimal(row.costPrice) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="90" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'warning' : 'info'">
              {{ GOODS_STATUS[row.status] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              type="danger"
              size="small"
              link
              @click="handleStatusChange(row, 0)"
            >下架</el-button>
            <el-button
              v-else-if="row.status === 0"
              type="success"
              size="small"
              link
              @click="handleStatusChange(row, 1)"
            >上架</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { useTable, formatDateTime, formatDecimal, GOODS_STATUS } from '@sup/shared'
import type { Goods } from '@sup/shared'
import { updateGoodsStatus } from '../../api/goods'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange, handleSearch, handleReset } = useTable<Goods>('/admin/goods')

const searchForm = reactive({
  name: '',
  status: undefined as number | undefined,
})

function onSearch() {
  const params: Record<string, any> = {}
  if (searchForm.name) params.name = searchForm.name
  if (searchForm.status !== undefined && searchForm.status !== null) params.status = searchForm.status
  handleSearch(params)
}

function onReset() {
  searchForm.name = ''
  searchForm.status = undefined
  handleReset()
}

async function handleStatusChange(row: Goods, status: number) {
  const action = status === 1 ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确定要${action}商品 "${row.name}" 吗？`, '确认操作', {
      type: 'warning',
    })
    await updateGoodsStatus(row.id, status)
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '操作失败')
    }
  }
}

function exportCSV(data: any[], filename: string) {
  if (!data.length) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function handleExport() {
  exportCSV(tableData.value, '商品列表')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.search-card {
  margin-top: 16px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
