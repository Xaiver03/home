<template>
  <div class="login-page">
    <!-- 左侧品牌面板 -->
    <div class="brand-panel">
      <div class="brand-content">
        <div class="brand-logo">
          <DashboardOutlined class="logo-icon" />
        </div>
        <h1 class="brand-title">{{ COMPANY_ADMIN_BRAND.name }}</h1>
        <p class="brand-subtitle">公司内容管理后台</p>
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

          <!-- 邮箱密码登录 -->
          <a-tab-pane key="password" tab="邮箱密码登录">
            <form @submit.prevent="loginByPassword" class="login-form">
              <div class="form-item">
                <label class="form-label">邮箱地址</label>
                <a-input
                  v-model:value="passwordLoginData.mail"
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
  LockOutlined,
} from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import { COMPANY_ADMIN_BRAND } from '@/config/companyBrand.mjs'

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
  mail: '',
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
  if (!passwordLoginData.mail) {
    notification.warning({ message: '请输入邮箱地址' })
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
  color: $main-text-color;
  font-family: $font-body;
}

// ========== 左侧品牌面板 ==========
.brand-panel {
  display: none;
  width: 460px;
  flex-shrink: 0;
  background:
    radial-gradient(circle at 18% 10%, color-mix(in srgb, $main-color 28%, transparent), transparent 22rem),
    linear-gradient(180deg, $main-background-color, $main-car-color);
  position: relative;
  overflow: hidden;

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
  border-radius: 8px;
  background: $surface-control;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  .logo-icon {
    font-size: 28px;
    color: $secondary-color;
  }
}

.brand-title {
  color: $main-text-color;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: 0;
}

.brand-subtitle {
  color: $secondary-text-color;
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
  color: $main-text-color;
  font-size: 14px;

  .feature-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: $surface-control;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: $secondary-color;
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
  background: transparent;
}

.form-card {
  width: 100%;
  max-width: 420px;
  background: $surface-glass-strong;
  border-radius: $radius-card;
  border: 1px solid $surface-border;
  box-shadow: $surface-inner-highlight, $surface-shadow;
  backdrop-filter: blur($surface-blur) saturate(165%);
  padding: 40px 36px;
}

.form-header {
  text-align: center;
  margin-bottom: 8px;
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  color: $main-text-color;
  margin: 0 0 6px 0;
}

.form-desc {
  font-size: 14px;
  color: $secondary-text-color;
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
  color: $main-text-color;
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
  border-radius: $radius-control;
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
    border-radius: $radius-capsule;
  }
}

// ========== Input 覆盖 ==========
:deep(.ant-input-affix-wrapper),
:deep(.ant-input) {
  border-radius: 8px;
  border-color: $surface-border;

  &:hover {
    border-color: $secondary-color;
  }

  &:focus,
  &.ant-input-affix-wrapper-focused {
    border-color: $main-color;
    box-shadow: $focus-ring;
  }
}

:deep(.ant-input-prefix) {
  color: $secondary-text-color;
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
