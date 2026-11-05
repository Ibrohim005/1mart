<script setup lang="ts">
/**
 * Плитки справа от карусели. Первая ведёт компанию к балансу, вторая - продавца
 * в кабинет.
 *
 * Плитка баланса живёт только в браузере: главная кэшируется, и сумма в
 * SSR-разметке досталась бы чужому посетителю. Если баланс получить не удалось,
 * вошедший видит ту же плитку, что и гость, но со ссылкой на страницу баланса.
 */
import type { BalanceOverview } from '#shared/types/order'

const localePath = useLocalePath()
const { sellerCabinetUrl } = useRuntimeConfig().public
const { money } = useMoney()
const auth = useAuthStore()
const api = useApi()

const balance = ref<BalanceOverview | null>(null)
const isLoading = ref(true)
let ticket = 0

async function loadBalance() {
  const current = ++ticket
  balance.value = null
  if (!auth.isLoggedIn) {
    isLoading.value = false
    return
  }
  isLoading.value = true
  try {
    const found = await api.get<BalanceOverview>('/balance')
    if (current === ticket) balance.value = found
  }
  catch {
    // Плитка останется без суммы, ссылка на баланс работает
  }
  finally {
    if (current === ticket) isLoading.value = false
  }
}

onMounted(loadBalance)
watch(() => auth.isLoggedIn, loadBalance)
</script>

<template>
  <div class="aside">
    <ClientOnly>
      <section v-if="isLoading" class="tile tile--funds" aria-busy="true">
        <UiSkeleton on-dark width="120px" height="16px" />
        <UiSkeleton on-dark width="200px" height="30px" />
      </section>

      <NuxtLink v-else-if="balance" :to="localePath('/account/balance')" class="tile tile--funds tile--link">
        <span class="tile__label">{{ $t('pay.balance.title') }}</span>
        <span class="tile__sum">{{ money(balance.available) }}</span>
        <span class="tile__company">{{ balance.company.name }}</span>
        <span class="tile__action">
          {{ $t('pay.payment.topUp') }}
          <UiIcon name="alt-arrow-right" color="currentColor" :size="16" />
        </span>
      </NuxtLink>

      <NuxtLink v-else-if="auth.isLoggedIn" :to="localePath('/account/balance')" class="tile tile--funds tile--link">
        <span class="tile__title">{{ $t('shell.home.companyTitle') }}</span>
        <span class="tile__text">{{ $t('shell.home.companyText') }}</span>
        <span class="tile__action">
          {{ $t('pay.balance.title') }}
          <UiIcon name="alt-arrow-right" color="currentColor" :size="16" />
        </span>
      </NuxtLink>

      <button v-else type="button" class="tile tile--funds tile--link" @click="auth.isAuthOpen = true">
        <span class="tile__title">{{ $t('shell.home.companyTitle') }}</span>
        <span class="tile__text">{{ $t('shell.home.companyText') }}</span>
        <span class="tile__action">
          {{ $t('shell.header.login') }}
          <UiIcon name="alt-arrow-right" color="currentColor" :size="16" />
        </span>
      </button>

      <template #fallback>
        <section class="tile tile--funds" aria-busy="true">
          <UiSkeleton on-dark width="120px" height="16px" />
          <UiSkeleton on-dark width="200px" height="30px" />
        </section>
      </template>
    </ClientOnly>

    <a :href="sellerCabinetUrl" target="_blank" rel="noopener" class="tile tile--sell tile--link">
      <span class="tile__title">{{ $t('shell.footer.sellOn1mart') }}</span>
      <span class="tile__action">
        {{ $t('shell.topbar.becomeSeller') }}
        <UiIcon name="alt-arrow-right" color="currentColor" :size="16" />
      </span>
      <img src="/1mart-mark.svg" alt="" width="150" height="140" class="tile__mark">
    </a>
  </div>
</template>

<style scoped>
.aside {
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 12px;
  min-width: 0;
}

.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 20px 24px;
  overflow: hidden;
  border: 0;
  border-radius: 20px;
  font-family: var(--font-ui);
  text-align: left;
}

.tile--link {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.tile--link:hover {
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgb(39 49 64 / 14%);
}

.tile--link:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.tile--funds { background: var(--color-brand); color: var(--color-on-brand); }
.tile--sell { background: var(--color-field); color: var(--color-text); }

.tile__label { font-size: var(--text-sm); line-height: 18px; }

.tile__sum {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  line-height: 36px;
  font-variant-numeric: tabular-nums;
}

.tile__company {
  max-width: 100%;
  overflow: hidden;
  font-size: var(--text-sm);
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tile__title {
  max-width: 300px;
  font: var(--type-card-title);
}

.tile__text {
  max-width: 320px;
  font-size: var(--text-sm);
  line-height: 18px;
}

.tile__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  font-weight: 600;
  font-size: var(--text-md);
  line-height: 20px;
}

.tile__action :deep(svg) { transition: transform 0.2s ease; }
.tile--link:hover .tile__action :deep(svg) { transform: translateX(3px); }

/* Знак бренда уходит за край плитки: он украшение, а не логотип */
.tile__mark {
  position: absolute;
  right: -18px;
  bottom: -28px;
  width: 150px;
  height: 150px;
  transform: rotate(-8deg);
  transition: transform 0.25s ease;
}

.tile--link:hover .tile__mark { transform: rotate(-4deg) scale(1.04); }

@media (prefers-reduced-motion: reduce) {
  .tile--link,
  .tile__mark,
  .tile__action :deep(svg) { transition: none; }
  .tile--link:hover { transform: none; }
}
</style>
