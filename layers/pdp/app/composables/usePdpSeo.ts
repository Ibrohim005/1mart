import type { Ref } from 'vue'
import type { Product } from '#shared/types/catalog'

/**
 * Метатеги и микроразметка карточки товара.
 *
 * Раньше это был компонент `PdpSeo` с шаблоном из одного HTML-комментария.
 * Комментарий в шаблоне живёт только на клиенте: SSR-компилятор Vue их
 * выбрасывает, поэтому на сервере у `.pdp` было пять детей, а на клиенте
 * шесть, и все секции ниже съезжали на один узел — страница целиком
 * перерисовывалась после гидратации, а консоль ругалась «Hydration node
 * mismatch». Композабл ничего не рисует и этой разницы создать не может.
 *
 * Товар приходит ссылкой и может быть пустым: страница открывается со
 * скелетоном, пока запрос едет. Все значения отдаём геттерами, поэтому теги
 * проставятся сами, как только товар появится.
 */
export function usePdpSeo(product: Ref<Product | null | undefined>) {
  const { t } = useI18n()
  // Подпись валюты берётся из словаря: у formatMoney вторым аргументом теперь
  // именно она, и передача сюда кода локали давала в заголовке «1 861 990 ru»
  const { money } = useMoney()

  useSeoMeta({
    title: () => (product.value
      ? t('seo.productTitle', { title: product.value.title, price: money(product.value.price) })
      : undefined),
    description: () => product.value?.description.slice(0, 160),
    ogImage: () => product.value?.images[0]?.url,
  })

  // og:type у карточки — product. В типах useSeoMeta такого значения нет,
  // поэтому ставим тег напрямую
  useHead({ meta: [{ property: 'og:type', content: 'product' }] })

  /**
   * Разметка товара. Три вещи были неверны для поисковика:
   * картинки шли относительными адресами, `brand` у всех товаров указывал на сам
   * маркетплейс, хотя продавцы разные, и не было артикула — по нему поисковик
   * связывает один товар в разных местах.
   */
  const siteUrl = useSiteConfig().url.replace(/\/$/, '')
  const absolute = (path: string) => (/^https?:/.test(path) ? path : `${siteUrl}${path}`)

  useSchemaOrg(computed(() => {
    const item = product.value
    if (!item) return []

    /** Артикул: у товара может быть несколько SKU, в разметку идёт выбранный по умолчанию */
    const sku = item.skus[0]?.id ?? item.id
    // Скрытого продавца не раскрываем и поисковику: продаёт сама площадка
    const seller = item.seller
      ? { '@type': 'Organization', 'name': item.seller.title, 'url': absolute(`/seller/${item.seller.slug}`) }
      : { '@type': 'Organization', 'name': 'spotshop', 'url': siteUrl }

    return [
      defineProduct({
        name: item.title,
        description: item.description,
        image: item.images.map(i => absolute(i.url)),
        sku: String(sku),
        brand: seller,
        aggregateRating: {
          ratingValue: item.rating,
          reviewCount: item.reviewsCount,
        },
        offers: {
          price: (item.price.amount / 100).toFixed(0),
          priceCurrency: 'UZS',
          availability: item.available ? 'InStock' : 'OutOfStock',
          url: absolute(`/product/${item.slug}`),
          seller,
        },
      }),
      defineBreadcrumb({
        itemListElement: [
          { name: t('breadcrumbs.home'), item: '/' },
          ...item.categoryPath.map(c => ({ name: c.title, item: `/category/${c.slug}` })),
          { name: item.title },
        ],
      }),
    ]
  }))
}
