<template>
  <div class="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden">
    <div class="flex-none">
      <Avatar :text="name" :size="avatarSize" />
    </div>

    <div class="flex flex-1 flex-col gap-0.5 overflow-hidden">
      <div class="flex items-center gap-2">
        <div class="font-medium">{{ name }}</div>
        <slot />
      </div>

      <div v-if="sub" class="truncate text-xs text-gray-400">{{ sub }}</div>
    </div>
  </div>
</template>

<script setup>
import Avatar from './Avatar.vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  sub: {
    type: String,
  },
  avatarSize: {
    type: String,
    default: 'md',
  },
})
</script>
