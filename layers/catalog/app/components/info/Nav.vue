<script setup lang="ts">
/** Боковая навигация информационных страниц: один раздел помощи вместо россыпи ссылок из футера. */
defineProps<{ current: string }>()

const localePath = useLocalePath()

const groups = [
  {
    title: 'ui.catalog.infoPage.nav.buyers',
    items: [
      { slug: 'faq', label: 'ui.catalog.infoPage.faq.title' },
      { slug: 'delivery', label: 'shell.footer.delivery' },
      { slug: 'returns', label: 'shell.footer.returns' },
      { slug: 'help', label: 'ui.appshell.appFooter.centrPomoschi' },
      { slug: 'contact', label: 'ui.appshell.appFooter.napisatNam' },
      { slug: 'complaint', label: 'ui.appshell.appFooter.podatZhalobu' },
    ],
  },
  {
    title: 'ui.catalog.infoPage.nav.sellers',
    items: [
      { slug: 'post-ad', label: 'ui.appshell.appFooter.razmestitObyavlenie' },
      { slug: 'partners', label: 'ui.appshell.appFooter.dlyaPartnerov' },
      { slug: 'rules', label: 'ui.appshell.appFooter.pravilaPublikacii' },
    ],
  },
  {
    title: 'ui.catalog.infoPage.nav.company',
    items: [
      { slug: 'about', label: 'ui.appshell.appFooter.oProekte' },
      { slug: 'services', label: 'catalog.services' },
      { slug: 'blog', label: 'ui.appshell.appFooter.blog' },
    ],
  },
  {
    title: 'ui.catalog.infoPage.nav.legal',
    items: [
      { slug: 'terms', label: 'ui.appshell.appFooter.polzovatelskoeSoglashenie' },
      { slug: 'privacy', label: 'ui.appshell.appFooter.politikaKonfidencialnosti' },
      { slug: 'cookie', label: 'ui.appshell.appFooter.cookie' },
      { slug: 'documents', label: 'ui.appshell.appFooter.arhivDokumentov' },
    ],
  },
]
</script>

<template>
  <nav class="info-nav" :aria-label="$t('ui.catalog.infoPage.nav.label')">
    <section v-for="group in groups" :key="group.title" class="info-nav__group">
      <h2 class="info-nav__title">{{ $t(group.title) }}</h2>
      <NuxtLink
        v-for="item in group.items"
        :key="item.slug"
        :to="localePath(`/info/${item.slug}`)"
        class="info-nav__link"
        :class="{ 'info-nav__link--active': item.slug === current }"
        :aria-current="item.slug === current ? 'page' : undefined"
      >
        {{ $t(item.label) }}
      </NuxtLink>
    </section>
  </nav>
</template>

<style scoped>
.info-nav {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 12px;
  border-radius: 20px;
  background: var(--color-surface);
}

.info-nav__group { display: flex; flex-direction: column; gap: 2px; }

.info-nav__title {
  margin: 0 0 6px;
  padding-inline: 12px;
  font-weight: 600;
  font-size: var(--text-xs);
  line-height: 18px;
  color: var(--color-gray);
}

.info-nav__link {
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 500;
  font-size: var(--text-sm);
  line-height: 20px;
  color: var(--color-text);
  transition: background-color .15s ease;
}

.info-nav__link:hover { background: var(--color-page); }
.info-nav__link:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.info-nav__link--active,
.info-nav__link--active:hover {
  background: var(--color-brand-tint);
  font-weight: 600;
  color: var(--color-brand-text);
}

@media (prefers-reduced-motion: reduce) {
  .info-nav__link { transition: none; }
}
</style>
