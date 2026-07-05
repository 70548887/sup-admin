<template>
  <div class="page-container">
    <div class="page-header">
      <h2>商品详情</h2>
      <el-button type="primary" @click="$router.push(`/goods/edit/${goodsId}`)">编辑</el-button>
    </div>

    <el-card v-loading="pageLoading" shadow="never" style="margin-top: 16px;">
      <!-- 基本信息 -->
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="商品编号">{{ goods.serialNumber }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ goods.name }}</el-descriptions-item>
        <el-descriptions-item label="售价">¥{{ formatDecimal(goods.price) }}</el-descriptions-item>
        <el-descriptions-item label="成本价">¥{{ formatDecimal(goods.costPrice) }}</el-descriptions-item>
        <el-descriptions-item label="库存">{{ goods.stock }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="goods.status === 1 ? 'success' : goods.status === 2 ? 'warning' : 'info'">
            {{ GOODS_STATUS[goods.status] || '未知' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所属分类">{{ goods.categoryName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="供货商">{{ goods.supplierName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(goods.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(goods.updatedAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 卡密批次 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <template #header>
        <span>卡密批次</span>
      </template>
      <el-table :data="batches" border stripe>
        <el-table-column prop="id" label="批次ID" width="80" />
        <el-table-column prop="batchName" label="批次名称" min-width="160" />
        <el-table-column prop="totalCount" label="总数量" width="90" />
        <el-table-column prop="usedCount" label="已使用" width="90" />
        <el-table-column prop="remainCount" label="剩余" width="90" />
        <el-table-column prop="createdAt" label="导入时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 近期订单 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <template #header>
        <span>近期订单</span>
      </template>
      <el-table :data="recentOrders" border stripe>
        <el-table-column prop="orderSn" label="订单号" width="180" />
        <el-table-column prop="buyNumber" label="数量" width="80" />
        <el-table-column prop="amount" label="金额" width="110">
          <template #default="{ row }">¥{{ formatDecimal(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ ORDER_STATUS[row.status] || '未知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="$router.push(`/orders/${row.id}`)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { apiClient, formatDateTime, formatDecimal, GOODS_STATUS, ORDER_STATUS } from '@sup/shared'

const route = useRoute()
const goodsId = Number(route.params.id)
const pageLoading = ref(false)

const goods = reactive({
  serialNumber: '',
  name: '',
  price: '0',
  costPrice: '0',
  stock: 0,
  status: 0,
  categoryName: '',
  supplierName: '',
  createdAt: 0,
  updatedAt: 0,
})

const batches = ref<any[]>([])
const recentOrders = ref<any[]>([])

function statusTagType(status: number): string {
  const map: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: '',
    3: 'success',
    4: 'info',
    5: 'danger',
    6: 'danger',
  }
  return map[status] || 'info'
}

async function fetchDetail() {
  pageLoading.value = true
  try {
    const data = await apiClient.get(`/admin/goods/${goodsId}`) as any
    Object.assign(goods, data)
    batches.value = data.batches || []
    recentOrders.value = data.recentOrders || []
  } catch (e: any) {
    ElMessage.error(e.message || '获取商品详情失败')
  } finally {
    pageLoading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
