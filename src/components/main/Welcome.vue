<template>
  <div class="flex h-full flex-1 flex-col">
    <MainHeader v-if="isMobile" />

    <div class="flex w-full flex-1 items-center justify-center">
      <i class="ri-message-3-line text-4xl text-gray-300"></i>
    </div>
  </div>
</template>

<script setup>
import { useChat } from '@/composables/useChat'
import MainHeader from '@/components/nav/MainHeader.vue'

const { isMobile } = useChat()
</script>
