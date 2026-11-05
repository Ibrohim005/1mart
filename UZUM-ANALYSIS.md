# Разбор Uzum Market: стек, архитектура, структура платформы

Дата разбора: 18.09.2026. Источники: прямой фингерпринтинг публичных фронтендов и API (uzum.uz, seller.uzum.uz, id.uzum.uz),
Certificate Transparency логи по домену uzum.uz, инженерный блог Uzum на Habr, публичные вакансии Uzum Technologies.

Помечено: **[факт]** — проверено напрямую в браузере/сети, **[источник]** — из публикаций/вакансий, **[вывод]** — обоснованная догадка.

---

## 1. Короткий ответ

Uzum Market — это не «один сайт на движке», а **экосистема из ~50+ отдельных продуктов и сервисов** (маркетплейс, кабинет продавца,
склады/WMS, логистика, курьеры, ПВЗ, ID/SSO, платежи, аналитика, стримы, обучение). Всё написано с нуля, без коробочных
e-commerce платформ (нет Magento/Shopify/Bitrix в ядре — Bitrix24 используется только как CRM для лидов продавцов).

- **Бэкенд:** Java/Kotlin + Spring Boot, микросервисы, Kafka, PostgreSQL, Redis, Kubernetes. Плюс Go, Python, Scala в отдельных местах.
- **API-слой для клиентов:** GraphQL (Apollo, `graphql.uzum.uz`) для витрины + REST (`api.uzum.uz/api`) для аккаунта/платежей/служебного.
- **Фронтенд:** мигрируют с legacy Vue 2 SPA на **Nuxt 3 (SSR) монорепозиторий со слоями (layers)**. Uzum ID — отдельно на Next.js.
- **Мобилки:** нативные — Kotlin/Jetpack Compose (Android), Swift (iOS).
- **Инфраструктура:** Yandex Cloud (балансировщик + SmartCaptcha на периметре), свои k8s-кластеры в домене `*.cluster.daymarket.uz`.
- **Данные/ML:** собственный clickstream → Kafka → ClickHouse → Airflow/Spark → рекомендации (CatBoost) и поиск (Elasticsearch + векторный).

---

## 2. Фронтенд (что реально отдаётся в браузер)

### 2.1 Два поколения фронта одновременно **[факт]**

| Часть сайта | Технология | Признаки |
|---|---|---|
| Главная `/ru`, часть старых страниц | **Vue 2.7.14 + Vuex + Apollo Client + vue-i18n + TypeScript**, сборка Webpack (Vue CLI), CSR (клиентский рендер) | `/static/js/app.<hash>.js`, `sentry.javascript.vue/8.36.0`, глобальный `__VUE_DEVTOOLS_GLOBAL_HOOK__` |
| Карточка товара, категории, поиск, корзина, чекаут, магазин, кабинет пользователя | **Nuxt 3 с SSR**, Pinia, Apollo, `@nuxt/image` (`/_ipx/`) | `window.__NUXT__`, `serverRendered: true`, `/_nuxt/entry.*.js`, `buildId` |
| `id.uzum.uz` (Uzum ID, SSO) | **Next.js (App Router, Turbopack)** + свой Sentry `sentry.uzumid.uz` | `/_next/static/chunks/...`, `sentry.javascript.nextjs/10.48.0` |
| `seller.uzum.uz` (лендинг и кабинет продавца) | **Nuxt 3 SSR**, пакет `@uzum-b2b-ssr/source` | `__NUXT__.config.public.auth.apiUrl = https://api-seller.uzum.uz/` |

Вывод: у них **микрофронтенды по роутам** — часть URL-ов отдаёт новый Nuxt-хост, часть старый SPA. Миграция идёт постранично,
без big bang. Это рабочая стратегия, но стоит двух кодовых баз одновременно.

### 2.2 Структура Nuxt-монорепо **[факт, из runtime-конфига]**

В конфиге i18n видны реальные пути сборки внутри контейнера — это раскрывает структуру репозитория:

