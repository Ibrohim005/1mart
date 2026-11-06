<script setup lang="ts">
/**
 * Блок доставки на оформлении (ТЗ UC-FL-10: адрес и способ доставки).
 * Курьером — через Express 24, Maxsus Courier или Yandex Доставка, у каждой
 * службы своя цена и дата; или самовывоз из пункта выдачи 1mart.
 * Цены и сроки считает сервер (`/checkout/quote`), здесь только выбор.
 */
import type { DeliveryProvider, DeliveryType } from '#shared/types/order'

export interface CourierOption { id: DeliveryProvider, price: number, days: number, eta: string }
export interface PickupOption { id: string, title: string, address: string, workingHours: string, price: number, eta: string }

defineProps<{
  address: string
  addressNote: string
  recipientName: string
  recipientPhone: string
  couriers: CourierOption[]
  pickupPoints: PickupOption[]
  /** Сервер посчитал доставку бесплатной: самовывоз, промокод или условие магазина */
  free?: boolean
}>()

const deliveryType = defineModel<DeliveryType>('deliveryType', { required: true })
const provider = defineModel<DeliveryProvider | null>('provider', { required: true })
const pickupPointId = defineModel<string | null>('pickupPointId', { required: true })

const emit = defineEmits<{ change: [] }>()

const { sum } = useMoney()
const { dayLabel, providerName } = use1mart()

const PROVIDER_MARKS: Record<DeliveryProvider, string> = { express24: 'E24', maxsus: 'MX', yandex: 'Я' }
</script>

<template>
  <section class="delivery">
    <h2 class="delivery__title">{{ $t('pay.delivery.title') }}</h2>

    <div class="delivery__tabs" role="radiogroup" :aria-label="$t('pay.delivery.method')">
      <button
        type="button"
        role="radio"
        class="delivery__tab"
        :class="{ 'delivery__tab--active': deliveryType === 'courier' }"
        :aria-checked="deliveryType === 'courier'"
        @click="deliveryType = 'courier'"
      >
        <UiIcon name="truck" :size="20" color="currentColor" />
        {{ $t('pay.delivery.courier') }}
      </button>
      <button
        type="button"
        role="radio"
        class="delivery__tab"
        :class="{ 'delivery__tab--active': deliveryType === 'pickupPoint' }"
        :aria-checked="deliveryType === 'pickupPoint'"
        @click="deliveryType = 'pickupPoint'"
      >
        <UiIcon name="location" :size="20" color="currentColor" />
        {{ $t('pay.delivery.pickup') }}
      </button>
    </div>

    <template v-if="deliveryType === 'courier'">
      <div class="delivery__row">
        <span class="delivery__icon"><UiIcon name="location" :size="24" /></span>
        <div class="delivery__text">
          <p class="delivery__caption">{{ $t('common.deliveryAddress') }}</p>
          <p class="delivery__value">{{ address }}</p>
          <p v-if="addressNote" class="delivery__note">{{ addressNote }}</p>
        </div>
        <button type="button" class="delivery__link" @click="emit('change')">{{ $t('pay.delivery.changeAddress') }}</button>
      </div>

      <p class="delivery__subtitle">{{ $t('pay.delivery.chooseService') }}</p>
      <div class="delivery__options" role="radiogroup" :aria-label="$t('pay.delivery.chooseService')">
        <label
          v-for="option in couriers"
          :key="option.id"
          class="delivery__option"
          :class="{ 'delivery__option--active': provider === option.id }"
        >
          <input v-model="provider" class="visually-hidden" type="radio" name="courier" :value="option.id" :aria-label="providerName(option.id)">
          <span class="delivery__mark" :class="`delivery__mark--${option.id}`" aria-hidden="true">{{ PROVIDER_MARKS[option.id] }}</span>
          <span class="delivery__option-text">
            <span class="delivery__option-title">{{ providerName(option.id) }}</span>
            <span class="delivery__option-note">{{ $t('pay.delivery.eta', { date: dayLabel(option.eta) }) }}</span>
          </span>
          <span class="delivery__price">{{ option.price ? sum(option.price) : $t('pay.summary.free') }}</span>
          <span class="delivery__radio" :class="{ 'delivery__radio--on': provider === option.id }" aria-hidden="true" />
        </label>
      </div>
    </template>

    <template v-else>
      <p class="delivery__subtitle">{{ $t('pay.delivery.choosePoint') }}</p>
      <div class="delivery__options" role="radiogroup" :aria-label="$t('pay.delivery.choosePoint')">
        <label
          v-for="point in pickupPoints"
          :key="point.id"
          class="delivery__option"
          :class="{ 'delivery__option--active': pickupPointId === point.id }"
        >
          <input v-model="pickupPointId" class="visually-hidden" type="radio" name="pickup" :value="point.id" :aria-label="point.title">
          <span class="delivery__mark delivery__mark--pickup" aria-hidden="true"><UiIcon name="map" :size="26" color="#111111" /></span>
          <span class="delivery__option-text">
            <span class="delivery__option-title">{{ point.title }}</span>
            <span class="delivery__option-note">{{ point.address }} · {{ point.workingHours }}</span>
            <span class="delivery__option-note">{{ $t('pay.delivery.pickupFrom', { date: dayLabel(point.eta) }) }}</span>
          </span>
          <span class="delivery__price">{{ $t('pay.summary.free') }}</span>
          <span class="delivery__radio" :class="{ 'delivery__radio--on': pickupPointId === point.id }" aria-hidden="true" />
        </label>
      </div>
    </template>

    <!-- Получатель только показан: формы для него нет, клик раньше открывал форму адреса -->
    <div class="delivery__row">
      <span class="delivery__icon"><UiIcon name="user" :size="24" /></span>
      <div class="delivery__text">
        <p class="delivery__caption">{{ $t('common.poluchatel') }}</p>
        <p class="delivery__value">{{ recipientName }}</p>
        <p class="delivery__note">{{ recipientPhone }}</p>
      </div>
    </div>
    <p v-if="free" class="delivery__free">
      <UiIcon name="check" :size="18" />
      {{ $t('badge.freeShipping') }}
    </p>
  </section>
