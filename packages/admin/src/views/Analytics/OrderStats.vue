<template>
  <div class="page-container">
    <h2>订单统计</h2>
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" @submit.prevent="loadData">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" style="margin-top: 16px;">
      <v-chart :option="chartOption" style="height: 400px;" autoresize />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { getOrderStats } from '../../api/analytics'
import type { OrderStatsData } from '../../api/analytics'

const dateRange = ref<[string, string] | null>(null)
const statsData = ref<OrderStatsData[]>([])

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['总订单', '已完成', '已取消', '待处理'] },
  xAxis: { type: 'category', data: statsData.value.map(d => d.date) },
  yAxis: { type: 'value', name: '数量' },
  series: [
    { name: '总订单', type: 'line', data: statsData.value.map(d => d.total), smooth: true },
    { name: '已完成', type: 'line', data: statsData.value.map(d => d.completed), smooth: true },
    { name: '已取消', type: 'line', data: statsData.value.map(d => d.cancelled), smooth: true },
    { name: '待处理', type: 'line', data: statsData.value.map(d => d.pending), smooth: true },
  ],
}))

async function loadData() {
  if (!dateRange.value) return
  try {
    statsData.value = await getOrderStats({ startDate: dateRange.value[0], endDate: dateRange.value[1] })
  } catch (e: any) {
    console.error(e.message)
  }
}

onMounted(() => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  dateRange.value = [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  loadData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.search-card { margin-top: 16px; }
</style>
