<script setup lang="ts">
// Макет входа: слева логотип, форма по центру и строка о правах; справа
// вложенная панель с 3D-рендером, обещанием и преимуществами.
const benefits = ['b1', 'b2', 'b3']
</script>

<template>
  <div class="auth">
    <div class="auth__side">
      <NuxtLink :to="useLocalePath()('/')" class="auth__brand">
        <img src="/1mart-logo.svg" alt="1mart" width="104" height="32" class="auth__logo">
        <span class="auth__brand-sub">{{ $t('m.brand.business') }}</span>
      </NuxtLink>

      <main class="auth__main">
        <div class="auth__form">
          <slot />
        </div>
      </main>

      <p class="auth__rights">© {{ $t('landing.footer.rights') }}</p>
    </div>

    <aside class="auth__aside">
      <h2 class="auth__statement">{{ $t('auth.aside.title') }}</h2>

      <img class="auth__render" src="/landing/login-3d.png" alt="" width="736" height="736">

      <ul class="auth__benefits">
        <li v-for="b in benefits" :key="b" class="auth__benefit">
          <UiIcon name="tick-circle-fill" :size="20" color="var(--m-on-brand)" />
          {{ $t(`auth.aside.${b}`) }}
        </li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
.auth {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  background: var(--m-surface);
}

/* ── Левая половина: логотип сверху, форма по центру, права снизу ─────────── */
.auth__side {
  display: flex;
  flex-direction: column;
  padding: 32px 56px;
}
.auth__brand {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 10px;
  border-radius: var(--m-radius-sm);
  text-decoration: none;
}
.auth__brand:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.auth__logo { display: block; width: 104px; height: 32px; }
.auth__brand-sub {
  padding: 5px 10px;
  border-radius: var(--m-radius-pill);
  background: var(--m-brand-tint);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-xs);
  line-height: 1;
  color: var(--m-brand-ink);
}
.auth__main {
  display: grid;
  flex: 1;
  padding-block: 32px;
  place-items: center;
}
.auth__form {
  width: 100%;
  max-width: 420px;
  animation: m-fade-up var(--m-dur-slow) var(--m-ease) both;
}
.auth__rights { margin: 0; font-size: var(--text-xs); color: var(--m-slate); }

/* ── Правая половина: вложенная панель с градиентом ───────────────────────── */
.auth__aside {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 16px 16px 16px 0;
  padding: 48px;
  overflow: hidden;
  border-radius: var(--m-radius-xl);
  background: var(--m-mesh-gradient);
  color: var(--m-on-brand);
}
.auth__render {
  /* В файле вокруг предметов пустые поля: сверху ~12%, снизу ~14%. Отрицательные
     отступы их съедают, чтобы тексты стояли вплотную к иконке. */
  --size: min(740px, calc(127vh - 440px));
  position: relative;
  flex: none;
  align-self: center;
  width: var(--size);
  height: var(--size);
  margin-block: calc(var(--size) * -0.095) calc(var(--size) * -0.12);
  filter: drop-shadow(0 28px 40px rgb(10 82 20 / 28%));
}
.auth__statement {
  position: relative;
  max-width: 520px;
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 44px;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--m-on-brand);
  text-wrap: balance;
}
/* Преимущества: стеклянная плашка у нижнего края, под коробкой на рендере */
.auth__benefits {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 18px 22px;
  border: 1px solid color-mix(in srgb, var(--m-surface) 60%, transparent);
  border-radius: var(--m-radius-lg);
  background: color-mix(in srgb, var(--m-surface) 78%, transparent);
  box-shadow: var(--m-shadow-md);
  backdrop-filter: blur(14px);
  list-style: none;
  animation: m-fade-up var(--m-dur-slow) var(--m-ease) 120ms both;
}
.auth__benefit {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--m-on-brand);
}

@media (prefers-reduced-motion: reduce) {
  .auth__form, .auth__benefits { animation: none; }
}
</style>
