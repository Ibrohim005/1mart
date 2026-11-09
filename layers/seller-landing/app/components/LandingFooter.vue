<script setup lang="ts">
// Подвал лендинга: тёмный лист со скруглённым верхом, заключительная фраза с кнопкой,
// колонки ссылок, контакты с соцсетями, копирайт и огромный знак 1mart, обрезанный
// нижним краем. Ссылки только на то, что реально есть: якоря лендинга, вход в кабинет
// и витрина.
const localePath = useLocalePath()
const config = useRuntimeConfig()
const storefrontUrl = config.public.storefrontUrl as string
const phone = config.public.supportPhone as string
const email = config.public.supportEmail as string

const columns: { titleKey: string, links: { href: string, key: string, external?: boolean }[] }[] = [
  {
    titleKey: 'landing.footer.learnTitle',
    links: [
      { href: '#steps', key: 'landing.nav.steps' },
      { href: '#tariffs', key: 'landing.nav.tariffs' },
    ],
  },
  {
    titleKey: 'landing.footer.partnersTitle',
    links: [
      { href: '#apply', key: 'landing.nav.apply' },
      { href: localePath('/login'), key: 'landing.footer.login' },
    ],
  },
  {
    titleKey: 'landing.footer.projectsTitle',
    links: [
      { href: storefrontUrl, key: 'landing.footer.storefront', external: true },
    ],
  },
]

// Адреса те же, что в подвале витрины (AppFooter)
const socials = [
  { icon: 'social-telegram', url: 'https://t.me/paylov', labelKey: 'landing.footer.telegram' },
  { icon: 'social-instagram', url: 'https://instagram.com/paylov.uz', labelKey: 'landing.footer.instagram' },
  { icon: 'social-facebook', url: 'https://facebook.com/paylov.uz', labelKey: 'landing.footer.facebook' },
]
</script>

<template>
  <footer class="lfooter">
    <div class="lfooter__sheet">
      <div class="lfooter__inner">
        <div class="lfooter__closing">
          <h2 class="lfooter__closing-title">{{ $t('landing.footer.closing') }}</h2>
          <a href="#apply" class="lfooter__cta">{{ $t('landing.nav.apply') }}</a>
        </div>

        <div class="lfooter__top">
          <div class="lfooter__cols">
            <div v-for="col in columns" :key="col.titleKey" class="lfooter__col">
              <h3 class="lfooter__head">{{ $t(col.titleKey) }}</h3>
              <a
                v-for="link in col.links"
                :key="link.key"
                :href="link.href"
                class="lfooter__link"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener' : undefined"
              >{{ $t(link.key) }}</a>
            </div>
          </div>

          <div class="lfooter__contact">
            <h3 class="lfooter__contact-title">{{ $t('landing.polishB.contactTitle') }}</h3>
            <a :href="`tel:${phone.replace(/\s/g, '')}`" class="lfooter__contact-link">{{ phone }}</a>
            <a :href="`mailto:${email}`" class="lfooter__contact-link">{{ email }}</a>
            <div class="lfooter__socials" role="group" :aria-label="$t('landing.footer.socialsTitle')">
              <a
                v-for="s in socials"
                :key="s.icon"
                :href="s.url"
                target="_blank"
                rel="noopener"
                class="lfooter__social"
                :aria-label="$t(s.labelKey)"
              >
                <UiIcon :name="s.icon" :size="22" color="var(--m-on-dark)" />
              </a>
            </div>
          </div>
        </div>

        <div class="lfooter__bottom">
          <p class="lfooter__meta">{{ $t('landing.footer.rights') }}</p>
          <p class="lfooter__meta">{{ $t('landing.footer.tagline') }}</p>
        </div>

        <div class="lfooter__mark" aria-hidden="true">spotshop</div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Корень в цвете страницы, чтобы за скруглёнными углами листа был тот же фон, что у формы */
.lfooter { background: var(--m-page); }
.lfooter__sheet {
  overflow: hidden;
  border-radius: calc(var(--m-radius-xl) * 2) calc(var(--m-radius-xl) * 2) 0 0;
  background: var(--m-hero-gradient);
}
.lfooter__inner { width: var(--container-width); max-width: var(--container-width); margin: 0 auto; padding-top: 96px; }

.lfooter__closing {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 64px;
  padding-bottom: 72px;
}
.lfooter__closing-title {
  margin: 0;
  max-width: 860px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 72px;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--m-on-dark);
  text-wrap: balance;
}
.lfooter__cta {
  display: inline-flex;
  flex: none;
  align-items: center;
  height: 56px;
  padding-inline: 32px;
  border-radius: var(--m-radius-pill);
  background: var(--m-brand);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--m-on-brand);
  text-decoration: none;
  transition: background var(--m-dur-fast) var(--m-ease);
}
.lfooter__cta:hover { background: var(--m-brand-bright); }

.lfooter__top {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 64px;
  padding: 56px 0;
  border-top: 1px solid var(--m-glass-2);
}
.lfooter__cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; align-content: start; }
.lfooter__col { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.lfooter__head { margin: 0 0 8px; font-size: var(--text-xs); font-weight: 500; color: var(--m-on-dark-3); }
.lfooter__link {
  font-size: var(--text-md);
  color: var(--m-on-dark-2);
  text-decoration: none;
  transition: color var(--m-dur-fast) var(--m-ease);
}
.lfooter__link:hover { color: var(--m-on-dark); }

.lfooter__contact { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.lfooter__contact-title {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-4xl);
  letter-spacing: -0.015em;
  color: var(--m-on-dark);
}
.lfooter__contact-link {
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--m-on-dark);
  text-decoration: none;
  transition: color var(--m-dur-fast) var(--m-ease);
}
.lfooter__contact-link:hover { color: var(--m-brand); }

.lfooter__socials { display: flex; gap: 10px; margin-top: 16px; }
.lfooter__social {
  display: grid;
  width: 44px;
  height: 44px;
  border: 1px solid var(--m-on-dark-3);
  border-radius: 50%;
  place-items: center;
  transition: background var(--m-dur-fast) var(--m-ease), border-color var(--m-dur-fast) var(--m-ease);
}
/* В svg иконок соцсетей цвет зашит, проп color его не перекрашивает */
.lfooter__social :deep(path) { fill: var(--m-on-dark); transition: fill var(--m-dur-fast) var(--m-ease); }
.lfooter__social:hover { border-color: var(--m-on-dark); background: var(--m-on-dark); }
.lfooter__social:hover :deep(path) { fill: var(--m-ink); }
.lfooter__cta:focus-visible,
.lfooter__link:focus-visible,
.lfooter__contact-link:focus-visible,
.lfooter__social:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.lfooter__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--m-glass-2);
}
.lfooter__meta { margin: 0; font-size: var(--text-sm); color: var(--m-on-dark-3); }

/* Кегль подобран под ширину контейнера 1240px: у Vela Sans Bold слово занимает
   2.65em при таком трекинге. Высота меньше кегля: низ знака срезается краем листа. */
.lfooter__mark {
  height: 300px;
  margin-top: 32px;
  overflow: hidden;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 465px;
  line-height: 1;
  letter-spacing: -0.03em;
  text-align: center;
  white-space: nowrap;
  color: var(--m-brand);
  user-select: none;
  pointer-events: none;
}
</style>
