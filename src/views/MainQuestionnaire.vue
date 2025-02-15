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

    <div class="score-summary">
      <div class="total-score">
        <span class="score-label">当前总分</span>
        <span class="score-value" :class="{ 'score-sufficient': totalScore >= 60 }">
          {{ totalScore }}/96
        </span>
      </div>
      <div class="score-hint">
        <span class="hint-icon">💡</span>
        <span>达到60分即可生成AI报告</span>
      </div>
    </div>

    <div class="debug-info">
      <p class="notice-title">📝 填写前须知：</p>
      <div class="notice-content">
        <p>
          <span class="emoji">🎯</span> 本问卷仅用于个人成长的<span class="highlight">记录思考</span>，仔细填写一定会有所收获。
        </p>
        <p>
          <span class="emoji">💭</span> 只有自己对自己更<span class="highlight">了解自己。</span>
        </p>
        <p>
          <span class="emoji">😄</span> 生成ai报告<span class="highlight">并不可靠</span>，但可以通过它来帮助认识自己。
        </p>
        <p>
          <span class="emoji">✨</span> 完成度得分超过<span class="highlight">60分</span>才可以<span class="highlight">生成ai报告哦</span>secrect :超过十五字就可得高分。
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
            <span class="question-score" :class="{ 'score-full': scores[question.id] === 8 }">
              {{ scores[question.id] || 0 }}/8
            </span>
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
          <pre class="report-text"><div v-html="formatReportContent(reportContent)"></div></pre>
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
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { categories, questions } from '../data/questions'
import axios from 'axios'
import html2pdf from 'html2pdf.js'
import { API_URL } from '../config/api'
import { generateReportPrompt } from '../utils/reportPrompt'
import { fetchReport } from '../utils/reportGenerator'
import { formatReportContent } from '../utils/reportFormatter'

const router = useRouter()
const answers = ref({})
const isLoading = ref(false)
const isSaving = ref(false)
const isGenerating = ref(false)
const showReportModal = ref(false)
const reportContent = ref('')

// 添加评分相关的响应式变量
const scores = ref({})  // 存储每个问题的得分
const totalScore = computed(() => {
  return Object.values(scores.value).reduce((sum, score) => sum + score, 0)
})
const canGenerateReport = computed(() => totalScore.value >= 60)

// 评分函数
const calculateQuestionScore = (answer) => {
  if (!answer || answer.trim() === '') return 0

  // 基础分：有回答就得4分
  let score = 2

  // 字数分：超过50字加2分
  if (answer.length >= 15) score += 4

  // 质量分：包含具体例子或详细说明加2分
  if (answer.includes('例如') || answer.includes('比如') || answer.includes('具体来说') ||
      answer.includes('首先') || answer.includes('其次') || answer.includes('最后') ||
      answer.includes('因为') || answer.includes('所以')) {
    score += 4
  }

  return Math.min(score, 8)  // 确保不超过8分
}

// 更新评分的函数
const updateScore = (questionId) => {
  const answer = answers.value[questionId]
  scores.value[questionId] = calculateQuestionScore(answer)
}

// 修改自动保存函数，加入评分逻辑
const autoSave = () => {
  hasUnsavedChanges.value = true
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }
  autoSaveTimeout = setTimeout(() => {
    // 更新所有问题的得分
    questions.forEach(question => {
      updateScore(question.id)
    })
    saveDraft()
  }, 2000)
}

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
let autoSaveInterval = null  // 新增：定时器变量，用于每分钟自动保存

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

      // alert('保存成功！')
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

    try {
      const res = await axios.get(`${API_URL}/questionnaire/${userId}`)
      console.log('从服务器获取到的问卷数据:', res.data)

      if (res.data?.status === 200 && res.data?.data?.answers) {
        answers.value = res.data.data.answers
        // 初始化所有问题的得分
        questions.forEach(question => {
          updateScore(question.id)
        })
        console.log('成功加载已保存的答案:', answers.value)
      } else {
        console.log('服务器返回的数据格式不正确:', res.data)
      }
    } catch (error) {
      console.log('从服务器加载数据失败:', error)
      const draft = localStorage.getItem(`questionnaire_draft_${userId}`)
      if (draft) {
        const draftData = JSON.parse(draft)
        answers.value = draftData.answers
        // 初始化所有问题的得分
        questions.forEach(question => {
          updateScore(question.id)
        })
        console.log('从本地草稿恢复数据:', answers.value)
      } else {
        console.log('没有找到本地草稿，初始化空答案')
        answers.value = {}
        scores.value = {}
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


const generateReport = async () => {
  if (!hasAnswers.value || !canGenerateReport.value) {
    alert('必须全部回答哦！继续加油完善你的答案吧～')
    return
  }

  if (totalScore.value < 60) {
    alert('需要达到60分才能生成AI报告哦！继续加油完善你的答案吧～')
    return
  }

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

    // 调用 fetchReport 获取报告内容
    const report = await fetchReport(questionnaireData)

    // 处理 AI 返回的内容
    reportContent.value = report
    showReportModal.value = true
  } catch (error) {
    console.error('生成报告失败:', error)
    alert('生成报告失败，等等我充下哈')
  } finally {
    isGenerating.value = false
  }
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
  // 启动定时器，每60秒自动保存答案到服务器（如果有未保存的修改）
  autoSaveInterval = setInterval(() => {
    if(hasUnsavedChanges.value) {
      saveAnswers()
    }
  }, 60000)
  console.log("60s save your answer")
})

