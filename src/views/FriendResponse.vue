<template>
  <div class="friend-response">
    <h1>好友问卷回答</h1>
    <div v-if="!submitted" class="response-form">
      <div class="friend-info">
        <input type="text" v-model="friendName" placeholder="请输入您的名字" class="name-input" />
      </div>

      <div v-for="question in customizedQuestions" :key="question.id" class="question-card">
        <div class="question-header">
          <span class="question-number">{{ question.serialNumber }}</span>
          <h3>{{ question.customText }}</h3>
        </div>
        <textarea v-model="answers[question.id]" placeholder="请输入您的回答..." rows="4" class="answer-input"></textarea>
      </div>

      <button @click="submitAnswers" class="submit-btn" :disabled="!isValid">
        提交回答
      </button>
    </div>

    <div v-else class="success-message">
      <h2>感谢您的回答！</h2>
      <p>您的反馈已经成功提交。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { questions } from '../data/questions'
import axios from 'axios'
import { API_URL } from '../config/api'

const route = useRoute()
const submitted = ref(false)
const friendName = ref('')
const answers = ref({})
const username = ref('') // 测评人的用户名

// 获取用户名
onMounted(async () => {
  try {
    // 从URL中获取用户ID
    const userId = route.params.id.split('-')[0]
    // 这里应该调用API获取用户信息
    // const res = await axios.get(`/api/user/${userId}`)
    // username.value = res.data.username
    username.value = '小明' // 临时写死，实际应该从API获取
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})

// 自定义问题文本
const customizedQuestions = computed(() => {
  const baseQuestions = questions.filter(q =>
    q.serialNumber === '104' || q.serialNumber === '203'
  )

  return baseQuestions.map(q => ({
    ...q,
    customText: q.serialNumber === '104'
      ? `你觉得 ${username.value} 是一个什么样的人？Ta关心什么样的人？`
      : `你觉得 ${username.value} 有哪些优点？`
  }))
})

// 验证所有问题是否已回答且填写了名字
const isValid = computed(() => {
  return friendName.value.trim() !== '' &&
    customizedQuestions.value.every(q => answers.value[q.id]?.trim())
})

// 从URL中获取分享ID
const shareId = computed(() => {
  const fullPath = route.params.id
  return fullPath.split('-')[1] // 获取问题ID部分
})

const submitAnswers = async () => {
  if (!isValid.value) return

  try {
    // 这里添加提交答案到后端的逻辑
    const response = await axios.post(`${API_URL}/friend-response`, {
      shareId: route.params.id,
      questionId: shareId.value,
      friendName: friendName.value,
      answers: answers.value,
      createdAt: new Date()
    })

    submitted.value = true
  } catch (error) {
    console.error('提交失败:', error)
    alert('提交失败，请重试')
  }
}
</script>

<style scoped>
.friend-response {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.friend-info {
  margin-bottom: 30px;
}

.name-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 16px;
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
  gap: 10px;
  margin-bottom: 15px;
}

.question-number {
  background: #4f46e5;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
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

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.success-message {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.success-message h2 {
  color: #16a34a;
  margin-bottom: 10px;
}
</style>
