<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar v-model="showSidebar" :is-mobile="isMobile" />

    <RouterView />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useChat } from '@/composables/useChat'
import Sidebar from '@/components/nav/Sidebar.vue'

const route = useRoute()
const { isMobile, showSidebar, showGroupMembers, initData } = useChat()

// 监听窗口宽度变化
const handleResize = () => {
  if (window.innerWidth < 640) {
    isMobile.value = true
    showSidebar.value = false
  } else {
    isMobile.value = false
    showSidebar.value = true
  }
}

// 监听路由变化, 关闭群成员列表
watch(
  () => route.path,
  () => {
    if (showGroupMembers.value) showGroupMembers.value = false
  },
)

onMounted(() => {
  initData()

  // 组件挂载时添加事件监听器
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  // 组件卸载时移除事件监听器
  window.removeEventListener('resize', handleResize)
})
</script>