```
/app
  apps/host/                      # хост-приложение (точка входа Nuxt)
  layers/
    app-shell/                    # шапка, футер, навигация, общий каркас
    landing/                      # главная/лендинги
    search/                       # поиск и выдача
    pdp/                          # Product Detail Page — карточка товара
    shared-product-card/          # общая карточка товара (грид, полки)
    cart/                         # корзина
    checkout/                     # оформление заказа
    marketing/                    # промо, баннеры, акции
    static/                       # статические страницы (FAQ, about, legal)
    shared/                       # общие утилиты/компоненты
  node_modules/@uzum/frontend-auth-nuxt-module-ui   # внутренний npm-пакет авторизации
```

Внутренние npm-пакеты (своя платформа фронтенда, «PFT» — Platform Frontend Team) **[факт]**:
- `@uzum/frontend-auth-nuxt-module-ui` — авторизация как переиспользуемый Nuxt-модуль;
- `@uzum/pft-prometheus-metrics-nuxt` — **метрики Prometheus прямо из Node-слоя Nuxt** (RED-метрики по страницам и API,
  с шаблонизацией URL: `/ru/product/{url}`, `/payment/{orderId}/options` — чтобы не взрывать кардинальность лейблов);
- свой `clickstream-client-js` — SDK сбора продуктовой аналитики;
- `pftCore` с `forwardRequestHeaders` — прокидывание заголовков (trace-id) с SSR в бэкенд.

Версии в проде на момент разбора: `b2c-frontend-ssr` **1.264.0**, b2b-кабинет `0.27.0`.

### 2.3 Прочее по фронту **[факт]**
- **i18n:** `uz` (дефолт) + `ru`, стратегия `prefix` (`/uz/...`, `/ru/...`), ленивая загрузка локалей, JSON-файлы на каждый layer.
  Переводами управляют через **Tolgee** (`tolgee.uzum.uz`) — self-hosted TMS.
- **Фича-флаги и A/B:** **GrowthBook** (`cdn.growthbook.io` + свои `flags.uzum.uz`, `gb.uzum.uz`), с шифрованием payload'а
  и отдельными SDK-ключами на B2C и B2B. Эксперименты пишутся в clickstream (`/experiments/exposure`).
- **Ошибки:** self-hosted **Sentry** (`sentry.infra.cluster.daymarket.uz`, `sentry.uzumid.uz`).
- **Карты:** Яндекс.Карты (ПВЗ, адреса доставки).
- **Шрифт:** собственный `TT Uzum` (брендинг), плюс Inter.
- **SEO:** SSR + мета `prerender-status-code` на legacy-части (пререндер для ботов), `hreflang` ru/uz/x-default,
  отдельный regex списка поисковых ботов в auth-модуле (боты не гоняются через авторизацию).
- **Аналитика:** GTM, GA4, Meta Pixel, Google Ads + **свой clickstream** с «adblock-friendly» алиасами эндпоинтов
  (`/api/analytics/v2/events` ↔ `/api/v2/e`, `/system/performance` ↔ `/api/v2/s/p`).

---

## 3. API-слой

### 3.1 GraphQL — витрина **[факт]**
- Эндпоинт `https://graphql.uzum.uz/` (есть ещё `graphql2.uzum.uz`, `graphql-dshop.uzum.uz`), клиент — Apollo.
- Реальные операции, вытащенные из бандла (по сути — контракт витрины):
  `ProductPage`, `ProductPage_Details`, `ProductPage_updated_prices`, `ProductPage_feedbackPhotosCount`,
  `MakeSearch_ItemsAndFilters`, `MakeSearch_Categories`, `GetTabs`, `Suggestions`, `Banners`,
  `Cart_Summary`, `Cart_Details`, `CartUpsale`, `CartCheckoutInformation`, `CartCheckoutInformation_permission`,
  `AddCartItems`, `SetCartItems`, `SynchronizeCart`,
  `Favorites_Summary`, `Favorites_Details`, `AddFavorite`, `RemoveFavorite`, `MergeFavorite`,
  `SaveFeedback`, `DisableReviewRequestModalBlock`.
