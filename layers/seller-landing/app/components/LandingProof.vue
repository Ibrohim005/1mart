<script setup lang="ts">
// Социальное доказательство сразу под героем (приём Framer: «trusted by»).
// Крупные числа — данные; подписи и оценка — из словаря. Вместо выдуманных
// логотипов компаний честные метрики площадки и рейтинг продавцов.
const { t } = useI18n()

const stats = [
  { value: '500+', labelKey: 'landing.proof.s1' },
  { value: '12 000+', labelKey: 'landing.proof.s2' },
  { value: t('landing.proof.s3val'), labelKey: 'landing.proof.s3' },
]
</script>

<template>
  <section class="proof">
    <div class="proof__inner">
      <p class="proof__eyebrow">{{ $t('landing.proof.eyebrow') }}</p>
      <dl class="proof__stats">
        <div v-for="s in stats" :key="s.labelKey" class="proof__stat">
          <dt class="proof__value m-metric">{{ s.value }}</dt>
          <dd class="proof__label">{{ $t(s.labelKey) }}</dd>
        </div>
        <div class="proof__stat proof__stat--rating">
          <dt class="proof__value proof__value--rating">
            <span class="m-metric">4.9</span>
            <span class="proof__stars">
              <UiIcon v-for="n in 5" :key="n" name="star-fill" :size="16" />
            </span>
          </dt>
          <dd class="proof__label">{{ $t('landing.proof.s4') }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.proof { padding: 40px 0; background: var(--m-surface); border-bottom: 1px solid var(--m-line); }
.proof__inner { width: var(--container-width); max-width: var(--container-width); margin: 0 auto; }
.proof__eyebrow { margin: 0 0 24px; font-size: var(--text-sm); font-weight: 600; color: var(--m-slate); text-align: center; }
.proof__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin: 0; }
.proof__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0 16px;
  border-left: 1px solid var(--m-line);
}
.proof__stat:first-child { border-left: 0; }
.proof__value { font-size: var(--text-10xl); line-height: 1; color: var(--m-ink); }
.proof__value--rating { display: inline-flex; align-items: center; gap: 12px; }
.proof__value--rating .m-metric { font-size: var(--text-10xl); line-height: 1; }
.proof__stars { display: inline-flex; gap: 2px; color: #F5A623; }
.proof__label { font-size: var(--text-sm); color: var(--m-slate); text-align: center; }
</style>
