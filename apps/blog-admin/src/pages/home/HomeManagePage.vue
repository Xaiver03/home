<template>
  <div class="home-manage-page">
    <a-card title="主页配置管理" class="mb-4">
      <a-alert message="提示" description="这里管理主页的所有配置，包括网站链接、社交链接、欢迎文案等。修改后需要点击保存按钮才会生效。" type="info" show-icon class="mb-4" />

      <a-tabs v-model:activeKey="activeTab" type="card">
        <!-- 网站链接 -->
        <a-tab-pane key="siteLinks" tab="网站链接">
          <a-card title="主页网站链接管理" size="small">
            <a-alert message="链接说明" description="这些链接将显示在主页的网站列表中，每6个为一页。支持拖拽排序。" type="info" show-icon class="mb-4" />

            <div v-for="(link, index) in siteLinks" :key="index" class="border rounded p-4 mb-4">
              <div class="flex justify-between items-center mb-2">
                <h4>网站链接 {{ index + 1 }}: {{ link.name || '未命名' }}</h4>
                <div>
                  <a-button type="text" @click="moveSiteLinkUp(index)" :disabled="index === 0">上移</a-button>
                  <a-button type="text" @click="moveSiteLinkDown(index)" :disabled="index === siteLinks.length - 1">下移</a-button>
                  <a-button type="text" danger @click="removeSiteLink(index)">删除</a-button>
                </div>
              </div>
              <a-row :gutter="16">
                <a-col :span="5">
                  <a-form-item label="网站名称">
                    <a-input v-model:value="link.name" placeholder="如：博客" />
                  </a-form-item>
                </a-col>
                <a-col :span="4">
                  <a-form-item label="类型">
                    <a-select v-model:value="link.type" placeholder="链接类型">
                      <a-select-option value="link">普通链接</a-select-option>
                      <a-select-option value="qr">二维码弹窗</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="7">
                  <a-form-item v-if="link.type !== 'qr'" label="链接地址">
                    <a-input v-model:value="link.link" placeholder="完整的URL地址" />
                  </a-form-item>
                  <a-form-item v-else label="二维码图片">
                    <div class="flex items-center gap-2">
                      <a-input v-model:value="link.link" placeholder="图片URL" class="flex-1" />
                      <a-upload
                        :show-upload-list="false"
                        :before-upload="(file) => handleQrUpload(file, index)"
                        accept="image/*"
                      >
                        <a-button size="small">上传</a-button>
                      </a-upload>
                    </div>
                    <img v-if="link.link && link.type === 'qr'" :src="link.link" class="mt-2 rounded" style="width:80px;height:80px;object-fit:cover" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="图标名称">
                    <a-select v-model:value="link.icon" placeholder="选择图标">
                      <a-select-option value="Blog">Blog (博客)</a-select-option>
                      <a-select-option value="Cloud">Cloud (云盘)</a-select-option>
                      <a-select-option value="CompactDisc">CompactDisc (音乐)</a-select-option>
                      <a-select-option value="Compass">Compass (起始页)</a-select-option>
                      <a-select-option value="Book">Book (书籍)</a-select-option>
                      <a-select-option value="Fire">Fire (热榜)</a-select-option>
                      <a-select-option value="LaptopCode">LaptopCode (编程)</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="2">
                  <a-form-item label="预览">
                    <div class="text-center text-lg">
                      {{ getIconPreview(link.icon) }}
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" @click="addSiteLink" block>+ 添加网站链接</a-button>
          </a-card>
        </a-tab-pane>

        <!-- 社交链接 -->
        <a-tab-pane key="socialLinks" tab="社交链接">
          <a-card title="社交链接管理" size="small">
            <a-alert message="社交说明" description="这些链接将显示在主页底部的社交链接区域。支持自定义图标和提示文字。" type="info" show-icon class="mb-4" />

            <div v-for="(link, index) in socialLinks" :key="index" class="border rounded p-4 mb-4">
              <div class="flex justify-between items-center mb-2">
                <h4>社交链接 {{ index + 1 }}: {{ link.name || '未命名' }}</h4>
                <div>
                  <a-button type="text" @click="moveSocialLinkUp(index)" :disabled="index === 0">上移</a-button>
                  <a-button type="text" @click="moveSocialLinkDown(index)" :disabled="index === socialLinks.length - 1">下移</a-button>
                  <a-button type="text" danger @click="removeSocialLink(index)">删除</a-button>
                </div>
              </div>
              <a-row :gutter="16">
                <a-col :span="6">
                  <a-form-item label="平台名称">
                    <a-input v-model:value="link.name" placeholder="如：GitHub" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="链接地址">
                    <a-input v-model:value="link.url" placeholder="完整的URL地址" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="提示文字">
                    <a-input v-model:value="link.tip" placeholder="鼠标悬停时的提示" />
                  </a-form-item>
                </a-col>
                <a-col :span="4">
                  <a-form-item label="图标上传">
                    <div class="flex flex-col items-center">
                      <img v-if="link.icon" :src="link.icon" alt="图标预览" class="w-8 h-8 mb-2" />
                      <a-upload
                        :before-upload="(file) => handleIconUpload(file, index)"
                        :show-upload-list="false"
                        accept="image/*"
                      >
                        <a-button size="small" :loading="uploading">
                          <UploadOutlined /> 上传图标
                        </a-button>
                      </a-upload>
                      <a-input v-model:value="link.icon" placeholder="或直接输入图标URL" size="small" class="mt-2" />
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" @click="addSocialLink" block>+ 添加社交链接</a-button>
          </a-card>
        </a-tab-pane>

        <!-- 主页文案 -->
        <a-tab-pane key="homeText" tab="主页文案">
          <a-card title="主页文案配置" size="small">
            <a-form layout="vertical">
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-form-item label="网站名称">
                    <a-input v-model:value="homeTexts.siteName" placeholder="显示在浏览器标题和PWA中" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="网站作者">
                    <a-input v-model:value="homeTexts.siteAuthor" placeholder="网站作者名称" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="站点URL">
                    <a-input v-model:value="homeTexts.siteUrl" placeholder="公司官网域名或完整 URL" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="16">
                  <a-form-item label="站点Logo">
                    <a-input v-model:value="homeTexts.siteLogo" placeholder="Logo图片路径，如：/images/icon/logo.png" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="Logo预览">
                    <div class="text-center">
                      <img v-if="homeTexts.siteLogo" :src="homeTexts.siteLogo" alt="Logo预览" class="w-16 h-16 object-contain" />
                      <span v-else class="text-gray-400">未设置Logo</span>
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="主问候语">
                    <a-input v-model:value="homeTexts.helloText" placeholder="Hello World !" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="备用问候语">
                    <a-input v-model:value="homeTexts.helloOther" placeholder="Oops !" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="个人简介">
                <a-textarea v-model:value="homeTexts.descText" placeholder="显示在主页的个人简介" :rows="3" />
              </a-form-item>

              <a-form-item label="备用简介">
                <a-textarea v-model:value="homeTexts.descTextOther" placeholder="点击彩蛋时显示的备用简介" :rows="3" />
              </a-form-item>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="建站时间">
                    <a-date-picker v-model:value="homeTexts.siteStart" placeholder="选择建站日期" style="width: 100%" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="ICP备案号">
                    <a-input v-model:value="homeTexts.siteIcp" placeholder="如：湘ICP备2026026942号-1" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </a-tab-pane>
      </a-tabs>

      <!-- 操作按钮 -->
      <div class="text-center mt-6 space-x-4">
        <a-button type="default" size="large" @click="loadConfigurations">
          <ReloadOutlined /> 重新加载
        </a-button>
        <a-button type="primary" size="large" @click="saveAllConfigurations" :loading="saving">
          <SaveOutlined /> 保存所有配置
        </a-button>
        <a-button type="default" size="large" @click="previewHomePage" target="_blank">
          <EyeOutlined /> 预览主页
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { message } from 'ant-design-vue'
import {
  UploadOutlined,
  SaveOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import {
  COMPANY_HOME_DEFAULTS,
  COMPANY_SITE_LINKS,
  getPublicSiteOrigin,
  resolvePublicPreviewUrl,
} from '@/config/companyBrand.mjs'

const { proxy } = getCurrentInstance()

// 响应式数据
const activeTab = ref('siteLinks')
const saving = ref(false)
const uploading = ref(false)

// 网站链接
const siteLinks = ref([])

// 社交链接
const socialLinks = ref([])

// 主页文案
const homeTexts = ref({
  siteName: '',
  siteAuthor: '',
  siteUrl: '',
  siteLogo: '',
  helloText: '',
  helloOther: '',
  descText: '',
  descTextOther: '',
  siteStart: null,
  siteIcp: ''
})

// 数组移动方法
const moveItemUp = (array, index) => {
  if (index > 0) {
    [array[index], array[index - 1]] = [array[index - 1], array[index]]
  }
}

const moveItemDown = (array, index) => {
  if (index < array.length - 1) {
    [array[index], array[index + 1]] = [array[index + 1], array[index]]
  }
}

// 网站链接管理
const addSiteLink = () => {
  siteLinks.value.push({ name: '', link: '', icon: 'Blog', type: 'link' })
}

const removeSiteLink = (index) => {
  siteLinks.value.splice(index, 1)
}

const moveSiteLinkUp = (index) => moveItemUp(siteLinks.value, index)
const moveSiteLinkDown = (index) => moveItemDown(siteLinks.value, index)

// 社交链接管理
const addSocialLink = () => {
  socialLinks.value.push({ name: '', url: '', icon: '', tip: '' })
}

const removeSocialLink = (index) => {
  socialLinks.value.splice(index, 1)
}

const moveSocialLinkUp = (index) => moveItemUp(socialLinks.value, index)
const moveSocialLinkDown = (index) => moveItemDown(socialLinks.value, index)

// 图标预览
const getIconPreview = (iconName) => {
  const iconMap = {
    'Blog': '📝',
    'Cloud': '☁️',
    'CompactDisc': '💿',
    'Compass': '🧭',
    'Book': '📚',
    'Fire': '🔥',
    'LaptopCode': '💻'
  }
  return iconMap[iconName] || '❓'
}

// 处理图标上传
const handleIconUpload = async (file, index) => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', '/image/social/')
    formData.append('uuidOrNot', 'true')

    const response = await proxy.$api.uploadImage(formData)
    if (response.code === 1) {
      socialLinks.value[index].icon = response.data.url
      message.success('图标上传成功')
    } else {
      message.error('图标上传失败')
    }
  } catch (error) {
    message.error('图标上传失败: ' + error.message)
  } finally {
    uploading.value = false
  }
  return false
}

