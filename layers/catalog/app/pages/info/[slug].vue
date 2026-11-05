<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
/**
 * Информационные страницы из футера (о проекте, правила, помощь).
 * В Figma этих экранов нет — собраны в UI-системе проекта:
 * контейнер 1240, карточка на белом с радиусом 25, типографика как в «О товаре».
 */
const route = useRoute()
const slug = computed(() => String(route.params.slug))

// TODO: Connect to backend endpoint GET /pages/{slug}
const pages: Record<string, { title: string, body: string[] }> = {
  about: { title: 'ui.appshell.appFooter.oProekte', body: ['ui.appshell.appFooter.zooelonMarketpleysDomashnihZhivotnyh'] },
  blog: { title: 'ui.appshell.appFooter.blog', body: ['ui.catalog.infoItem.blogBody'] },
  partners: { title: 'ui.appshell.appFooter.dlyaPartnerov', body: ['ui.catalog.infoItem.partnersBody'] },
  'post-ad': { title: 'ui.appshell.appFooter.razmestitObyavlenie', body: ['ui.catalog.infoItem.postAdBody'] },
  terms: { title: 'ui.appshell.appFooter.polzovatelskoeSoglashenie', body: ['ui.catalog.infoItem.termsBody'] },
  privacy: { title: 'ui.appshell.appFooter.politikaKonfidencialnosti', body: ['ui.catalog.infoItem.privacyBody'] },
  rules: { title: 'ui.appshell.appFooter.pravilaPublikacii', body: ['ui.catalog.infoItem.rulesBody'] },
  cookie: { title: 'ui.appshell.appFooter.cookie', body: ['ui.catalog.infoItem.cookieBody'] },
  documents: { title: 'ui.appshell.appFooter.arhivDokumentov', body: ['ui.catalog.infoItem.documentsBody'] },
  help: { title: 'ui.appshell.appFooter.centrPomoschi', body: ['ui.catalog.infoItem.helpBody'] },
  services: { title: 'catalog.services', body: ['ui.catalog.infoItem.servicesBody'] },
  faq: { title: 'ui.catalog.infoPage.faq.title', body: ['ui.catalog.infoPage.faq.intro'] },
  returns: { title: 'shell.footer.returns', body: ['ui.catalog.infoPage.returns.intro'] },
  contact: { title: 'ui.appshell.appFooter.napisatNam', body: ['ui.catalog.infoItem.contactBody'] },
  complaint: { title: 'ui.appshell.appFooter.podatZhalobu', body: ['ui.catalog.infoItem.complaintBody'] },
  chat: { title: 'ui.appshell.appFooter.liveChat', body: ['ui.catalog.infoItem.chatBody'] },
  delivery: { title: 'shell.footer.delivery', body: ['ui.catalog.infoPage.delivery.intro'] },
  'terms-conditions': { title: 'ui.appshell.appFooter.termsConditions', body: ['ui.catalog.infoItem.termsConditionsBody'] },
}