- Паттерн: **разделение «summary» и «details»** (быстрый лёгкий запрос для шапки/бейджей + тяжёлый для контента),
  отдельный запрос на «свежие цены» — то есть тяжёлый ответ кэшируется, а цена/остаток догружаются отдельно. Это ключевой приём
  для маркетплейса с CDN-кэшем.
- Найден **GraphQL Hive** (`hive-api.infra.internal.daymarket.uz/artifacts/...`) — реестр схем.
  **[вывод]** GraphQL-шлюз федеративный: схему собирают из нескольких бэкенд-сабграфов, Hive следит за совместимостью и usage.
- Интроспекция извне закрыта, CORS ограничен **[факт]**.

### 3.2 REST — аккаунт, платежи, служебное **[факт]**
База: `https://api.uzum.uz/api`. Ошибки в формате
`{"payload":null,"errors":[{"code":"bad-request-001","message":"..."}],"timestamp":"2026-09-18T18:03:42.255264429","trace":"c25a21f2b5..."}`
— наносекундный `LocalDateTime` + 32-hex trace id ⇒ **Jackson + Spring Boot + distributed tracing (OTel/Sleuth)** **[вывод]**.

Видимые группы эндпоинтов:
- **Auth:** `/auth/phone`, `/auth/verify`, `/auth/password`, `/auth/reset_password`, `/auth/token`, `/auth/jwks`,
  `/auth/client_sessions`, `/auth/logout`, `/auth/phone_country_codes`, `/auth/estimate_password`
  ⇒ вход по телефону + OTP, JWT с **RS256 и публичным JWKS** (сервисы валидируют токен локально, без похода в auth),
  управление сессиями устройств.
- **Витрина/служебное:** `/main/root-categories`, `/main/promo-categories`, `/nav-bar/entry-point`, `/popup/active?installId=...`.
- **Заказы/платежи (из метрик):** `/v2/order/{orderId}/text`, `/payment/{orderId}/options`, `/user/order/{orderId}/receipt`,
  `/user/order/advice/{orderId}/pay`, `/user/order/advice/{orderId}/cancel`.
- Кастомные заголовки: `X-IID` (installId — идентификатор устройства/инсталла), `x-pseudo` (псевдо-юзер до логина),
  `x-context`, `x-experiments` (состав экспериментов), `x-sse-support`.

### 3.3 Картинки **[факт]**
Три сервиса: `images-uploader.uzum.uz` (внутреннее имя **louis**, загрузка с client-key), `images-gateway.uzum.uz`,
`images.uzum.uz` (отдача). URL вида `https://images.uzum.uz/<20-символьный id>/<preset>.jpg` — то есть **именованные пресеты
рендишенов**, а не произвольный ресайз по query. Плюс `static.uzum.uz` для промо-картинок и `/_ipx/` (Nuxt Image) для лендингов.

---

## 4. Бэкенд и инфраструктура

### 4.1 Стек **[источник: вакансии Uzum Technologies, Habr]**
- **Java / Kotlin + Spring Boot**, Hibernate/JPA, **Liquibase** для миграций.
- **PostgreSQL** (основная), местами Oracle (наследие/финтех).
- **Apache Kafka** — шина событий между сервисами (заказы, остатки, аналитика, рекомендации).
- **Redis** — кэш/очереди.
- **Go**, **Python**, **Scala** — отдельные сервисы (данные, интеграции, ML-сервинг).
- **Docker/Podman + Kubernetes**, GitLab CI, **EFK** (Elastic/Fluentd/Kibana) для логов, **Grafana + Prometheus** для метрик.
- Микросервисная архитектура, highload.

### 4.2 Периметр **[факт]**
- `server: ycalb` + куки `_yasc` ⇒ **Yandex Cloud Application Load Balancer**.
- **Yandex SmartCaptcha** на периметре: любой запрос без нормального браузерного отпечатка (curl, простой скрапер) улетает
  на `/tmgrdfrend/showcaptchafast` ⇒ антибот/антипарсинг защита конкурентного скрапинга цен.
