<template>
  <div v-if="!loading" class="flex w-full flex-1 flex-col gap-2">
    <template v-for="chat in chats" :key="chat.id">
      <div
        class="flex items-center gap-2 rounded-md bg-gray-100 p-2 transition-colors hover:bg-gray-200/60"
        :class="{
          'bg-gray-200': chat.id === currentChatId,
        }"
        @click="handleChatClick(chat.id)"
      >
        <UserDisplay :name="getChatName(chat)" :sub="getLastMessageText(chat)">
          <div class="flex flex-1 items-center justify-end gap-2">
            <i v-if="chat.type === 'group'" class="ri-group-2-line text-xs"></i>
            <div class="text-xs text-gray-400">
              {{ getLastMessageTime(chat) }}
            </div>
          </div>
        </UserDisplay>

        <div
          class="flex-none rounded-full bg-blue-500 transition-[width,height,opacity] duration-300"
          :class="
            chat.id === currentChatId
              ? 'h-1.5 w-1.5 opacity-100'
              : 'h-0 w-0 opacity-0'
          "
        ></div>
      </div>
    </template>
  </div>

  <div v-else class="flex w-full flex-1 items-center justify-center">
    <div class="text-gray-400">加载中...</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useChat } from '@/composables/useChat'
import { formatDate } from '@/utils/time'
import UserDisplay from '@/components/ui/UserDisplay.vue'

const router = useRouter()
const route = useRoute()
const { currentUser } = useAuth()
const { chats, loading } = useChat()

const emit = defineEmits(['hideSidebar'])

const currentChatId = computed(() => route.params.id)

// 获取聊天名称
const getChatName = (chat) => {
  if (chat.type === 'single') {
    return chat.character?.name || chat.name
  }
  return chat.name
}

// 获取最后一条消息的文本
const getLastMessageText = (chat) => {
  if (!chat.lastMessage) return '开始聊天吧'

  const isUserMessage = chat.lastMessage.creatorId === currentUser.value?.id
  return isUserMessage
    ? `我：${chat.lastMessage.content}`
    : chat.lastMessage.content
}

// 获取最后一条消息的时间
const getLastMessageTime = (chat) => {
  return chat.lastMessage?.createdAt
    ? formatDate(chat.lastMessage.createdAt)
    : formatDate(chat.createdAt)
}

// 处理聊天点击事件
const handleChatClick = (chatId) => {
  router.push(`/chat/${chatId}`)
  emit('hideSidebar')
}
</script>
