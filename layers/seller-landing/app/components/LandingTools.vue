<script setup lang="ts">
// Инструменты кабинета: три высокие карточки зигзагом, в каждой рабочая карусель.
// Визуал слайда — маленький макет экрана кабинета на HTML/CSS (плитки, столбики,
// строки таблицы). Значения в макетах — примеры, все тексты лежат в словаре.
type Cell = 'a' | 'b' | 'c'
type Tone = 'ok' | 'warn' | 'info' | 'mute'

interface MockRow { id: string, tone?: Tone, level?: number, on?: boolean }
interface MockSlide {
  key: string
  cols?: Cell[]
  header?: boolean
  tree?: boolean
  rows?: MockRow[]
  tiles?: string[]
  bars?: number[]
  float?: boolean
}
interface Deck { key: string, tone: 'mesh' | 'dark' | 'tint', slides: MockSlide[] }

const decks: Deck[] = [
  {
    key: 'c1',
    tone: 'mesh',
    slides: [
      {
        key: 's1',
        tree: true,
        cols: ['a'],
        rows: [
          { id: 'r1', level: 0 },
          { id: 'r2', level: 1 },
          { id: 'r3', level: 2, on: true },
          { id: 'r4', level: 1 },
          { id: 'r5', level: 0 },
        ],
      },
      {
        key: 's2',
        cols: ['a', 'b'],
        rows: [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }, { id: 'r4' }, { id: 'r5' }],
      },
      {
        key: 's3',
        cols: ['a', 'b', 'c'],
        header: true,
        float: true,
        rows: [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }, { id: 'r4' }],
      },
    ],
  },
  {
    key: 'c2',
    tone: 'dark',
    slides: [
      {
        key: 's1',
        tiles: ['t1', 't2'],
        cols: ['a', 'b'],
        rows: [{ id: 'r1' }, { id: 'r2' }],
      },
      {
        key: 's2',
        cols: ['a', 'b', 'c'],
        header: true,
        float: true,
        rows: [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }, { id: 'r4' }],
      },
      {
        key: 's3',
        cols: ['a', 'b', 'c'],
        header: true,
        rows: [
          { id: 'r1', tone: 'info' },
          { id: 'r2', tone: 'warn' },
          { id: 'r3', tone: 'ok' },
          { id: 'r4', tone: 'ok' },
        ],
      },
      {
        key: 's4',
        cols: ['a', 'b', 'c'],
        header: true,
        rows: [
          { id: 'r1', tone: 'info' },
          { id: 'r2', tone: 'ok' },
          { id: 'r3', tone: 'warn' },
          { id: 'r4', tone: 'ok' },
        ],
      },
    ],
  },
  {
    key: 'c3',
    tone: 'tint',
    slides: [
      {
        key: 's1',
        tiles: ['t1', 't2'],
        bars: [34, 52, 44, 68, 58, 76, 62, 88, 72, 96],
      },
      {
        key: 's2',
        cols: ['a', 'b', 'c'],
        header: true,
        rows: [
          { id: 'r1', tone: 'info' },
          { id: 'r2', tone: 'warn' },
          { id: 'r3', tone: 'info' },
          { id: 'r4', tone: 'ok' },
        ],
      },
      {
        key: 's3',
        cols: ['a', 'b', 'c'],
        header: true,
        rows: [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }, { id: 'r4' }],
      },
      {
        key: 's4',
        cols: ['a', 'b'],
        header: true,
        rows: [
          { id: 'r1', tone: 'mute' },
          { id: 'r2', tone: 'mute' },
          { id: 'r3', tone: 'mute' },
          { id: 'r4', tone: 'mute' },
        ],
      },
    ],
  },
]

// Номер активного слайда по каждой карточке; стрелки ходят по кругу.
const active = ref<number[]>(decks.map(() => 0))

function step(deckIndex: number, delta: number) {
  const total = decks[deckIndex]?.slides.length ?? 1
  active.value[deckIndex] = ((active.value[deckIndex] ?? 0) + delta + total) % total
}

function key(deck: Deck, slide: MockSlide, path: string) {
  return `landing.tools.${deck.key}.${slide.key}.${path}`
}
</script>

