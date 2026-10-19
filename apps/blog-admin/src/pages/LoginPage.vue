<template>
  <div class="login-page">
    <section class="brand-panel">
      <div class="brand-content">
        <div class="brand-logo"><DashboardOutlined class="logo-icon" /></div>
        <h1 class="brand-title">灯下灯</h1>
        <p class="brand-subtitle">博客管理后台</p>
        <div class="feature-list">
          <div class="feature-item"><FileTextOutlined /><span>文章创作与管理</span></div>
          <div class="feature-item"><SettingOutlined /><span>站点配置与友链</span></div>
          <div class="feature-item"><BarChartOutlined /><span>数据看板与分析</span></div>
        </div>
      </div>
    </section>
    <section class="form-panel">
      <div class="form-card">
        <div class="form-header">
          <h2 class="form-title">进入管理后台</h2>
          <p class="form-desc">使用中央统一身份登录，管理能力由中央实时签发</p>
        </div>
        <a-button type="primary" size="large" block class="login-btn" @click="startLogin">
          使用统一身份登录
        </a-button>
        <div v-if="claimRequired" class="claim-panel">
          <h3>绑定已有管理员记录</h3>
          <p>这是一次性双证明绑定：中央身份 + 原管理员密码。绑定不会按邮箱自动合并账号。</p>
          <a-input v-model:value="claim.mail" placeholder="原管理员邮箱" autocomplete="email" />
          <a-input-password v-model:value="claim.proof" class="claim-input" placeholder="原管理员密码" autocomplete="current-password" />
          <a-button block :loading="claiming" @click="submitClaim">完成绑定</a-button>
        </div>
        <p v-if="message" class="login-message">{{ message }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { notification } from 'ant-design-vue';
import { DashboardOutlined, FileTextOutlined, SettingOutlined, BarChartOutlined } from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();
const claim = reactive({ mail: '', proof: '' });
const claiming = ref(false);
const message = ref('');
const claimRequired = computed(() => route.query.auth_error === 'identity_binding_required');

const startLogin = () => {
  window.location.assign('/api/auth/oidc/start?mode=management&return_to=%2Fadmin%2F');
};

const csrf = () => {
  const item = document.cookie.split('; ').find((entry) => entry.startsWith('__Host-home_csrf='));
  return item ? decodeURIComponent(item.slice('__Host-home_csrf='.length)) : '';
};

const submitClaim = async () => {
  if (!claim.mail || !claim.proof) {
    message.value = '请提供原管理员邮箱和密码';
    return;
  }
  claiming.value = true;
  try {
    await axios.post('/api/auth/claim', { kind: 'admin', mail: claim.mail, proofType: 'password', proof: claim.proof }, {
      withCredentials: true,
      headers: { 'X-CSRF-Token': csrf() },
    });
    notification.success({ message: '绑定成功', description: '正在进入管理后台' });
    router.replace('/');
  } catch (error) {
    message.value = error?.response?.data?.msg || '绑定失败，请确认原账号证明';
  } finally {
    claiming.value = false;
  }
};
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; background: linear-gradient(135deg, #ecf4f0, #dce9e2); color: #17201d; }
.brand-panel { width: 42%; display: flex; align-items: center; justify-content: center; padding: 4rem; background: #1d4d40; color: #f6f7f1; }
.brand-content { max-width: 28rem; }
.brand-logo { font-size: 2.6rem; margin-bottom: 1.6rem; }
.brand-title { margin: 0; font-size: 3rem; }
.brand-subtitle { opacity: .78; font-size: 1.2rem; }
.feature-list { display: grid; gap: 1rem; margin-top: 3rem; }
.feature-item { display: flex; align-items: center; gap: .8rem; opacity: .9; }
.form-panel { flex: 1; display: grid; place-items: center; padding: 2rem; }
.form-card { width: min(100%, 30rem); max-width: 30rem; padding: 2.4rem; border-radius: 1.2rem; background: rgba(255,255,255,.82); box-shadow: 0 1.5rem 4rem rgba(23,32,29,.12); }
.form-header { margin-bottom: 2rem; }
.form-title { margin: 0 0 .5rem; font-size: 1.8rem; }
.form-desc { color: #65706a; line-height: 1.6; }
.login-btn { height: 3rem; }
.claim-panel { display: grid; gap: .8rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #dfe4da; }
.claim-panel h3 { margin: 0; }
.claim-panel p, .login-message { color: #65706a; line-height: 1.6; }
.claim-input { margin-top: .4rem; }
@media (max-width: 720px) { .login-page { display: block; } .brand-panel { width: auto; min-height: 16rem; padding: 2rem; } .feature-list { display: none; } }
</style>
