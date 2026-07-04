<template>
  <div class="page-container">
    <h2>收入趋势</h2>
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
import { getRevenueTrend } from '../../api/analytics'
import type { TrendData } from '../../api/analytics'

const dateRange = ref<[string, string] | null>(null)
const trendData = ref<TrendData[]>([])

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['收入', '订单数'] },
  xAxis: { type: 'category', data: trendData.value.map(d => d.date) },
  yAxis: [
    { type: 'value', name: '收入 (¥)' },
    { type: 'value', name: '订单数' },
  ],
  series: [
    { name: '收入', type: 'line', data: trendData.value.map(d => d.revenue), smooth: true },
    { name: '订单数', type: 'line', yAxisIndex: 1, data: trendData.value.map(d => d.orderCount), smooth: true },
  ],
}))

async function loadData() {
  if (!dateRange.value) return
  try {
    trendData.value = await getRevenueTrend({ startDate: dateRange.value[0], endDate: dateRange.value[1] })
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
