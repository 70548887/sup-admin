<template>
  <div class="goods-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">返回</el-button>
          <span>商品详情</span>
        </div>
      </template>

      <el-descriptions v-if="goods" :column="2" border>
        <el-descriptions-item label="ID">{{ goods.id }}</el-descriptions-item>
        <el-descriptions-item label="编号">{{ goods.serialNumber }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ goods.name }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ goods.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="售价">¥{{ goods.price }}</el-descriptions-item>
        <el-descriptions-item label="成本价">¥{{ goods.costPrice }}</el-descriptions-item>
        <el-descriptions-item label="库存">{{ goods.stock }}</el-descriptions-item>
        <el-descriptions-item label="销量">{{ goods.salesCount }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="goods.status === 1 ? 'success' : 'info'">
            {{ goods.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(goods.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ goods.description || '暂无' }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="goods?.buyParams?.length" style="margin-top: 20px">
        <h4>购买参数</h4>
        <el-table :data="goods.buyParams" border>
          <el-table-column prop="name" label="参数名" />
          <el-table-column prop="type" label="类型" />
          <el-table-column prop="required" label="必填">
            <template #default="{ row }">{{ row.required ? '是' : '否' }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getGoodsShow, type SupplierGoods } from '@/api/goods'

const route = useRoute()
const loading = ref(false)
const goods = ref<SupplierGoods | null>(null)

function formatTime(ts: number): string {
  if (!ts) return '-'
  return new Date(ts * 1000).toLocaleString('zh-CN')
}

async function fetchData() {
  const id = Number(route.params.id)
  if (!id) return

  loading.value = true
  try {
    goods.value = await getGoodsShow(id)
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
