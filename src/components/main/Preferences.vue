<template>
  <div class="p-4">
    <button class="btn-base" @click="handleLogout">退出登录</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { logout } = useAuth()

const handleLogout = () => {
  if (confirm('确定退出登录吗？')) {
    logout()
    router.push('/auth')
  }
}
</script>