// 上传二维码图片
const handleQrUpload = async (file, index) => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', '/image/qr/')
    formData.append('uuidOrNot', 'true')

    const response = await proxy.$api.uploadImage(formData)
    if (response.code === 1) {
      siteLinks.value[index].link = response.data.url
      message.success('二维码上传成功')
    } else {
      message.error('二维码上传失败')
    }
  } catch (error) {
    message.error('二维码上传失败: ' + error.message)
  } finally {
    uploading.value = false
  }
  return false
}

// 预览主页
const previewHomePage = () => {
  const siteOrigin = getPublicSiteOrigin(
    import.meta.env.VITE_PUBLIC_SITE_URL,
    import.meta.env.DEV
  )
  window.open(resolvePublicPreviewUrl(siteOrigin, '/'), '_blank')
}

// 保存配置的辅助函数
const saveConfig = async (label, content, type = 'JSON') => {
  try {
    const response = await proxy.$api.getAllConfig()
    if (response.code === 1) {
      const existingConfig = response.data.data.find(config => config.label === label)

      if (existingConfig) {
        // 更新现有配置
        await proxy.$api.updateConfig({
          id: existingConfig.id,
          label,
          content: typeof content === 'string' ? content : JSON.stringify(content),
          type
        })
      } else {
        // 创建新配置
        await proxy.$api.addConfig({
          label,
          content: typeof content === 'string' ? content : JSON.stringify(content),
          type
        })
      }
    }
  } catch (error) {
    console.error(`保存配置 ${label} 失败:`, error)
    throw error
  }
}

