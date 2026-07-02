<template>
    <div id="login-page" class="flex-box">
        <div id="login-card" class="flex-box min-w-96">
            <a-tabs v-model:activeKey="activeTab" centered>
                <!-- 验证码登录 -->
                <a-tab-pane key="code" tab="验证码登录">
                    <form @submit.prevent="loginByCode">
                        <a-space direction="vertical" size="middle" class="flex-box">
                            <h1>登录</h1>
                            <a-input v-model:value="codeLoginData.mail" class="card-item text-center" size="large"
                                placeholder="请输入管理员邮箱" />
                            <a-button v-if="sendCodeRest <= 0" @click="getLoginCode">发送验证码</a-button>
                            <a-button v-else :disabled="true">请 {{ sendCodeRest }} 秒后重试</a-button>
                            <a-input v-model:value="codeLoginData.code" class="card-item text-center" size="large"
                                placeholder="请输入验证码" />
                            <a-button class="card-item" html-type="submit">登录</a-button>
                        </a-space>
                    </form>
                </a-tab-pane>

                <!-- 账号密码登录 -->
                <a-tab-pane key="password" tab="账号密码登录">
                    <form @submit.prevent="loginByPassword">
                        <a-space direction="vertical" size="middle" class="flex-box">
                            <h1>登录</h1>
                            <a-input v-model:value="passwordLoginData.username" class="card-item text-center" size="large"
                                placeholder="请输入管理员账号" />
                            <a-input-password v-model:value="passwordLoginData.password" class="card-item text-center"
                                size="large" placeholder="请输入密码" />
                            <a-button class="card-item" html-type="submit">登录</a-button>
                        </a-space>
                    </form>
                </a-tab-pane>
            </a-tabs>
        </div>
    </div>
</template>

<script setup>
import { reactive, getCurrentInstance, ref } from "vue"
import { useRouter } from "vue-router";
const router = useRouter()
import Cookies from 'js-cookie';
import { setToken } from "@/utils/auth";
import utils from "@/utils";
const { proxy } = getCurrentInstance();

const activeTab = ref('code') // 当前登录方式

// 验证码登录数据
let codeLoginData = reactive({
    mail: null,
    code: null,
})
// 账号密码登录数据
let passwordLoginData = reactive({
    username: null,
    password: null,
})

let sendCodeRest = ref(0) // 发送验证码按钮的休息时长

// 登录成功后的统一处理
const handleLoginSuccess = (res) => {
    for (let key in res.data) {
        if (key != 'createTime' && key != 'updatedTime') {
            Cookies.set(key, res.data[key], { expires: 10, secure: false })
        }
    }
    // token 同时写入 localStorage，作为刷新后的双保险
    if (res.data.token) {
        setToken(res.data.token)
    }
    router.push('/')
}

const loginByCode = () => { // 验证码登录
    proxy.$api.adminLogin(codeLoginData).then(res => {
        if (utils.analysisData(res)) {
            handleLoginSuccess(res)
        }
    })
}

const loginByPassword = () => { // 账号密码登录
    proxy.$api.loginByPassword(passwordLoginData).then(res => {
        if (utils.analysisData(res)) {
            handleLoginSuccess(res)
        }
    })
}

const getLoginCode = () => {
    sendCodeRest.value = 60 // 60秒的休息时间
    const sendCodeInterval = setInterval(() => {
        if (--sendCodeRest.value <= 0) {
            clearInterval(sendCodeInterval)
        }
    }, 1000);
    proxy.$api.getLoginCode({ mail: codeLoginData.mail }).then(res => {
        utils.analysisData(res)
    })
}
</script>

<style lang="scss" scoped>
#login-page {
    width: 100%;
    height: 100%;

    h1 {
        font-size: $large-font-size;
    }

    #login-card {
        border-radius: 20px;
        padding: 2rem;
        border: 1px solid $main-text-color;
        min-width: 24rem;
    }

}

.flex-box {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
