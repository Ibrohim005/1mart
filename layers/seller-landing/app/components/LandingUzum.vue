<script setup lang="ts">
// Блок логистики/фулфилмента (фирменный приём маркетплейсов вроде Uzum): склад,
// доставка по стране, пункты выдачи и возвраты на стороне площадки. Слева —
// плитки возможностей, справа — фото склада с плавающей карточкой-метрикой.
// Тексты из словаря, фото локальное (public/landing).
const tiles = [
  { key: 't1', icon: 'box-fill' },
  { key: 't2', icon: 'truck-fill' },
  { key: 't3', icon: 'location-fill' },
  { key: 't4', icon: 'undo' },
]
</script>

<template>
  <section id="logistics" class="uz">
    <div class="uz__inner">
      <div class="uz__lead">
        <h2 class="uz__title">{{ $t('landing.logistics.title') }}</h2>
        <p class="uz__sub">{{ $t('landing.logistics.subtitle') }}</p>

        <div class="uz__tiles">
          <div v-for="t in tiles" :key="t.key" class="uz__tile">
            <span class="uz__tile-icon"><UiIcon :name="t.icon" :size="22" color="var(--m-on-brand)" /></span>
            <div>
              <p class="uz__tile-title">{{ $t(`landing.logistics.${t.key}Title`) }}</p>
              <p class="uz__tile-text">{{ $t(`landing.logistics.${t.key}Text`) }}</p>
            </div>
          </div>
        </div>

        <a href="#apply" class="uz__cta">
          <UiButton variant="primary" size="lg">{{ $t('landing.logistics.cta') }}</UiButton>
        </a>
      </div>

      <div class="uz__media">
        <div class="uz__photo">
          <img src="/landing/warehouse.jpg" :alt="$t('landing.logistics.title')" loading="lazy">
        </div>
        <dl class="uz__stat">
          <dt class="uz__stat-val m-tnum">{{ $t('landing.logistics.statVal') }}</dt>
          <dd class="uz__stat-label">{{ $t('landing.logistics.statLabel') }}</dd>
        </dl>
        <span class="uz__blob" aria-hidden="true" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.uz { padding: 100px 0; background: var(--m-brand-tint); }
.uz__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 520px);
  align-items: center;
  gap: 72px;
  width: var(--container-width);
  max-width: var(--container-width);
  margin: 0 auto;
}
.uz__title { margin: 12px 0 0; max-width: 520px; font-family: var(--font-display); font-weight: 800; font-size: var(--text-10xl); line-height: 1.08; letter-spacing: -0.025em; color: var(--m-ink); }
.uz__sub { margin: 16px 0 0; max-width: 520px; font-size: var(--text-lg); line-height: 1.5; color: var(--m-ink-soft); }

.uz__tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 32px 0 0; }
.uz__tile {
  display: flex;
  gap: 14px;
  padding: 18px;
  border-radius: var(--m-radius-lg);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-sm);
}
.uz__tile-icon {
  display: inline-grid;
  place-items: center;
  width: 42px; height: 42px;
  flex: none;
  border-radius: var(--m-radius-sm);
  background: var(--m-brand-gradient);
  box-shadow: var(--m-shadow-brand);
}
.uz__tile-title { margin: 0; font-weight: 600; font-size: var(--text-base); color: var(--m-ink); }
.uz__tile-text { margin: 4px 0 0; font-size: var(--text-sm); line-height: 1.45; color: var(--m-slate); }
.uz__cta { display: inline-flex; margin-top: 32px; }

/* ── Фото склада + плавающая метрика ────────────────────────────────────── */
.uz__media { position: relative; }
.uz__photo {
  position: relative;
  z-index: 1;
  overflow: hidden;
  height: 460px;
  border-radius: var(--m-radius-xl);
  box-shadow: var(--m-shadow-lg);
}
.uz__photo img { width: 100%; height: 100%; object-fit: cover; }
.uz__stat {
  position: absolute;
  z-index: 2;
  left: -24px; bottom: 32px;
  margin: 0;
  padding: 18px 22px;
  border-radius: var(--m-radius-lg);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-lg);
}
.uz__stat-val { font-family: var(--font-display); font-weight: 800; font-size: var(--text-7xl); line-height: 1; letter-spacing: -0.02em; color: var(--m-brand-strong); }
.uz__stat-label { margin: 6px 0 0; max-width: 170px; font-size: var(--text-sm); line-height: 1.35; color: var(--m-slate); }
.uz__blob { position: absolute; z-index: 0; inset: auto -30px -30px auto; width: 240px; height: 240px; border-radius: 50%; background: var(--m-brand-glow); filter: blur(44px); }
</style>
