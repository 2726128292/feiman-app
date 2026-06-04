<template>
  <div
    class="rounded-2xl shadow-sm p-4"
    :class="variantClasses[variant]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'gradient-blue' | 'gradient-warm' | 'dark-card'
}>(), {
  variant: 'default',
})

const variantClasses = computed<Record<string, string>>(() => ({
  default: 'bg-white',
  'gradient-blue': 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
  'gradient-warm': 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
  'dark-card': 'bg-slate-800 text-white',
}))
</script>
