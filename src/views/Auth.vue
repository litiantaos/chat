<template>
  <div class="flex h-screen justify-center p-4">
    <div class="mt-48 flex w-full max-w-md flex-col">
      <div class="flex items-center gap-4">
        <Title />

        <h2 class="text-2xl font-bold">
          {{ isLogin ? '登录' : '注册' }}
        </h2>
      </div>

      <form class="mt-6 w-full space-y-6" @submit.prevent="handleSubmit">
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="用户名"
          required
          class="w-full"
        />

        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="密码"
          required
          class="w-full"
        />

        <!-- 提示信息 -->
        <div
          v-if="message"
          :class="[
            'w-full rounded-md p-2 text-xs',
            message.type === 'success'
              ? 'bg-green-50 text-green-500'
              : 'bg-red-50 text-red-500',
          ]"
        >
          {{ message.text }}
        </div>

        <button
          type="submit"
          class="btn-base w-full bg-blue-500! text-white sm:hover:bg-blue-600!"
          :disabled="loading"
        >
          <i v-if="loading" class="ri-loader-4-line animate-spin text-base"></i>
          <span v-else>{{ isLogin ? '登录' : '注册' }}</span>
        </button>
      </form>

      <div class="mt-6">
        <span class="text-gray-400">
          {{ isLogin ? '没有账号？' : '已有账号？' }}
        </span>

        <button class="text-blue-500" @click="switchMode">
          {{ isLogin ? '去注册' : '去登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Title from '@/components/ui/Title.vue'

const router = useRouter()
const isLogin = ref(true)

const username = ref('')
const password = ref('')

const loading = ref(false)
const message = ref(null)

const switchMode = () => {
  isLogin.value = !isLogin.value
  message.value = null
}

const { login, register } = useAuth()

const handleSubmit = async () => {
  if (loading.value) return
  loading.value = true
  message.value = null

  try {
    if (isLogin.value) {
      await login(username.value, password.value)
    } else {
      await register(username.value, password.value)
    }
    router.push('/')
  } catch (error) {
    message.value = {
      type: 'error',
      text: error.message,
    }
  } finally {
    loading.value = false
  }
}
</script>
