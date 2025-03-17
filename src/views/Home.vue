<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar v-model="showSidebar" :is-mobile="isMobile" />

    <main class="flex flex-1 flex-col">
      <MainHeader v-model="showSidebar" :is-mobile="isMobile" />

      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useChat } from '@/composables/useChat'
import Sidebar from '@/components/nav/Sidebar.vue'
import MainHeader from '@/components/nav/MainHeader.vue'

const route = useRoute()
const { showGroupMembers, initData } = useChat()

// 监听窗口宽度变化
const isMobile = ref(false)
const showSidebar = ref(false)

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
