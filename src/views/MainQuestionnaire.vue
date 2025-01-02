<template>
  <div class="questionnaire-container">
    <div class="header-actions">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span> 返回个人空间
      </button>
      <div class="right-actions">
        <button class="download-btn" @click="downloadQuestionnaire" :disabled="!hasAnswers">
          <span class="download-icon">↓</span> 下载问卷
        </button>
        <button class="save-btn" @click="saveAnswers" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '保存当前' }}
        </button>
      </div>
    </div>

    <h1>生活问卷调查</h1>

    <div class="debug-info" v-if="isDev">
      <p>填写前须知：</p>
      <pre>本问卷仅用于个人生活记录，请如实填写，不得用于任何商业用途。</pre>
    </div>

    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-for="category in categories" :key="category.id" class="category-section">
      <div class="category-header">
        <h2>{{ category.title }}</h2>
        <p class="category-description">{{ category.description }}</p>
      </div>

      <div class="questions">
        <div v-for="question in getCategoryQuestions(category.id)"
             :key="question.id"
             class="question-card">
          <div class="question-header">
            <span class="question-number">{{ question.serialNumber }}</span>
            <h3>{{ question.text }}</h3>
          </div>

          <textarea
            v-model="answers[question.id]"
            :placeholder="'请输入您的回答...'"
            rows="4"
            class="answer-input"
            @input="autoSave"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { categories, questions } from '../data/questions'
import axios from 'axios'
import html2pdf from 'html2pdf.js'
import { API_URL } from '../config/api'

const router = useRouter()
const answers = ref({})
const isLoading = ref(false)
const isSaving = ref(false)

// 是否为开发环境
const isDev = ref(import.meta.env.DEV)

// 获取某个分类下的所有问题
const getCategoryQuestions = (categoryId) => {
  return questions.filter(q => q.category === categoryId)
}

// 返回个人空间
const goBack = () => {
  if (hasUnsavedChanges.value) {
    if (confirm('您确定要离开吗hhh？')) {
      router.push('/home')
    }
  } else {
    router.push('/home')
  }
}

// 自动保存相关
const hasUnsavedChanges = ref(false)
let autoSaveTimeout = null

const autoSave = () => {
  hasUnsavedChanges.value = true
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }
  autoSaveTimeout = setTimeout(() => {
    saveDraft()
  }, 2000)
}

// 保存草稿到本地存储
const saveDraft = () => {
  try {
    const userId = JSON.parse(localStorage.getItem('user')).id
    localStorage.setItem(`questionnaire_draft_${userId}`, JSON.stringify({
      answers: answers.value,
      timestamp: new Date().toISOString()
    }))
    console.log('草稿已保存')
  } catch (error) {
    console.error('保存草稿失败:', error)
  }
}

// 保存答案到服务器
const saveAnswers = async () => {
  if (isSaving.value) return

  isSaving.value = true
  try {
    const userId = JSON.parse(localStorage.getItem('user')).id
    const response = await axios.post(`${API_URL}/questionnaire/save`, {
      userId,
      answers: answers.value,
      updatedAt: new Date().toISOString()
    })

    if (response.data.success) {
      hasUnsavedChanges.value = false
      localStorage.removeItem(`questionnaire_draft_${userId}`) // 清除草稿
      alert('保存成功！')
    } else {
      throw new Error(response.data.message || '保存失败')
    }
  } catch (error) {
    // console.error('保存失败:', error)
    alert('保存hhh。')
    saveDraft() // 保存为草稿
  } finally {
    isSaving.value = false
  }
}

