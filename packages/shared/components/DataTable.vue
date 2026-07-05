<template>
  <div class="data-table">
    <el-table :data="data" v-loading="loading" border stripe v-bind="$attrs">
      <slot />
    </el-table>
    <el-pagination
      v-if="(total ?? 0) > 0"
      :current-page="page"
      :page-size="pageSize"
      :total="total ?? 0"
      layout="total, prev, pager, next, jumper"
      @current-change="$emit('page-change', $event)"
      style="margin-top: 16px; justify-content: flex-end;"
    />
  </div>
</template>
<script setup lang="ts">
defineProps<{
  data: any[]
  loading?: boolean
  total?: number
  page?: number
  pageSize?: number
}>()
defineEmits<{ 'page-change': [page: number] }>()
</script>
