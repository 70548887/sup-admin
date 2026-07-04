<template>
  <div class="goods-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="搜索商品" clearable @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable>
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">搜索</el-button>
        </el-form-item>
      </el-form>

      <!-- 商品卡片 -->
      <div class="goods-grid" v-loading="loading">
        <el-card v-for="item in tableData" :key="item.id" shadow="hover" class="goods-card">
          <div class="goods-info">
            <h4>{{ item.name }}</h4>
            <p class="goods-category">{{ item.categoryName }}</p>
            <div class="goods-price">¥{{ item.price }}</div>
            <div class="goods-meta">
              <span>库存: {{ item.stock }}</span>
              <span>销量: {{ item.salesCount }}</span>
            </div>
          </div>
          <div class="goods-actions">
            <el-button type="primary" size="small" @click="$router.push(`/goods/${item.id}`)">
              查看详情
            </el-button>
          </div>
        </el-card>
      </div>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无商品" />

      <!-- 分页 -->
      <el-pagination
        class="pagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getGoodsList, getCategoryList, type CustomerGoods, type Category } from '@/api/goods'

const route = useRoute()
const loading = ref(false)
const tableData = ref<CustomerGoods[]>([])
const categories = ref<Category[]>([])

const searchForm = reactive({
  name: '',
  categoryId: undefined as number | undefined,
})

const pagination = reactive({
  page: 1,
  size: 12,
  total: 0,
})

async function fetchCategories() {
  try {
    categories.value = await getCategoryList()
  } catch (_) { /* ignore */ }
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getGoodsList({
      page: pagination.page,
      size: pagination.size,
      name: searchForm.name || undefined,
      categoryId: searchForm.categoryId,
    })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 监听 URL query 的 categoryId
watch(() => route.query.categoryId, (val) => {
  if (val) {
    searchForm.categoryId = Number(val)
  }
  fetchData()
}, { immediate: false })

onMounted(() => {
  if (route.query.categoryId) {
    searchForm.categoryId = Number(route.query.categoryId)
  }
  fetchCategories()
  fetchData()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 16px;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  min-height: 100px;
}

.goods-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-info h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.goods-category {
  color: #909399;
  font-size: 12px;
  margin: 0 0 8px 0;
}

.goods-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 8px;
}

.goods-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.goods-actions {
  margin-top: 12px;
  text-align: right;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
