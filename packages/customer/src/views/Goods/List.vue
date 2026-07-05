<template>
  <div class="goods-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchForm.name"
          placeholder="搜索商品名称"
          clearable
          class="search-input"
          @keyup.enter="fetchData"
        >
          <template #append>
            <el-button :icon="Search" @click="fetchData" />
          </template>
        </el-input>
      </div>

      <!-- 分类导航栏 -->
      <div class="category-nav">
        <el-radio-group v-model="searchForm.categoryId" size="large" @change="onCategoryChange">
          <el-radio-button :label="undefined">全部</el-radio-button>
          <el-radio-button v-for="cat in categories" :key="cat.id" :label="cat.id">
            {{ cat.name }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 商品卡片 -->
      <div class="goods-grid" v-loading="loading">
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
              <el-button type="primary" size="small" @click="goDetail(item.id)">
                购买
              </el-button>
            </div>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Picture } from '@element-plus/icons-vue'
import { getGoodsList, getCategoryList, type CustomerGoods, type Category } from '@/api/goods'

const route = useRoute()
const router = useRouter()
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

function getGoodsImage(item: CustomerGoods): string {
  // 商品无图片字段，使用商品名称前四字生成占位图
  return `https://placehold.co/280x180/f5f7fa/909399?text=${encodeURIComponent(item.name.slice(0, 4))}`
}

function goDetail(id: number) {
  router.push(`/goods/${id}`)
}

function onCategoryChange() {
  pagination.page = 1
  fetchData()
}

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
  searchForm.categoryId = val ? Number(val) : undefined
  pagination.page = 1
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
.search-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.search-input {
  max-width: 360px;
}

.category-nav {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
  overflow-x: auto;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  min-height: 100px;
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