// В объекте лежат ключи локали; переводим в computed, чтобы смена языка перерисовала страницу
const sections: Record<string, Array<{ title: string, body: string[] }>> = {
  "about": [
    {
      "title": "ui.catalog.infoItem.aboutH1",
      "body": [
        "ui.catalog.infoItem.aboutP1_1",
        "ui.catalog.infoItem.aboutP1_2"
      ]
    },
    {
      "title": "ui.catalog.infoItem.aboutH2",
      "body": [
        "ui.catalog.infoItem.aboutP2_1",
        "ui.catalog.infoItem.aboutP2_2"
      ]
    },
    {
      "title": "ui.catalog.infoItem.aboutH3",
      "body": [
        "ui.catalog.infoItem.aboutP3_1",
        "ui.catalog.infoItem.aboutP3_2"
      ]
    }
  ],
  "blog": [
    {
      "title": "ui.catalog.infoItem.blogH1",
      "body": [
        "ui.catalog.infoItem.blogP1_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.blogH2",
      "body": [
        "ui.catalog.infoItem.blogP2_1"
      ]
    }
  ],
  "partners": [
    {
      "title": "ui.catalog.infoItem.partnersH1",
      "body": [
        "ui.catalog.infoItem.partnersP1_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.partnersH2",
      "body": [
        "ui.catalog.infoItem.partnersP2_1",
        "ui.catalog.infoItem.partnersP2_2"
      ]
    },
    {
      "title": "ui.catalog.infoItem.partnersH3",
      "body": [
        "ui.catalog.infoItem.partnersP3_1"
      ]
    }
  ],
  "post-ad": [
    {
      "title": "ui.catalog.infoItem.postAdH1",
      "body": [
        "ui.catalog.infoItem.postAdP1_1",
        "ui.catalog.infoItem.postAdP1_2"
      ]
    },
    {
      "title": "ui.catalog.infoItem.postAdH2",
      "body": [
        "ui.catalog.infoItem.postAdP2_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.postAdH3",
      "body": [
        "ui.catalog.infoItem.postAdP3_1"
      ]
    }
  ],
  "services": [
    {
      "title": "ui.catalog.infoItem.servicesH1",
      "body": [
        "ui.catalog.infoItem.servicesP1_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.servicesH2",
      "body": [
        "ui.catalog.infoItem.servicesP2_1",
        "ui.catalog.infoItem.servicesP2_2"
      ]
    }
  ],
  "help": [
    {
      "title": "ui.catalog.infoItem.helpH1",
      "body": [
        "ui.catalog.infoItem.helpP1_1",
        "ui.catalog.infoItem.helpP1_2"
      ]
    },
    {
      "title": "ui.catalog.infoItem.helpH2",
      "body": [
        "ui.catalog.infoItem.helpP2_1",
        "ui.catalog.infoItem.helpP2_2"
      ]
    },
    {
      "title": "ui.catalog.infoItem.helpH3",
      "body": [
        "ui.catalog.infoItem.helpP3_1",
        "ui.catalog.infoItem.helpP3_2"
      ]
    },
    {
      "title": "ui.catalog.infoItem.helpH4",
      "body": [
        "ui.catalog.infoItem.helpP4_1"
      ]
    }
  ],
  "chat": [
    {
      "title": "ui.catalog.infoItem.chatH1",
      "body": [
        "ui.catalog.infoItem.chatP1_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.chatH2",
      "body": [
        "ui.catalog.infoItem.chatP2_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.chatH3",
      "body": [
        "ui.catalog.infoItem.chatP3_1"
      ]
    }
  ],
  "cookie": [
    {
      "title": "ui.catalog.infoItem.cookieH1",
      "body": [
        "ui.catalog.infoItem.cookieP1_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.cookieH2",
      "body": [
        "ui.catalog.infoItem.cookieP2_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.cookieH3",
      "body": [
        "ui.catalog.infoItem.cookieP3_1"
      ]
    }
  ],
  "documents": [
    {
      "title": "ui.catalog.infoItem.documentsH1",
      "body": [
        "ui.catalog.infoItem.documentsP1_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.documentsH2",
      "body": [
        "ui.catalog.infoItem.documentsP2_1"
      ]
    }
  ],
  "terms": [
    {
      "title": "ui.catalog.infoItem.termsH1",
      "body": [
        "ui.catalog.infoItem.termsP1_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.termsH2",
      "body": [
        "ui.catalog.infoItem.termsP2_1"
      ]
    }
  ],
  "privacy": [
    {
      "title": "ui.catalog.infoItem.privacyH1",
      "body": [
        "ui.catalog.infoItem.privacyP1_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.privacyH2",
      "body": [
        "ui.catalog.infoItem.privacyP2_1"
      ]
    }
  ],
  "rules": [
    {
      "title": "ui.catalog.infoItem.rulesH1",
      "body": [
        "ui.catalog.infoItem.rulesP1_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.rulesH2",
      "body": [
        "ui.catalog.infoItem.rulesP2_1",
        "ui.catalog.infoItem.rulesP2_2"
      ]
    },
    {
      "title": "ui.catalog.infoItem.rulesH3",
      "body": [
        "ui.catalog.infoItem.rulesP3_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.rulesH4",
      "body": [
        "ui.catalog.infoItem.rulesP4_1"
      ]
    }
  ],
  "terms-conditions": [
    {
      "title": "ui.catalog.infoItem.termsConditionsH1",
      "body": [
        "ui.catalog.infoItem.termsConditionsP1_1"
      ]
    },
    {
      "title": "ui.catalog.infoItem.termsConditionsH2",
      "body": [
        "ui.catalog.infoItem.termsConditionsP2_1"
      ]
    }
  ],
  "contact": [
    {
      "title": "ui.catalog.infoItem.contactH1",
      "body": [
        "ui.catalog.infoItem.contactP1_1",
        "ui.catalog.infoItem.contactP1_2"
      ]
    }
  ],
  "complaint": [
    {
      "title": "ui.catalog.infoItem.complaintH1",
      "body": [
        "ui.catalog.infoItem.complaintP1_1",
        "ui.catalog.infoItem.complaintP1_2"
      ]
    }
  ]
}

const page = computed(() => {
  const raw = pages[slug.value]
  if (!raw) return undefined
  return {
    title: t(raw.title),
    body: raw.body.map(key => t(key)),
    sections: (sections[slug.value] ?? []).map(part => ({
      title: t(part.title),
      body: part.body.map(key => t(key)),
    })),
  }
})

/** На «Написать нам» и «Подать жалобу» под текстом стоит форма */
const formKind = computed(() => (slug.value === 'contact' ? 'contact' : slug.value === 'complaint' ? 'complaint' : null))

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: t('common.pageNotFound'), fatal: true })
}

useSeoMeta({
  title: () => `${page.value!.title}`,
  description: () => page.value!.body[0],
})
</script>

<template>
  <div v-if="page" class="info">
    <div class="info__container">
      <nav class="info__breadcrumbs" :aria-label="$t('common.hlebnyeKroshki')">
        <NuxtLink :to="localePath('/')">{{ t('breadcrumbs.home') }}</NuxtLink> / {{ page.title }}
      </nav>

      <div class="info__layout">
      <aside class="info__aside sticky-aside">
        <InfoNav :current="slug" />
      </aside>

      <div class="info__main">
      <article class="info__card">
        <h1 class="info__title">{{ page.title }}</h1>
        <p v-for="(paragraph, index) in page.body" :key="index" class="info__text">{{ paragraph }}</p>

        <section v-for="(part, index) in page.sections" :key="`s${index}`" class="info__section">
          <h2 class="info__section-title">{{ part.title }}</h2>
          <p v-for="(paragraph, line) in part.body" :key="line" class="info__text">{{ paragraph }}</p>
        </section>

        <InfoFaq v-if="slug === 'faq'" />
        <InfoDelivery v-else-if="slug === 'delivery'" />
        <InfoReturns v-else-if="slug === 'returns'" />

        <InfoContactForm v-if="formKind" :kind="formKind" />
      </article>

      <!-- На страницах с формой она уже есть, второй призыв написать не нужен -->
      <section v-if="!formKind" class="info__cta">
        <div class="info__cta-text">
          <h2 class="info__cta-title">{{ $t('ui.catalog.infoPage.cta.title') }}</h2>
          <p class="info__cta-note">{{ $t('ui.catalog.infoPage.cta.text') }}</p>
        </div>
        <NuxtLink :to="localePath('/info/contact')" class="info__cta-link info__cta-link--primary">{{ $t('ui.catalog.infoPage.cta.contact') }}</NuxtLink>
        <NuxtLink v-if="slug !== 'help'" :to="localePath('/info/help')" class="info__cta-link">{{ $t('ui.catalog.infoPage.cta.help') }}</NuxtLink>
      </section>
      </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.info__section { margin-top: 24px; }

.info__section-title {
  margin: 0 0 12px;
  font: var(--type-section-title);
  color: var(--color-text);
}

.info { display: flex; flex-direction: column; }

.info__container {
  width: var(--container-width);
  margin-inline: auto;
  padding-block: 24px 52px;
}

.info__breadcrumbs {
  padding-bottom: 24px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.info__layout { display: flex; gap: 20px; align-items: flex-start; }
.info__aside { flex: 0 0 280px; }
.info__main { display: flex; flex: 1; flex-direction: column; gap: 16px; min-width: 0; }

.info__card {
  padding: 28px;
  border-radius: 20px;
  background: var(--color-surface);
}

.info__cta {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 28px;
  border-radius: 20px;
  background: var(--color-surface);
}

.info__cta-text { flex: 1; min-width: 0; }
.info__cta-title { margin: 0 0 2px; font: var(--type-card-title); color: var(--color-text); }
.info__cta-note { margin: 0; font-size: var(--text-sm); line-height: 20px; color: var(--color-text-muted); }

.info__cta-link {
  display: inline-flex;
  flex: none;
  align-items: center;
  height: 44px;
  padding-inline: 18px;
  border-radius: 12px;
  background: var(--color-field);
  font: var(--type-button-sm);
  color: var(--color-text);
}

.info__cta-link:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.info__cta-link--primary { background: var(--color-brand); color: var(--color-on-brand); }
.info__cta-link--primary:hover { background: var(--color-brand-dark); }

.info__title {
  margin: 0 0 18px;
  font: var(--type-page-title);
  color: var(--color-text);
}

.info__text {
  margin: 0 0 12px;
  max-width: 760px;
  font-weight: 400;
  font-size: var(--text-base);
  line-height: 25px;
  color: var(--color-text);
}
</style>
