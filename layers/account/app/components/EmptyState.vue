<script setup lang="ts">
/** Пустое состояние раздела кабинета (макеты orders-6 / orders-7). */
defineProps<{ title: string, text?: string, illustration?: string }>()
</script>

<template>
  <div class="empty">
    <img v-if="illustration" :src="illustration" alt="" class="empty__image">
    <p class="empty__title">{{ title }}</p>
    <p v-if="text" class="empty__text">{{ text }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  border-radius: 20px;
  background: var(--color-surface);
  text-align: center;
}

.empty__image { width: 160px; height: 160px; object-fit: contain; }

.empty__title {
  margin: 20px 0 0;
  font-weight: 700;
  font-size: var(--text-3xl);
  line-height: 28px;
  color: #101010;
}

.empty__text {
  margin: 8px 0 0;
  font-weight: 400;
  font-size: var(--text-xl);
  line-height: 24px;
  color: #7C8A94;
}
</style>
