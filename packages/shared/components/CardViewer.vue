<template>
  <div class="card-viewer">
    <!-- 工具栏 -->
    <div class="card-toolbar">
      <el-space>
        <el-switch v-model="globalMasked" active-text="遮罩" inactive-text="明文" />
        <el-button type="primary" size="small" plain @click="copyAll" :disabled="cards.length === 0">
          批量复制
        </el-button>
      </el-space>
    </div>

    <!-- 卡密表格 -->
    <el-table :data="cards" border stripe style="width: 100%;">
      <el-table-column type="index" label="#" width="60" align="center" />
      <el-table-column label="卡号/内容" min-width="250">
        <template #default="{ row, $index }">
          <span class="card-content">{{ getDisplayText(row.content, $index) }}</span>
          <el-button
            type="primary"
            size="small"
            link
            @click="toggleRowMask($index)"
          >
            {{ rowMasked[$index] ? '显示' : '隐藏' }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="密码" min-width="200">
        <template #default="{ row, $index }">
          <template v-if="row.password">
            <span class="card-content">{{ getDisplayText(row.password, $index) }}</span>
          </template>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" link @click="copyText(row.content)">复制</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="cards.length === 0" description="暂无卡密数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

/** 卡密数据项 */
interface CardItem {
  content: string
  password?: string
}

const props = withDefaults(defineProps<{
  /** 卡密列表 */
  cards: CardItem[]
  /** 是否默认遮罩显示 */
  masked?: boolean
}>(), {
  masked: true,
})

const globalMasked = ref(props.masked)
const rowMasked = ref<boolean[]>([])

// 初始化行遮罩状态：跟随全局遮罩设置
watch(
  () => [props.cards, props.masked],
  () => {
    rowMasked.value = props.cards.map(() => globalMasked.value)
  },
  { immediate: true, deep: true },
)

// 全局遮罩切换时，同步所有行
watch(globalMasked, (val) => {
  rowMasked.value = props.cards.map(() => val)
})

/** 获取显示文本（遮罩或明文） */
function getDisplayText(text: string, index: number): string {
  if (!text) return '-'
  if (rowMasked.value[index]) {
    return '••••••••'
  }
  return text
}

/** 切换单行遮罩状态 */
function toggleRowMask(index: number) {
  rowMasked.value[index] = !rowMasked.value[index]
}

/** 复制单条文本 */
async function copyText(text: string) {
  if (!text) {
    ElMessage.warning('内容为空，无法复制')
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

/** 批量复制所有卡密 */
async function copyAll() {
  if (props.cards.length === 0) {
    ElMessage.warning('暂无卡密可复制')
    return
  }
  const text = props.cards
    .map((card, index) => {
      const parts = [`卡密${index + 1}: ${card.content}`]
      if (card.password) {
        parts.push(`密码: ${card.password}`)
      }
      return parts.join('  ')
    })
    .join('\n')
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`已复制 ${props.cards.length} 条卡密`)
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.card-viewer {
  width: 100%;
}
.card-toolbar {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-end;
}
.card-content {
  margin-right: 8px;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 1px;
}
.text-muted {
  color: #909399;
}
</style>