- Внутренние кластеры: `*.infra.cluster.daymarket.uz`, `*.dev.cluster.daymarket.uz`, `api.dev.cluster.daymarket.uz`,
  `id.staging.daymarket.uz`, `id.staging.ufintech.uz` — т.е. контуры **dev / staging / prod** на отдельных доменах
  (`daymarket.uz` — историческое внутреннее имя компании, `ufintech.uz` — финтех-часть).

### 4.3 Поиск **[источник: Habr, статья про векторный поиск]**
- **Elasticsearch 8.x** с KNN.
- **Гибридный retrieval:** sparse (BM25 + `minimum_should_match`) ≈1000 товаров + dense (KNN) ≈200 ⇒ 1200 кандидатов на реранк.
- Эмбеддинги — **Google LaBSE** (мультиязычная модель), вектор **256 измерений**, текст собирается из названия на двух языках,
  описания и характеристик с маркерами `[UZ_TEXT]` / `[RU_TEXT]` — так решают узбекско-русский двуязычный поиск и опечатки.
- Индекс **HNSW (m=32, ef_construction=100)**.
- Финальный ранк — **LTR-модель**, косинусная близость как фича (у dense-кандидатов BM25-фичи нулевые).

### 4.4 Рекомендации **[источник: Habr]**
- Пайплайн: **Kafka → ClickHouse → Airflow (DAG) → Spark → S3 (модели/фичи) → PostgreSQL (готовые рекомендации)**.
- Три стадии: генерация кандидатов (item2item коллаборативная фильтрация + популярное) → ранжирование
  (**CatBoostRanker / LambdaMART**, метрика nDCG@100) → постобработка (диверсификация, отсев просмотренного).
- **Онлайн-слой** реагирует на последние K кликов пользователя за ~2 секунды, вставка похожих товаров по round-robin.
- Эффект: полка рекомендаций +22,4% выручки, на рекомендации приходится **21% общей выручки маркетплейса**.

---

## 5. Карта платформы (из Certificate Transparency — 119 поддоменов)

Это, по сути, схема доменов ответственности. Для вас — готовый чеклист «что придётся построить».

**Покупатель (B2C)**
`uzum.uz` · `graphql.uzum.uz`, `graphql2`, `graphql-dshop` · `api.uzum.uz`, `api-cache` · `id.uzum.uz` (SSO, узлы `u-01/u-02/w-01/w-02`)
· `pay.uzum.uz` · `loyalty` · `promo` · `notification` · `api-chat` (чат с продавцом/поддержкой) · `live`, `live2`,
`streamers-api`, `streamerce-api` (**live-commerce / стрим-продажи**) · `clicker`, `clicker-api` (геймификация) · `survey` · `forum`
· `academy`, `lms` (обучение) · `legal` · `images*`, `static`

**Продавец (B2B)**
`seller.uzum.uz`, `sellers`, `api-seller` · `business.uzum.uz`, `analytics.business`, `check.business` · `analytics-seller`
· `pim.uzum.uz` (**Product Information Management** — карточки/атрибуты/категории) · `tarification` (тарифы и комиссии)
· `crossborder` (трансграничные продавцы, Китай) · `devhub`, `api-devhub`, `devhub-admin` (**открытое API для продавцов**)
· `offline-price-collector` (сбор цен офлайн-рынка/конкурентов)

**Логистика и склад**
`wms.uzum.uz` + `core-wms`, `gateway-wms`, `classic-wms`, `wms-old`, `light1-wms`, `light2-wms` (облегчённые склады),
`api-wms`, `wms-oauth2`, `kibana-wms`, `wms-edgecenter` · `wms-courier`, `wms-courier-frontend` (приложение курьера)
· `dp` (delivery points / ПВЗ), `pop` (pickup point), `packing` · `lms` / `logistics` · `tezkor`, `tezkor-partner` (экспресс-доставка еды)

**Данные и внутренние инструменты**
`clickstream.uzum.uz` + отдельные потоки: `clickstream-market`, `-seller`, `-wms`, `-wms-courier`, `-wms-pickup-point`, `-clicker`
· `bi`, `bi-ops`, `bi-int`, `ods` (Operational Data Store) · `flags`, `gb` (GrowthBook) · `tolgee` (переводы)
· `admin`, `admin-frontend`, `front-admin` (бэкофис) · `beta.uzum.uz`