</template>

<style scoped>
.delivery {
  padding: 24px;
  border-radius: 24px;
  background: var(--color-surface);
}

.delivery__free {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--badge-cheaper-bg);
  font: var(--type-button-sm);
  color: var(--color-brand-text);
}

.delivery__title {
  margin: 0 0 18px;
  font: var(--type-section-title);
  color: var(--color-text);
}

.delivery__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  border-radius: 14px;
  background: var(--color-field);
}

.delivery__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border: 0;
  border-radius: 11px;
  background: none;
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--color-text-muted);
  cursor: pointer;
}

.delivery__tab--active { background: var(--color-surface); color: var(--color-text); box-shadow: 0 1px 4px rgb(17 17 17 / 8%); }

.delivery__row {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-height: 88px;
  margin-top: 18px;
  padding: 16px;
  border: 0;
  border-radius: 20px;
  background: var(--color-page);
  text-align: left;
}

.delivery__icon {
  display: grid;
  place-items: center;
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background: var(--color-brand-tint);
}

.delivery__text { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }

.delivery__caption { margin: 0; font-size: var(--text-sm); color: var(--color-text-muted); }

.delivery__value {
  margin: 0;
  font-weight: 600;
  font-size: var(--text-base);
  line-height: 24px;
  color: var(--color-text);
}

.delivery__note { margin: 0; font-size: var(--text-sm); line-height: 20px; color: var(--color-text-muted); }

.delivery__link {
  flex: none;
  padding: 10px 14px;
  border: 0;
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  font: var(--type-button-sm);
}

.delivery__subtitle {
  margin: 20px 0 10px;
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--color-text);
}

.delivery__options { display: flex; flex-direction: column; gap: 10px; }

.delivery__option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1.5px solid var(--color-line);
  border-radius: 16px;
  cursor: pointer;
}

.delivery__option:focus-within { box-shadow: var(--focus-ring); }
.delivery__option--active { border-color: var(--color-brand); background: var(--color-brand-tint); }

.delivery__mark {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-weight: 800;
  font-size: var(--text-base);
  color: #FFFFFF;
}

.delivery__mark--express24 { background: #E8352E; }
.delivery__mark--maxsus { background: #1E3A8A; }
.delivery__mark--yandex { background: #FFCC00; color: #111111; }
.delivery__mark--pickup { background: var(--color-brand); }

.delivery__option-text { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.delivery__option-title { font-weight: 600; font-size: var(--text-base); color: var(--color-text); }
.delivery__option-note { font-size: var(--text-sm); color: var(--color-text-muted); }

.delivery__price { flex: none; font-weight: 600; font-size: var(--text-base); font-variant-numeric: tabular-nums; color: var(--color-text); }

.delivery__radio {
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-line);
  border-radius: 50%;
}

.delivery__radio--on { border: 7px solid var(--color-brand); }

</style>
