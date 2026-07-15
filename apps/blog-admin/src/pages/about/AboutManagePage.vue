<template>
  <div class="about-manage-page">
    <a-card title="关于我们页面管理" class="mb-4">
      <a-alert message="提示" description="所有内容都可以自由配置，修改后需要点击保存按钮才会生效。" type="info" show-icon class="mb-4" />

      <a-tabs v-model:activeKey="activeTab" type="card">
        <!-- 基本信息 -->
        <a-tab-pane key="basic" tab="基本信息">
          <a-card title="团队标识" size="small" class="mb-4">
            <div class="flex items-center gap-4">
              <a-avatar size="large" :src="configs['my-avatar']?.content">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <div>
                <a-upload
                  :before-upload="handleAvatarUpload"
                  :show-upload-list="false"
                  accept="image/*"
                >
                  <a-button type="primary" :loading="avatarUploading">
                    <UploadOutlined /> 上传头像
                  </a-button>
                </a-upload>
                <div class="text-sm text-gray-500 mt-1">推荐尺寸：200x200px，支持JPG/PNG/WebP格式</div>
              </div>
            </div>
          </a-card>

          <a-card title="团队基本信息" size="small" class="mb-4">
            <a-form layout="vertical">
              <a-form-item label="团队名称">
                <a-input v-model:value="basicInfo.name" placeholder="显示在关于我们页面的团队名称" />
              </a-form-item>
              <a-form-item label="团队标语">
                <a-input v-model:value="basicInfo.tagline" placeholder="显示在团队标识下方的定位" />
              </a-form-item>
              <a-form-item label="职业描述">
                <a-input v-model:value="basicInfo.profession" placeholder="职业或身份描述" />
              </a-form-item>
              <a-form-item label="差异化关键词">
                <a-input v-model:value="basicInfo.personality" placeholder="如：AI × Culture" />
              </a-form-item>
              <a-form-item label="关键词描述">
                <a-input v-model:value="basicInfo.personalityDesc" placeholder="团队定位的补充描述" />
              </a-form-item>
              <a-form-item label="欢迎文案">
                <a-textarea v-model:value="basicInfo.welcomeText" placeholder="显示在渐变卡片中的欢迎文案" :rows="3" />
              </a-form-item>
              <a-form-item label="团队介绍">
                <a-textarea v-model:value="basicInfo.introduction" placeholder="团队的业务、方法与价值主张" :rows="3" />
              </a-form-item>
            </a-form>
          </a-card>

          <a-card title="社交链接" size="small" class="mb-4">
            <div v-for="(link, index) in socialLinks" :key="index" class="border rounded p-4 mb-3">
              <div class="flex justify-between items-center mb-2">
                <h4>社交链接 {{ index + 1 }}</h4>
                <a-button type="text" danger @click="removeSocialLink(index)">删除</a-button>
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
                  <a-form-item label="图标上传">
                    <div class="flex items-center gap-2">
                      <img v-if="link.icon" :src="link.icon" alt="图标预览" class="w-8 h-8 object-contain rounded" />
                      <span v-else class="text-gray-400 text-sm">未上传</span>
                      <a-upload
                        :before-upload="(file) => handleSocialIconUpload(file, index)"
                        :show-upload-list="false"
                        accept="image/*"
                      >
                        <a-button size="small" :loading="uploading">
                          <UploadOutlined /> 上传
                        </a-button>
                      </a-upload>
                    </div>
                    <a-input v-model:value="link.icon" placeholder="或直接输入图片URL" size="small" class="mt-2" />
                  </a-form-item>
                </a-col>
                <a-col :span="4">
                  <a-form-item label="SVG图标名">
                    <a-input v-model:value="link.iconClass" placeholder="如：GitHub" />
                    <div class="text-xs text-gray-400 mt-1">GitHub / 公众号 等内置SVG</div>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" @click="addSocialLink" block>+ 添加社交链接</a-button>
          </a-card>
        </a-tab-pane>

        <!-- 关于本站 -->
        <a-tab-pane key="website" tab="关于本站">
          <a-card title="网站介绍滑动展示" size="small">
            <div v-for="(item, index) in websiteSlides" :key="index" class="border rounded p-4 mb-4">
              <div class="flex justify-between items-center mb-2">
                <h4>展示项 {{ index + 1 }}</h4>
                <div>
                  <a-button type="text" @click="moveSlideUp(index)" :disabled="index === 0">上移</a-button>
                  <a-button type="text" @click="moveSlideDown(index)" :disabled="index === websiteSlides.length - 1">下移</a-button>
                  <a-button type="text" danger @click="removeWebsiteSlide(index)">删除</a-button>
                </div>
              </div>
              <a-form layout="vertical">
                <a-form-item label="标题">
                  <a-input v-model:value="item.title" placeholder="展示项标题" />
                </a-form-item>
                <a-form-item label="背景图片">
                  <div class="flex items-center gap-4">
                    <img v-if="item.image" :src="item.image" alt="预览" class="w-20 h-20 object-cover rounded" />
                    <div v-else class="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                      <span class="text-gray-400">无图片</span>
                    </div>
                    <a-upload
                      :before-upload="(file) => handleImageUpload(file, 'website', index)"
                      :show-upload-list="false"
                      accept="image/*"
                    >
                      <a-button :loading="uploading">
                        <UploadOutlined /> 上传图片
                      </a-button>
                    </a-upload>
                    <a-input v-model:value="item.image" placeholder="或直接输入图片URL" style="flex: 1;" />
                  </div>
                </a-form-item>
                <a-form-item label="描述内容">
                  <div v-for="(text, textIndex) in item.text" :key="textIndex" class="flex gap-2 mb-2">
                    <a-textarea v-model:value="item.text[textIndex]" placeholder="描述段落（支持HTML标签）" auto-size />
                    <a-button type="text" danger @click="removeSlideText(index, textIndex)">删除</a-button>
                  </div>
                  <a-button type="dashed" @click="addSlideText(index)" size="small">+ 添加段落</a-button>
                </a-form-item>
              </a-form>
            </div>
            <a-button type="dashed" @click="addWebsiteSlide" block>+ 添加展示项</a-button>
          </a-card>
        </a-tab-pane>

        <!-- 技能 -->
        <a-tab-pane key="skills" tab="技能">
          <a-card title="技能标签管理" size="small">
            <div v-for="(item, index) in skills" :key="index" class="border rounded p-4 mb-4">
              <div class="flex justify-between items-center mb-2">
                <h4>{{ item.type === 'parting' ? '分割线: ' + (item.title || '未命名') : '技能标签: ' + (item.name || '未命名') }}</h4>
                <div>
                  <a-button type="text" @click="moveSkillUp(index)" :disabled="index === 0">上移</a-button>
                  <a-button type="text" @click="moveSkillDown(index)" :disabled="index === skills.length - 1">下移</a-button>
                  <a-button type="text" danger @click="removeSkill(index)">删除</a-button>
                </div>
              </div>
              <a-form layout="vertical">
                <a-form-item label="类型">
                  <a-select v-model:value="item.type" style="width: 120px">
                    <a-select-option value="tag">技能标签</a-select-option>
                    <a-select-option value="parting">分割线</a-select-option>
                  </a-select>
                </a-form-item>
                <template v-if="item.type === 'tag'">
                  <a-row :gutter="16">
                    <a-col :span="6">
                      <a-form-item label="技能名称">
                        <a-input v-model:value="item.name" placeholder="技能名称" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item label="链接地址">
                        <a-input v-model:value="item.url" placeholder="相关链接（可选）" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item label="标签颜色">
                        <a-input v-model:value="item.color" placeholder="#1890ff">
                          <template #addonBefore>
                            <div :style="{ backgroundColor: item.color, width: '20px', height: '20px' }"></div>
                          </template>
                        </a-input>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item label="图标类名">
                        <a-input v-model:value="item.iconClass" placeholder="icon-vue">
                          <template #addonAfter>
                            <i :class="`iconfont ${item.iconClass}`"></i>
                          </template>
                        </a-input>
                      </a-form-item>
                    </a-col>
                  </a-row>
                </template>
                <template v-else>
                  <a-form-item label="分割线标题">
                    <a-input v-model:value="item.title" placeholder="分割线标题" />
                  </a-form-item>
                </template>
              </a-form>
            </div>
            <a-button type="dashed" @click="addSkill" block>+ 添加技能项</a-button>
          </a-card>
        </a-tab-pane>

        <!-- 生涯 -->
        <a-tab-pane key="career" tab="生涯">
          <a-card title="生涯时间线" size="small">
            <div v-for="(item, index) in career" :key="index" class="border rounded p-4 mb-4">
              <div class="flex justify-between items-center mb-2">
                <h4>时间节点 {{ index + 1 }}: {{ item.time || '未设置时间' }}</h4>
                <div>
                  <a-button type="text" @click="moveCareerUp(index)" :disabled="index === 0">上移</a-button>
                  <a-button type="text" @click="moveCareerDown(index)" :disabled="index === career.length - 1">下移</a-button>
                  <a-button type="text" danger @click="removeCareer(index)">删除</a-button>
                </div>
              </div>
              <a-row :gutter="16">
                <a-col :span="6">
                  <a-form-item label="时间">
                    <a-input v-model:value="item.time" placeholder="如：2024年" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="事件描述">
                    <a-input v-model:value="item.label" placeholder="事件描述" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="图标">
                    <a-input v-model:value="item.icon" placeholder="🚀">
                      <template #addonAfter>
                        <span style="font-size: 16px;">{{ item.icon }}</span>
                      </template>
                    </a-input>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" @click="addCareer" block>+ 添加生涯节点</a-button>
          </a-card>
        </a-tab-pane>

        <!-- 关键词云 -->
        <a-tab-pane key="keywords" tab="关键词云">
          <a-card title="关键词标签" size="small">
            <a-form layout="vertical">
              <a-form-item label="关键词云HTML内容" extra="用于生成3D词云，每个关键词用 <a> 标签包裹">
                <a-textarea
                  v-model:value="keywordTags"
                  :rows="10"
                  placeholder="请输入HTML格式的关键词标签，如：<a href='#'>编程</a><a href='#'>设计</a><a href='#'>创新</a>"
                />
              </a-form-item>
              <a-form-item label="词云说明文字">
                <a-input v-model:value="keywordDescription" placeholder="显示在词云下方的说明文字" />
              </a-form-item>
            </a-form>
          </a-card>
        </a-tab-pane>

        <!-- 写在最后 -->
        <a-tab-pane key="thoughts" tab="写在最后">
          <a-card title="最后的想法" size="small">
            <div v-for="(thought, index) in finalThoughts" :key="index" class="border rounded p-4 mb-4">
              <div class="flex justify-between items-center mb-2">
                <h4>想法 {{ index + 1 }}</h4>
                <div>
                  <a-button type="text" @click="moveThoughtUp(index)" :disabled="index === 0">上移</a-button>
                  <a-button type="text" @click="moveThoughtDown(index)" :disabled="index === finalThoughts.length - 1">下移</a-button>
                  <a-button type="text" danger @click="removeFinalThought(index)">删除</a-button>
                </div>
              </div>
              <a-textarea
                v-model:value="finalThoughts[index]"
                :rows="3"
                placeholder="写下您的想法...（支持HTML标签）"
              />
            </div>
            <a-button type="dashed" @click="addFinalThought" block>+ 添加想法</a-button>

            <a-divider />

            <a-form layout="vertical">
              <a-form-item label="点击提示文字">
                <a-input v-model:value="finalThoughtsHint" placeholder="显示在想法区域下方的提示文字" />
              </a-form-item>
            </a-form>
          </a-card>
        </a-tab-pane>

        <!-- 页面文案 -->
        <a-tab-pane key="pageText" tab="页面文案">
          <a-card title="页面标题和文案配置" size="small">
            <a-form layout="vertical">
              <a-form-item label="关于本站 - 标题">
                <a-input v-model:value="pageTexts.aboutWebTitle" placeholder="关于本站" />
              </a-form-item>
              <a-form-item label="关于本站 - 副标题">
                <a-input v-model:value="pageTexts.aboutWebSubtitle" placeholder="About Web📍" />
              </a-form-item>
              <a-form-item label="关于我们 - 标题">
                <a-input v-model:value="pageTexts.aboutMeTitle" placeholder="关于我们" />
              </a-form-item>
              <a-form-item label="关于我们 - 副标题">
                <a-input v-model:value="pageTexts.aboutMeSubtitle" placeholder="About the Team" />
              </a-form-item>
              <a-form-item label="技能 - 标题">
                <a-input v-model:value="pageTexts.skillTitle" placeholder="技能" />
              </a-form-item>
              <a-form-item label="生涯 - 标题">
                <a-input v-model:value="pageTexts.careerTitle" placeholder="生涯" />
              </a-form-item>
              <a-form-item label="关键词 - 标题">
                <a-input v-model:value="pageTexts.keywordTitle" placeholder="关键词🔑" />
              </a-form-item>
              <a-form-item label="写在最后 - 标题">
                <a-input v-model:value="pageTexts.finalThoughtsTitle" placeholder="写在最后" />
              </a-form-item>
              <a-form-item label="写在最后 - 副标题">
                <a-input v-model:value="pageTexts.finalThoughtsSubtitle" placeholder="Final Thoughts💐" />
              </a-form-item>
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
        <a-button type="default" size="large" @click="previewAboutPage" target="_blank">
          <EyeOutlined /> 预览About页面
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  UploadOutlined,
  SaveOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'
