<template>
  <div class="page-container">
    <h2>客户统计</h2>
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
import { getCustomerStats } from '../../api/analytics'
import type { CustomerStatsData } from '../../api/analytics'

const dateRange = ref<[string, string] | null>(null)
const statsData = ref<CustomerStatsData[]>([])

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['新增客户', '活跃客户', '累计客户'] },
  xAxis: { type: 'category', data: statsData.value.map(d => d.date) },
  yAxis: { type: 'value', name: '人数' },
  series: [
    { name: '新增客户', type: 'bar', data: statsData.value.map(d => d.newCustomers) },
    { name: '活跃客户', type: 'line', data: statsData.value.map(d => d.activeCustomers), smooth: true },
    { name: '累计客户', type: 'line', data: statsData.value.map(d => d.totalCustomers), smooth: true },
  ],
}))

async function loadData() {
  if (!dateRange.value) return
  try {
    statsData.value = await getCustomerStats({ startDate: dateRange.value[0], endDate: dateRange.value[1] })
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
