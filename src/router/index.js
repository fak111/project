import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import HomeView from '../views/HomeView.vue'
import MainQuestionnaire from '../views/MainQuestionnaire.vue'
import FriendResponse from '../views/FriendResponse.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginView
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterView
        },
        {
            path: '/home',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: true }
        },
        {
            path: '/questionnaire',
            name: 'questionnaire',
            component: MainQuestionnaire,
            meta: { requiresAuth: true }
        },
        {
            path: '/friend-response/:id',
            name: 'friendResponse',
            component: FriendResponse,
            meta: { requiresAuth: true }
        }
    ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
    console.log('路由守卫 - 目标路由:', to.path)

    const userStr = localStorage.getItem('user')
    console.log('路由守卫 - 用户状态:', userStr)

    // 解析用户数据并验证
    let isValidUser = false
    try {
        const userData = JSON.parse(userStr)
        isValidUser = userData && userData.id && userData.username
    } catch (error) {
        console.error('��析用户数据失败:', error)
    }

    if (to.meta.requiresAuth && !isValidUser) {
        console.log('需要认证，重定向到登录页')
        localStorage.removeItem('user') // 清除无效的用户数据
        next('/')
    } else {
        console.log('允许导航')
        next()
    }
})

export default router
