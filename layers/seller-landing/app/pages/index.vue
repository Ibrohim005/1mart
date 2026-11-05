<script setup lang="ts">
// Лендинг для продавцов — публичная страница business.paylov.uz.
// Собственная шапка и подвал; макет кабинета здесь не используется.
const { t } = useI18n()
const localePath = useLocalePath()

const anchors = [
  { href: '#steps', key: 'landing.nav.steps' },
  { href: '#tariffs', key: 'landing.nav.tariffs' },
  { href: '#faq', key: 'landing.nav.faq' },
]

useSeoMeta({
  title: () => `${t('landing.hero.title')} — 1mart Business`,
  description: () => t('landing.hero.subtitle'),
})
</script>

<template>
  <div class="landing">
    <header class="lnav">
      <div class="lnav__inner">
        <a href="#" class="lnav__brand">
          <img src="/1mart-logo.svg" alt="1mart" class="lnav__logo-img" width="114" height="35">
          <span class="lnav__brand-tag">{{ $t('m.brand.business') }}</span>
        </a>
        <nav class="lnav__links">
          <a v-for="item in anchors" :key="item.href" :href="item.href" class="lnav__link">{{ $t(item.key) }}</a>
        </nav>
        <div class="lnav__actions">
          <NuxtLink :to="localePath('/login')"><UiButton variant="ghost">{{ $t('landing.nav.login') }}</UiButton></NuxtLink>
          <a href="#apply"><UiButton variant="primary">{{ $t('landing.nav.apply') }}</UiButton></a>
        </div>
      </div>
    </header>

    <main>
      <LandingHero />
      <LandingStats />
      <LandingEducation />
      <LandingTools />
      <LandingUzum />
      <LandingReviews />
      <LandingSupport />
      <LandingSteps />
      <LandingTariffs />
      <LandingFaq />
      <LandingCta />
      <LandingMobile />
      <LandingApplyForm />
    </main>

    <LandingFooter />
  </div>
</template>

<style scoped>
/* --lnav-offset — верхний отступ шапки плюс её высота; героблок учитывает его в своём padding.
   flow-root не даёт верхнему отступу шапки схлопнуться и открыть полосу фона над страницей. */
.landing { --lnav-offset: 76px; display: flow-root; background: var(--m-page); }

/* Якоря: скроллит html, поэтому отступ задан самим секциям, чтобы шапка не закрывала их верх. */
.landing :deep([id]) { scroll-margin-top: calc(var(--lnav-offset) + var(--m-space-3)); }

/* Плавающая шапка-пилюля: сама шапка прозрачна, контент подтянут под неё отрицательным отступом. */
.lnav {
  position: sticky;
  top: var(--m-space-3);
  z-index: 100;
  width: var(--container-width);
  max-width: var(--container-width);
  margin: var(--m-space-3) auto calc(-1 * var(--lnav-offset));
}
.lnav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 var(--m-space-2) 0 var(--m-space-6);
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius-pill);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-md);
}
.lnav__brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.lnav__logo-img { display: block; height: 35px; width: auto; }
.lnav__brand-tag {
  padding: 5px 10px;
  border-radius: var(--m-radius-pill);
  background: var(--m-brand-tint);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-xs);
  line-height: 1;
  color: var(--m-brand-ink);
}
.lnav__links { display: flex; gap: 28px; }
.lnav__link { padding-block: 8px; font-size: var(--text-base); font-weight: 500; color: var(--m-slate); text-decoration: none; transition: color var(--m-dur-fast) var(--m-ease); }
.lnav__link:hover { color: var(--m-brand-strong); }
.lnav__actions { display: flex; align-items: center; gap: 12px; }
/* Кнопки вписаны в пилюлю с равным зазором сверху, снизу и справа. */
.lnav__actions :deep(.btn) { height: 48px; border-radius: var(--m-radius-pill); }
</style>
