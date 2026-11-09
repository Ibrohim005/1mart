<script setup lang="ts">
/**
 * Подвал 1mart — раскладка Uzum Market: четыре колонки
 * («О нас», «Пользователям», «Для предпринимателей», «Скачать приложение»),
 * соцсети и нижняя строка с документами и копирайтом. Сверху две карточки
 * с главными действиями, внизу логотип на всю ширину, обрезанный краем страницы.
 * Фон — тёмно-синий палитры 1mart, знак — белый вариант.
 */
// Бейджи сторов — растр: в SVG-выгрузке логотип Google Play разваливался на сегменты

const localePath = useLocalePath()
const { sellerCabinetUrl } = useRuntimeConfig().public

const year = new Date().getFullYear()

const socials = [
  { label: 'Telegram', url: 'https://t.me/paylov', icon: 'social-telegram' },
  { label: 'Instagram', url: 'https://instagram.com/paylov.uz', icon: 'social-instagram' },
  { label: 'Facebook', url: 'https://facebook.com/paylov.uz', icon: 'social-facebook' },
  { label: 'YouTube', url: 'https://youtube.com/@paylov', icon: 'social-youtube' },
]

type FooterLink = { label: string, to?: string, href?: string }

/*
 * Отдельных страниц «Вакансии», «Пункты выдачи» и «Возврат» пока нет —
 * ссылки ведут на ближайшие существующие /info/*: о компании, доставку и
 * центр помощи. Когда страницы появятся, меняется только `to`.
 */
const columns: Array<{ title: string, items: FooterLink[] }> = [
  {
    title: 'shell.footer.about',
    items: [
      { label: 'shell.footer.aboutMarket', to: '/info/about' },
      { label: 'shell.footer.pickupPoints', to: '/info/delivery#pickup' },
      { label: 'shell.footer.vacancies', to: '/info/contact' },
    ],
  },
  {
    title: 'shell.footer.users',
    items: [
      { label: 'shell.footer.contact', to: '/info/contact' },
      { label: 'shell.footer.faq', to: '/info/faq' },
      { label: 'shell.footer.delivery', to: '/info/delivery' },
      { label: 'shell.footer.returns', to: '/info/returns' },
    ],
  },
  {
    title: 'shell.footer.business',
    items: [
      // Кабинет продавца живёт вне витрины
      { label: 'shell.footer.sellOn1mart', href: sellerCabinetUrl },
      { label: 'shell.footer.sellerLogin', href: sellerCabinetUrl },
    ],
  },
]
</script>

<template>
  <footer class="footer">
    <div class="footer__top">
      <p class="footer__about">{{ $t('shell.footer.tagline') }}</p>

      <div class="footer__cards">
        <NuxtLink :to="localePath('/account/balance')" class="footer__card">
          <span class="footer__card-label">{{ $t('footer.buyers') }}</span>
          <span class="footer__card-action">
            {{ $t('pay.balance.topUpTitle') }}
            <UiIcon name="alt-arrow-right" color="currentColor" :size="18" />
          </span>
        </NuxtLink>
        <a :href="sellerCabinetUrl" target="_blank" rel="noopener" class="footer__card">
          <span class="footer__card-label">{{ $t('footer.sellers') }}</span>
          <span class="footer__card-action">
            {{ $t('shell.footer.sellOn1mart') }}
            <UiIcon name="alt-arrow-right" color="currentColor" :size="18" />
          </span>
        </a>
      </div>
    </div>

    <div class="footer__inner">
      <nav
        v-for="column in columns"
        :key="column.title"
        class="footer__column"
        :aria-label="$t(column.title)"
      >
        <h3 class="footer__heading">{{ $t(column.title) }}</h3>
        <ul class="footer__list">
          <li v-for="item in column.items" :key="item.label">
            <a v-if="item.href" :href="item.href" target="_blank" rel="noopener" class="footer__link">{{ $t(item.label) }}</a>
            <NuxtLink v-else :to="localePath(item.to!)" class="footer__link">{{ $t(item.label) }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="footer__column footer__column--app">
        <h3 class="footer__heading">{{ $t('shell.footer.socials') }}</h3>
        <ul class="footer__social">
          <li v-for="social in socials" :key="social.url">
            <a :href="social.url" target="_blank" rel="noopener noreferrer" class="footer__social-item" :aria-label="social.label">
              <UiIcon :name="social.icon" :size="20" />
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="footer__bottom-inner">
        <nav class="footer__legal">
          <NuxtLink :to="localePath('/info/terms')" class="footer__legal-link">{{ $t('shell.footer.terms') }}</NuxtLink>
          <NuxtLink :to="localePath('/info/privacy')" class="footer__legal-link">{{ $t('shell.footer.privacy') }}</NuxtLink>
        </nav>
        <!-- Знак © живёт в самой строке перевода: где он стоит, решает язык -->
        <p class="footer__copy">{{ $t('shell.footer.copyright', { year }) }}</p>
      </div>
    </div>

    <!-- Логотип целиком в разметке, обрезает его только рамка: подпись для скринридера есть у ссылки -->
    <div class="footer__wordmark-frame">
      <NuxtLink :to="localePath('/')" class="footer__wordmark" :aria-label="$t('shell.header.home')">
        <img src="/1mart-logo-on-dark.svg" alt="" width="999" height="210" loading="lazy" class="footer__wordmark-img">
      </NuxtLink>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-navy);
  color: var(--color-surface);
}

