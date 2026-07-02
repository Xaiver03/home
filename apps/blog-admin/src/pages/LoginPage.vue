<template>
  <div class="login-page">
    <!-- 左侧品牌面板 -->
    <div class="brand-panel">
      <div class="brand-content">
        <div class="brand-logo">
          <DashboardOutlined class="logo-icon" />
        </div>
        <h1 class="brand-title">Bokey Space</h1>
        <p class="brand-subtitle">博客管理后台</p>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <FileTextOutlined />
            </div>
            <span>文章创作与管理</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <SettingOutlined />
            </div>
            <span>站点配置与友链</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <BarChartOutlined />
            </div>
            <span>数据看板与分析</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="form-panel">
      <div class="form-card">
        <div class="form-header">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-desc">请选择登录方式以继续</p>
        </div>

        <a-tabs v-model:activeKey="activeTab" centered class="login-tabs">
          <!-- 验证码登录 -->
          <a-tab-pane key="code" tab="验证码登录">
            <form @submit.prevent="loginByCode" class="login-form">
              <div class="form-item">
                <label class="form-label">邮箱地址</label>
                <a-input
                  v-model:value="codeLoginData.mail"
                  size="large"
                  placeholder="请输入管理员邮箱"
                  autocomplete="email"
                >
                  <template #prefix>
                    <MailOutlined />
                  </template>
                </a-input>
              </div>

              <div class="form-item">
                <label class="form-label">验证码</label>
                <div class="code-row">
                  <a-input
                    v-model:value="codeLoginData.code"
                    size="large"
                    placeholder="请输入验证码"
                    class="code-input"
                    autocomplete="off"
                  >
                    <template #prefix>
                      <SafetyOutlined />
                    </template>
                  </a-input>
                  <a-button
                    v-if="sendCodeRest <= 0"
                    @click="getLoginCode"
                    class="send-btn"
                    size="large"
                    type="primary"
                    ghost
                  >
                    发送验证码
                  </a-button>
                  <a-button v-else disabled class="send-btn" size="large">
                    请 {{ sendCodeRest }} 秒后重试
                  </a-button>
                </div>
              </div>

              <a-button
                html-type="submit"
                type="primary"
                size="large"
                class="login-btn"
                :loading="codeLoading"
                block
              >
                登录
              </a-button>
            </form>
          </a-tab-pane>

          <!-- 账号密码登录 -->
          <a-tab-pane key="password" tab="账号密码登录">
            <form @submit.prevent="loginByPassword" class="login-form">
              <div class="form-item">
                <label class="form-label">管理员账号</label>
                <a-input
                  v-model:value="passwordLoginData.username"
                  size="large"
                  placeholder="请输入管理员账号"
                  autocomplete="username"
                >
                  <template #prefix>
                    <UserOutlined />
                  </template>
                </a-input>
              </div>

              <div class="form-item">
                <label class="form-label">登录密码</label>
                <a-input-password
                  v-model:value="passwordLoginData.password"
                  size="large"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                >
                  <template #prefix>
                    <LockOutlined />
                  </template>
                </a-input-password>
              </div>

              <a-button
                html-type="submit"
                type="primary"
                size="large"
                class="login-btn"
                :loading="pwdLoading"
                block
              >
                登录
              </a-button>
            </form>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, getCurrentInstance } from "vue"
