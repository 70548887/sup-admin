<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="100px"
    style="max-width: 600px;"
  >
    <!-- 钱包余额 -->
    <el-form-item v-if="walletBalance" label="当前余额">
      <span class="wallet-balance">¥{{ formatDecimal(walletBalance) }}</span>
    </el-form-item>

    <!-- 金额预设快捷按钮 -->
    <el-form-item label="充值金额" prop="amount">
      <div class="amount-section">
        <div class="quick-amounts">
          <el-button
            v-for="amt in quickAmounts"
            :key="amt"
            size="small"
            :type="formData.amount === amt ? 'primary' : 'default'"
            @click="formData.amount = amt"
          >
            ¥{{ amt }}
          </el-button>
        </div>
        <el-input-number
          v-model="formData.amount"
          :precision="2"
          :min="0.01"
          :step="100"
          controls-position="right"
          style="width: 240px; margin-top: 8px;"
        />
        <span class="form-suffix">元</span>
      </div>
    </el-form-item>

    <!-- 支付方式 -->
    <el-form-item label="支付方式" prop="paymentMethod">
      <el-select v-model="formData.paymentMethod" placeholder="请选择支付方式" style="width: 100%;">
        <el-option label="银行转账" value="bank_transfer" />
        <el-option label="支付宝" value="alipay" />
        <el-option label="微信" value="wechat" />
      </el-select>
    </el-form-item>

    <!-- 备注 -->
    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="formData.remark"
        type="textarea"
        :rows="3"
        placeholder="请输入备注信息（选填）"
        maxlength="200"
        show-word-limit
      />
    </el-form-item>

    <!-- 凭证上传 -->
    <el-form-item label="充值凭证" prop="proof">
      <el-upload
        v-model:file-list="fileList"
        :action="uploadAction"
        :headers="uploadHeaders"
        :limit="1"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-remove="handleUploadRemove"
        :on-exceed="handleExceed"
        accept="image/*,.pdf"
      >
        <el-button type="primary" plain>点击上传</el-button>
        <template #tip>
          <div class="upload-tip">支持 JPG/PNG/PDF 格式，单个文件不超过 5MB</div>
        </template>
      </el-upload>
    </el-form-item>

    <!-- 提交 -->
    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">提交充值申请</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadUserFile } from 'element-plus'
import { formatDecimal } from '../utils/format'

/** 充值表单数据 */
interface RechargeFormData {
  amount: number
  paymentMethod: string
  remark: string
  proof: string
}

const props = withDefaults(defineProps<{
  /** 钱包余额 */
  walletBalance?: string
  /** 上传接口地址 */
  uploadAction?: string
}>(), {
  walletBalance: '',
  uploadAction: '/api/upload',
})

const emit = defineEmits<{
  (e: 'submit', data: RechargeFormData): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const fileList = ref<UploadUserFile[]>([])

const quickAmounts = [100, 500, 1000, 5000]

const formData = reactive<RechargeFormData>({
  amount: 0,
  paymentMethod: '',
  remark: '',
  proof: '',
})

const rules: FormRules = {
  amount: [{ required: true, message: '请输入充值金额', trigger: 'blur', type: 'number' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
}

/** 上传请求头（携带认证token） */
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
}

/** 上传前校验 */
function beforeUpload(file: File): boolean {
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 5MB')
    return false
  }
  return true
}

/** 上传成功回调 */
function handleUploadSuccess(response: any) {
  if (response && (response.code === 0 || response.url)) {
    formData.proof = response.data?.url || response.url || ''
    ElMessage.success('凭证上传成功')
  } else {
    ElMessage.error(response?.message || '上传失败')
  }
}

/** 移除凭证 */
function handleUploadRemove() {
  formData.proof = ''
}

/** 超出上传限制 */
function handleExceed() {
  ElMessage.warning('最多上传1个文件，请先删除已有文件')
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请完善表单信息')
    return
  }
  if (formData.amount <= 0) {
    ElMessage.warning('充值金额必须大于0')
    return
  }
  submitting.value = true
  emit('submit', { ...formData })
  submitting.value = false
}

function handleReset() {
  formRef.value?.resetFields()
  formData.proof = ''
  fileList.value = []
}
</script>

<style scoped>
.wallet-balance {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}
.amount-section {
  width: 100%;
}
.quick-amounts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.form-suffix {
  margin-left: 8px;
  color: #909399;
}
.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
