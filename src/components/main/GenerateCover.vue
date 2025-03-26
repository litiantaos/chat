<template>
  <div class="flex h-full flex-1 flex-col">
    <MainHeader title="生成封面图">
      <template #right>
        <button
          v-if="html"
          class="text-base"
          :class="showPreview ? 'ri-layout-right-fill' : 'ri-layout-right-line'"
          @click="showPreview = !showPreview"
        ></button>
      </template>
    </MainHeader>

    <div class="relative w-full flex-1 space-y-6 overflow-y-auto p-4">
      <div class="rounded-md bg-gray-100 p-4 text-xs">
        提示词来源于「歸藏」，详细内容与风格示例请查看
        <a
          href="https://mp.weixin.qq.com/s/OFCgFrXNQgIT2ho3V-4Oag"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-500"
        >
          公众号原文
        </a>
      </div>

      <div>
        <label for="platform">平台</label>
        <select
          id="platform"
          v-model="platform"
          required
          placeholder="请选择平台"
          class="w-full"
        >
          <option value="xhs">小红书</option>
          <option value="gzh">微信公众号</option>
        </select>
      </div>

      <div>
        <label for="userContent">
          文案内容
          <span class="font-normal text-gray-400">
            （输入要在封面上显示的内容，文本内容填写在方括号内）
          </span>
        </label>

        <textarea
          id="userContent"
          v-model="userContent"
          class="h-32! w-full p-2"
          placeholder="输入文案内容"
        ></textarea>
      </div>

      <div>
        <label for="coverStyle">风格</label>
        <select
          id="coverStyle"
          v-model="coverStyle"
          required
          placeholder="请选择风格"
          class="w-full"
        >
          <option v-for="(s, k) in stylePrompts" :key="k" :value="k">
            {{ k }}
          </option>
        </select>
      </div>

      <div>
        <label for="coverStyleContent">
          风格内容
          <span class="font-normal text-gray-400">
            （预设的风格提示词，可自行调整）
          </span>
        </label>
        <textarea
          id="coverStyleContent"
          v-model="coverStyleContent"
          class="h-64! w-full p-2"
          placeholder="输入风格内容"
        ></textarea>
      </div>

      <button
        type="submit"
        :disabled="!userContent || !coverStyleContent"
        class="btn-base text-blue-500"
        @click="handleSubmit"
      >
        <span v-if="!loading">生成封面</span>
        <span v-else class="ri-loader-4-line animate-spin text-base"></span>
      </button>

      <Transition name="move-left-full">
        <div
          v-if="showPreview && html"
          class="absolute top-0 right-0 bottom-0 z-10 flex w-full flex-col border-l border-gray-200 bg-white lg:w-1/2"
        >
          <iframe :srcdoc="html" class="w-full flex-1"></iframe>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useChat } from '@/composables/useChat'
import MainHeader from '@/components/nav/MainHeader.vue'
import { xhsBasePrompt, gzhBasePrompt, stylePrompts } from '@/config/prompts'

const { getAIResponse } = useChat()

const platform = ref('xhs')
const userContent = ref(`- 封面文案：[…]
- 账号名称：[…]
- 可选标语：[…]
- …`)
const coverStyle = ref(Object.keys(stylePrompts)[0])
const coverStyleContent = ref(stylePrompts[coverStyle.value])

const loading = ref(false)
const showPreview = ref(false)
const html = ref('')

const handleSubmit = async () => {
  loading.value = true

  const basePrompt = platform.value === 'xhs' ? xhsBasePrompt : gzhBasePrompt

  const messages = [
    {
      role: 'system',
      content:
        basePrompt +
        '\n\n' +
        userContent.value +
        '\n\n' +
        coverStyleContent.value,
    },
  ]

  // console.log('message content:', messages[0].content)

  const response = await getAIResponse(messages)

  // 移除代码块标记，转义HTML闭合标签
  html.value = response
    .replace(/^```html\n|```$/g, '')
    .replace(/<\/html>/g, '<\/html>')
    .replace(/<\/head>/g, '<\/head>')
    .replace(/<\/body>/g, '<\/body>')
    .replace(/<\/script>/g, '<\/script>')

  // console.log(html.value)

  loading.value = false
  showPreview.value = true
}
</script>
