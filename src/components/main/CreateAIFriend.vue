<template>
  <div class="w-full flex-1 overflow-y-auto p-4">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="name">名字</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="请输入名字"
          required
          class="w-full"
        />
      </div>

      <div>
        <label for="gender">性别</label>
        <select
          id="gender"
          v-model="form.gender"
          required
          placeholder="请选择性别"
          class="w-full"
        >
          <option value="男">男</option>
          <option value="女">女</option>
        </select>
      </div>

      <div>
        <label for="personality">性格</label>
        <select
          id="personality"
          v-model="form.personality"
          required
          placeholder="请选择性格"
          class="w-full"
        >
          <option v-for="p in personalityOptions" :key="p" :value="p">
            {{ p }}
          </option>
        </select>
      </div>

      <div>
        <label for="background">背景</label>
        <select
          id="background"
          v-model="form.background"
          required
          placeholder="请选择背景"
          class="w-full"
        >
          <option v-for="b in backgroundOptions" :key="b" :value="b">
            {{ b }}
          </option>
        </select>
      </div>

      <div>
        <label for="description">自定义设定</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          class="h-30! w-full p-2"
          placeholder="更多个性化的自定义设定"
        ></textarea>
      </div>

      <button
        type="submit"
        :disabled="!form.name"
        class="btn-base text-blue-500"
      >
        {{ isEdit ? '保存' : '创建' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChat } from '@/composables/useChat'
import { getCharacterById, updateCharacter } from '@/services/repositories'

const personalityOptions = [
  '开朗活泼',
  '温柔体贴',
  '严谨认真',
  '幽默风趣',
  '冷静理性',
  '热情奔放',
  '内向沉静',
  '随性豁达',
  '敏感细腻',
  '乐观积极',
  '严肃正经',
  '平静淡泊',
]

const backgroundOptions = [
  '专业助手',
  '知心朋友',
  '娱乐伙伴',
  '情感顾问',
  '医生',
  '律师',
  '教师',
  '作家',
  '企业家',
  '艺术家',
  '科学家',
  '美食家',
  '旅行家',
  '哲学家',
  '历史学家',
  '演员',
  '音乐家',
  '摄影师',
]

const form = ref({
  name: '',
  gender: '女',
  personality: personalityOptions[0],
  background: backgroundOptions[0],
  description: '',
})

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.aiId)

const { createAICharacter } = useChat()

onMounted(async () => {
  if (route.params.aiId) {
    const character = await getCharacterById(route.params.aiId)
    if (character) {
      form.value = {
        name: character.name,
        gender: character.gender,
        personality: character.personality,
        background: character.background,
        description: character.description,
      }
    }
  }
})

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateCharacter(route.params.aiId, form.value)
      router.back()
    } else {
      const chatId = await createAICharacter(form.value)
      router.push(`/chat/${chatId}`)
    }
  } catch (error) {
    console.error(isEdit.value ? '更新AI角色失败:' : '创建AI角色失败:', error)
  }
}
</script>