onUnmounted(() => {
  // 组件卸载时清除定时器
  clearInterval(autoSaveInterval)
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
  padding: 24px;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.report-title {
  font-size: 22px;
  color: #1f2937;
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
}

.report-body {
  padding: 0 16px;
  max-height: 70vh;
  overflow-y: auto;
  background-color: #fff;
  font-size: 14px;
  line-height: 1.6;
}

.report-text {
  white-space: pre-wrap;
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 0;
  text-align: left;
}

.report-text div {
  white-space: pre-wrap;
}

/* 核心特质分析部分样式 */
.report-text div:has(+ div:contains("【价值观分析】")),
.report-text div:has(+ div:contains("【才能分析】")),
.report-text div:has(+ div:contains("【理想分析】")) {
  margin-bottom: 8px;
}

/* 分析标题样式 */
.report-text div:contains("【") {
  font-weight: 600;
  color: #4f46e5;
  margin: 12px 0 8px 0;
  padding-left: 8px;
  border-left: 3px solid #4f46e5;
}

/* 列表项样式 */
.report-text div:contains("•") {
  padding-left: 20px;
  margin: 4px 0;
  position: relative;
}

/* 职业发展方向样式 */
.report-text div:contains("1."),
.report-text div:contains("2."),
.report-text div:contains("3."),
.report-text div:contains("4."),
.report-text div:contains("5.") {
  padding-left: 16px;
  margin: 6px 0;
}

/* 最佳职业推荐样式 */
.report-text div:contains("★") {
  font-weight: 600;
  color: #1f2937;
  margin: 16px 0 12px 0;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
}

/* 匹配依据样式 */
.report-text div:contains("匹配依据") {
  font-weight: 500;
  color: #4b5563;
  margin: 12px 0 8px 0;
}

/* 分隔线样式 */
.report-text div:contains("━━━") {
  margin: 16px 0;
  color: #e5e7eb;
}

.report-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
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
  font-size: 14px;
  font-weight: 500;
}

.close-btn {
  background: #f3f4f6;
  color: #374151;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.score-summary {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.total-score {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-label {
  font-size: 18px;
  color: #0f172a;
  font-weight: 500;
}

.score-value {
  font-size: 24px;
  font-weight: 600;
  color: #6b7280;
  background: white;
  padding: 4px 12px;
  border-radius: 8px;
  min-width: 100px;
  text-align: center;
  transition: all 0.3s ease;
}

.score-sufficient {
  color: #059669;
  background: #ecfdf5;
}

.score-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 16px;
}

.hint-icon {
  font-size: 20px;
}

.question-score {
  margin-left: auto;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  transition: all 0.3s ease;
}

.score-full {
  background: #ecfdf5;
  color: #059669;
}
.report-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.report-step {
  margin: 2rem 0;
  position: relative;
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.step-badge {
  background: #2196F3;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
}

.keyword-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.keyword-column {
  background: #f8f9ff;
  border-radius: 10px;
  padding: 1.2rem;
  transition: transform 0.2s;
}

.keyword-column:hover {
  transform: translateY(-3px);
}

.keyword-type {
  color: #2196F3;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.keyword-icon {
  display: inline-block;
  width: 6px;
  height: 20px;
  background: #2196F3;
  margin-right: 0.5rem;
}

.keyword-tag {
  background: rgba(33,150,243,0.1);
  color: #2196F3;
  padding: 4px 12px;
  border-radius: 20px;
  margin: 4px;
  display: inline-block;
  font-size: 0.9em;
}

.timeline-item {
  display: flex;
  margin: 1rem 0;
  position: relative;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  background: #4CAF50;
  border-radius: 50%;
  margin-right: 1rem;
  position: relative;
  top: 5px;
}

.timeline-content {
  flex: 1;
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #4CAF50;
}

.recommendation-card {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  box-shadow: 0 4px 15px rgba(33,150,243,0.3);
}

.reason-item {
  padding: 0.8rem;
  margin: 0.5rem 0;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  position: relative;
  padding-left: 2rem;
}

.reason-item::before {
  content: "✓";
  position: absolute;
  left: 0.8rem;
  color: #4CAF50;
}

.report-decoration {
  text-align: center;
  margin-top: 2rem;
  position: relative;
}

.decoration-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, #2196F3, transparent);
  margin: 1rem 0;
}

.completed-text {
  color: #666;
  font-size: 0.9em;
  letter-spacing: 2px;
}

</style>
