<template>
  <div class="page-container">
    <h2>订单详情</h2>
    <el-button @click="$router.back()" style="margin-bottom: 16px;">返回列表</el-button>

    <el-card v-if="order" shadow="never">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ order.orderSn }}</el-descriptions-item>
        <el-descriptions-item label="商品">{{ order.goodsName }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ order.customerName }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ order.buyNumber }}</el-descriptions-item>
        <el-descriptions-item label="单价">¥{{ formatDecimal(order.unitPrice) }}</el-descriptions-item>
        <el-descriptions-item label="总额">¥{{ formatDecimal(order.amount) }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ order.paymentMethod }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag>{{ ORDER_STATUS[order.status] || '未知' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ formatDateTime(order.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ order.paidAt ? formatDateTime(order.paidAt) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ order.completedAt ? formatDateTime(order.completedAt) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ order.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-if="order && order.cards && order.cards.length > 0" shadow="never" style="margin-top: 16px;">
      <h3>卡密信息</h3>
      <el-table :data="order.cards" border stripe size="small">
        <el-table-column prop="cardNo" label="卡号" />
        <el-table-column prop="cardPassword" label="卡密" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { formatDateTime, formatDecimal, ORDER_STATUS } from '@sup/shared'
import { getTenantOrderDetail } from '../../api/orders'
import type { TenantOrderDetail } from '../../api/orders'

const route = useRoute()
const order = ref<TenantOrderDetail | null>(null)

onMounted(async () => {
  try {
    order.value = await getTenantOrderDetail(Number(route.params.id))
  } catch (e: any) {
    ElMessage.error(e.message)
  }
})
</script>

<style scoped>
.page-container { padding: 20px; }
</style>
