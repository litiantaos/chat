<template>
  <header
    v-if="pageTitle || isMobile"
    class="flex h-15 items-center justify-between gap-4 border-b border-gray-200 px-4"
  >
    <div class="flex items-center gap-3">
      <button
        v-if="isMobile"
        class="ri-menu-line text-base"
        @click="showSidebar = !showSidebar"
      ></button>

      <h2 class="font-bold">{{ pageTitle }}</h2>

      <div
        v-if="chat?.members?.length > 2"
        class="rounded-md bg-gray-200 px-2 py-px text-xs"
      >
        {{ chat.members.length }}
      </div>
    </div>

    <div>
      <button
        v-if="chat?.members?.length > 2"
        class="ri-more-line text-base font-bold"
        @click="showGroupMembers = !showGroupMembers"
      ></button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useChat } from '@/composables/useChat'

const route = useRoute()
const { chats, showGroupMembers } = useChat()

const props = defineProps(['isMobile'])
const showSidebar = defineModel(false)

const path = route.path.split('/').pop()
const chatId = computed(() => route.params.id)
const chat = computed(() => chats.value.find((c) => c.id === chatId.value))

const titleMap = {
  ai: '创建AI好友',
  group: '创建群聊',
  preferences: '设置',
}

const pageTitle = computed(() => {
  if (chat.value) return chat.value?.name
  return titleMap[path]
})
</script>
