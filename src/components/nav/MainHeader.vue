<template>
  <header
    class="flex h-15 items-center justify-between gap-4 border-b border-gray-200 px-4"
  >
    <div class="flex items-center gap-3">
      <button
        v-if="isMobile"
        class="ri-menu-line text-base"
        @click="showSidebar = !showSidebar"
      ></button>

      <h2 class="font-bold">{{ title }}</h2>

      <slot name="left" />
    </div>

    <div>
      <slot name="right" />
    </div>
  </header>
</template>

<script setup>
import { useChat } from '@/composables/useChat'

const { isMobile, showSidebar } = useChat()

const props = defineProps(['title'])
</script>
