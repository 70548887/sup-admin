<template>
  <div class="categories-page">
    <el-card v-loading="loading">
      <template #header>
        <span>商品分类</span>
      </template>

      <div class="category-grid">
        <el-card
          v-for="cat in categories"
          :key="cat.id"
          shadow="hover"
          class="category-card"
          @click="$router.push(`/goods?categoryId=${cat.id}`)"
        >
          <div class="category-content">
            <el-icon :size="32"><Folder /></el-icon>
            <span class="category-name">{{ cat.name }}</span>
          </div>
        </el-card>
      </div>

      <el-empty v-if="!loading && categories.length === 0" description="暂无分类" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Folder } from '@element-plus/icons-vue'
import { getCategoryList, type Category } from '@/api/goods'

const loading = ref(false)
const categories = ref<Category[]>([])

async function fetchData() {
  loading.value = true
  try {
    categories.value = await getCategoryList()
  } catch (error: any) {
    ElMessage.error(error.message || '获取分类列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.category-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.category-card:hover {
  transform: translateY(-2px);
}

.category-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
}

.category-name {
  font-size: 14px;
  color: #303133;
}
</style>
