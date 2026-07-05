<template>
  <div class="page-container">
    <PageHeader :title="`供货商详情 - ${supplier.name || '加载中...'}`">
      <template #actions>
        <el-button @click="$router.back()">返回列表</el-button>
      </template>
    </PageHeader>

    <!-- 基本信息 -->
    <el-card shadow="never" v-loading="loading">
      <template #header>基本信息</template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="供货商ID">{{ supplier.id }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ supplier.name }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ supplier.contactName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ supplier.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ supplier.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="supplier.status === 1 ? 'success' : 'danger'" size="small">
            {{ supplier.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDateTime(supplier.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ formatDateTime(supplier.lastLoginAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 商品列表 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <template #header>供应商品 ({{ supplierGoods.length }})</template>
      <el-table :data="supplierGoods" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="price" label="单价" width="100">
          <template #default="{ row }">¥{{ formatDecimal(row.price) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 订单统计 -->
    <el-row :gutter="20" style="margin-top: 16px;">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>最近30天订单统计</template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="订单数">{{ orderStats.totalOrders }}</el-descriptions-item>
            <el-descriptions-item label="订单金额">¥{{ formatDecimal(orderStats.totalAmount) }}</el-descriptions-item>
            <el-descriptions-item label="完成订单">{{ orderStats.completedOrders }}</el-descriptions-item>
            <el-descriptions-item label="退款订单">{{ orderStats.refundOrders }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>结算记录</template>
          <el-table :data="settlementRecords" border stripe max-height="300">
            <el-table-column prop="period" label="结算周期" min-width="140" />
            <el-table-column prop="amount" label="结算金额" width="120">
              <template #default="{ row }">¥{{ formatDecimal(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
                  {{ row.status === 1 ? '已结' : '待结' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatDateTime, formatDecimal, apiClient } from '@sup/shared'
import PageHeader from '@sup/shared/components/PageHeader.vue'

interface SupplierDetail {
  id: number
  name: string
  contactName: string
  contactPhone: string
  email: string
  status: number
  createdAt: number
  lastLoginAt: number
}

interface SupplierGoods {
  id: number
  name: string
  price: string
  stock: number
  status: number
}

interface OrderStats {
  totalOrders: number
  totalAmount: string
  completedOrders: number
  refundOrders: number
}

interface SettlementRecord {
  period: string
  amount: string
  status: number
}

const route = useRoute()
const supplierId = route.params.id as string
const loading = ref(false)

const supplier = ref<SupplierDetail>({
  id: 0, name: '', contactName: '', contactPhone: '', email: '', status: 0, createdAt: 0, lastLoginAt: 0,
})
const supplierGoods = ref<SupplierGoods[]>([])
const orderStats = ref<OrderStats>({ totalOrders: 0, totalAmount: '0', completedOrders: 0, refundOrders: 0 })
const settlementRecords = ref<SettlementRecord[]>([])

async function loadDetail() {
  loading.value = true
  try {
    const data = await apiClient.get(`/admin/suppliers/${supplierId}`) as any
    supplier.value = data
  } catch (e: any) {
    console.error('loadDetail error:', e.message)
  } finally {
    loading.value = false
  }
}

async function loadGoods() {
  try {
    const data = await apiClient.get(`/admin/suppliers/${supplierId}/goods`) as any
    supplierGoods.value = data.list || data || []
  } catch { /* ignore */ }
}

async function loadOrderStats() {
  try {
    const data = await apiClient.get(`/admin/suppliers/${supplierId}/order-stats`) as any
    orderStats.value = data || { totalOrders: 0, totalAmount: '0', completedOrders: 0, refundOrders: 0 }
  } catch { /* ignore */ }
}

async function loadSettlements() {
  try {
    const data = await apiClient.get(`/admin/suppliers/${supplierId}/settlements`) as any
    settlementRecords.value = data.list || data || []
  } catch { /* ignore */ }
}

onMounted(() => {
  loadDetail()
  loadGoods()
  loadOrderStats()
  loadSettlements()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
