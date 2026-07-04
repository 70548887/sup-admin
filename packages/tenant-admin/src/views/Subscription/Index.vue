<template>
  <div class="page-container">
    <h2>订阅管理</h2>

    <!-- 当前订阅 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <h3>当前套餐</h3>
      <el-descriptions v-if="subscription" :column="3" border>
        <el-descriptions-item label="套餐名称">{{ subscription.planName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="subscription.status === 'active' ? 'success' : 'danger'">{{ subscription.status === 'active' ? '生效中' : subscription.status === 'expired' ? '已过期' : '已取消' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="到期日期">{{ subscription.endDate }}</el-descriptions-item>
        <el-descriptions-item label="订单上限">{{ subscription.maxOrders }}</el-descriptions-item>
        <el-descriptions-item label="商品上限">{{ subscription.maxGoods }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 使用量 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <h3>用量统计</h3>
      <el-row :gutter="24" v-if="usage">
        <el-col :span="8">
          <div class="usage-item">
            <span>订单用量</span>
            <el-progress :percentage="Math.min(100, Math.round(usage.ordersUsed / usage.ordersLimit * 100))" :text-inside="true" :stroke-width="20" />
            <span class="usage-detail">{{ usage.ordersUsed }} / {{ usage.ordersLimit }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="usage-item">
            <span>商品用量</span>
            <el-progress :percentage="Math.min(100, Math.round(usage.goodsUsed / usage.goodsLimit * 100))" :text-inside="true" :stroke-width="20" />
            <span class="usage-detail">{{ usage.goodsUsed }} / {{ usage.goodsLimit }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="usage-item">
            <span>存储用量</span>
            <el-progress :percentage="Math.min(100, Math.round(usage.storageUsedMB / usage.storageLimitMB * 100))" :text-inside="true" :stroke-width="20" />
            <span class="usage-detail">{{ usage.storageUsedMB }}MB / {{ usage.storageLimitMB }}MB</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 升级 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <h3>升级套餐</h3>
      <el-row :gutter="16">
        <el-col v-for="plan in plans" :key="plan.id" :span="8">
          <el-card shadow="hover" class="plan-card">
            <h4>{{ plan.name }}</h4>
            <p class="plan-price">¥{{ plan.price }}/{{ plan.billingCycle === 'monthly' ? '月' : '年' }}</p>
            <ul class="plan-features">
              <li v-for="f in plan.features" :key="f">{{ f }}</li>
            </ul>
            <el-button type="primary" @click="handleUpgrade(plan.id)" :loading="upgrading">升级</el-button>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSubscription, getUsage, getAvailablePlans, upgradeSubscription } from '../../api/subscription'
import type { SubscriptionInfo, UsageInfo, UpgradePlan } from '../../api/subscription'

const subscription = ref<SubscriptionInfo | null>(null)
const usage = ref<UsageInfo | null>(null)
const plans = ref<UpgradePlan[]>([])
const upgrading = ref(false)

async function handleUpgrade(planId: number) {
  await ElMessageBox.confirm('确认升级到该套餐？', '提示', { type: 'info' })
  upgrading.value = true
  try {
    await upgradeSubscription(planId)
    ElMessage.success('升级成功')
    loadData()
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    upgrading.value = false
  }
}

async function loadData() {
  try {
    const [sub, usg, pls] = await Promise.all([getSubscription(), getUsage(), getAvailablePlans()])
    subscription.value = sub
    usage.value = usg
    plans.value = pls
  } catch (e) { /* ignore */ }
}

onMounted(() => loadData())
</script>

<style scoped>
.page-container { padding: 20px; }
.usage-item { text-align: center; }
.usage-detail { display: block; margin-top: 4px; font-size: 12px; color: #999; }
.plan-card { text-align: center; }
.plan-price { font-size: 24px; color: #409eff; margin: 12px 0; }
.plan-features { list-style: none; padding: 0; margin: 12px 0; text-align: left; }
.plan-features li { padding: 4px 0; color: #666; }
.plan-features li::before { content: '✓ '; color: #67c23a; }
</style>
