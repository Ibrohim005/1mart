# 1mart storefront: rules for developers

Read this before changing the code. It covers what the product is, how the code is organised,
and the rules that keep it consistent. For commit and branch rules see `CONTRIBUTING.md`, for
ready-made components see `UI-KIT.md`, for the API contract see `BACKEND.md`.

## The product

1mart is a **B2B-only** marketplace. Companies buy from sellers. There are no consumer flows.

- A buyer pays from the **company balance** or by **corporate card**. No personal cards, cash or
  installments.
- The balance is topped up by bank transfer from the company's settlement account to the platform's
  requisites, against an invoice issued on `/account/balance`.
- Money is reserved when an order is placed. After the seller confirms, it goes to the seller's
  settlement account. If the seller rejects, it returns the same way.
- Balance payment uses a simple confirmation. Card payment uses an SMS code.
- The currency is the Uzbek sum. Money in code is always integer tiyin (`69999000` is 699 990 sum).

## Running it

```bash
npm install
npm run dev            # storefront on mocks
npm run dev:business   # seller cabinet and landing
npm run typecheck      # check the exit code; resolver noise in the output is known
npm run lint
npm run build
```

Copy `.env.example` to `.env` when you need real settings. Never commit `.env`.
Against the real backend:

```bash
NUXT_UPSTREAM_BASE=<api url>/api/v1 NUXT_SSR_THROTTLE_KEY=<key> npm run dev
```

## Layout

```
apps/host/            storefront: nuxt.config.ts, i18n locales, shared types
apps/business/        seller cabinet and landing
layers/shared/        design tokens, UI components, money helpers, useApi
layers/app-shell/     header, footer, modals, auth store
layers/catalog/       home, category, search, seller page, info pages
layers/pdp/           product page
layers/cart/          cart
layers/checkout/      checkout, payment, order documents
layers/account/       buyer account, company balance
layers/api-mock/      mock server routes, used by default
layers/api-backend/   real adapter, loaded only when NUXT_UPSTREAM_BASE is set
```

## API rules

Pages never call the backend directly. `layers/api-backend/` owns every upstream call and hides the
differences, so components work the same on mocks and on the real API:

| | Backend | Frontend |
|---|---|---|
| Envelope | `{success, message, errors}` | `{payload, errors}` |
| Money | decimal string `"699990.00"` | integer tiyin `69999000` |
| Paging | `limit` / `offset` | `page` / `perPage` |

- New endpoint: add the mock route and the type, describe it in `BACKEND.md`, then the adapter.
- The server calculates totals. Never compute the payable amount in the browser.
- Never branch on a translated string. Send a machine value next to the label (`statusCode`).
- Cache keys must include the locale, because slugs are translated.
- Helpers in a layer's `server/utils/` share one global namespace. Put private adapter helpers in
  `server/lib/`.
- `server/plugins/` is not scanned from a layer. Declare plugins under `nitro.plugins`.
- Personal data must not reach cached HTML: pages are cached, so load balances, counters and
  similar values in the browser only.

## Design rules

All values come from `layers/shared/app/assets/css/tokens.css`. Do not add raw colors or sizes.

**Text.** Headings, fields, labels and buttons use a role, never their own size or weight:

```css
.my-title { font: var(--type-section-title); }
.my-input { font: var(--type-input); color: var(--input-color); }
.my-button { font: var(--type-button); }
```

| Role | Use for |
|---|---|
| `--type-page-title` | page heading |
| `--type-section-title` | block on a page |
| `--type-dialog-title` | dialog heading |
| `--type-card-title` | card heading |
| `--type-label` | label above a field |
| `--type-input` | text in a field |
| `--type-button` | button |
| `--type-button-sm` | small button inside a block |

To change a style across the site, edit the role in `tokens.css`, not the components.

**Color and controls.**

- Text and icons on green use `--color-on-brand` (white, decided by the owner).
- Green text on a light background uses `--color-brand-text`.
- Buttons use `--control-height` and `--control-radius`. Placeholders use `--input-placeholder`.

**Layout and content.**

- The layout is fixed at 1440 px with a 1240 px container. There are no breakpoints on purpose.
  Do not make it responsive without asking the product owner.
- No emoji or Unicode characters as icons. Add an SVG to `layers/shared/app/assets/icons/`.
- Do not invent data: no made-up numbers, reviews, requisites, logos or advantages. If real data is
  missing, ask for it or leave a clearly marked placeholder.
- Use product photos and real content rather than drawn dashboards.
- When the owner says to copy a reference exactly, match its real layout and order. Look at the
  reference first.
- Do not copy another marketplace's name, logo, texts or legal details.

## Languages

There are 5 locales in `apps/host/i18n/locales/`: `ru` (default, no prefix), `uz`, `uz-cyrl`, `en`, `kaa`.

- Never hardcode a user-visible string in a `.vue` file. Add a key to all 5 locales.
- Uzbek uses the typewriter apostrophe `'` (U+0027), never `ʻ` or `’`.
- Use regular hyphens in code and copy.
- `npm run i18n:todo` lists keys that need attention.

## Testing

A green typecheck does not mean a working screen. **Check every visible change in a real browser**,
at 1440 px, in Russian and in Uzbek, with an empty console.

```bash
npm run build
PORT=3100 NITRO_PORT=3100 node apps/host/.output/server/index.mjs
PW_BASE_URL=http://localhost:3100 npx playwright test --project=desktop-1440
```

- Run the full suite against a build, because the dev server does not survive long runs. Do not
  rebuild while a run is using that build.
- `tests/e2e/b2b.spec.ts` holds the current flows. Add new tests there.
- Compare against tokens, not hardcoded sizes, so a design change does not break tests.
- `test.fixme` marks scenarios from the older storefront. Rewrite one for the current product
  before re-enabling it.
- Images are lazy-loaded: scroll to them or wait before measuring.
- The mock assigns a visitor id on the first page visit: open a page before calling `page.request`.

## Known gaps

These look finished on mocks but are not ready for production:

- **Platform requisites** are test placeholders (`PLATFORM_REQUISITES` in
  `layers/api-mock/server/utils/balance-state.ts`), with a visible warning on the invoice.
- **Incoming transfers** are simulated by a demo button. Production needs bank statement matching.
- **Personal card rejection** is a mock rule. The backend must decide using bank data.
- **Backend endpoints** for the balance, invoices, company details and the order comment do not
  exist yet. The contract is in `BACKEND.md`.
- **Order documents** on checkout are static samples from `apps/host/public/mock/documents/`, not
  generated from the order. Replace the links in `OrderDocuments.vue` when the backend issues files.
- **Social links** in the footer still point to the old Paylov accounts.
- **Old names** remain in places: `.env.example` and part of `README.md` mention older brands, and
  the mock promo codes are named `PAYLOV-*`.
