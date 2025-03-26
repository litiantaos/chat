<template>
  <div class="flex h-full flex-1 flex-col">
    <MainHeader title="设置" />

    <div class="p-4">
      <button class="btn-base" @click="handleLogout">退出登录</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import MainHeader from '@/components/nav/MainHeader.vue'

const router = useRouter()
const { logout } = useAuth()

const handleLogout = () => {
  if (confirm('确定退出登录吗？')) {
    logout()
    router.push('/auth')
  }
}
</script>
