<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { initDB } from '@/services/database'

initDB()
</script>