import {
  COMPANY_ABOUT_DEFAULTS,
  resolvePublicPreviewUrl,
} from '@/config/companyBrand.mjs'

const { proxy } = getCurrentInstance()

// 响应式数据
const activeTab = ref('basic')
const saving = ref(false)
const uploading = ref(false)
const avatarUploading = ref(false)

// 所有配置的响应式存储
const configs = ref({})

// 基本信息
const basicInfo = ref({
  name: '',
  tagline: '',
  profession: '',
  personality: '',
  personalityDesc: '',
  welcomeText: '',
  introduction: ''
})

// 社交链接
const socialLinks = ref([])

// 关于本站滑动展示
const websiteSlides = ref([])

// 技能
const skills = ref([])

// 生涯
const career = ref([])

// 关键词云
const keywordTags = ref('')
const keywordDescription = ref('')

// 最后的想法
const finalThoughts = ref([])
const finalThoughtsHint = ref('')

// 页面文案
const pageTexts = ref({
  aboutWebTitle: '',
  aboutWebSubtitle: '',
  aboutMeTitle: '',
  aboutMeSubtitle: '',
  skillTitle: '',
  careerTitle: '',
  keywordTitle: '',
  finalThoughtsTitle: '',
  finalThoughtsSubtitle: ''
})

// 方法：处理头像上传
const handleAvatarUpload = async (file) => {
  avatarUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', '/image/about/')
    formData.append('uuidOrNot', 'true')

    const response = await proxy.$api.uploadImage(formData)
    if (response.code === 1) {
      configs.value['my-avatar'] = { content: response.data.url }
      message.success('头像上传成功')
    } else {
      message.error('头像上传失败')
    }
  } catch (error) {
    message.error('头像上传失败: ' + error.message)
  } finally {
    avatarUploading.value = false
  }
  return false
}

