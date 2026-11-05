<script setup lang="ts">
/**
 * Отзывы покупателей о товарах продавца. Главное здесь - ответить: вкладка
 * «Ждут ответа», рядом с отзывом поле ответа, отправленный ответ можно изменить.
 */
import type { ReviewRow, ReviewsPage } from '#shared/types/merchant'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const api = useApi()
const toast = useToast()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const PER_PAGE = 10
const { filters, signature } = useUrlFilters({ status: 'all', rating: 'all', q: '', page: '1' })
const statusFilter = filters.status
const ratingFilter = filters.rating
const search = useDebouncedSearch(filters.q)
const page = computed({ get: () => Number(filters.page.value) || 1, set: (value: number) => { filters.page.value = String(value) } })

const { data, status, refresh } = await useApiData<ReviewsPage>(
  'm:reviews',
  '/merchant/reviews',
  {
    query: () => ({
      status: statusFilter.value,
      rating: ratingFilter.value === 'all' ? undefined : ratingFilter.value,
      q: filters.q.value,
      page: page.value,
      perPage: PER_PAGE,
    }),
    watch: [signature],
  },
)

const tabs = computed(() => {
  const counts = data.value?.counts
  return [
    { value: 'all', label: t('m.reviews.tabAll'), count: counts?.all },
    { value: 'unanswered', label: t('m.reviews.tabUnanswered'), count: counts?.unanswered },
    { value: 'answered', label: t('m.reviews.tabAnswered'), count: counts?.answered },
  ]
})

const ratingOptions = computed(() => [
  { value: 'all', label: t('m.reviews.ratingAll') },
  ...[5, 4, 3, 2, 1].map(value => ({ value: String(value), label: t('m.reviews.ratingOption', { n: value }) })),
])

/* Ответ: одновременно открыт один отзыв */
const editingId = ref<string | null>(null)
const draft = ref('')
const draftError = ref('')
const saving = ref(false)

function startReply(review: ReviewRow) {
  editingId.value = review.id
  draft.value = review.reply?.text ?? ''
  draftError.value = ''
}

function cancelReply() {
  editingId.value = null
}

async function sendReply(review: ReviewRow) {
  if (draft.value.trim().length < 2) {
    draftError.value = t('m.reviews.errEmpty')
    return
  }
  saving.value = true
  try {
    await api.post(`/merchant/reviews/${review.id}/reply`, { text: draft.value.trim() })
    editingId.value = null
    toast.show(t('m.reviews.sent'))
    await refresh()
  }
  catch {
    toast.show(t('m.common.loadError'), 'error')
  }
  finally {
    saving.value = false
  }
}

