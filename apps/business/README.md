# 1mart Business — seller cabinet & landing

Second Nuxt app of the 1mart marketplace monorepo. It is the **B2B seller side**:
a marketing **landing** for onboarding merchants and the **Merchant Cabinet** where a
seller runs their business — products, orders, customers, finances, documents, team.

Deployed on its own host (`business.paylov.uz`). The storefront (`apps/host`) links here
via its "Become a seller" button. The two apps share only the design system
(`@zoo/shared`: tokens, fonts, UI kit), exactly as Uzum runs `seller.uzum.uz` apart from
`uzum.uz`.

> **Frontend only.** Like the storefront, this app ships the UI plus a mock API layer
> (`layers/merchant-mock`) that returns the same `{ payload, errors }` contract the real
> backend will. Backend business logic (payments, settlement, real payouts) is built
> separately and swaps the mock out with no change to the pages — see "Connecting the
> backend" below. No real money movement happens here.

## Run

```bash
npm install
npm run dev:business
```

Opens on the port Nuxt prints (default 3000; run the storefront and this on different
ports). Default locale is Russian (`/`), Uzbek under `/uz`.

```bash
npm run typecheck:business
npm run build:business
```

Demo login: any phone + any password of 4+ characters (mock auth).

## Layout

```
apps/business/              the app: nuxt.config, i18n (ru/uz), shared types, fonts
layers/shared/              design system reused from the storefront (@zoo/shared)
layers/merchant/            the cabinet: layout, sidebar/topbar, M-* UI kit, pages, store
layers/seller-landing/      public landing: hero, benefits, tariffs, steps, FAQ, apply form
layers/merchant-mock/       mock API (/api/merchant/*) — removed once api-backend exists
```

### The `M-*` UI kit (`layers/merchant`)

Cabinet-level components, globally registered with the `M` prefix, built on `@zoo/shared`
tokens: `MCard`, `MPageHeader`, `MStatTile`, `MStatus`, `MTable`, `MEmpty`, `MField`,
`MSelect`, `MTextarea`, `MPagination`, `MTabs`, `MBarChart`, plus `MSidebar` / `MTopbar`
used by the `merchant` layout.

### Conventions (same as the storefront — see root `CLAUDE.md`)

- **Money is tiyin.** `Money = { amount, currency: 'UZS' }`; `amount` is integer tiyin.
  Format with `useMoney()` (`money(obj)`), never hardcode "сум".
- **Never hardcode user-visible strings** in `.vue` — everything goes through `$t`.
  Keys live in `i18n/locales/{ru,uz}.json`. Uzbek uses the typewriter apostrophe `'`.
- **Branch on machine codes, not translated strings.** Status fields carry a `statusCode`
  (`OrderStatusCode`, `PayoutStatus`, …); `useStatusMeta()` maps a code to a badge tone +
  label key. Never `/доставлен/.test(...)`.
- **Mock helpers private to the adapter live in `server/lib/`**, not `server/utils/`
  (Nitro merges every layer's `server/utils` into one namespace — a clash once silently
  overrode the shared `money`).
- Desktop layout, fixed 1440 width (inherited from `@zoo/shared/main.css`). No responsive
  work without the product owner's sign-off.

## Auth

Cabinet routes are guarded by the `merchant-auth` middleware. The session (name, shop,
role) is held in a JS-readable cookie `paylov_biz` via `useMerchantStore`, mirroring the
storefront's `paylov_auth`. The real backend will additionally set httpOnly token cookies;
the display cookie and store API stay the same.

## Connecting the backend

`layers/merchant-mock` raises, inside Nuxt, the exact addresses the backend will serve.
Each handler returns `ok(payload)` (the `{ payload, errors }` envelope) and carries a
`// TODO: Connect to backend endpoint <METHOD> /merchant/...` note. To go live:

1. Set `NUXT_PUBLIC_API_BASE` to the real API base.
2. Add an `api-backend`-style adapter layer (as the storefront has) and drop
   `layers/merchant-mock` from `extends` in `nuxt.config.ts`.

Pages never call upstream directly — they use `useApi()` / `useApiData()` from
`@zoo/shared`, so none of the UI changes.

### Endpoint contract (mock mirrors the backend)

All under `/api/merchant`. Lists return `Paged<T>` = `{ items, total, page, perPage }`.
Types are in `apps/business/shared/types/merchant.ts`.

| Method & path | Returns | Notes |
|---|---|---|
| `POST /auth/login` | `MerchantUser` | phone + password |
| `POST /auth/logout` | `{ ok }` | |
| `GET /auth/session` | `MerchantUser` | server-side session check |
| `GET /dashboard` | `DashboardSummary` | KPIs, 14-day series, funnel, top, recent |
| `GET /products` | `Paged<ProductListItem>` | `q, status, categoryId, sort, page, perPage` |
| `GET /products/{id}` | `ProductDetail` | |
| `POST /products` | `ProductDetail` | create (draft / moderation) |
| `PUT /products/{id}` | `ProductDetail` | update |
| `DELETE /products/{id}` | `{ id, deleted }` | |
| `GET /categories` | `MerchantCategory[]` | per-category commission rate |
| `GET /orders` | `Paged<OrderListItem>` | `q, status, page, perPage` |
| `GET /orders/{id}` | `OrderDetail` | items, totals, commission, payout, timeline |
| `PATCH /orders/{id}` | `OrderListItem` | `{ statusCode }` |
| `GET /customers` | `Paged<CustomerListItem>` | `q, page, perPage` |
| `GET /customers/{id}` | `CustomerDetail` | |
| `GET /finance/overview` | `FinanceOverview` | balance + period totals + recent tx |
| `GET /finance/balance` | `BalanceState` | available / pending / hold / lifetime |
| `GET /finance/commissions` | `CommissionSummary` | base rate, period total, by category, rows |
| `GET /finance/payouts` | `Paged<PayoutRow>` | |
| `POST /finance/payouts` | `PayoutRow` | request a payout `{ amount }` (sums) |
| `GET /finance/transactions` | `Paged<TransactionRow>` | `type, page, perPage` |
| `GET /documents` | `DocumentRow[]` | `type` filter |
| `GET /company` | `CompanyProfile` | |
| `PUT /company` | `CompanyProfile` | editable contact fields only |
| `GET /employees` | `Employee[]` | |
| `POST /employees` | `Employee` | invite `{ name, phone, email, role }` |
| `DELETE /employees/{id}` | `{ id, deleted }` | owner cannot be removed |
| `GET /notifications` | `NotificationItem[]` | |
| `POST /notifications/read` | `{ unread }` | `{ id? }`, omit id = mark all |
| `GET /support` | `TicketListItem[]` | |
| `GET /support/{id}` | `TicketDetail` | thread with messages |
| `POST /support` | `TicketDetail` | new ticket `{ subject, text, priority? }` |
| `POST /applications` | `{ accepted, … }` | seller application from the landing |

## i18n

`i18n/locales/{ru,uz}.json`, `prefix_except_default` with **ru as default**. Namespaces:
`m.*` (cabinet), `landing.*` (landing), `auth.*` (login), `common.currency`. Uzbek is a
full mirror; add new keys to both files.
