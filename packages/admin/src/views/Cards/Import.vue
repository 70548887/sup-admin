<template>
  <div class="page-container">
    <PageHeader title="导入卡密" subtitle="上传卡密文件或粘贴卡密内容，批量导入到指定商品">
      <template #actions>
        <el-button @click="$router.back()">返回列表</el-button>
      </template>
    </PageHeader>

    <el-card shadow="never">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="选择商品" prop="goodsId">
          <el-select v-model="form.goodsId" placeholder="请选择商品" filterable style="width: 100%;">
            <el-option v-for="g in goodsOptions" :key="g.id" :label="g.name" :value="g.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="批次名称" prop="batchName">
          <el-input v-model="form.batchName" placeholder="请输入批次名称（如：20260705第一批）" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="导入方式">
          <el-radio-group v-model="importMode">
            <el-radio-button value="file">上传文件</el-radio-button>
            <el-radio-button value="paste">粘贴输入</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="importMode === 'file'" label="卡密文件" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".txt"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <template #trigger>
              <el-button type="primary" plain>选择TXT文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">支持 .txt 文件，每行一张卡密</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item v-if="importMode === 'paste'" label="卡密内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="每行一张卡密，格式：卡号 或 卡号----密码"
            @input="updatePreviewCount"
          />
        </el-form-item>

        <!-- 预览 -->
        <el-form-item label="预览数量">
          <el-tag type="info" size="large">{{ previewCount }} 张卡密</el-tag>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ submitting ? '导入中...' : '提交导入' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 导入进度 -->
    <el-card v-if="importTaskId" shadow="never" style="margin-top: 16px;">
      <template #header>导入进度</template>
      <el-progress :percentage="importProgress" :status="importStatus" :stroke-width="20" striped striped-flow />
      <p style="margin-top: 12px; color: #606266;">{{ importMessage }}</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { apiClient } from '@sup/shared'
import PageHeader from '@sup/shared/components/PageHeader.vue'

interface GoodsOption {
  id: number
  name: string
}

const formRef = ref<FormInstance>()
const goodsOptions = ref<GoodsOption[]>([])
const importMode = ref<'file' | 'paste'>('file')
const submitting = ref(false)
const previewCount = ref(0)

// 导入进度
const importTaskId = ref('')
const importProgress = ref(0)
const importStatus = ref<'' | 'success' | 'exception'>('')
const importMessage = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null

const form = reactive({
  goodsId: undefined as number | undefined,
  batchName: '',
  content: '',
  file: null as File | null,
})

const rules: FormRules = {
  goodsId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  batchName: [{ required: true, message: '请输入批次名称', trigger: 'blur' }],
}

function handleFileChange(file: UploadFile) {
  if (file.raw) {
    form.file = file.raw
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter((l) => l.trim())
      previewCount.value = lines.length
    }
    reader.readAsText(file.raw)
  }
}

function handleFileRemove() {
  form.file = null
  previewCount.value = 0
}

function updatePreviewCount() {
  const lines = form.content.split('\n').filter((l) => l.trim())
  previewCount.value = lines.length
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()

  if (importMode.value === 'file' && !form.file) {
    ElMessage.warning('请选择卡密文件')
    return
  }
  if (importMode.value === 'paste' && !form.content.trim()) {
    ElMessage.warning('请输入卡密内容')
    return
  }

  submitting.value = true
  try {
    let content = ''
    if (importMode.value === 'file' && form.file) {
      content = await form.file.text()
    } else {
      content = form.content
    }

    const res = await apiClient.post('/admin/cards/import-async', {
      goodsId: form.goodsId,
      batchName: form.batchName,
      content,
    }) as any

    importTaskId.value = res.taskId || res.task_id || 'unknown'
    importProgress.value = 0
    importStatus.value = ''
    importMessage.value = '导入任务已提交，正在处理中...'
    ElMessage.success('导入任务已提交')
    startPolling()
  } catch (e: any) {
    ElMessage.error(e.message || '提交导入失败')
  } finally {
    submitting.value = false
  }
}

function startPolling() {
  pollTimer = setInterval(async () => {
    try {
      const data = await apiClient.get(`/admin/cards/import-task/${importTaskId.value}`) as any
      importProgress.value = data.progress || 0
      importMessage.value = data.message || ''
      if (data.status === 'completed') {
        importProgress.value = 100
        importStatus.value = 'success'
        importMessage.value = `导入完成！成功 ${data.successCount || 0} 条，失败 ${data.failCount || 0} 条`
        stopPolling()
      } else if (data.status === 'failed') {
        importStatus.value = 'exception'
        importMessage.value = data.message || '导入失败'
        stopPolling()
      }
    } catch { /* ignore polling errors */ }
  }, 2000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function loadGoodsOptions() {
  try {
    const data = await apiClient.get('/admin/goods/options') as any
    goodsOptions.value = data || []
  } catch { /* ignore */ }
}

onMounted(() => {
  loadGoodsOptions()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
