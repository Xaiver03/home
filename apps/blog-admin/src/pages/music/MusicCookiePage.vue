<template>
  <div class="music-page px-8 py-6">
    <a-card title="QQ 音乐 Cookie 管理" class="mb-6">
      <template #extra>
        <a-tag v-if="status.hasKey" color="success">已登录</a-tag>
        <a-tag v-else color="default">未登录</a-tag>
      </template>

      <a-descriptions v-if="status.hasKey" bordered :column="1" size="small" class="mb-4">
        <a-descriptions-item label="musickey">{{ status.musickey }}</a-descriptions-item>
        <a-descriptions-item label="QQ号">{{ status.uin }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ status.updatedAt }}</a-descriptions-item>
        <a-descriptions-item label="预计过期">{{ status.expiresAt }}</a-descriptions-item>
      </a-descriptions>
      <a-empty v-else description="尚未配置，请扫码登录" class="mb-4" />

      <a-space>
        <a-button type="primary" @click="openScanModal">扫码登录</a-button>
        <a-button v-if="status.hasKey" @click="refreshCookie" :loading="refreshing">刷新续期</a-button>
        <a-popconfirm v-if="status.hasKey" title="确认清除 musickey？" @confirm="deleteCookie">
          <a-button danger>清除</a-button>
        </a-popconfirm>
      </a-space>
    </a-card>

    <!-- 扫码弹窗 -->
    <a-modal v-model:open="scanModalOpen" title="扫码登录 QQ 音乐" :footer="null" @cancel="stopPoll" width="320px">
      <div class="flex flex-col items-center py-4 gap-4">
        <a-spin v-if="qrcodeLoading" tip="加载二维码..." />
        <template v-else>
          <img v-if="qrcode" :src="qrcode" width="200" height="200" alt="QQ音乐扫码" style="border:1px solid #eee; border-radius:8px" />
          <a-tag :color="statusTagColor">{{ pollMsg }}</a-tag>
          <a-button v-if="pollStatus === 65 || pollStatus === -2" @click="loadQrCode" size="small">重新获取</a-button>
          <a-typography-text type="secondary" style="font-size:12px">使用手机 QQ 扫码授权</a-typography-text>
        </template>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed } from 'vue'
import { notification } from 'ant-design-vue'
import http from '@/api/http'

const status = ref({ hasKey: false })
const qrcode = ref('')
const qrcodeLoading = ref(false)
const scanModalOpen = ref(false)
const pollMsg = ref('等待扫码...')
const pollStatus = ref(66)
const refreshing = ref(false)
let pollTimer = null

const statusTagColor = computed(() => {
  if (pollStatus.value === 0) return 'success'
  if (pollStatus.value === 65 || pollStatus.value === -2) return 'error'
  if (pollStatus.value === 67) return 'processing'
  return 'default'
})

const loadStatus = async () => {
  const res = await http.get('/music/cookie/status')
  if (res.data.code === 0) status.value = res.data.data
}

const loadQrCode = async () => {
  qrcodeLoading.value = true
  pollMsg.value = '加载中...'
  stopPoll()
  try {
    const res = await http.get('/music/qrcode')
    if (res.data.code === 0) {
      qrcode.value = res.data.data.qrcode
      pollMsg.value = '等待扫码...'
      pollStatus.value = 66
      startPoll()
    } else {
      pollMsg.value = res.data.msg || '获取失败'
      pollStatus.value = -2
    }
  } catch {
    pollMsg.value = '获取二维码失败'
    pollStatus.value = -2
  } finally {
    qrcodeLoading.value = false
  }
}

const startPoll = () => {
  let failCount = 0
  pollTimer = setInterval(async () => {
    try {
      const res = await http.get('/music/qrcode/poll')
      const { status: s, msg, code } = res.data
      pollStatus.value = s ?? code
      pollMsg.value = msg

      if (s === 0) {
        stopPoll()
        scanModalOpen.value = false
        notification.success({ message: '登录成功', description: 'QQ 音乐 Cookie 已保存' })
        loadStatus()
      } else if (s === 65) {
        stopPoll()
        notification.warning({ message: '二维码已过期', description: '请重新获取二维码' })
      } else if (code < 0) {
        // 后端返回错误，停止轮询并显示错误
        stopPoll()
        notification.error({ message: '登录失败', description: msg || '未知错误' })
      }
      failCount = 0
    } catch {
      failCount++
      if (failCount > 10) {
        stopPoll()
        pollMsg.value = '网络异常，请重试'
        notification.error({ message: '轮询失败', description: '网络连接异常，请检查网络后重试' })
      }
    }
    }
  }, 2000)
}

const stopPoll = () => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

const openScanModal = async () => {
  scanModalOpen.value = true
  qrcode.value = ''
  await loadQrCode()
}

const refreshCookie = async () => {
  refreshing.value = true
  try {
    const res = await http.post('/music/cookie/refresh')
    if (res.data.code === 0) {
      notification.success({ message: '刷新成功' })
      loadStatus()
    } else {
      notification.error({ message: res.data.msg })
    }
  } finally {
    refreshing.value = false
  }
}

const deleteCookie = async () => {
  await http.delete('/music/cookie')
  notification.success({ message: '已清除' })
  loadStatus()
}

onUnmounted(stopPoll)
loadStatus()
</script>