Отдельно замечено: **Bitrix24 CRM** (`/bitrix/rest/crm.item.list`) для обработки лидов продавцов — единственная «коробка» в контуре.

---

## 6. Что из этого стоит повторить, а что — нет

**Повторить (проверено временем и нагрузкой):**
1. **GraphQL для витрины + REST для транзакционного/аккаунта.** Витрина = много разных экранов из одних данных, GraphQL экономит круги.
   Платежи/заказы/авторизация — REST, проще аудит и идемпотентность.
2. **Split `summary` / `details` / `updated_prices`.** Тяжёлый контент карточки кэшируется агрессивно, цена и остаток — отдельным
   лёгким запросом. Без этого нельзя кэшировать карточку товара вообще.
3. **SSR для PDP/категорий/поиска.** Для маркетплейса SEO = основной бесплатный трафик. Nuxt/Next SSR + пресеты картинок.
4. **JWT RS256 + JWKS**, телефон + OTP как основной вход (для Узбекистана — единственный вменяемый вариант), управление сессиями устройств.
5. **Свой clickstream с первого дня** (`installId`/`x-iid`, псевдо-юзер до логина, экспозиции экспериментов). Без своего потока
   событий вы потом не построите ни рекомендации, ни нормальную аналитику — GA4 для этого не годится.
6. **Фича-флаги + A/B (GrowthBook self-hosted)** с самого начала, флаг в SSR и в мобилках.
7. **PIM как отдельный сервис.** Категории/атрибуты/варианты (SKU) — самая сложная часть каталога; если размажете по монолиту, потом не вытащите.
8. **Kafka как шина событий между заказом, складом, оплатой, аналитикой.** Это то, что позволяет складу и витрине жить независимо.
9. **Prometheus-метрики с шаблонизацией URL** (`/product/{id}`, а не сырой путь) — иначе кардинальность метрик убьёт мониторинг.
10. **Tolgee/аналог для переводов** — при uz/ru двуязычии ручные JSON быстро превращаются в ад.

**Не повторять / учесть как их боль:**
- Два поколения фронта одновременно (Vue 2 SPA + Nuxt 3) — вы стартуете с нуля, **берите сразу Nuxt 3/Next 15 SSR + монорепо со слоями**.
- Vuex/Vue 2 — мёртвый стек, только Pinia + Vue 3 (или React/Next, если команда сильнее в React).
- Отдельный стек на Uzum ID (Next.js) при Vue-маркете — следствие покупок/разных команд, а не осознанного выбора.
- `graphql2`, `wms-old`, `classic-wms`, `cilckstream-*` (опечатка в проде) — следы быстрого роста; закладывайте версионирование и нейминг сразу.

**Что реально определяет успех маркетплейса (порядок, в котором строить):**
каталог/PIM → поиск (сначала обычный Elastic BM25, векторный потом) → корзина/чекаут/платежи → кабинет продавца →
склад и логистика (WMS/ПВЗ) → аналитика и clickstream → рекомендации и ранжирование → реклама продавцов и промо.
Uzum'у на это потребовалось несколько лет и сотни инженеров — под «такой же маркетплейс» надо резать скоуп до первых трёх пунктов.

---

## 7. Источники
- Прямой фингерпринтинг: uzum.uz, seller.uzum.uz, id.uzum.uz (runtime-конфиги, бандлы, сетевые запросы, заголовки) — 18.09.2026.
- Certificate Transparency: crt.sh по `%.uzum.uz` (119 уникальных имён).
- Habr, блог Uzum: «Поиск без границ: путь к векторному поиску в Uzum Market» — https://habr.com/ru/companies/uzum/articles/816773/
- Habr, блог Uzum: «От данных к действиям: как мы создавали рекомендации на главной странице Uzum Market» — https://habr.com/ru/companies/uzum/articles/884328/
- Вакансии Uzum Technologies (hh.ru, people.uzum.com, career.habr.com) — стек бэкенда и мобильной разработки.
