<script setup lang="ts">
/** Необязательный комментарий к заказу: уходит вместе с заказом и виден в кабинете. */
const model = defineModel<string>({ required: true })

const MAX_LENGTH = 500
</script>

<template>
  <section class="comment">
    <label for="order-comment" class="comment__title">{{ $t('pay.comment.title') }}</label>
    <textarea
      id="order-comment"
      v-model="model"
      class="comment__field"
      rows="3"
      :maxlength="MAX_LENGTH"
      :placeholder="$t('pay.comment.placeholder')"
    />
    <p class="comment__counter">{{ model.length }} / {{ MAX_LENGTH }}</p>
  </section>
</template>

<style scoped>
.comment {
  padding: 24px;
  border-radius: 24px;
  background: var(--color-surface);
}

.comment__title {
  display: block;
  margin-bottom: 16px;
  font: var(--type-section-title);
  color: var(--color-text);
}

.comment__field {
  display: block;
  width: 100%;
  min-height: 96px;
  padding: 14px 16px;
  border: 1.5px solid transparent;
  border-radius: var(--field-radius);
  background: var(--color-field);
  outline: none;
  font: var(--type-input);
  color: var(--input-color);
  resize: vertical;
}

.comment__field::placeholder { color: var(--input-placeholder); }
.comment__field:focus { border-color: var(--color-brand); background: var(--color-surface); }

.comment__counter {
  margin: 8px 0 0;
  font-size: var(--text-xs);
  line-height: 16px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--color-text-muted);
}
</style>
