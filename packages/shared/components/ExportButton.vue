<template>
  <el-button :icon="Download" @click="handleExport" :loading="exporting">
    {{ label || '导出CSV' }}
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = withDefaults(defineProps<{
  /** 按钮文本 */
  label?: string
  /** 导出数据（数组），如果传入则直接导出；否则调用 fetchData */
  data?: any[]
  /** 异步获取导出数据的函数 */
  fetchData?: () => Promise<any[]>
  /** 导出文件名前缀 */
  filename?: string
  /** 自定义列映射 { 列标题: 字段名 } */
  columns?: Record<string, string>
}>(), {
  label: '导出CSV',
  filename: 'export',
})

const exporting = ref(false)

function formatCSVValue(val: any): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

async function handleExport() {
  exporting.value = true
  try {
    let exportData = props.data
    if (!exportData && props.fetchData) {
      exportData = await props.fetchData()
    }
    if (!exportData || exportData.length === 0) {
      ElMessage.warning('暂无数据可导出')
      return
    }

    let headers: string[]
    let rows: string[][]

    if (props.columns) {
      headers = Object.keys(props.columns)
      const fields = Object.values(props.columns)
      rows = exportData.map(item => fields.map(field => formatCSVValue(item[field])))
    } else {
      headers = Object.keys(exportData[0])
      rows = exportData.map(item => headers.map(key => formatCSVValue(item[key])))
    }

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.filename}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e: any) {
    ElMessage.error(e.message || '导出失败')
  } finally {
    exporting.value = false
  }
}
</script>
