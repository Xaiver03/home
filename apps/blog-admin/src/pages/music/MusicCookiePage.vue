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
        <a-button @click="openImportModal">导入 Cookie</a-button>
        <a-button v-if="status.hasKey" @click="refreshCookie" :loading="refreshing">刷新续期</a-button>
        <a-popconfirm v-if="status.hasKey" title="确认清除 musickey？" @confirm="deleteCookie">
          <a-button danger>清除</a-button>
        </a-popconfirm>
      </a-space>
    </a-card>

    <!-- 扫码弹窗 -->
    <a-modal v-model:open="scanModalOpen" title="扫码登录 QQ 音乐" :footer="null" @cancel="stopScanWatch" width="320px">
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

    <!-- Cookie 导入弹窗 -->
    <a-modal v-model:open="importModalOpen" title="导入 QQ 音乐 Cookie" :confirm-loading="importing" @ok="importCookie" width="560px">
      <a-alert class="mb-4" type="info" show-icon message="从 y.qq.com 登录后复制 Cookie，需包含 uin 和 qm_keyst 或 qqmusic_key。" />
      <a-textarea v-model:value="cookieText" :rows="8" placeholder="uin=...; qm_keyst=...; qqmusic_key=..." />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed } from 'vue'
import { notification } from 'ant-design-vue'
import http from '@/api/http'
import { getToken } from '@/utils/auth'

const status = ref({ hasKey: false })
const qrcode = ref('')
const qrcodeLoading = ref(false)
const scanModalOpen = ref(false)
const importModalOpen = ref(false)
const cookieText = ref('')
const importing = ref(false)
const pollMsg = ref('等待扫码...')
const pollStatus = ref(66)
const refreshing = ref(false)
const qrSessionId = ref('')
let pollTimer = null
let wsClient = null
let wsSubscribeTimer = null
let wsSettled = false
let scanFinished = false

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

const handleScanResponse = (responseData) => {
  const s = responseData.status
  const msg = responseData.msg
  const code = responseData.code
  pollStatus.value = (s != null) ? s : code
  pollMsg.value = msg

  if (s === 0) {
    scanFinished = true
    stopScanWatch()
    scanModalOpen.value = false
    notification.success({ message: '登录成功', description: 'QQ 音乐 Cookie 已保存' })
    loadStatus()
  } else if (s === 65) {
    scanFinished = true
    stopScanWatch()
    notification.warning({ message: '二维码已过期', description: '请重新获取二维码' })
  } else if (code < 0) {
    scanFinished = true
    stopScanWatch()
    notification.error({ message: '登录失败', description: msg || '未知错误' })
  }
}

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_BASE_URL) return import.meta.env.VITE_WS_BASE_URL
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}

const clearWsSubscribeTimer = () => {
  if (wsSubscribeTimer) {
    clearTimeout(wsSubscribeTimer)
    wsSubscribeTimer = null
  }
}

const closeWs = () => {
  clearWsSubscribeTimer()
  if (wsClient) {
    const client = wsClient
    wsClient = null
    client.onclose = null
    client.onerror = null
    client.onmessage = null
    client.close()
  }
}

const fallbackToPoll = () => {
  if (pollTimer) return
  closeWs()
  startPoll()
}

const startWsPush = () => {
  const token = getToken()
  if (!token || !qrSessionId.value || !window.WebSocket) {
    fallbackToPoll()
    return
  }

  wsSettled = false
  closeWs()
  const client = new WebSocket(getWsUrl())
  wsClient = client

  wsSubscribeTimer = setTimeout(() => {
    if (!wsSettled) fallbackToPoll()
  }, 3000)

  client.onopen = () => {
    client.send(JSON.stringify({
      type: 'subscribe',
      id: `music-qr-${Date.now()}`,
      channel: 'music.qr',
      token,
      params: { sessionId: qrSessionId.value },
    }))
  }

  client.onmessage = (event) => {
    let message
    try {
      message = JSON.parse(event.data)
    } catch {
      fallbackToPoll()
      return
    }

    if (message.type === 'connected') return

    if (message.type === 'subscribed') {
      wsSettled = true
      clearWsSubscribeTimer()
      stopPoll()
      return
    }

    if (message.type === 'error') {
      fallbackToPoll()
      return
    }

    if (message.type === 'event' && message.channel === 'music.qr' && message.data) {
      handleScanResponse(message.data)
    }
  }

  client.onerror = () => {
    if (scanModalOpen.value && !scanFinished && !pollTimer) fallbackToPoll()
  }

  client.onclose = () => {
    if (scanModalOpen.value && !scanFinished && !pollTimer) fallbackToPoll()
  }
}

const loadQrCode = async () => {
  qrcodeLoading.value = true
  pollMsg.value = '加载中...'
  stopScanWatch()
  try {
    const res = await http.get('/music/qrcode')
    if (res.data.code === 0) {
      qrcode.value = res.data.data.qrcode
      qrSessionId.value = res.data.data.sessionId || ''
      pollMsg.value = '等待扫码...'
      pollStatus.value = 66
      startWsPush()
    } else {
      pollMsg.value = res.data.msg || '获取失败'
      pollStatus.value = -2
    }
  } catch (e) {
    pollMsg.value = '获取失败，请检查网络后重试'
    pollStatus.value = -2
  } finally {
    qrcodeLoading.value = false
  }
}

const startPoll = () => {
  let failCount = 0
  const pollAction = async () => {
    try {
      const url = qrSessionId.value ? `/music/qrcode/poll?sessionId=${encodeURIComponent(qrSessionId.value)}` : '/music/qrcode/poll'
      const res = await http.get(url)
      handleScanResponse(res.data)
      failCount = 0
    } catch (e) {
      failCount = failCount + 1
      if (failCount > 10) {
        stopPoll()
        pollMsg.value = '网络异常，请重试'
        notification.error({ message: '轮询失败', description: '网络连接异常，请检查网络后重试' })
      }
    }
  }
  pollAction()
  pollTimer = setInterval(pollAction, 2000)
}

const stopPoll = () => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

const stopScanWatch = () => {
  wsSettled = false
  stopPoll()
  closeWs()
}

const openScanModal = async () => {
  scanModalOpen.value = true
  qrcode.value = ''
  qrSessionId.value = ''
  scanFinished = false
  await loadQrCode()
}

const openImportModal = () => {
  importModalOpen.value = true
}

const importCookie = async () => {
  if (!cookieText.value.trim()) {
    notification.error({ message: '请先粘贴 Cookie' })
    return
  }
  importing.value = true
  try {
    const res = await http.post('/music/cookie/import', { cookie: cookieText.value })
    if (res.data.code === 0) {
      notification.success({ message: '导入成功' })
      importModalOpen.value = false
      cookieText.value = ''
      loadStatus()
    } else {
      notification.error({ message: res.data.msg || '导入失败' })
    }
  } finally {
    importing.value = false
  }
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

onUnmounted(stopScanWatch)
loadStatus()
</script>
