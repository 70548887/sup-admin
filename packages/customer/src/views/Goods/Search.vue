<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>商品搜索</span>
      </template>

      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索商品名称、关键词"
          clearable
          size="large"
          class="search-input"
          @keyup.enter="onSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="onSearch" />
          </template>
        </el-input>
      </div>

      <!-- 高级筛选 -->
      <el-collapse v-model="filterCollapse" class="filter-collapse">
        <el-collapse-item title="高级筛选" name="filter">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="分类">
              <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable>
                <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="价格区间">
              <el-input-number
                v-model="searchForm.minPrice"
                :min="0"
                :precision="2"
                :step="1"
                placeholder="最低价"
                controls-position="right"
                style="width: 130px;"
              />
              <span style="margin: 0 8px; color: #909399;">-</span>
              <el-input-number
                v-model="searchForm.maxPrice"
                :min="0"
                :precision="2"
                :step="1"
                placeholder="最高价"
                controls-position="right"
                style="width: 130px;"
              />
            </el-form-item>
            <el-form-item label="库存状态">
              <el-select v-model="searchForm.inStock" placeholder="全部" clearable>
                <el-option label="有货" :value="1" />
                <el-option label="缺货" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSearch">筛选</el-button>
              <el-button @click="onReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <!-- 搜索结果 -->
      <div v-loading="loading" class="results-section">
        <div v-if="searched && !loading" class="result-summary">
          共找到 <strong>{{ pagination.total }}</strong> 个商品
        </div>

        <div class="goods-grid">
          <el-card v-for="item in tableData" :key="item.id" shadow="hover" class="goods-card">
            <div class="goods-image">
              <el-image :src="getGoodsImage(item)" fit="cover" class="image">
                <template #error>
                  <div class="image-placeholder">
                    <el-icon :size="40" color="#909399"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="goods-info">
              <h4 class="goods-name" :title="item.name">{{ item.name }}</h4>
              <p class="goods-category">{{ item.categoryName }}</p>
              <div class="goods-meta">
                <span>库存: {{ item.stock }}</span>
                <span>销量: {{ item.salesCount }}</span>
              </div>
              <div class="goods-bottom">
                <div class="goods-price">¥{{ item.price }}</div>
                <el-button type="primary" size="small" @click="goDetail(item.id)">购买</el-button>
              </div>
            </div>
          </el-card>
        </div>

        <el-empty v-if="searched && !loading && tableData.length === 0" description="未找到相关商品" />

        <!-- 分页 -->
        <el-pagination
          v-if="pagination.total > 0"
          class="pagination"
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next"
          @size-change="onSearch"
          @current-change="onSearch"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Picture } from '@element-plus/icons-vue'
import { getGoodsList, getCategoryList, type CustomerGoods, type Category } from '@/api/goods'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const searched = ref(false)
const tableData = ref<CustomerGoods[]>([])
const categories = ref<Category[]>([])
const filterCollapse = ref<string[]>([])

const searchForm = reactive({
  keyword: '',
  categoryId: undefined as number | undefined,
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  inStock: undefined as number | undefined,
})

const pagination = reactive({
  page: 1,
  size: 12,
  total: 0,
})

function getGoodsImage(item: CustomerGoods): string {
  return `https://placehold.co/280x180/f5f7fa/909399?text=${encodeURIComponent(item.name.slice(0, 4))}`
}

function goDetail(id: number) {
  router.push(`/goods/${id}`)
}

async function fetchCategories() {
  try {
    categories.value = await getCategoryList()
  } catch (_) { /* ignore */ }
}

async function onSearch() {
  loading.value = true
  searched.value = true
  try {
    const params: Record<string, any> = {
      page: pagination.page,
      size: pagination.size,
    }
    if (searchForm.keyword) params.name = searchForm.keyword
    if (searchForm.categoryId) params.categoryId = searchForm.categoryId
    if (searchForm.minPrice !== undefined) params.minPrice = searchForm.minPrice
    if (searchForm.maxPrice !== undefined) params.maxPrice = searchForm.maxPrice
    if (searchForm.inStock !== undefined) params.inStock = searchForm.inStock

    const res = await getGoodsList(params as any)
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (e: any) {
    ElMessage.error(e.message || '搜索失败')
  } finally {
    loading.value = false
  }
}

function onReset() {
  searchForm.keyword = ''
  searchForm.categoryId = undefined
  searchForm.minPrice = undefined
  searchForm.maxPrice = undefined
  searchForm.inStock = undefined
  pagination.page = 1
  onSearch()
}

onMounted(() => {
  fetchCategories()
  // 如果URL中有搜索参数，自动执行搜索
  if (route.query.keyword) {
    searchForm.keyword = route.query.keyword as string
    onSearch()
  }
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.search-section {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.search-input {
  max-width: 600px;
  width: 100%;
}

.filter-collapse {
  margin-bottom: 20px;
  border: none;
}

.result-summary {
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.results-section {
  min-height: 200px;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.goods-card {
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

.goods-card:hover {
  transform: translateY(-4px);
}

.goods-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 12px;
}

.image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goods-name {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 44px;
}

.goods-category {
  color: #909399;
  font-size: 12px;
  margin: 0 0 8px 0;
}

.goods-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
}

.goods-bottom {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goods-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.pagination {
  margin-top: 24px;
  justify-content: flex-end;
}
</style>
