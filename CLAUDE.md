# zoo-market-front — notes for whoever works here next

Buyer storefront for the Zoo marketplace. Nuxt 4, layered monorepo, SSR.

**Read `HANDOFF.md` first** — it covers all three repos, the current state and what to do next.
This file is only the conventions of this one.

---

## Layout

```
apps/host/            the app: nuxt.config.ts, i18n locales, shared types
layers/shared/        design system, money helpers, useApi
layers/app-shell/     header, footer, modals, auth store
layers/catalog/       home, category, search
layers/pdp/           product page
layers/cart/  checkout/  account/
layers/api-mock/      mock server routes — the default
layers/api-backend/   the real adapter — loaded ONLY when NUXT_UPSTREAM_BASE is set
```

## Running it

```bash
# against the real backend (see zoo-backend/docs/LOCAL-DEMO.md)
NUXT_UPSTREAM_BASE=http://localhost:8020/api/v1 NUXT_SSR_THROTTLE_KEY=demo-ssr-key npm run dev

npm run dev          # mocks only
npm run typecheck
npm run build
```

`npm run typecheck` prints `ERR_PACKAGE_PATH_NOT_EXPORTED` / `vue-router/volar/*` resolver noise.
Pre-existing, not an error — **check the exit code, not the output**.

## The adapter layer is the whole design

Pages never call the backend. `layers/api-backend/` owns every upstream call and hides three
differences, so components stay identical whether they run on mocks or on the real thing:

| | backend | frontend |
|---|---|---|
| envelope | `{success, message, errors}` | `{payload, errors}` |
| money | decimal string `"699990.00"` | integer tiyin `69999000` |
| paging | `limit` / `offset` | `page` / `perPage` |

Rules that have already been learned the hard way:

- **Nitro auto-imports every layer's `server/utils/` into one namespace.** A helper named `money`
  there silently overrode the shared one. Adapter-private helpers live in `server/lib/` instead.
- **`server/plugins/` is NOT auto-scanned from a layer** (unlike `server/api` and `server/utils`).
  Declare it in the layer's `nuxt.config.ts` under `nitro.plugins`, or it never reaches the build
  and you will debug a plugin that was never loaded.
- **Never decide UI behaviour from a translated string.** The adapter localises `status`, so
  `/доставлен/.test(order.status)` never matched on `/uz`. Send the machine value alongside the
  label (`statusCode`, `checked`) and branch on that.
- **A sort can change the result *set*, not just the order.** `recommended` drops out-of-stock rows,
  which made every category page look empty. Check the backend's `_apply_sorting` before mapping a
  new sort.
- **Cache keys must include the locale.** Slugs are translated (`koshki`/`mushuklar`); one shared
  map meant the second language found nothing for five minutes. Worse, a miss returns 200 with an
  empty list — indistinguishable from "this category is empty".

## i18n

`apps/host/i18n/locales/{uz,ru}.json`, 547 keys, `prefix_except_default` with **ru as default** — so
Russian is `/product/x` and Uzbek is `/uz/product/x`. 9 keys are byte-identical between locales and
all of them are intentional (`{count} {word}`, `FAQ`, `Cookie`).

Uzbek uses the typewriter apostrophe `'` (U+0027), never `ʻ` or `'`. Never hardcode a user-visible
string in a `.vue` file — that class of bug was swept once already and is the owner's top complaint.

## Icons: hard rule from the owner

Every icon in every app comes from the owner's Figma file:
- General icons, page `Icon`: https://www.figma.com/design/ieFHxM11OwkuX1vgaFFUvl/1mart?node-id=9-21
- Social icons, component `Social icon` (Style=White on dark): https://www.figma.com/design/ieFHxM11OwkuX1vgaFFUvl/1mart?node-id=11-52334

Look in the whole file before saying an icon is missing.

- **Never invent, hand-draw or borrow an icon.** No inline `<svg>` icons in templates, no icon
  libraries, no Unicode glyphs or emoji standing in for icons.