<template>
  <section id="tools" class="tools">
    <div class="tools__inner">
      <h2 class="tools__title">{{ $t('landing.tools.title') }}</h2>

      <div class="tools__list">
        <article v-for="(deck, d) in decks" :key="deck.key" class="tool" :class="{ 'tool--flip': d % 2 === 1 }">
          <div class="tool__side">
            <h3 class="tool__title">{{ $t(`landing.tools.${deck.key}.title`) }}</h3>
            <p class="tool__text">{{ $t(`landing.tools.${deck.key}.text`) }}</p>
            <a href="#apply" class="tool__more">{{ $t('landing.tools.more') }}</a>
          </div>

          <div class="panel" :class="`panel--${deck.tone}`">
            <span class="panel__deco" aria-hidden="true" />

            <div class="panel__head">
              <div class="panel__tabs">
                <button
                  v-for="(slide, i) in deck.slides"
                  :key="slide.key"
                  type="button"
                  class="panel__tab"
                  :class="{ 'panel__tab--on': active[d] === i }"
                  :aria-current="active[d] === i"
                  @click="active[d] = i"
                >
                  {{ $t(key(deck, slide, 'title')) }}
                </button>
              </div>

              <div class="panel__arrows">
                <button type="button" class="panel__arrow" :aria-label="$t('landing.tools.prev')" @click="step(d, -1)">
                  <UiIcon name="arrow-left" :size="18" />
                </button>
                <button type="button" class="panel__arrow" :aria-label="$t('landing.tools.next')" @click="step(d, 1)">
                  <UiIcon name="arrow-right" :size="18" />
                </button>
              </div>
            </div>

            <div
              v-for="(slide, i) in deck.slides"
              :key="slide.key"
              class="slide"
              :class="{ 'slide--on': active[d] === i }"
              :aria-hidden="active[d] !== i"
            >
              <h4 class="slide__title">{{ $t(key(deck, slide, 'title')) }}</h4>
              <p class="slide__text">{{ $t(key(deck, slide, 'text')) }}</p>

              <div class="mock">
                <div v-if="slide.float" class="mock__float">
                  <span class="mock__label">{{ $t(key(deck, slide, 'float.label')) }}</span>
                  <span class="mock__floatValue m-tnum">{{ $t(key(deck, slide, 'float.value')) }}</span>
                </div>

                <p class="mock__head">{{ $t(key(deck, slide, 'head')) }}</p>

                <div v-if="slide.tiles" class="mock__tiles">
                  <div v-for="tile in slide.tiles" :key="tile" class="mock__tile">
                    <span class="mock__label">{{ $t(key(deck, slide, `${tile}.label`)) }}</span>
                    <span class="mock__value m-metric">{{ $t(key(deck, slide, `${tile}.value`)) }}</span>
                  </div>
                </div>

                <div v-if="slide.bars" class="mock__bars" aria-hidden="true">
                  <span
                    v-for="(bar, b) in slide.bars"
                    :key="b"
                    class="mock__bar"
                    :class="{ 'mock__bar--on': b === slide.bars.length - 1 }"
                    :style="{ height: `${bar}%` }"
                  />
                </div>

                <ul v-if="slide.rows" class="mock__table" :class="`mock__table--${slide.cols?.length ?? 1}`">
                  <li v-if="slide.header" class="mock__row mock__row--head">
                    <span v-for="col in slide.cols" :key="col" class="mock__cell">
                      {{ $t(key(deck, slide, `h.${col}`)) }}
                    </span>
                  </li>
                  <li
                    v-for="row in slide.rows"
                    :key="row.id"
                    class="mock__row"
                    :class="{ 'mock__row--on': row.on }"
                    :style="row.level ? { paddingLeft: `${8 + row.level * 20}px` } : undefined"
                  >
                    <span
                      v-for="(col, c) in slide.cols"
                      :key="col"
                      class="mock__cell m-tnum"
                      :class="row.tone && c === (slide.cols?.length ?? 1) - 1 ? `mock__status mock__status--${row.tone}` : ''"
                    >
                      <UiIcon v-if="slide.tree" name="arrow-right" :size="12" class="mock__chevron" />
                      {{ $t(key(deck, slide, `${row.id}.${col}`)) }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tools { padding: 64px 0; background: var(--m-page); }
.tools__inner { width: var(--container-width); max-width: var(--container-width); margin: 0 auto; }
.tools__title { margin: 0 0 40px; font-family: var(--font-display); font-weight: 800; font-size: var(--text-10xl); letter-spacing: -0.025em; color: var(--m-ink); }
.tools__list { display: flex; flex-direction: column; gap: 32px; }

/* Карточка: текст с кнопкой внизу и цветная панель-карусель; средняя зеркальна. */
.tool {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 640px;
  gap: 40px;
  height: 640px;
  padding: 24px;
  border-radius: var(--m-radius-xl);
  background: var(--m-surface);
}
.tool__side { display: flex; flex-direction: column; align-items: flex-start; padding: 24px 0 24px 24px; }
.tool--flip { grid-template-columns: 640px minmax(0, 1fr); }
.tool--flip .tool__side { grid-column: 2; grid-row: 1; padding: 24px 24px 24px 0; }
.tool--flip .panel { grid-column: 1; grid-row: 1; }
.tool__title { margin: 0; font-family: var(--font-display); font-weight: 700; font-size: var(--text-9xl); line-height: 1.2; letter-spacing: -0.015em; color: var(--m-ink); }
.tool__text { margin: 20px 0 0; font-size: var(--text-xl); line-height: 1.45; color: var(--m-ink-soft); }
.tool__more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  height: 50px;
  margin-top: auto;
  padding: 0 28px;
  border: 1px solid var(--m-ink);
  border-radius: var(--m-radius-pill);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--m-ink);
  text-decoration: none;
  transition: background var(--m-dur) var(--m-ease), color var(--m-dur) var(--m-ease);
}
.tool__more:hover { background: var(--m-ink); color: var(--m-surface); }

