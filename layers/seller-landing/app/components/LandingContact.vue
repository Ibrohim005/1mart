<script setup lang="ts">
// Призывная полоса «Остались вопросы?»: онлайн-чат и контактные плашки с
// заливными иконками (адрес, телефон, почта). Приём из референса NGO.
const config = useRuntimeConfig()
const phone = config.public.supportPhone as string
const email = config.public.supportEmail as string

const pills = computed(() => [
  { icon: 'location-fill', labelKey: 'landing.contact.addressLabel', value: '' /* адрес из i18n */, isAddress: true },
  { icon: 'call-fill', labelKey: 'landing.contact.phoneLabel', value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
  { icon: 'sms-fill', labelKey: 'landing.contact.emailLabel', value: email, href: `mailto:${email}` },
])
</script>

<template>
  <section class="lcontact">
    <div class="lcontact__inner">
      <div class="lcontact__bg" aria-hidden="true">
        <span class="lcontact__grid" />
      </div>
      <div class="lcontact__content">
        <div class="lcontact__head">
          <div>
            <h2 class="lcontact__title">{{ $t('landing.contact.title') }}</h2>
            <p class="lcontact__text">{{ $t('landing.contact.text') }}</p>
          </div>
          <a href="#apply" class="lcontact__chat">
            <UiIcon name="messages-fill" :size="20" color="var(--m-on-dark)" />
            {{ $t('landing.contact.chat') }}
          </a>
        </div>

        <div class="lcontact__pills">
          <component
            :is="pill.href ? 'a' : 'div'"
            v-for="pill in pills"
            :key="pill.labelKey"
            :href="pill.href"
            class="lcontact__pill"
          >
            <span class="lcontact__pill-ic"><UiIcon :name="pill.icon" :size="22" color="var(--m-on-dark)" /></span>
            <span class="lcontact__pill-text">
              <span class="lcontact__pill-value">{{ pill.isAddress ? $t('landing.contact.address') : pill.value }}</span>
              <span class="lcontact__pill-label">{{ $t(pill.labelKey) }}</span>
            </span>
          </component>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lcontact { padding: 0 0 100px; background: var(--m-surface); }
.lcontact__inner {
  position: relative;
  width: var(--container-width);
  max-width: var(--container-width);
  margin: 0 auto;
  overflow: hidden;
  border-radius: var(--m-radius-xl);
  background: var(--m-hero-gradient);
  box-shadow: var(--m-shadow-lg);
}
.lcontact__bg { position: absolute; inset: 0; pointer-events: none; }
.lcontact__grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(var(--m-glass-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--m-glass-grid) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: radial-gradient(120% 120% at 100% 0%, #000 20%, transparent 70%);
}
.lcontact__content { position: relative; padding: 48px 48px 44px; }
.lcontact__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 32px; }
.lcontact__title { margin: 0; font-family: var(--font-display); font-weight: 800; font-size: var(--text-10xl); letter-spacing: -0.02em; color: var(--m-on-dark); }
.lcontact__text { margin: 10px 0 0; max-width: 520px; font-size: var(--text-lg); line-height: 1.5; color: var(--m-on-dark-2); }
.lcontact__chat {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: none;
  height: 48px;
  padding-inline: 22px;
  border-radius: var(--m-radius-pill);
  background: var(--m-glass-2);
  border: 1px solid var(--m-glass-strong);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--m-on-dark);
  text-decoration: none;
  backdrop-filter: blur(4px);
  transition: background var(--m-dur-fast) var(--m-ease);
}
.lcontact__chat:hover { background: var(--m-glass-strong); }

.lcontact__pills { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.lcontact__pill {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: var(--m-radius-lg);
  background: var(--m-glass);
  border: 1px solid rgb(255 255 255 / 12%);
  text-decoration: none;
  transition: background var(--m-dur-fast) var(--m-ease);
}
.lcontact__pill:hover { background: var(--m-glass-2); }
.lcontact__pill-ic {
  display: grid;
  width: 44px; height: 44px;
  flex: none;
  border-radius: var(--m-radius);
  background: var(--m-glass-2);
  place-items: center;
}
.lcontact__pill-text { display: flex; flex-direction: column; min-width: 0; }
.lcontact__pill-value { font-size: var(--text-base); font-weight: 600; color: var(--m-on-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lcontact__pill-label { margin-top: 2px; font-size: var(--text-xs); color: var(--m-on-dark-3); }
</style>
