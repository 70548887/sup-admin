<template>
  <div class="page-container">
    <h2>热卖排行</h2>
    <el-card shadow="never" style="margin-top: 16px;">
      <el-form :inline="true">
        <el-form-item label="显示数量">
          <el-select v-model="limit" @change="loadData">
            <el-option :value="10" label="Top 10" />
            <el-option :value="20" label="Top 20" />
            <el-option :value="50" label="Top 50" />
          </el-select>
        </el-form-item>
      </el-form>
      <v-chart :option="chartOption" style="height: 500px;" autoresize />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { getHotGoods } from '../../api/analytics'
import type { HotGoodsItem } from '../../api/analytics'

const limit = ref(10)
const hotGoods = ref<HotGoodsItem[]>([])

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'value', name: '销量' },
  yAxis: { type: 'category', data: hotGoods.value.map(g => g.goodsName).reverse() },
  series: [
    { name: '销量', type: 'bar', data: hotGoods.value.map(g => g.salesCount).reverse() },
  ],
}))

async function loadData() {
  try {
    hotGoods.value = await getHotGoods({ limit: limit.value })
  } catch (e: any) {
    console.error(e.message)
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.page-container { padding: 20px; }
</style>
