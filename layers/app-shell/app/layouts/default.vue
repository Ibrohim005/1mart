<template>
  <div class="layout">
    <!-- Ссылка для клавиатуры: до содержимого иначе нужно прощёлкать всю шапку -->
    <a href="#main" class="layout__skip">{{ $t('common.skipToContent') }}</a>
    <AppHeader />
    <main id="main" class="layout__main">
      <slot />
    </main>
    <AppFooter />
    <UiToasts />
  </div>
</template>

<style scoped>
/* Видна только при фокусе — так задумано, она для клавиатуры */
.layout__skip {
  position: absolute;
  z-index: 300;
  top: 8px;
  left: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  background: var(--color-brand);
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--color-on-brand);
  transform: translateY(-200%);
  transition: transform 0.15s ease;
}

.layout__skip:focus { transform: translateY(0); }

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout__main {
  flex: 1;
  padding-block: var(--space-6);
}
</style>
