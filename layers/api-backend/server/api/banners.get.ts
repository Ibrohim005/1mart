import type { Banner, BannerTone } from '#shared/types/catalog'
import { money } from '../lib/money'

/**
 * Баннеры главной — `GET /common/banners/` (BannerListView + BannerSerializer).
 *
 * Это именно `apps.common.models.Banner`, а НЕ `apps.shop.models.ShopCampaign`.
 * Похожи они только словом «акция»: в докстроке ShopCampaign прямо написано
 * «Not the same thing as apps.common.models.Banner — Banner is a single
 * clickable promotional tile/link, this is a countdown-timed section populated
 * with real ShopProduct cards». Фронту здесь нужна именно плитка-ссылка:
 * HeroCarousel и PromoBanners рисуют картинку и ведут по `link`, а полки с
 * товарами и таймером собираются отдельным роутом /products/shelf.
 *
 * Какое `placement`: у баннера на бэкенде четыре площадки, и `carousel`
 * (значение по умолчанию) — это карусель классифайда zooelon.uz, а не
 * витрины. Этому фронту нужны ровно две, обе подписаны в модели дословно
 * как «Zoo Market»: `SHOP_CAROUSEL` — «bosh sahifasi yuqorisidagi karusel»
 * (HeroCarousel), `SHOP_PLATFORM` — «bandi (keng)» (PromoBanners, ряд
 * ниже). Это два независимых набора баннеров, каждый со своей картинкой и
 * своей ссылкой — HeroCarousel и PromoBanners раньше рисовали ОДИН и тот же
 * список дважды (второй раз обрезая карусельные картинки под свою плитку),
 * из-за чего плитка №3 в ряду промо всегда дублировала баннер №1 вместо
 * показа настоящего третьего. Без явного параметра бэкенд молча отдал бы
 * чужие баннеры (карусель классифайда), поэтому параметр обязателен, а не
 * опционален — маршрут явно проверяет, что значение одно из двух ожидаемых.
 *
 * Пагинации у вьюхи нет (`pagination_class = None`) — приходит голый массив,
 * но разворачиваем через `items()`: гадать про пагинацию в этом проекте уже
 * ломало другие роуты.
 */
interface UpstreamBanner {
  id: string
  title: string
  subtitle: string
  image: string | null
  image_original: string | null
  banner_type: string
  placement: string
  link: string
  order: number
}

type ShopPlacement = 'shop_carousel' | 'shop_platform'

function shopPlacement(event: NitroEvent): ShopPlacement {
  const value = getQuery(event).placement
  return value === 'shop_platform' ? 'shop_platform' : 'shop_carousel'
}

export default defineEventHandler(async (event) => {
  // Accept-Language пробрасывает сам `upstream()`, и здесь это не формальность:
  // у Banner переведены title, subtitle, image И link
  // (apps/common/translations.py), то есть на другой локали меняются и
  // картинка, и адрес перехода, а не только подпись. Проверено на бою: uz и ru
  // отдают разные файлы артворка для одного и того же баннера, то есть
  // десятиминутный `cache_page` на вьюхе язык различает.
  const response = await upstream<unknown>(event, '/common/banners/', {
    query: { placement: shopPlacement(event) },
  })

  const banners = items<UpstreamBanner>(response).map((banner, index): Banner => ({
    // Фронт объявил id числом, у бэкенда это UUID. Поле используется только
    // ключом списка (`:key="`${banner.id}-${index}`"`), поэтому берём
    // порядковый номер — так же, как для отзывов в products/[slug].
    // Обрубок UUID до числа выглядел бы как настоящий идентификатор баннера.
    id: index + 1,
    title: banner.title,
    // Текст впечатан в картинку, поэтому компоненты дублируют его скрытым
    // блоком для поисковика и скринридера. У бэкенда это `subtitle`.
    description: banner.subtitle ?? '',
    // Ссылка приходит абсолютной («https://zooelon.uz/uz/search»,
    // «http://www.youtube.com/@Zooelon») и иногда пустой. Отдаём как есть:
    // `localePath()` возвращает строку с протоколом нетронутой
    // (hasProtocol(..., { acceptRelative: true }) в самом начале), а
    // NuxtLink сам распознаёт внешний адрес. Дописывать сюда origin витрины
    // было бы подменой: баннеры на бою ведут на другие сайты осознанно.
    link: banner.link ?? '',
    // Уже WebP-рендишн (BannerSerializer.get_image), а не исходный PNG:
    // на бою пять исходников весили 3.5 МБ.
    image: banner.image,
    // Отдельной маленькой версии у баннера нет: у бэкенда одна картинка на
    // площадку. Ряд промо-баннеров (529×214) режет её через object-fit: cover.
    imageSmall: banner.image,
    tone: tone(banner.banner_type),
    // Цены на баннере у бэкенда нет вовсе: в модели Banner только title,
    // subtitle, image, link, banner_type, placement, order. Мок раздавал
    // здесь выдуманные суммы и «-12%» — переносить их значило бы показать
    // покупателю цену, которой никто не назначал. Нули и пустые строки
    // компоненты не рисуют: ветка с ценой включается только когда картинки
    // нет, а картинка у баннера обязательная.
    oldPrice: money(0),
    price: money(0),
    discountLabel: '',
    until: '',
  }))

  return ok<Banner[]>(banners)
})

/**
 * Цвета у баннера на бэкенде нет. Поле `tone` — это CSS-класс подложки, и
 * под картинкой во всю плитку (object-fit: cover) его вообще не видно;
 * пустым его оставить нельзя — тип допускает только два значения. Берём
 * настоящее поле `banner_type`, чтобы выбор был хотя бы детерминированным и
 * не прыгал между запросами: акция — тёплый, остальное — фиолетовый.
 */
function tone(bannerType: string): BannerTone {
  return bannerType === 'promo' ? 'orange' : 'violet'
}
