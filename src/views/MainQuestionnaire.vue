<template>
  <div class="questionnaire-container">
    <div class="header-actions">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span> 返回个人空间
      </button>
      <div class="right-actions">
        <button class="download-btn" @click="downloadQuestionnaire" :disabled="!hasAnswers">
          <span class="download-icon">↓</span> 下载PDF问卷
        </button>
        <!-- <button class="download-json-btn" @click="downloadJSON" :disabled="!hasAnswers">
          <span class="download-icon">↓</span> 下载JSON格式
        </button> -->
        <button class="generate-report-btn" @click="generateReport" :disabled="!hasAnswers || isGenerating">
          <span class="ai-icon">🤖</span> {{ isGenerating ? '生成中...' : '生成AI报告' }}
        </button>
        <button class="save-btn" @click="saveAnswers" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '保存当前' }}
        </button>
      </div>
    </div>

    <h1>生活问卷调查</h1>

    <div class="debug-info">
      <p class="notice-title">📝 填写前须知：</p>
      <div class="notice-content">
        <p>
          <span class="emoji">🎯</span> 本问卷仅用于个人成长的<span class="highlight">记录思考</span>，仔细填写一定会有所收获。
        </p>
        <p>
          <span class="emoji">💭</span> 如果自己对自己<span class="highlight">不上心</span>，那怎么会有人更<span class="highlight">了解自己</span>呢。
        </p>
        <p>
          <span class="emoji">😄</span> 生成ai报告<span class="highlight">并不可靠</span>，但可以通过它来帮助认识自己。
        </p>
        <p>
          <span class="emoji">✨</span> 祝愿这个问卷能给你的生活带来<span class="highlight">些许改变</span>。
        </p>
      </div>
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

    <div v-if="showReportModal" class="report-modal">
      <div class="report-content">
        <h2 class="report-title">AI 生成的职业规划报告</h2>
        <div class="report-body">
          <div v-html="formatReportContent(reportContent)"></div>
        </div>
        <div class="report-actions">
          <button @click="downloadReport" class="download-report-btn">
            <span class="download-icon">↓</span> 下载报告
          </button>
          <button @click="showReportModal = false" class="close-btn">关闭</button>
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
import { generateReportPrompt } from '../utils/reportPrompt'

const router = useRouter()
const answers = ref({})
const isLoading = ref(false)
const isSaving = ref(false)
const isGenerating = ref(false)
const showReportModal = ref(false)
const reportContent = ref('')

// 是否为开发环境
const isDev = ref(import.meta.env.DEV)

// 获取某个分类下的所有问题
const getCategoryQuestions = (categoryId) => {
  return questions.filter(q => q.category === categoryId)
}