useSeoMeta({ title: () => `${t('m.reviews.title')} — 1mart Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.reviews.title')" :subtitle="$t('m.reviews.subtitle')">
      <div v-if="data?.totalReviews" class="rev__summary">
        <UiIcon name="star-fill" color="#FF9F0A" :size="20" />
        <b class="m-tnum">{{ data.average.toFixed(1) }}</b>
        <span>{{ $t('m.reviews.summary', { count: data.totalReviews }) }}</span>
      </div>
    </MPageHeader>

    <MCard flush>
      <div class="rev__tabs">
        <MTabs v-model="statusFilter" :tabs="tabs" />
      </div>
      <div class="rev__toolbar">
        <MField v-model="search" icon="search-normal" :placeholder="$t('m.reviews.searchPlaceholder')" class="rev__search" />
        <MSelect v-model="ratingFilter" :options="ratingOptions" class="rev__rating-select" />
      </div>

      <div v-if="status === 'pending' && !data" class="rev__loading">
        <UiSkeleton v-for="n in 4" :key="n" height="120px" radius="12px" />
      </div>

      <template v-else-if="data && data.items.length">
        <ul class="rev__list">
          <li v-for="review in data.items" :key="review.id" class="rev__item">
            <div class="rev__head">
              <span class="rev__stars" role="img" :aria-label="$t('m.reviews.ratingOption', { n: review.rating })">
                <UiIcon
                  v-for="n in 5"
                  :key="n"
                  :name="n <= review.rating ? 'star-fill' : 'star'"
                  :color="n <= review.rating ? '#FF9F0A' : undefined"
                  :size="16"
                  :class="{ 'rev__star--off': n > review.rating }"
                />
              </span>
              <span class="rev__author">{{ review.author }}</span>
              <span class="rev__date m-tnum">{{ formatDate(new Date(review.createdAt)) }}</span>
              <MStatus :tone="review.reply ? 'success' : 'warning'" class="rev__status">
                {{ $t(review.reply ? 'm.reviews.statusAnswered' : 'm.reviews.statusUnanswered') }}
              </MStatus>
            </div>

            <NuxtLink :to="localePath(`/products/${review.productId}`)" class="rev__product">{{ review.productTitle }}</NuxtLink>
            <p class="rev__text">{{ review.text }}</p>

            <!-- Отправленный ответ -->
            <div v-if="review.reply && editingId !== review.id" class="rev__reply">
              <p class="rev__reply-label">{{ $t('m.reviews.yourReply') }} · {{ formatDate(new Date(review.reply.createdAt)) }}</p>
              <p class="rev__reply-text">{{ review.reply.text }}</p>
              <button type="button" class="rev__link" @click="startReply(review)">{{ $t('m.reviews.edit') }}</button>
            </div>

            <!-- Форма ответа -->
            <form v-else-if="editingId === review.id" class="rev__form" @submit.prevent="sendReply(review)">
              <MTextarea
                v-model="draft"
                :label="$t('m.reviews.replyLabel')"
                :placeholder="$t('m.reviews.replyPlaceholder')"
                :rows="3"
                :error="draftError"
              />
              <div class="rev__form-actions">
                <UiButton type="submit" variant="primary" :disabled="saving">{{ $t('m.reviews.send') }}</UiButton>
                <UiButton type="button" variant="ghost" :disabled="saving" @click="cancelReply">{{ $t('m.common.cancel') }}</UiButton>
              </div>
            </form>

            <UiButton v-else variant="secondary" class="rev__answer" @click="startReply(review)">{{ $t('m.reviews.reply') }}</UiButton>
          </li>
        </ul>
        <div class="rev__pag">
          <MPagination v-model:page="page" :per-page="PER_PAGE" :total="data.total" />
        </div>
      </template>

      <MLoadError v-else-if="status === 'error'" @retry="refresh()" />
      <MEmpty v-else :title="$t('m.reviews.empty')" :text="$t('m.reviews.emptyText')" icon="star-fill" />
    </MCard>

    <p class="rev__note">{{ $t('m.reviews.note', { email: config.public.supportEmail }) }}</p>
  </div>
</template>

<style scoped>
.rev__summary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding-inline: 14px;
  border-radius: 12px;
  background: var(--color-surface);
  font-size: var(--text-sm);
  color: var(--m-slate);
}

.rev__summary b { font-size: var(--text-xl); color: var(--m-ink); }

.rev__tabs { padding: 16px 18px 0; }
.rev__toolbar { display: flex; gap: 12px; padding: 16px 18px; }
.rev__search { flex: 1; }
.rev__rating-select { flex: 0 0 200px; }
.rev__loading { display: flex; flex-direction: column; gap: 10px; padding: 0 18px 18px; }

.rev__list { margin: 0; padding: 0; list-style: none; }

.rev__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 18px;
  border-top: 1px solid var(--color-line);
}

.rev__head { display: flex; align-items: center; gap: 12px; width: 100%; }
.rev__stars { display: inline-flex; gap: 2px; }
.rev__star--off { color: var(--color-line); }
.rev__author { font-weight: 600; font-size: var(--text-sm); color: var(--m-ink); }
.rev__date { font-size: var(--text-xs); color: var(--m-slate); }
.rev__status { margin-left: auto; }

.rev__product { font-size: var(--text-sm); color: var(--m-brand-strong); }
.rev__product:hover { text-decoration: underline; }
.rev__product:focus-visible { border-radius: 4px; outline: none; box-shadow: var(--focus-ring); }

.rev__text { max-width: 820px; margin: 0; font-size: var(--text-md); line-height: 22px; color: var(--m-ink-soft); }

.rev__reply {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--color-page);
}

.rev__reply-label { margin: 0 0 4px; font-weight: 600; font-size: var(--text-xs); color: var(--m-slate); }
.rev__reply-text { margin: 0 0 6px; font-size: var(--text-sm); line-height: 20px; color: var(--m-ink-soft); }

.rev__link {
  padding: 0;
  border: 0;
  background: none;
  font-weight: 600;
  font-size: var(--text-xs);
  color: var(--m-brand-strong);
  cursor: pointer;
}

.rev__link:hover { text-decoration: underline; }
.rev__link:focus-visible { border-radius: 4px; outline: none; box-shadow: var(--focus-ring); }

.rev__form { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.rev__form-actions { display: flex; gap: 8px; }
.rev__pag { padding: 0 18px 16px; }

.rev__note { margin: 12px 4px 0; font-size: var(--text-xs); line-height: 18px; color: var(--m-slate); }
</style>
