<script setup lang="ts">
/** Пустое состояние: иконка в круге, заголовок, пояснение и слот действия. */
withDefaults(defineProps<{
  title: string
  text?: string
  icon?: string
}>(), { icon: 'box-fill' })
</script>

<template>
  <div class="mempty">
    <span class="mempty__icon"><UiIcon :name="icon" :size="34" /></span>
    <p class="mempty__title">{{ title }}</p>
    <p v-if="text" class="mempty__text">{{ text }}</p>
    <div v-if="$slots.default" class="mempty__action"><slot /></div>
  </div>
</template>

<style scoped>
.mempty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 24px;
  text-align: center;
}
.mempty__icon {
  display: grid;
  width: 72px;
  height: 72px;
  margin-bottom: 18px;
  border-radius: var(--m-radius-xl);
  background: var(--m-brand-tint);
  color: var(--m-brand-strong);
  place-items: center;
}
.mempty__title { margin: 0; font-family: var(--font-display); font-weight: 600; font-size: var(--text-xl); color: var(--m-ink); }
.mempty__text { margin: 8px 0 0; max-width: 420px; font-size: var(--text-sm); color: var(--m-slate); }
.mempty__action { margin-top: 20px; }
</style>
