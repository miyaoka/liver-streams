<doc lang="md">
ローディングスピナー。サイズ（sm/md/lg）とメッセージを指定可能。
</doc>

<script setup lang="ts">
defineProps<{
  size?: "sm" | "md" | "lg";
  message?: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3">
    <i
      class="i-mdi-loading animate-spin"
      :class="{
        'size-8': size === 'sm',
        'size-12': size === 'md' || !size,
        'size-16': size === 'lg',
      }"
    />
    <p v-if="message" class="text-sm font-medium">{{ message }}</p>
  </div>
</template>