// 加载问卷数据
const loadQuestionnaireData = async () => {
  isLoading.value = true
  try {
    const userId = JSON.parse(localStorage.getItem('user')).id

    // 先尝试从服务器加载已保存的答案
    try {
      const res = await axios.get(`${API_URL}/questionnaire/${userId}`)
      console.log('从服务器获取到的问卷数据:', res.data)

      if (res.data?.status === 200 && res.data?.data?.answers) {
        answers.value = res.data.data.answers
        console.log('成功加载已保存的答案:', answers.value)
      } else {
        console.log('服务器返回的数据格式不正确:', res.data)
      }
    } catch (error) {
      console.log('从服务器加载数据失败:', error)
      // 尝试从本地草稿恢复
      const draft = localStorage.getItem(`questionnaire_draft_${userId}`)
      if (draft) {
        const draftData = JSON.parse(draft)
        answers.value = draftData.answers
        console.log('从本地草稿恢复数据:', answers.value)
      } else {
        console.log('没有找到本地草稿，初始化空答案')
        answers.value = {}
      }
    }
  } catch (error) {
    console.error('加载问卷数据失败:', error)
    alert('加载问卷数据失败，请刷新页面重试')
  } finally {
    isLoading.value = false
  }
}

// 检查是否有答案
const hasAnswers = computed(() => {
  return Object.keys(answers.value).length > 0
})

// 生成并下载PDF
const downloadQuestionnaire = async () => {
  try {
    // 创建临时的打印内容
    const element = document.createElement('div')
    element.innerHTML = `
      <div style="padding: 40px; font-family: SimSun;">
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;">生活问卷调查</h1>
        <div style="margin-bottom: 20px;">
          <p>用户名：${JSON.parse(localStorage.getItem('user')).username}</p>
          <p>生成日期：${new Date().toLocaleDateString('zh-CN')}</p>
        </div>
        ${categories.map(category => `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #4f46e5; font-size: 18px; margin-bottom: 15px;">${category.title}</h2>
            ${questions
              .filter(q => q.category === category.id)
              .map(question => `
                <div style="margin-bottom: 20px;">
                  <div style="margin-bottom: 10px;">
                    <span style="background: #4f46e5; color: white; padding: 2px 8px; border-radius: 4px; margin-right: 10px;">
                      ${question.serialNumber}
                    </span>
                    <span style="font-size: 16px;">${question.text}</span>
                  </div>
                  <div style="margin-left: 20px; color: #374151; background: #f8fafc; padding: 10px; border-radius: 4px;">
                    ${answers.value[question.id] || '未作答'}
                  </div>
                </div>
              `).join('')}
          </div>
        `).join('')}
      </div>
    `

    // PDF配置
    const opt = {
      margin: 10,
      filename: `生活问卷调查_${JSON.parse(localStorage.getItem('user')).username}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: {
        unit: 'pt',
        format: 'a4',
        orientation: 'portrait'
      }
    }

    // 生成PDF
    html2pdf().from(element).set(opt).save()
  } catch (error) {
    console.error('生成PDF失败:', error)
    alert('生成PDF失败，请重试')
  }
}

onMounted(() => {
  loadQuestionnaireData()
})
</script>

<style scoped>
.questionnaire-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 10px 0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
}

.right-actions {
  display: flex;
  gap: 10px;
}

.back-btn,
.save-btn,
.download-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  background: #f3f4f6;
  color: #374151;
}

.back-icon {
  font-size: 20px;
}

.save-btn {
  background: #4f46e5;
  color: white;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.download-btn {
  background: #10b981; /* 绿色 */
  color: white;
}

.download-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.download-icon {
  font-size: 20px;
}

.category-section {
  margin-bottom: 40px;
}

.category-header {
  margin-bottom: 20px;
}

.category-header h2 {
  font-size: 20px;
  color: #4f46e5;
  margin-bottom: 8px;
  font-weight: 600;
}

.category-description {
  color: #6b7280;
  font-size: 14px;
}

.question-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.question-number {
  background: #4f46e5;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  min-width: 32px;
  text-align: center;
  line-height: 1.5;
}

.question-header h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  line-height: 1.5;
  color: #374151;
}

.answer-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  min-height: 100px;
}

.answer-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.debug-info {
  margin: 20px 0;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.debug-info pre {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 12px;
  margin: 10px 0;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
}
</style>
