<script setup lang="ts">
/**
 * Таблица кабинета. Колонки задаются декларативно; ячейку можно переопределить
 * именованным слотом `cell-<key>` со scope `{ row, value }`. Без слота печатает
 * `row[key]`. Для состояний загрузки/пусто используйте слоты loading/empty.
 *
 * `rows` намеренно нетипизированы (`any[]`): доменные типы — интерфейсы, а они
 * не удовлетворяют индексной сигнатуре `Record<string, unknown>`, поэтому таблица
 * универсальна, а страницы приводят тип ячейки у места (`value as Money` и т.п.).
 */
defineProps<{
  columns: { key: string, label: string, align?: 'left' | 'right' | 'center', width?: string }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- универсальная таблица: строка любая, ячейки типизируются в слотах
  rows: readonly any[]
  rowKey?: string
  loading?: boolean
}>()
</script>

<template>
  <div class="mtable__wrap">
    <table class="mtable">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ textAlign: col.align ?? 'left', width: col.width }"
          >{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="String(rowKey ? row[rowKey] : i)">
          <td
            v-for="col in columns"
            :key="col.key"
            :style="{ textAlign: col.align ?? 'left' }"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.mtable__wrap { width: 100%; overflow-x: auto; }
.mtable { width: 100%; border-collapse: collapse; }
.mtable th {
  padding: 12px 18px;
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--m-slate-soft);
  text-align: left;
  white-space: nowrap;
  background: var(--m-surface-sunken);
  border-bottom: 1px solid var(--m-line);
}
/* Round the header's top corners only when the table sits flush at the very top
   of a card — i.e. the flush body is the card's first child (no card header) and
   the table is the body's first child (no toolbar/tabs above it). Otherwise the
   rounded corners land mid-card and leave white notches at the header's edges. */
.mcard__body--flush:first-child > .mtable__wrap:first-child .mtable th:first-child { border-top-left-radius: var(--m-radius-lg); }
.mcard__body--flush:first-child > .mtable__wrap:first-child .mtable th:last-child { border-top-right-radius: var(--m-radius-lg); }
.mtable td {
  padding: 15px 18px;
  font-size: var(--text-sm);
  color: var(--m-ink-soft);
  border-bottom: 1px solid var(--m-line-soft);
  vertical-align: middle;
}
.mtable tbody tr:last-child td { border-bottom: 0; }
/* Суммы и числа держим одной строкой, чтобы «сум» не отрывался от цифр. */
.mtable td :deep(.m-tnum) { white-space: nowrap; }
.mtable tbody tr { transition: background var(--m-dur-fast) var(--m-ease); }
.mtable tbody tr:hover td { background: var(--m-surface-sunken); }
</style>
