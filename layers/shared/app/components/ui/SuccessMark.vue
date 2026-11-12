<script setup lang="ts">
/**
 * Отметка «готово»: тонкое кольцо, внутри залитый круг с галочкой-вырезом.
 * Круг рисует сама иконка; поле вокруг него в SVG 2 из 24, отсюда 0.73 / (20 / 24).
 * Стоит в диалогах успешного пополнения и успешной оплаты — в обоих
 * местах в макете одна и та же фигура.
 */
withDefaults(defineProps<{ size?: number }>(), { size: 189.3 })
</script>

<template>
  <span class="mark" :style="{ width: `${size}px`, height: `${size}px` }" aria-hidden="true">
    <UiIcon name="tick-circle-fill" color="#0B8F2A" :size="size * 0.876" />
  </span>
</template>

<style scoped>
.mark {
  display: grid;
  place-items: center;
  flex: none;
  border: 2px solid #0B8F2A;
  border-radius: 50%;
}
</style>