/* Панель: цвета текста и элементов управления заданы переменными тона. */
.panel {
  position: relative;
  overflow: hidden;
  border-radius: var(--m-radius-xl);
  color: var(--panel-fg);
}
/* Правый нижний угол прямой: вокруг него белые макет и карточка, и скругление давало дугу цвета панели. */
.panel { border-bottom-right-radius: 0; }
.panel--mesh { --panel-fg: var(--m-on-brand); --panel-fg-2: var(--m-on-brand); --tab-on-bg: var(--m-surface); --tab-on-fg: var(--m-on-brand); background: var(--m-mesh-gradient); }
.panel--dark { --panel-fg: var(--m-on-dark); --panel-fg-2: var(--m-on-dark-2); --tab-on-bg: var(--m-brand); --tab-on-fg: var(--m-on-brand); background: var(--m-hero-gradient); }
.panel--tint { --panel-fg: var(--m-brand-ink); --panel-fg-2: var(--m-ink-soft); --tab-on-bg: var(--m-brand); --tab-on-fg: var(--m-on-brand); background: var(--m-brand-tint); }

.panel__deco {
  position: absolute;
  right: 372px;
  bottom: 0;
  width: 200px;
  height: 300px;
  border-radius: var(--m-radius-lg) var(--m-radius-lg) 0 0;
  background: color-mix(in srgb, var(--panel-fg) 7%, transparent);
}

/* Верх панели: вкладки-пилюли слева (длинные переносятся), стрелки в правом углу. */
.panel__head {
  position: absolute;
  top: 20px;
  left: 32px;
  right: 20px;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.panel__tabs { display: flex; flex-wrap: wrap; align-content: center; gap: 4px; min-width: 0; min-height: 40px; }
.panel__tab {
  height: 26px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--panel-fg) 35%, transparent);
  border-radius: var(--m-radius-pill);
  background: transparent;
  font-size: var(--text-2xs);
  font-weight: 500;
  white-space: nowrap;
  color: var(--panel-fg);
  cursor: pointer;
  transition: background var(--m-dur) var(--m-ease), border-color var(--m-dur) var(--m-ease), color var(--m-dur) var(--m-ease);
}
.panel__tab:hover { background: color-mix(in srgb, var(--panel-fg) 12%, transparent); }
.panel__tab--on,
.panel__tab--on:hover { border-color: var(--tab-on-bg); background: var(--tab-on-bg); color: var(--tab-on-fg); }

