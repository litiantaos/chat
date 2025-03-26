<template>
  <div v-if="chat" class="flex h-full flex-1 flex-col">
    <MainHeader :title="chat.name">
      <template #left>
        <div
          v-if="chat?.members?.length > 2"
          class="rounded-md bg-gray-200 px-2 py-px text-xs"
        >
          {{ chat.members.length }}
        </div>
      </template>

      <template #right>
        <button
          v-if="chat?.members?.length > 2"
          class="ri-more-line text-base font-bold"
          @click="showGroupMembers = !showGroupMembers"
        ></button>
      </template>
    </MainHeader>

    <div
      v-if="chat?.members?.length"
      class="relative flex flex-1 flex-col overflow-hidden"
    >
      <div
        class="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
        ref="messageContainer"
      >
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex w-full gap-2"
          :class="isUserMessage(message) ? 'flex-row-reverse' : ''"
        >
          <Avatar
            size="sm"
            :text="getSenderName(message)"
            @click="handleAvatarClick(message)"
            :class="!isUserMessage(message) ? 'cursor-pointer' : ''"
          />

          <div
            class="flex max-w-3/4 flex-col gap-2 rounded-md p-3"
            :class="
              isUserMessage(message) ? 'bg-gray-600 text-white' : 'bg-gray-100'
            "
          >
            <div>{{ message.content }}</div>

            <div
              class="flex gap-2 text-xs"
              :class="
                isUserMessage(message) ? 'text-gray-300' : 'text-gray-400'
              "
            >
              <span class="font-bold">
                {{ getSenderName(message) }}
              </span>
              <span>{{ formatTime(message.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 p-4">
        <textarea
          v-model="input"
          placeholder="请输入消息"
          class="h-20! w-full rounded-md border border-gray-200 p-2"
          @keydown.enter.prevent="handleSend"
        ></textarea>
      </div>

      <GroupMembers :chat="chat" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useChat } from '@/composables/useChat'
import { formatTime } from '@/utils/time'
import MainHeader from '@/components/nav/MainHeader.vue'
import Avatar from '@/components/ui/Avatar.vue'
import GroupMembers from '@/components/main/GroupMembers.vue'

const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()
const { chats, chatMessages, showGroupMembers, sendMessage, loadMessages } =
  useChat()

const chatId = computed(() => route.params.id)
const chat = computed(() => chats.value.find((c) => c.id === chatId.value))
const messages = computed(() => chatMessages.value[chatId.value])

const input = ref('')
const messageContainer = ref(null)

// 判断是否为用户消息
const isUserMessage = (message) => message.createdBy === currentUser.value?.id

// 获取发送者名称
const getSenderName = (message) => {
  const sender = chat.value.members.find(
    (member) => member.id === message.createdBy,
  )

  return sender?.name || sender?.username
}

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

const handleLoadMessages = async (id) => {
  try {
    await loadMessages(id)
    scrollToBottom()
  } catch (error) {
    console.error('加载聊天记录失败:', error)
  }
}

// 监听消息变化
watch(() => messages.value?.length, scrollToBottom)

// 监听路由变化
watch(chatId, async (newId, oldId) => {
  if (newId !== oldId) {
    handleLoadMessages(newId)
  }
})

// 发送消息
const handleSend = async () => {
  if (!input.value.trim() || !chatId.value) return

  const content = input.value
  input.value = ''
  await sendMessage(chatId.value, content)
}

// 点击AI头像
const handleAvatarClick = (message) => {
  if (!isUserMessage(message)) {
    router.push(`/ai/${message.createdBy}`)
  }
}

// 初始化
onMounted(async () => {
  if (chatId.value) {
    handleLoadMessages(chatId.value)
  }
})
</script>
