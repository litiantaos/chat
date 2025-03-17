<template>
  <div class="relative overflow-hidden rounded-md" :class="sizeMap[size]">
    <img
      :src="`https://api.dicebear.com/9.x/glass/svg?seed=${text}`"
      alt="avatar"
    />
    <div
      class="absolute inset-0 flex items-center justify-center bg-black/10 font-bold text-white [text-shadow:0_0_4px_rgba(0,0,0,0.2)]"
    >
      {{ text?.[0].toUpperCase() }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
  },
})

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}
</script>
