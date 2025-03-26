<template>
  <div
    class="fixed z-10 flex h-full w-screen flex-col gap-4 border-r border-gray-200 bg-gray-50 p-4 transition-all sm:relative sm:w-72"
    :class="show ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex h-20 cursor-pointer items-center" @click="goHome">
      <Title />
    </div>

    <div class="flex gap-2">
      <button
        class="btn-base flex-1 px-0!"
        :class="{ 'text-blue-500': $route.path === '/ai' }"
        @click="createAI"
      >
        <i class="ri-add-circle-line text-sm"></i>
        <span>创建AI好友</span>
      </button>

      <button
        class="btn-base flex-1 px-0!"
        :class="{ 'text-blue-500': $route.path === '/group' }"
        @click="createGroup"
      >
        <i class="ri-group-2-line text-sm"></i>
        <span>创建群聊</span>
      </button>
    </div>

    <button
      class="relative h-16 overflow-hidden rounded-md bg-gray-100 p-2"
      @click="goCover"
    >
      <img
        :src="`https://api.dicebear.com/9.x/glass/svg?seed=cover`"
        alt="cover"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-black/20"></div>
      <div
        class="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white"
      >
        <div class="font-bold">生成封面图</div>
        <div class="text-xs">小红书和公众号</div>
      </div>
    </button>

    <ChatList @hide-sidebar="toggleSidebar" />

    <div v-if="currentUser" class="flex items-center" @click="goPreferences">
      <UserDisplay :name="currentUser.username" />

      <div
        v-if="$route.path === '/preferences'"
        class="h-1.5 w-1.5 flex-none rounded-full bg-blue-500"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Title from '@/components/ui/Title.vue'
import ChatList from '@/components/nav/ChatList.vue'
import UserDisplay from '@/components/ui/UserDisplay.vue'

const { currentUser } = useAuth()

const router = useRouter()

const show = defineModel(false)
const props = defineProps({
  isMobile: Boolean,
})

const toggleSidebar = () => {
  if (!props.isMobile) return
  show.value = !show.value
}

const createAI = () => {
  router.push('/ai')
  toggleSidebar()
}

const createGroup = () => {
  router.push('/group')
  toggleSidebar()
}

const goHome = () => {
  router.push('/')
  toggleSidebar()
}

const goPreferences = () => {
  router.push('/preferences')
  toggleSidebar()
}

const goCover = () => {
  router.push('/cover')
  toggleSidebar()
}
</script>
