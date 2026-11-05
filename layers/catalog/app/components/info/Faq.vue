<script setup lang="ts">
/** «Вопросы и ответы»: темы, поиск по тексту и раскрывающиеся ответы. */
const { t } = useI18n()

const TOPICS = [
  { code: 'payment', items: ['payHow', 'payTopUp', 'payPersonal', 'payMoney'] },
  { code: 'orders', items: ['ordStatus', 'ordCancel', 'ordOriginal'] },
  { code: 'delivery', items: ['delWho', 'delTime', 'delPickup'] },
  { code: 'returns', items: ['retHow', 'retMoney'] },
  { code: 'sellers', items: ['selStart', 'selCheck', 'selFee'] },
]

const topic = ref('all')
const query = ref('')
const opened = ref<string | null>('payHow')

const needle = computed(() => query.value.trim().toLowerCase())

const visible = computed(() => TOPICS
  .filter(item => topic.value === 'all' || item.code === topic.value)
  .map(item => ({
    code: item.code,
    title: t(`ui.catalog.infoPage.faq.topics.${item.code}`),
    items: item.items
      .map(id => ({
        id,
        question: t(`ui.catalog.infoPage.faq.items.${id}.q`),
        answer: t(`ui.catalog.infoPage.faq.items.${id}.a`),
      }))
      .filter(entry => !needle.value || `${entry.question} ${entry.answer}`.toLowerCase().includes(needle.value)),
  }))
  .filter(item => item.items.length))

function toggle(id: string) {
  opened.value = opened.value === id ? null : id
}
</script>

<template>
  <div class="faq">
    <label class="faq__search">
      <UiIcon name="search-normal" :size="18" class="faq__search-icon" />
      <input
        v-model="query"
        type="search"
        class="faq__input"
        :placeholder="$t('ui.catalog.infoPage.faq.search')"
        :aria-label="$t('ui.catalog.infoPage.faq.search')"
      >
    </label>

    <div class="faq__topics" role="group" :aria-label="$t('ui.catalog.infoPage.faq.topicsLabel')">
      <button
        v-for="code in ['all', ...TOPICS.map(item => item.code)]"
        :key="code"
        type="button"
        class="faq__topic"
        :class="{ 'faq__topic--active': topic === code }"
        :aria-pressed="topic === code"
        @click="topic = code"
      >
        {{ $t(`ui.catalog.infoPage.faq.topics.${code}`) }}
      </button>
    </div>

    <section v-for="group in visible" :key="group.code" class="faq__group">
      <h2 class="faq__group-title">{{ group.title }}</h2>
      <div v-for="entry in group.items" :key="entry.id" class="faq__item" :class="{ 'faq__item--open': opened === entry.id }">
        <button
          :id="`faq-q-${entry.id}`"
          type="button"
          class="faq__question"
          :aria-expanded="opened === entry.id"
          :aria-controls="`faq-a-${entry.id}`"
          @click="toggle(entry.id)"
        >
          <span>{{ entry.question }}</span>
          <UiIcon name="alt-arrow-down" :size="18" class="faq__chevron" />
        </button>
        <div :id="`faq-a-${entry.id}`" class="faq__collapse" role="region" :aria-labelledby="`faq-q-${entry.id}`">
          <div class="faq__collapse-inner" :inert="opened !== entry.id || undefined">
            <p class="faq__answer">{{ entry.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <p v-if="!visible.length" class="faq__empty">{{ $t('ui.catalog.infoPage.faq.empty') }}</p>
  </div>
</template>

<style scoped>
.faq { display: flex; flex-direction: column; gap: 20px; }

.faq__search {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 46px;
  padding-inline: 14px;
  border: 1px solid var(--color-line);
  border-radius: 12px;
  background: var(--color-page);
  transition: border-color .15s ease, background-color .15s ease;
}

.faq__search:focus-within { border-color: var(--color-brand); background: var(--color-surface); }
.faq__search-icon { flex: none; color: var(--color-gray); }

.faq__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: none;
  outline: none;
  font: var(--type-input);
  color: var(--input-color);
}

.faq__input::placeholder { font-weight: 400; color: var(--input-placeholder); }

.faq__topics { display: flex; flex-wrap: wrap; gap: 8px; }

.faq__topic {
  height: 36px;
  padding-inline: 14px;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  background: var(--color-surface);
  font: var(--type-button-sm);
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}

.faq__topic:hover { border-color: var(--color-brand); }
.faq__topic:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.faq__topic--active,
.faq__topic--active:hover {
  border-color: var(--color-brand);
  background: var(--color-brand-tint);
  color: var(--color-brand-text);
}

.faq__group { display: flex; flex-direction: column; }

.faq__group-title {
  margin: 0 0 6px;
  font: var(--type-card-title);
  color: var(--color-text);
}

.faq__item { border-bottom: 1px solid var(--color-line); }

.faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 14px 0;
  border: 0;
  background: none;
  text-align: left;
  font-weight: 500;
  font-size: var(--text-base);
  line-height: 22px;
  color: var(--color-text);
  cursor: pointer;
}

.faq__question:hover { color: var(--color-brand-text); }
.faq__question:focus-visible { outline: none; box-shadow: var(--focus-ring); border-radius: 6px; }

.faq__chevron { flex: none; color: var(--color-gray); transition: transform .25s ease; }
.faq__item--open .faq__chevron { transform: rotate(180deg); }

.faq__collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .25s ease; }
.faq__item--open .faq__collapse { grid-template-rows: 1fr; }
.faq__collapse-inner { min-height: 0; overflow: hidden; }

.faq__answer {
  margin: 0;
  padding-bottom: 16px;
  max-width: 760px;
  font-size: var(--text-md);
  line-height: 24px;
  color: var(--color-text-muted);
}

.faq__empty {
  margin: 0;
  padding-block: 24px;
  text-align: center;
  font-size: var(--text-md);
  color: var(--color-text-muted);
}

@media (prefers-reduced-motion: reduce) {
  .faq__collapse,
  .faq__chevron,
  .faq__topic,
  .faq__search { transition: none; }
}
</style>