- Render with `<UiIcon name="..." />`. Files live in `layers/shared/app/assets/icons/`, listed in
  `layers/shared/app/assets/icons.figma.json`.
- Add an icon only by exporting it:
  `FIGMA_TOKEN=... node scripts/export-figma-icons.mjs wallet wallet-fill`. The `-fill` suffix is
  the Bold style. Never commit the token.
- **If Figma has no suitable icon, stop and ask the owner.** Offer options and wait for a yes.
- `npm run test:icons` fails on a foreign icon, an extra file or an inline `<svg>`. The chart
  `MBarChart.vue` and `ui/Icon.vue` are the only allowed `<svg>` files.
- Not icons: the 1mart logos, payment-network logos (owner-supplied files) and language flags.

## Text styles live in one place

`layers/shared/app/assets/css/tokens.css` defines text roles: `--type-page-title`, `--type-section-title`,
`--type-dialog-title`, `--type-card-title`, `--type-label`, `--type-input`, `--type-button`, `--type-button-sm`.
Headings, fields, field labels and buttons use `font: var(--type-…)`, never their own size or weight, so the
whole site changes from that file. Colors: `--input-color`, `--input-placeholder`, `--label-color`. Text and icons
on green use `--color-on-brand` (white, the owner's decision). Buttons use `--control-height`, `--control-radius`.

## Layout is fixed at 1440px

`layers/shared/app/assets/css/main.css:10` sets `min-width: 1440px` on `body` and the project has
**zero** `@media` rules. Below 1440 the page scrolls horizontally. This is deliberate and documented
there, but it means the site is desktop-only. Content that looks "cut off at the bottom" is usually
cut off on the **right**. Do not start making it responsive without asking the product owner.

## Testing

```bash
npm run typecheck && npm run build
npx playwright test          # tests/e2e
```

Run the suite against a build: the dev server does not survive long runs.

```bash
npm run build
PORT=3100 NITRO_PORT=3100 node apps/host/.output/server/index.mjs
PW_BASE_URL=http://localhost:3100 npx playwright test --project=desktop-1440
```

`tests/e2e/b2b.spec.ts` holds the current B2B flows (balance, invoice, corporate card, catalog).
`test.fixme` in `controls.spec.ts` and `shop.spec.ts` marks old Zoo scenarios (breeds, installments,
cash, old Figma sizes, removed pages). Rewrite one for the current storefront before re-enabling it.
Tests wait for `useNuxtApp().isHydrating === false`, because `__vueParentComponent` exists only in dev.
The mock assigns a visitor id on the first page visit: open a page before calling `page.request`.

The seller cabinet has its own suite. Build and copy `apps/business/.output` first, because another session's build overwrites it mid-run:

```bash
npm run build:business
BUSINESS_URL=http://localhost:3102 PW_BASE_URL=http://localhost:3102 npx playwright test --project=desktop-1440 tests/e2e/business.spec.ts
```

Playwright is installed but ships **no browser binary**. Use system Chrome:

```js
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
```

Use `waitUntil: 'domcontentloaded'` plus a ~3 s wait; `networkidle` times out against the dev
server. **Images are lazy-loaded** — on the category page they sit at y≈8959 on a 10910 px
document, so measuring `naturalWidth` without scrolling to the bottom will tell you they are broken
when they are not.

`BUGS.md` holds 255 open findings from a browser-driven hunt. Only about half were verified, and
three of the four highest-severity claims were false when checked by hand. Reproduce before fixing.

## Standing instructions from the product owner

- The marketplace is B2B only. Buyers pay from a company balance, topped up by bank transfer to
  the platform's requisites, or by corporate card; the money then goes to the seller's settlement
  account. No personal cards, cash or installments. See "Баланс компании (B2B)" in `BACKEND.md`.
- Do not advise on when to commit or push — that is the owner's call.
- Documentation in English; the owner converses in Uzbek.
- Verify in a real browser. A green typecheck has repeatedly not meant a working screen.