.footer__inner {
  display: grid;
  grid-template-columns: repeat(3, 1fr) 260px;
  gap: 40px;
  width: var(--container-width);
  margin-inline: auto;
  padding-block: 40px;
}

/* ---------- Описание и карточки ---------- */

.footer__top {
  display: grid;
  grid-template-columns: 400px minmax(0, 1fr);
  align-items: center;
  gap: 40px;
  width: var(--container-width);
  margin-inline: auto;
  padding-block: 48px 40px;
  border-bottom: 1px solid var(--color-navy-2);
}

.footer__about {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-3xl);
  line-height: 30px;
  color: var(--color-surface);
}

.footer__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.footer__card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 20px;
  background: var(--color-navy-2);
  color: var(--color-surface);
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.footer__card:hover {
  background: var(--color-brand);
  color: var(--color-on-brand);
  text-decoration: none;
  transform: translateY(-2px);
}

.footer__card:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.footer__card-label { font-size: var(--text-sm); line-height: 18px; opacity: 0.75; }

.footer__card-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
  font-size: var(--text-lg);
  line-height: 22px;
}

/* ---------- Логотип на всю ширину ---------- */

/* Рамка режет логотип чуть ниже букв: знак слева уходит за край страницы */
.footer__wordmark-frame {
  width: var(--container-width);
  height: 236px;
  margin-inline: auto;
  overflow: hidden;
}

.footer__wordmark { display: block; padding-top: 16px; }

.footer__wordmark-img {
  display: block;
  width: 100%;
  height: auto;
}

/* Плавный подъём при прокрутке: без поддержки браузером логотип просто стоит */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .footer__wordmark-img {
      animation: footer-rise linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 100%;
    }
  }
}

@keyframes footer-rise {
  from { transform: translateY(70px); }
}

@media (prefers-reduced-motion: reduce) {
  .footer__card { transition: none; }
  .footer__card:hover { transform: none; }
}

/* ---------- Колонки ссылок ---------- */

.footer__column { min-width: 0; }

.footer__heading {
  margin: 0;
  font-weight: 500;
  font-size: var(--text-base);
  line-height: 20px;
  color: var(--color-surface);
}


.footer__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.footer__link {
  font-size: var(--text-sm);
  line-height: 18px;
  color: var(--color-gray);
  transition: color 0.15s ease;
}

.footer__link:hover { color: var(--color-surface); }

/* ---------- Приложение и соцсети ---------- */


.footer__social {
  display: flex;
  gap: 10px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.footer__social-item {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  /* Иконки соцсетей залиты тёмным — кружок под ними светлый */
  background: var(--color-surface);
  color: var(--color-text);
  transition: background 0.15s ease, transform 0.15s ease;
}

.footer__social-item:hover { background: var(--color-brand-tint); transform: scale(1.06); }

/* ---------- Нижняя строка ---------- */

.footer__bottom { border-top: 1px solid var(--color-navy-2); }

.footer__bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: var(--container-width);
  min-height: 64px;
  margin-inline: auto;
}

.footer__legal {
  display: flex;
  gap: 24px;
}

.footer__legal-link,
.footer__copy {
  margin: 0;
  font-size: var(--text-xs);
  line-height: 18px;
  color: var(--color-gray);
}

.footer__legal-link:hover { color: var(--color-surface); }

/* Общее правило подчёркивает ссылки внутри li при наведении — здесь цвет и так меняется */
.footer__link:hover { text-decoration: none; }
</style>
