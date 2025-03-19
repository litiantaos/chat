<template>
  <Transition name="move-left-full">
    <div
      v-if="showGroupMembers && chat"
      class="absolute top-0 right-0 bottom-0 flex w-full flex-col gap-6 overflow-y-auto border-l border-gray-200 bg-white p-4 sm:w-72"
    >
      <!-- 群聊名称 -->
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

      <!-- 成员列表 -->
      <div>
        <label>群成员 ({{ chat.members.length }})</label>
        <div class="mt-4 flex flex-col gap-4">
          <div
            v-for="member in chat.members"
            :key="member.id"
            class="flex items-center justify-between"
          >
            <UserDisplay
              :name="member.name || member.username"
              avatar-size="sm"
            />
            <button
              v-if="
                member.id !== currentUser?.id &&
                chat.createdBy === currentUser?.id
              "
              class="ri-close-line"
              @click="handleRemoveMember(member.id)"
            ></button>
          </div>
        </div>
      </div>

      <!-- 添加成员 -->
      <div
        v-if="availableCharacters.length && chat.createdBy === currentUser?.id"
      >
        <label>添加成员</label>
        <div class="mt-2">
          <select v-model="selectedCharacter" class="w-full">
            <option value="">选择成员</option>
            <option
              v-for="char in availableCharacters"
              :key="char.id"
              :value="char.id"
            >
              {{ char.name }}
            </option>
          </select>
          <button
            v-if="selectedCharacter"
            class="btn-base mt-2 w-full"
            @click="handleAddMember"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import { useAuth } from '@/composables/useAuth'
import {
  updateChat,
  getAvailableCharacters,
  addMemberToChat,
  removeMemberFromChat,
  getChatMembersFromRelations,
  getChatMemberRelations,
} from '@/services/repositories'
import UserDisplay from '../ui/UserDisplay.vue'

const { showGroupMembers } = useChat()
const { currentUser } = useAuth()

const props = defineProps(['chat'])

const inputRef = ref(null)
const groupName = ref(props.chat?.name)
const availableCharacters = ref([])
const selectedCharacter = ref('')

// 更新群名
const updateGroupName = async () => {
  if (!groupName.value) return

  await updateChat(props.chat.id, {
    name: groupName.value,
  })

  props.chat.name = groupName.value
  inputRef.value?.blur()
}

// 添加成员
const handleAddMember = async () => {
  if (!selectedCharacter.value) return

  try {
    await addMemberToChat({
      chatId: props.chat.id,
      memberId: selectedCharacter.value,
      memberType: 'ai',
    })

    // 更新成员列表
    const relations = await getChatMemberRelations(props.chat.id)
    const members = await getChatMembersFromRelations([relations])
    props.chat.members = members[0]

    // 更新可用AI列表
    await loadAvailableCharacters()
    selectedCharacter.value = ''
  } catch (error) {
    console.error('添加成员失败:', error)
  }
}

// 移除成员
const handleRemoveMember = async (memberId) => {
  if (props.chat.members?.length <= 3) {
    alert('群聊至少需要3个成员')
    return
  }

  if (!confirm('确定要移除该成员吗?')) return

  try {
    await removeMemberFromChat(props.chat.id, memberId)

    // 更新成员列表
    const relations = await getChatMemberRelations(props.chat.id)
    const members = await getChatMembersFromRelations([relations])
    props.chat.members = members[0]

    // 更新可用AI列表
    await loadAvailableCharacters()
  } catch (error) {
    console.error('移除成员失败:', error)
  }
}

// 加载可用的AI角色
const loadAvailableCharacters = async () => {
  try {
    availableCharacters.value = await getAvailableCharacters(props.chat.id)
  } catch (error) {
    console.error('加载可用AI角色失败:', error)
  }
}

onMounted(async () => {
  if (props.chat?.id) {
    await loadAvailableCharacters()
  }
})

watch(
  () => props.chat,
  (newChat) => {
    if (newChat.name) {
      groupName.value = newChat.name
    }
  },
)
</script>
