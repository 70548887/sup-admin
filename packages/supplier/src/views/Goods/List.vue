<template>
  <div class="goods-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="搜索商品" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">搜索</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="serialNumber" label="编号" width="120" />
        <el-table-column prop="price" label="售价" width="100" />
        <el-table-column prop="costPrice" label="成本价" width="100" />
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push(`/goods/${row.id}`)">详情</el-button>
            <el-button size="small" type="primary" @click="$router.push(`/goods/${row.id}/edit`)">编辑</el-button>
            <el-button size="small" type="warning" @click="$router.push(`/goods/${row.id}/price`)">改价</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getGoodsPaging, type SupplierGoods } from '@/api/goods'

const loading = ref(false)
const tableData = ref<SupplierGoods[]>([])

const searchForm = reactive({
  name: '',
  status: undefined as number | undefined,
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getGoodsPaging({
      page: pagination.page,
      size: pagination.size,
      name: searchForm.name || undefined,
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

onMounted(fetchData)
</script>

<style scoped>
.search-form {
  margin-bottom: 16px;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
