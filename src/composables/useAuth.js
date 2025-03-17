import { ref } from 'vue'
import { createUser, getUserByUsername } from '@/services/repositories'

// 用户信息状态
const currentUser = ref(null)

// 从本地存储加载用户
const loadUserFromStorage = () => {
  const userStr = localStorage.getItem('user')

  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr)
    } catch (error) {
      localStorage.removeItem('user')
      currentUser.value = null
    }
  }

  return currentUser.value
}

// 注册用户
const register = async (username, password) => {
  // 检查用户名是否已存在
  const existingUser = await getUserByUsername(username)

  if (existingUser) {
    throw new Error('用户名已存在')
  }

  // 创建新用户
  const user = await createUser({ username, password })

  // 更新状态和本地存储
  currentUser.value = user
  localStorage.setItem('user', JSON.stringify(user))

  return user
}

// 登录
const login = async (username, password) => {
  const user = await getUserByUsername(username)

  if (!user || user.password !== password) {
    throw new Error('用户名或密码错误')
  }

  // 更新状态和本地存储
  currentUser.value = user
  localStorage.setItem('user', JSON.stringify(user))

  return user
}

// 退出登录
const logout = () => {
  currentUser.value = null
  localStorage.removeItem('user')
}

export function useAuth() {
  return {
    currentUser,
    loadUserFromStorage,
    register,
    login,
    logout,
  }
}
