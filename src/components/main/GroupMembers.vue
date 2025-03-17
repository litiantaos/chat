<template>
  <Transition name="move-left-full">
    <div
      v-if="showGroupMembers && chat"
      class="absolute top-0 right-0 bottom-0 flex w-full flex-col gap-6 overflow-y-auto border-l border-gray-200 bg-white p-4 sm:w-72"
    >
      <div>
        <label>群聊名称</label>
        <div class="flex items-center gap-2">
          <input
            type="text"
            v-model="groupName"
            placeholder="群聊名称"
            class="flex-1 border-0! px-0!"
            ref="inputRef"
          />
          <button
            v-if="groupName !== chat.name"
            class="ri-check-line flex-none text-base"
            @click="updateGroupName"
          ></button>
        </div>
      </div>

      <div>
        <label>群成员</label>
        <div class="mt-4 flex flex-col gap-4">
          <div v-for="member in chat.members" :key="member.id">
            <UserDisplay
              :name="member.name || member.username"
              avatar-size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import { updateChat } from '@/services/repositories'
import UserDisplay from '../ui/UserDisplay.vue'

const { showGroupMembers } = useChat()

const props = defineProps(['chat'])
const emit = defineEmits(['updateGroupName'])

const inputRef = ref(null)
const groupName = ref(props.chat?.name)

watch(
  () => props.chat,
  (newChat) => {
    if (newChat.name) {
      groupName.value = newChat.name
    }
  },
)

const updateGroupName = async () => {
  if (!groupName) return

  await updateChat(props.chat.id, {
    name: groupName.value,
  })

  emit('updateGroupName', groupName.value)

  inputRef.value?.blur()
}
</script>