// 保存所有配置
const saveAllConfigurations = async () => {
  saving.value = true
  try {
    // 保存网站链接
    await saveConfig('site-links', siteLinks.value)

    // 保存社交链接
    await saveConfig('social-links', socialLinks.value)

    // 保存主页文案
    const homeTextsToSave = {
      ...homeTexts.value,
      siteStart: homeTexts.value.siteStart ? homeTexts.value.siteStart.format('YYYY-MM-DD') : null
    }
    await saveConfig('home-texts', homeTextsToSave)

    message.success('所有配置保存成功！')
  } catch (error) {
    message.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

// 加载现有配置
const loadConfigurations = async () => {
  try {
    const response = await proxy.$api.getAllConfig()
    if (response.code === 1) {
      const configData = response.data.data

      configData.forEach(config => {
        try {
          switch (config.label) {
            case 'site-links':
              siteLinks.value = JSON.parse(config.content)
              break
            case 'social-links':
              socialLinks.value = JSON.parse(config.content)
              break
            case 'home-texts': {
              const homeTextsData = JSON.parse(config.content)
              homeTexts.value = {
                ...homeTextsData,
                siteStart: homeTextsData.siteStart ? dayjs(homeTextsData.siteStart) : null
              }
              break
            }
          }
        } catch (e) {
          console.warn(`解析配置 ${config.label} 失败:`, e)
        }
      })

      message.success('配置加载成功')
    }
  } catch (error) {
    message.error('加载配置失败: ' + error.message)
  }
}

// 初始化默认值
const initializeDefaults = () => {
  // 网站链接默认值
  if (siteLinks.value.length === 0) {
    siteLinks.value = COMPANY_SITE_LINKS.map(link => ({ ...link }))
  }

  // 社交链接默认值
  if (socialLinks.value.length === 0) {
    socialLinks.value = []
  }

  // 主页文案默认值
  if (!homeTexts.value.siteName) {
    homeTexts.value = { ...COMPANY_HOME_DEFAULTS }
  }
}

onMounted(() => {
  initializeDefaults()
  loadConfigurations()
})
</script>

<style scoped>
.home-manage-page {
  padding: 24px;
}

.border {
  border: 1px solid #d9d9d9;
}

.rounded {
  border-radius: 6px;
}

.space-x-4 > * + * {
  margin-left: 16px;
}
</style>