import { useRouter } from "vue-router"
import Cookies from 'js-cookie'
import { setToken } from "@/utils/auth"
import utils from "@/utils"
import {
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  BarChartOutlined,
  MailOutlined,
  SafetyOutlined,
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'

const { proxy } = getCurrentInstance()
const router = useRouter()

const activeTab = ref('code')
const codeLoading = ref(false)
const pwdLoading = ref(false)

const codeLoginData = reactive({
  mail: '',
  code: '',
})

const passwordLoginData = reactive({
  username: '',
  password: '',
})

let sendCodeRest = ref(0)

const handleLoginSuccess = (res) => {
  for (let key in res.data) {
    if (key != 'createTime' && key != 'updatedTime') {
      Cookies.set(key, res.data[key], { expires: 10, secure: false })
    }
  }
  if (res.data.token) {
    setToken(res.data.token)
  }
  notification.success({ message: '登录成功', description: '欢迎回来！' })
  router.push('/')
}

const loginByCode = () => {
  if (!codeLoginData.mail) {
    notification.warning({ message: '请输入邮箱地址' })
    return
  }
  if (!codeLoginData.code) {
    notification.warning({ message: '请输入验证码' })
    return
  }
  codeLoading.value = true
  proxy.$api.adminLogin(codeLoginData).then(res => {
    if (utils.analysisData(res)) {
      handleLoginSuccess(res)
    }
  }).finally(() => {
    codeLoading.value = false
  })
}

const loginByPassword = () => {
  if (!passwordLoginData.username) {
    notification.warning({ message: '请输入管理员账号' })
    return
  }
  if (!passwordLoginData.password) {
    notification.warning({ message: '请输入密码' })
    return
  }
  pwdLoading.value = true
  proxy.$api.loginByPassword(passwordLoginData).then(res => {
    if (utils.analysisData(res)) {
      handleLoginSuccess(res)
    }
  }).finally(() => {
    pwdLoading.value = false
  })
}

const getLoginCode = () => {
  if (!codeLoginData.mail) {
    notification.warning({ message: '请先输入邮箱地址' })
    return
  }
  sendCodeRest.value = 60
  const sendCodeInterval = setInterval(() => {
    if (--sendCodeRest.value <= 0) {
      clearInterval(sendCodeInterval)
    }
  }, 1000)
  proxy.$api.getLoginCode({ mail: codeLoginData.mail }).then(res => {
    utils.analysisData(res)
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

// ========== 左侧品牌面板 ==========
.brand-panel {
  display: none;
  width: 460px;
  flex-shrink: 0;
  background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.06);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -20%;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.04);
  }

  @media (min-width: 1024px) {
    display: flex;
    align-items: center;
  }
}

.brand-content {
  position: relative;
  z-index: 1;
  padding: 0 56px;
}

.brand-logo {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  .logo-icon {
    font-size: 28px;
    color: #60a5fa;
  }
}

.brand-title {
  color: #f1f5f9;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  color: #94a3b8;
  font-size: 15px;
  margin: 0 0 48px 0;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #cbd5e1;
  font-size: 14px;

  .feature-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(59, 130, 246, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #93c5fd;
    flex-shrink: 0;
  }
}

// ========== 右侧表单面板 ==========
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--main-background-color, #f8fafc);
}

.form-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03);
  padding: 40px 36px;
}

.form-header {
  text-align: center;
  margin-bottom: 8px;
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
}

.form-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

// ========== 表单样式 ==========
.login-form {
  margin-top: 20px;
}

.form-item {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 6px;
}

.code-row {
  display: flex;
  gap: 10px;

  .code-input {
    flex: 1;
  }

  .send-btn {
    flex-shrink: 0;
    min-width: 120px;
  }
}

.login-btn {
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  margin-top: 8px;
}

// ========== Tabs 覆盖 ==========
.login-tabs {
  :deep(.ant-tabs-nav) {
    margin-bottom: 4px;
  }

  :deep(.ant-tabs-tab) {
    font-size: 14px;
    padding: 10px 20px;
  }

  :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
    font-weight: 600;
  }

  :deep(.ant-tabs-ink-bar) {
    height: 3px;
    border-radius: 2px;
  }
}

// ========== Input 覆盖 ==========
:deep(.ant-input-affix-wrapper),
:deep(.ant-input) {
  border-radius: 10px;
  border-color: #e2e8f0;

  &:hover {
    border-color: #93c5fd;
  }

  &:focus,
  &.ant-input-affix-wrapper-focused {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

:deep(.ant-input-prefix) {
  color: #94a3b8;
  margin-right: 8px;
}

// ========== 响应式 ==========
@media (max-width: 1023px) {
  .form-card {
    max-width: 420px;
    padding: 32px 24px;
  }

  .brand-panel {
    display: none;
  }
}
</style>