// 方法：处理图片上传
const handleImageUpload = async (file, type, index) => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', '/image/about/')
    formData.append('uuidOrNot', 'true')

    const response = await proxy.$api.uploadImage(formData)
    if (response.code === 1) {
      if (type === 'website') {
        websiteSlides.value[index].image = response.data.url
      }
      message.success('图片上传成功')
    } else {
      message.error('图片上传失败')
    }
  } catch (error) {
    message.error('图片上传失败: ' + error.message)
  } finally {
    uploading.value = false
  }
  return false
}

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

// 社交链接管理
const addSocialLink = () => {
  socialLinks.value.push({ name: '', url: '', icon: '', iconClass: '' })
}

const removeSocialLink = (index) => {
  socialLinks.value.splice(index, 1)
}

// 社交图标上传
const handleSocialIconUpload = async (file, index) => {
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

// 网站展示管理
const addWebsiteSlide = () => {
  websiteSlides.value.push({
    title: '',
    image: '',
    text: ['']
  })
}

const removeWebsiteSlide = (index) => {
  websiteSlides.value.splice(index, 1)
}

const moveSlideUp = (index) => moveItemUp(websiteSlides.value, index)
const moveSlideDown = (index) => moveItemDown(websiteSlides.value, index)

const addSlideText = (slideIndex) => {
  websiteSlides.value[slideIndex].text.push('')
}

const removeSlideText = (slideIndex, textIndex) => {
  websiteSlides.value[slideIndex].text.splice(textIndex, 1)
}

// 技能管理
const addSkill = () => {
  skills.value.push({ type: 'tag', name: '', url: '', color: '', iconClass: '' })
}

const removeSkill = (index) => {
  skills.value.splice(index, 1)
}

const moveSkillUp = (index) => moveItemUp(skills.value, index)
const moveSkillDown = (index) => moveItemDown(skills.value, index)

// 生涯管理
const addCareer = () => {
  career.value.push({ time: '', label: '', icon: '' })
}

const removeCareer = (index) => {
  career.value.splice(index, 1)
}

const moveCareerUp = (index) => moveItemUp(career.value, index)
const moveCareerDown = (index) => moveItemDown(career.value, index)

// 最后想法管理
const addFinalThought = () => {
  finalThoughts.value.push('')
}

const removeFinalThought = (index) => {
  finalThoughts.value.splice(index, 1)
}

const moveThoughtUp = (index) => moveItemUp(finalThoughts.value, index)
const moveThoughtDown = (index) => moveItemDown(finalThoughts.value, index)

// 预览About页面
const previewAboutPage = () => {
  window.open(
    resolvePublicPreviewUrl(import.meta.env.VITE_PUBLIC_SITE_URL, '/blog/about'),
    '_blank'
  )
}

// 安全解析配置内容（数据库JSON列已自动反序列化）
const safeParse = (val, fallback) => {
  if (!val) return fallback;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return val;
};

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
    // 保存头像
    if (configs.value['my-avatar']?.content) {
      await saveConfig('my-avatar', configs.value['my-avatar'].content, 'STRING')
    }

    // 保存基本信息
    await saveConfig('about-basic-info', basicInfo.value)

    // 保存社交链接
    await saveConfig('about-social-links', socialLinks.value)

    // 保存关于本站滑动展示
    await saveConfig('about-me-slide', websiteSlides.value)

    // 保存技能
    await saveConfig('skill-item', skills.value)

    // 保存生涯
    await saveConfig('career-line', career.value)

    // 保存关键词云
    await saveConfig('about-me-cloud-tags', keywordTags.value, 'STRING')
    await saveConfig('about-keyword-description', keywordDescription.value, 'STRING')

    // 保存最后想法
    await saveConfig('final-thoughts', finalThoughts.value)
    await saveConfig('final-thoughts-hint', finalThoughtsHint.value, 'STRING')

    // 保存页面文案
    await saveConfig('about-page-texts', pageTexts.value)

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

      // 重置configs对象
      configs.value = {}

      configData.forEach(config => {
        configs.value[config.label] = config

        try {
          switch (config.label) {
            case 'my-avatar':
              // 头像已经在configs中处理
              break
            case 'about-basic-info':
              basicInfo.value = safeParse(config.content, basicInfo.value)
              break
            case 'about-social-links':
              socialLinks.value = safeParse(config.content, socialLinks.value)
              break
            case 'about-me-slide':
              websiteSlides.value = safeParse(config.content, websiteSlides.value)
              break
            case 'skill-item':
              skills.value = safeParse(config.content, skills.value)
              break
            case 'career-line':
              career.value = safeParse(config.content, career.value)
              break
            case 'about-me-cloud-tags':
              keywordTags.value = config.content
              break
            case 'about-keyword-description':
              keywordDescription.value = config.content
              break
            case 'final-thoughts':
              finalThoughts.value = safeParse(config.content, finalThoughts.value)
              break
            case 'final-thoughts-hint':
              finalThoughtsHint.value = config.content
              break
            case 'about-page-texts':
              pageTexts.value = safeParse(config.content, pageTexts.value)
              break
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
  // 基本信息默认值
  if (!basicInfo.value.name) {
    basicInfo.value = { ...COMPANY_ABOUT_DEFAULTS.basicInfo }
  }

  // 社交链接默认值
  if (socialLinks.value.length === 0) {
    socialLinks.value = [...COMPANY_ABOUT_DEFAULTS.socialLinks]
  }

  // 页面文案默认值
  if (!pageTexts.value.aboutWebTitle) {
    pageTexts.value = { ...COMPANY_ABOUT_DEFAULTS.pageTexts }
  }

  // 其他默认值
  if (!keywordDescription.value) {
    keywordDescription.value = '从产品、工程与人文三个维度理解晓黎团队'
  }

  if (!finalThoughtsHint.value) {
    finalThoughtsHint.value = '点一点有惊喜'
  }
}

onMounted(() => {
  initializeDefaults()
  loadConfigurations()
})
</script>

<style scoped>
.about-manage-page {
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
