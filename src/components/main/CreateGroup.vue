<template>
  <div class="w-full flex-1 overflow-y-auto p-4">
    <form @submit.prevent="handleCreateGroup" class="space-y-6">
      <div>
        <label for="name">群聊名称</label>
        <input
          id="name"
          type="text"
          v-model="form.name"
          required
          placeholder="请输入群聊名称"
          class="w-full"
        />
      </div>

      <div>
        <label>选择成员</label>
        <div class="overflow-hidden rounded-md border border-gray-200">
          <div class="max-h-120 overflow-y-auto">
            <div
              v-for="character in characters"
              :key="character.id"
              class="flex items-center gap-3 p-3 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                :checked="isSelected(character.id)"
                @change="toggleMember(character.id)"
                class="h-3 w-3 cursor-pointer rounded-md border-gray-200"
              />
              <UserDisplay :name="character.name" />
            </div>
          </div>
        </div>
      </div>

      <button type="submit" class="btn-base text-blue-500" :disabled="!isValid">
        创建
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllCharacters } from '@/services/repositories'
import { useChat } from '@/composables/useChat'
import UserDisplay from '@/components/ui/UserDisplay.vue'

const { createGroup } = useChat()

const router = useRouter()
const characters = ref([])

const form = ref({
  name: '',
  aiMemberIds: [],
})

// 表单是否有效
const isValid = computed(
  () => form.value.name.trim() && form.value.aiMemberIds.length > 1,
)

// 检查成员是否已选择
const isSelected = (id) => form.value.aiMemberIds.includes(id)

// 切换成员选择状态
const toggleMember = (id) => {
  const index = form.value.aiMemberIds.indexOf(id)
  if (index === -1) {
    form.value.aiMemberIds.push(id)
  } else {
    form.value.aiMemberIds.splice(index, 1)
  }
}

// 创建群聊
const handleCreateGroup = async () => {
  try {
    const chatId = await createGroup(form.value)
    router.push(`/chat/${chatId}`)
  } catch (error) {
    console.error('创建群聊失败:', error)
  }
}

// 加载AI角色列表
onMounted(async () => {
  try {
    characters.value = await getAllCharacters()
  } catch (error) {
    console.error('加载AI角色列表失败:', error)
  }
})
</script>
