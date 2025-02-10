<template>
  <div class="home-container">
    <h1>欢迎回来，{{ user?.username }}！</h1>

    <!-- 修改按钮布局为三个按钮 -->
    <div class="action-buttons">
      <button class="questionnaire-btn" @click="goToQuestionnaire">
        开始问卷调查
      </button>
      <button class="example-btn" @click="openExamplePDF">
        查看示例问卷
      </button>
      <button class="logout-btn" @click="handleLogout">
        退出登录
      </button>
    </div>

    <!-- 项目说明 -->
    <div class="project-intro">
      <div class="intro-content">
        <p>有一天深夜，我看小高和茉莉的视频，偶然了解到这个想法。脑袋一拍，我就决定做个网页，把这些内容记录下来。其实用一张 A4 纸自己写也行，但我想借此机会练练手，于是就诞生了这个项目。（可以测评完下载成pdf，然后喂给大模型让模型帮你分析。）</p>
        <p>问卷一共十五个问题，分成三个主题：价值观、才能、愿望梦想。一开始我也没当回事，可真正用心写下来才发现，它确实能帮人更好地认识自己。</p>
        <div class="formula">
          <p>这里面有个小公式：</p>
          <p class="formula-text">想做的事 = 做和自己【才能】相匹配、又符合【愿望梦想】的工作/事业。同时，这个工作/事业必须契合你的【价值观】，这样才能真正收获生活中的快乐。</p>
        </div>
        <p>这也给了我们一个启发：即使你面前有很好的【选择】，但它不符合你的【价值观】那么就不要选择它。</p>
      </div>
    </div>

    <!-- 修改标题和布局 -->
    <div class="inspiration-section">
      <h2>项目受以下内容启发：</h2>
      <div class="inspiration-content">
        <!-- 书籍卡片 -->
        <div class="book-card" @click="openBook">
          <img src="/book-cover.jpg" alt="书籍封面" class="book-thumbnail">
          <div class="book-info">
            <h3>《如何找到想做的事》</h3>
            <p class="book-author">[日]八木仁平</p>
            <p class="book-desc">本书是一本"超简单、超有效的自我认知指南"，帮助你拨云驱雾，用自我认知三大法则、五个步骤，快速找到自己，并确立自己的人生目标。</p>
          </div>
        </div>

        <!-- 视频卡片 -->
        <div class="video-cards">
          <div class="video-card" @click="openVideo('bilibili')">
            <img src="https://i.ytimg.com/vi/czPxfhoHBeQ/hqdefault.jpg" alt="bilibili视频封面" class="video-thumbnail">
            <div class="video-info">
              <h3>找到你的"人生之路"的正确方法</h3>
              <p class="video-source">来源: Bilibili</p>
            </div>
          </div>

          <div class="video-card" @click="openVideo('youtube')">
            <img src="https://i.ytimg.com/vi/czPxfhoHBeQ/hqdefault.jpg" alt="YouTube视频封面" class="video-thumbnail">
            <div class="video-info">
              <h3>Life Path Guidance</h3>
              <p class="video-source">来源: YouTube</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="user-info">
      <p>手机号：{{ user?.phone }}</p>
      <p>注册时间：{{ formatDate(user?.createdAt) }}</p>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const user = ref(null)

onMounted(() => {
  const savedUserStr = localStorage.getItem('user')
  if (savedUserStr && savedUserStr !== 'undefined') {
    try {
      const savedUser = JSON.parse(savedUserStr)
      if (savedUser && savedUser.id && savedUser.username) {
        user.value = savedUser
      } else {
        handleInvalidUser()
      }
    } catch (error) {
      console.error('解析用户数据失败:', error)
      handleInvalidUser()
    }
  } else {
    handleInvalidUser()
  }
})

const handleInvalidUser = () => {
  localStorage.removeItem('user')
  router.push('/')
}

const goToQuestionnaire = () => {
  console.log('尝试转到问卷页面')
  try {
    router.push('/questionnaire').catch(err => {
      console.error('路由跳转失败:', err)
    })
  } catch (error) {
    console.error('跳转错误:', error)
  }
}

const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

// 添加视频打开方法
const openVideo = (platform) => {
  const urls = {
    bilibili: 'https://www.bilibili.com/video/BV15o4pe7ETn/?spm_id_from=333.337.search-card.all.click',
    youtube: 'https://www.youtube.com/watch?v=czPxfhoHBeQ&t=372s'
  }
  window.open(urls[platform], '_blank')
}

// 添加打开书籍链接方法
const openBook = () => {
  window.open('https://weread.qq.com/web/bookDetail/ede325a0811e7ed22g011961', '_blank')
}

// 添加打开示例PDF的方法
const openExamplePDF = () => {
  window.open('/example-questionnaire.pdf', '_blank')
}
</script>

<style scoped>
.home-container {
  max-width: 800px;  /* 增加宽度以适应视频卡片 */
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

h1 {
  font-size: 24px;
  margin-bottom: 30px;
}

.user-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.user-info p {
  margin: 10px 0;
  color: #666;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
  margin: 20px 0 30px;
}

.questionnaire-btn,
.example-btn,
.logout-btn {
  width: 160px;  /* 稍微减小宽度以适应三个按钮 */
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.questionnaire-btn:hover,
.example-btn:hover,
.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.questionnaire-btn {
  background: #4f46e5;
  color: white;
}

.example-btn {
  background: #10b981;  /* 绿色 */
  color: white;
}

.logout-btn {
  background: #ef4444;
  color: white;
}

.video-section {
  margin: 30px 0;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.video-section h2 {
  font-size: 20px;
  color: #374151;
  margin-bottom: 20px;
}

.video-cards {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 0;
}

.video-card {
  flex: 0 0 300px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid #e5e7eb;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-thumbnail {
  width: 100%;
  height: 168px;
  object-fit: cover;
}

.video-info {
  padding: 12px;
}

.video-info h3 {
  font-size: 16px;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1.4;
}

.video-source {
  font-size: 14px;
  color: #6b7280;
}

.project-source {
  margin: 30px 0;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.project-source h2 {
  font-size: 20px;
  color: #374151;
  margin-bottom: 20px;
}

.source-cards {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}

.book-card {
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid #e5e7eb;
  padding: 20px;
  width: 100%;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-thumbnail {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 20px;
}

.book-info {
  flex: 1;
  text-align: left;
}

.book-info h3 {
  font-size: 18px;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1.4;
}

.book-author {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.book-desc {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 调整视频部分的标题 */
.video-section h2 {
  text-align: left;
}

/* 确保所有区块标题左对齐 */
.project-source h2,
.video-section h2 {
  text-align: left;
  padding-left: 10px;
  border-left: 4px solid #4f46e5;
}

.project-intro {
  margin: 30px 0;
  padding: 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.intro-content {
  text-align: left;
  color: #374151;
  line-height: 1.8;
}

.intro-content p {
  margin-bottom: 16px;
}

.formula {
  margin: 20px 0;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #4f46e5;
}

.formula-text {
  font-weight: 500;
  color: #1f2937;
}

.intro-content p:last-child {
  margin-bottom: 0;
}

/* 调整标记文字的样式 */
.intro-content strong {
  color: #4f46e5;
  font-weight: 600;
}

.inspiration-section {
  margin: 30px 0;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.inspiration-section h2 {
  font-size: 20px;
  color: #374151;
  margin-bottom: 20px;
  text-align: left;
  padding-left: 10px;
  border-left: 4px solid #4f46e5;
}

.inspiration-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 调整书籍卡片和视频卡片的样式以保持一致性 */
.book-card,
.video-cards {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}
</style>
