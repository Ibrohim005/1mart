<script setup lang="ts">
/**
 * Документы по текущему заказу. Пока это образцы из public/mock/documents:
 * ссылки заменятся на файлы бэкенда, когда он начнёт их выдавать.
 */
const DOCUMENTS = [
  { kind: 'specification', href: '/mock/documents/specification.pdf' },
  { kind: 'invoice', href: '/mock/documents/invoice.pdf' },
]
</script>

<template>
  <section class="documents">
    <h2 class="documents__title">{{ $t('pay.documents.title') }}</h2>

    <div class="documents__list">
      <a
        v-for="item in DOCUMENTS"
        :key="item.kind"
        :href="item.href"
        :download="`spotshop-${item.kind}.pdf`"
        class="documents__item"
      >
        <span class="documents__badge" aria-hidden="true">PDF</span>
        <span class="documents__text">
          <span class="documents__name">{{ $t(`pay.documents.${item.kind}`) }}</span>
          <span class="documents__note">{{ $t('pay.documents.note') }}</span>
        </span>
        <UiIcon name="export-fill" :size="20" class="documents__icon" />
      </a>
    </div>
  </section>
</template>

<style scoped>
.documents {
  padding: 24px;
  border-radius: 24px;
  background: var(--color-surface);
}

.documents__title {
  margin: 0 0 16px;
  font: var(--type-section-title);
  color: var(--color-text);
}

.documents__list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }

.documents__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: var(--color-page);
  transition: background 0.15s ease;
}

.documents__item:hover { background: var(--color-field); text-decoration: none; }
.documents__item:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.documents__badge {
  display: grid;
  flex: none;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-surface);
  font: var(--type-button-sm);
  color: var(--color-brand-text);
}

.documents__text { display: flex; flex: 1; flex-direction: column; gap: 2px; min-width: 0; }
.documents__name { font: var(--type-button); color: var(--color-text); }
.documents__note { font-size: var(--text-sm); line-height: 18px; color: var(--color-text-muted); }
.documents__icon { flex: none; color: var(--color-text-muted); }
</style>
