<template>
  <div class="goods-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="$router.push('/goods/create')">新建商品</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent="onSearch">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="搜索商品名称" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="序列号">
          <el-input v-model="searchForm.serial_number" placeholder="搜索序列号" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px;">
            <el-option v-for="(label, key) in GOODS_STATUS" :key="key" :label="label" :value="Number(key)" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 批量操作栏 -->
      <div v-if="selectedRows.length" class="batch-bar">
        <span>已选择 {{ selectedRows.length }} 项</span>
        <el-button size="small" type="success" :loading="batchLoading" @click="handleBatchStatus(false)">批量上架</el-button>
        <el-button size="small" type="danger" :loading="batchLoading" @click="handleBatchStatus(true)">批量下架</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="45" />
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="serial_number" label="序列号" width="140" />
        <el-table-column label="售价" width="100">
          <template #default="{ row }">¥{{ formatDecimal(row.price) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'warning' : 'info'">
              {{ GOODS_STATUS[row.status] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="$router.push(`/goods/${row.serial_number}`)">详情</el-button>
            <el-button size="small" link type="primary" @click="$router.push(`/goods/edit/${row.serial_number}`)">编辑</el-button>
            <el-button size="small" link type="warning" @click="$router.push(`/goods/${row.serial_number}/price`)">改价</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { GOODS_STATUS, formatDecimal } from '@sup/shared'
import { getGoodsPaging, editGoods, type SupplierGoodsListItem } from '@/api/goods'

const loading = ref(false)
const batchLoading = ref(false)
const tableData = ref<SupplierGoodsListItem[]>([])
const selectedRows = ref<SupplierGoodsListItem[]>([])

const searchForm = reactive({
  name: '',
  serial_number: '',
  status: undefined as number | undefined,
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getGoodsPaging({
      page: pagination.page,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      serial_number: searchForm.serial_number || undefined,
      status: searchForm.status,
    })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品列表失败')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  pagination.page = 1
  fetchData()
}

function onReset() {
  searchForm.name = ''
  searchForm.serial_number = ''
  searchForm.status = undefined
  pagination.page = 1
  fetchData()
}

function handlePageChange() {
  fetchData()
}

function handleSizeChange() {
  pagination.page = 1
  fetchData()
}

function handleSelectionChange(rows: SupplierGoodsListItem[]) {
  selectedRows.value = rows
}

async function handleBatchStatus(isClose: boolean) {
  if (!selectedRows.value.length) return
  const action = isClose ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(
      `确定要批量${action}选中的 ${selectedRows.value.length} 个商品吗？`,
      '确认操作',
      { type: 'warning' }
    )
    batchLoading.value = true
    const promises = selectedRows.value.map((row) =>
      editGoods({ goods_sn: row.serial_number, is_close: isClose })
    )
    await Promise.all(promises)
    ElMessage.success(`批量${action}成功`)
    selectedRows.value = []
    fetchData()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '批量操作失败')
    }
  } finally {
    batchLoading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.search-form {
  margin-bottom: 16px;
}
.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 4px;
  font-size: 14px;
  color: #409eff;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
