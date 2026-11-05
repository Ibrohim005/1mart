<script setup lang="ts">
/**
 * Выбор адреса доставки по кнопке-локации в шапке.
 * Макет: Location → Tab Bar 586×330, r30. Адрес выбирается из
 * сохранённого списка — определения по геолокации в макете нет.
 *
 * Адреса приходят с сервера, а выбор сохраняется: раньше список был зашит
 * в этом файле двумя строками, а «Выбрать адрес» просто закрывал окно —
 * выбранный адрес не появлялся нигде.
 *
 * TODO: Connect to backend endpoint GET /user/addresses
 */
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean], select: [string], add: [] }>()

const { data: list } = await useApiData<SavedAddress[]>('user:addresses', '/user/addresses')

const { selectedId, select, withLabels } = useDeliveryAddress()

/*
 * `withLabels` — потому что у точки с карты сервер отдаёт пустые title и
 * subtitle: в списке были три безымянные строки с одной иконкой. Подпись
 * достраивается из координат и уточнений, ровно как в оформлении.
 */
const addresses = computed(() => (list.value ?? []).map(withLabels))
const selected = ref(selectedId.value ?? addresses.value[0]?.id ?? '')

// Окно живёт в шапке и не размонтируется — при открытии показываем текущий выбор
watch(() => props.modelValue, (open) => {
  if (open) selected.value = selectedId.value ?? addresses.value[0]?.id ?? ''
})

/*
 * Выбор мог смениться, пока окно закрыто: из формы «добавить адрес» мы
 * возвращаемся сюда, и новый адрес уже отмечен в cookie. Следим за самим
 * выбором, а не только за открытием, — иначе точка стояла на старой строке,
 * хотя сохранён и выбран был только что заведённый адрес.
 */
watch(selectedId, (id) => {
  if (id) selected.value = id
})

function apply() {
  const address = addresses.value.find(item => item.id === selected.value)
  if (address) select(address)
  emit('select', selected.value)
  emit('update:modelValue', false)
}

function close() {
  emit('update:modelValue', false)
}

// Блокировка фона, ловушка фокуса, Esc и возврат фокуса — общие для всех диалогов
const panel = ref<HTMLElement | null>(null)
useDialog(toRef(props, 'modelValue'), { panel, onClose: close })

</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="loc-overlay" @click.self="emit('update:modelValue', false)">
      <div ref="panel" class="loc" role="dialog" aria-modal="true" :aria-label="$t('common.deliveryAddress')" tabindex="-1">
        <header class="loc__head">
          <h2 class="loc__title">{{ $t('common.deliveryAddress') }}</h2>
          <UiCloseButton @click="emit('update:modelValue', false)" />
        </header>

        <ul class="loc__list">
          <li v-for="address in addresses" :key="address.id" class="loc__item">
            <label class="loc__card">
              <UiIcon name="location" :size="35" />
              <span class="loc__text">
                <span class="loc__street">{{ address.title }}</span>
                <span class="loc__city">{{ address.subtitle }}</span>
              </span>
              <input v-model="selected" class="loc__radio" type="radio" name="address" :value="address.id">
            </label>
          </li>
        </ul>

        <!-- Пустой список выглядел сломанным окном: заголовок и две кнопки
             без единого слова о том, почему выбирать не из чего. -->
        <p v-if="!addresses.length" class="loc__empty">
          {{ $t('ui.appshell.locationModal.empty') }}
        </p>

        <div class="loc__actions">
          <button type="button" class="loc__add" @click="emit('add')">
            <UiIcon name="plus" :size="22" />
            <span>{{ $t('ui.appshell.locationModal.dobavitAdres') }}</span>
          </button>

          <!-- Выбирать нечего — кнопка не должна притворяться рабочей:
               раньше она закрывала окно, ничего не выбрав. -->
          <button type="button" class="loc__apply" :disabled="!selected" @click="apply">
            {{ $t('ui.appshell.locationModal.vybratAdres') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.loc-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--overlay-z);
  display: grid;
  place-items: center;
  background: var(--overlay-bg);
}

.loc {
  display: flex;
  flex-direction: column;
  width: 586px;
  padding: 22px;
  border-radius: var(--dialog-radius);
  background: var(--color-surface);
}

.loc__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.loc__title {
  margin: 0;
  font: var(--type-dialog-title);
  color: var(--color-text);
}


.loc__list {
  margin: 36px 0 0;
  padding: 0;
  list-style: none;
}

.loc__item + .loc__item { border-top: 1.5px solid #F2F2F2; }

.loc__card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  cursor: pointer;
}

.loc__text { flex: 1; }

.loc__street {
  display: block;
  font-weight: 500;
  font-size: var(--text-md);
  line-height: 18px;
  color: #1C1C1C;
}

.loc__city {
  display: block;
  margin-top: 4px;
  font-weight: 400;
  font-size: var(--text-sm);
  line-height: 30px;
  color: #1C1C1C;
}

.loc__radio {
  cursor: pointer;
  width: 29.2px;
  height: 29.2px;
  accent-color: #FF5A0D;
}

/* Добавление нового адреса стоит отдельной кнопкой над выбором */
/* Обе кнопки в одном ряду: добавление слева, выбор справа */
.loc__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.loc__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1.5px solid #E4E8EC;
  background: none;
  color: var(--color-text);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.loc__add:hover { background: #F7F9FC; }

.loc__apply {
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.loc__apply:disabled {
  background: #E6E9EF;
  color: var(--color-text-muted);
  cursor: default;
}

.loc__empty {
  margin: 0;
  padding: 24px 4px 4px;
  font-size: var(--text-base);
  line-height: 20px;
  color: var(--color-text-muted);
  text-align: center;
}
</style>