// 返回个人空间
const goBack = () => {
  if (hasUnsavedChanges.value) {
    if (confirm('您确定要离开吗？')) {
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
    alert('已经保存')
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

// 添加下载JSON的方法
const downloadJSON = () => {
  try {
    // 构建JSON数据
    const jsonData = {
      timestamp: new Date().toISOString(),
      categories: categories,
      answers: Object.entries(answers.value).map(([questionId, answer]) => {
        const question = questions.find(q => q.id === questionId)
        return {
          id: questionId,
          serialNumber: question?.serialNumber,
          question: question?.text,
          category: question?.category,
          answer: answer
        }
      })
    }

    // 创建Blob对象
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // 创建下载链接
    const link = document.createElement('a')
    link.href = url
    link.download = `questionnaire_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载JSON失败:', error)
    alert('下载失败，请重试')
  }
}

const generateReport = async () => {
  if (!hasAnswers.value) return

  isGenerating.value = true
  try {
    // 准备问卷数据
    const questionnaireData = {
      answers: Object.entries(answers.value).map(([questionId, answer]) => {
        const question = questions.find(q => q.id === questionId)
        return {
          id: question?.serialNumber,
          category: question?.category,
          question: question?.text,
          answer: answer
        }
      })
    }

    // 生成 prompt
    const prompt = generateReportPrompt(questionnaireData)

    // 调用 GPT API
    const response = await axios.post('https://api.chatanywhere.tech/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer sk-gdSG6GO4T6Eh17bJtCRNkZm0btZYFsyvlu1Tp3mXt1Q15iRg`,
        'Content-Type': 'application/json'
      }
    })

    // 处理 AI 返回的内容
    reportContent.value = response.data.choices[0].message.content
    showReportModal.value = true
  } catch (error) {
    console.error('生成报告失败:', error)
    alert('生成报告失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

// 优化格式化报告内容的方法
const formatReportContent = (content) => {
  if (!content) return ''

  // 替换步骤标题
  let formatted = content
    .replace(/报告：/g, '<div class="report-section">')
    .replace(/步骤1：|步骤1:|Step 1:|第一步：/gi,
      '<h3 class="step-title"><span class="step-number">01</span>关键词提取</h3>')
    .replace(/步骤2：|步骤2:|Step 2:|第二步：/gi,
      '<h3 class="step-title"><span class="step-number">02</span>职业方向分析</h3>')
    .replace(/步骤3：|步骤3:|Step 3:|第三步：/gi,
      '<h3 class="step-title"><span class="step-number">03</span>最佳职业推荐</h3>')

  // 格式化关键词部分
  formatted = formatted.replace(
    /(价值观关键词|才能关键词|理想关键词)：(.*?)(?=\n|$)/g,
    '<div class="keyword-group"><span class="keyword-title">$1</span><div class="keyword-list">$2</div></div>'
  )

  // 格式化职业方向列表
  formatted = formatted.replace(
    /(\d\. .*?)(?=\n|$)/g,
    '<div class="career-item">$1</div>'
  )

  // 高亮关键词
  formatted = formatted.replace(/【(.*?)】/g, '<span class="highlight-keyword">$1</span>')

  // 添加结尾装饰
  formatted += '<div class="report-footer">✨ 报告生成完毕 ✨</div>'

  return formatted
}

// 修改下载报告的样式
const downloadReport = async () => {
  try {
    const element = document.createElement('div')
    element.innerHTML = `
      <div style="padding: 40px; font-family: SimSun;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; color: #1f2937; margin-bottom: 16px;">个人发展规划报告</h1>
          <div style="color: #6b7280; font-size: 14px;">
            <p>用户：${JSON.parse(localStorage.getItem('user')).username}</p>
            <p>生成日期：${new Date().toLocaleDateString('zh-CN')}</p>
          </div>
        </div>

        <div style="line-height: 2; color: #374151;">
          ${formatReportContent(reportContent.value)}
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px;">本报告由 AI 助手生成，仅供参考</p>
        </div>
      </div>
    `

    const opt = {
      margin: 20,
      filename: `职业规划报告_${JSON.parse(localStorage.getItem('user')).username}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    }

    html2pdf().from(element).set(opt).save()
  } catch (error) {
    console.error('下载报告失败:', error)
    alert('下载失败，请重试')
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
  gap: 12px;
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
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.notice-title {
  font-size: 18px;
  font-weight: 600;
  color: #4f46e5;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-content {
  font-size: 16px;
  line-height: 1.8;
  color: #374151;
}

.notice-content p {
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.emoji {
  font-size: 20px;
  display: inline-block;
  min-width: 24px;
}

/* 添加渐变背景和动画效果 */
.debug-info {
  background: linear-gradient(135deg, #f8fafc 0%, #f0f7ff 100%);
  transition: transform 0.2s, box-shadow 0.2s;
}

.debug-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.highlight {
  background: #fef08a;  /* 浅黄色背景 */
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
  color: #854d0e;  /* 深褐色文字 */
  display: inline-block;
  line-height: 1.2;
}

.download-json-btn {
  background: #0ea5e9;  /* 蓝色 */
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.download-json-btn:hover {
  background: #0284c7;
}

.download-json-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.generate-report-btn {
  background: #8b5cf6;  /* 紫色 */
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.generate-report-btn:hover {
  background: #7c3aed;
}

.generate-report-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.report-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.report-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.report-title {
  font-size: 24px;
  color: #1f2937;
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.report-body {
  margin: 20px 0;
  line-height: 1.8;
  color: #374151;
  font-size: 16px;
}

.report-body :deep(.step-title) {
  color: #1f2937;
  font-size: 22px;
  margin: 30px 0 20px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f7ff 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-body :deep(.step-number) {
  background: #4f46e5;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 16px;
}

.report-body :deep(.keyword-group) {
  margin: 15px 0;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #4f46e5;
}

.report-body :deep(.keyword-title) {
  color: #4f46e5;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}

.report-body :deep(.keyword-list) {
  color: #374151;
  line-height: 1.8;
}

.report-body :deep(.career-item) {
  margin: 12px 0;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s;
}

.report-body :deep(.career-item:hover) {
  transform: translateX(5px);
  border-color: #4f46e5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.report-body :deep(.highlight-keyword) {
  background: #fef9c3;
  color: #854d0e;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.report-body :deep(.report-footer) {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
  color: #6b7280;
  font-size: 14px;
}

.report-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.download-report-btn {
  background: #10b981;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.close-btn {
  background: #f3f4f6;
  color: #374151;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
