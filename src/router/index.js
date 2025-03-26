import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Home from '@/views/Home.vue'
import Welcome from '@/components/main/Welcome.vue'
import CreateAIFriend from '@/components/main/CreateAIFriend.vue'
import CreateGroup from '@/components/main/CreateGroup.vue'
import Chat from '@/components/main/Chat.vue'
import Preferences from '@/components/main/Preferences.vue'
import GenerateCover from '@/components/main/GenerateCover.vue'
import Auth from '@/views/Auth.vue'

const { currentUser, loadUserFromStorage } = useAuth()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Home,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'welcome',
          component: Welcome,
        },
        {
          path: 'ai/:aiId?',
          name: 'ai',
          component: CreateAIFriend,
        },
        {
          path: 'group',
          name: 'group',
          component: CreateGroup,
        },
        {
          path: 'chat',
          name: 'chat',
          component: Chat,
        },
        {
          path: 'chat/:id',
          component: Chat,
        },
        {
          path: 'preferences',
          name: 'preferences',
          component: Preferences,
        },
        {
          path: 'cover',
          name: 'cover',
          component: GenerateCover,
        },
      ],
    },
    {
      path: '/auth',
      component: Auth,
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 如果没有用户信息，尝试从localStorage加载
  if (!currentUser.value) {
    loadUserFromStorage()
  }

  // 检查是否需要认证
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // 如果需要认证且未登录，重定向到登录页
    if (!currentUser.value) {
      next('/auth')
    } else {
      next()
    }
  } else {
    // 如果已登录且访问登录页，重定向到首页
    if (currentUser.value && to.path === '/auth') {
      next('/')
    } else {
      next()
    }
  }
})

export default router