.panel__arrows { display: flex; flex: none; gap: 8px; }
.panel__arrow {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--panel-fg) 45%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--panel-fg) 8%, transparent);
  color: var(--panel-fg);
  cursor: pointer;
  transition: background var(--m-dur) var(--m-ease), border-color var(--m-dur) var(--m-ease);
}
.panel__arrow:hover { background: color-mix(in srgb, var(--panel-fg) 20%, transparent); border-color: var(--panel-fg); }
.panel__arrow:focus-visible,
.panel__tab:focus-visible { outline: 2px solid var(--panel-fg); outline-offset: 2px; }

/* Слайды лежат стопкой; активный проявляется, остальные скрыты от мыши и чтения. */
.slide {
  position: absolute;
  inset: 0;
  padding: 92px 32px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateX(16px);
  transition: opacity var(--m-dur-slow) var(--m-ease), transform var(--m-dur-slow) var(--m-ease), visibility var(--m-dur-slow);
}
.slide--on { opacity: 1; visibility: visible; transform: none; }
.slide__title { margin: 0; font-family: var(--font-display); font-weight: 700; font-size: var(--text-9xl); line-height: 1.2; letter-spacing: -0.015em; }
.slide__text { margin: 12px 0 0; font-size: var(--text-lg); line-height: 1.45; color: var(--panel-fg-2); }

/* Макет экрана кабинета: прижат к правому нижнему углу панели. */
.mock {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 470px;
  padding: 16px 16px 20px;
  border-radius: var(--m-radius-lg) 0 0 0;
  background: var(--m-surface);
  box-shadow: var(--m-shadow-lg);
  color: var(--m-ink);
}
.mock__head { margin: 0 0 12px; font-size: var(--text-md); font-weight: 600; color: var(--m-ink); }

.mock__float {
  position: absolute;
  top: -40px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
  padding: 10px 14px;
  border-radius: var(--m-radius);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-lg);
}
.mock__floatValue { font-family: var(--font-display); font-weight: 700; font-size: var(--text-2xl); color: var(--m-brand-strong); white-space: nowrap; }

.mock__tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.mock__tile { display: flex; flex-direction: column; gap: 4px; padding: 12px; border-radius: var(--m-radius-sm); background: var(--m-surface-sunken); }
.mock__label { font-size: var(--text-2xs); color: var(--m-slate); white-space: nowrap; }
.mock__value { font-size: var(--text-2xl); white-space: nowrap; }

.mock__bars { display: flex; align-items: flex-end; gap: 10px; height: 120px; margin-top: 14px; }
.mock__bar { flex: 1; border-radius: 6px 6px 0 0; background: var(--m-brand-tint-2); }
.mock__bar--on { background: var(--m-brand); }

.mock__table { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }
.mock__tiles + .mock__table { margin-top: 10px; }
.mock__row { display: grid; align-items: center; gap: 8px; min-height: 40px; padding: 0 8px; border-top: 1px solid var(--m-line-soft); font-size: var(--text-xs); color: var(--m-ink-soft); }
.mock__row:first-child { border-top: 0; }
.mock__row--head { min-height: 30px; border-radius: var(--m-radius-sm); background: var(--m-surface-sunken); font-size: var(--text-2xs); color: var(--m-slate); }
.mock__row--on { border-radius: var(--m-radius-sm); background: var(--m-brand-tint); font-weight: 600; color: var(--m-brand-ink); }
.mock__table--1 .mock__row { grid-template-columns: minmax(0, 1fr); }
.mock__table--2 .mock__row { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.mock__table--3 .mock__row { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1.3fr); }

.mock__cell { display: flex; align-items: center; gap: 6px; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.mock__cell:last-child:not(:first-child) { justify-self: end; }
.mock__chevron { color: var(--m-slate-soft); }

.mock__status { padding: 3px 8px; border-radius: var(--m-radius-pill); font-size: var(--text-2xs); font-weight: 500; }
.mock__status--ok { background: var(--m-success-bg); color: var(--m-success-fg); }
.mock__status--warn { background: var(--m-warning-bg); color: var(--m-warning-fg); }
.mock__status--info { background: var(--m-info-bg); color: var(--m-info-fg); }
.mock__status--mute { background: var(--m-surface-sunken); color: var(--m-slate); }

@media (prefers-reduced-motion: reduce) {
  .slide { transform: none; transition: none; }
  .panel__tab, .panel__arrow { transition: none; }
}
</style>
