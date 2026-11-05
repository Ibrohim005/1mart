import type { Category } from '#shared/types/catalog'
import type { MockLocale } from './facets'

/**
 * Названия категорий на узбекском (латиница/кириллица) и английском.
 * Русские названия живут в дереве категорий (data.ts); каракалпакский
 * интерфейс получает узбекскую латиницу (mockLocale сводит kaa → uz).
 */
type Tr = { uz: string, 'uz-cyrl': string, en: string }
const T: Record<string, Tr> = {
  'elektronika': { uz: 'Elektronika', 'uz-cyrl': 'Электроника', en: 'Electronics' },
  'smartfony': { uz: 'Smartfonlar', 'uz-cyrl': 'Смартфонлар', en: 'Smartphones' },
  'planshety': { uz: 'Planshetlar', 'uz-cyrl': 'Планшетлар', en: 'Tablets' },
  'noutbuki': { uz: 'Noutbuklar', 'uz-cyrl': 'Ноутбуклар', en: 'Laptops' },
  'aksessuary-dlya-telefonov': { uz: 'Telefon aksessuarlari', 'uz-cyrl': 'Телефон аксессуарлари', en: 'Phone accessories' },
  'naushniki': { uz: 'Quloqchinlar', 'uz-cyrl': 'Қулоқчинлар', en: 'Headphones' },
  'umnye-chasy': { uz: 'Aqlli soatlar', 'uz-cyrl': 'Ақлли соатлар', en: 'Smartwatches' },
  'foto-i-video': { uz: 'Foto va video', 'uz-cyrl': 'Фото ва видео', en: 'Photo & video' },
  'bytovaya-tehnika': { uz: 'Maishiy texnika', 'uz-cyrl': 'Маиший техника', en: 'Home appliances' },
  'kuhonnaya-tehnika': { uz: 'Oshxona texnikasi', 'uz-cyrl': 'Ошхона техникаси', en: 'Kitchen appliances' },
  'umnyy-dom': { uz: 'Aqlli uy', 'uz-cyrl': 'Ақлли уй', en: 'Smart home' },
  'odezhda': { uz: 'Kiyim', 'uz-cyrl': 'Кийим', en: 'Clothing' },
  'platya': { uz: "Ayollar ko'ylaklari", 'uz-cyrl': 'Аёллар кўйлаклари', en: "Women's dresses" },
  'kostyumy-i-yubki': { uz: 'Kostyumlar va yubkalar', 'uz-cyrl': 'Костюмлар ва юбкалар', en: 'Suits & skirts' },
  'muzhskaya-odezhda': { uz: 'Erkaklar kiyimi', 'uz-cyrl': 'Эркаклар кийими', en: "Men's clothing" },
  'obuv': { uz: 'Poyabzal', 'uz-cyrl': 'Пойабзал', en: 'Shoes' },
  'krossovki': { uz: 'Krossovka va kedlar', 'uz-cyrl': 'Кроссовка ва кедлар', en: 'Sneakers' },
  'zhenskie-tufli': { uz: 'Ayollar tuflisi', 'uz-cyrl': 'Аёллар туфлиси', en: "Women's heels" },
  'povsednevnaya-obuv': { uz: 'Kundalik poyabzal', 'uz-cyrl': 'Кундалик пойабзал', en: 'Casual shoes' },
  'domashnyaya-obuv': { uz: 'Uy poyabzali', 'uz-cyrl': 'Уй пойабзали', en: 'Slippers' },
  'butsy': { uz: 'Sport poyabzali', 'uz-cyrl': 'Спорт пойабзали', en: 'Sports shoes' },
  'aksessuary': { uz: 'Aksessuarlar', 'uz-cyrl': 'Аксессуарлар', en: 'Accessories' },
  'sumki': { uz: 'Sumka va ryukzaklar', 'uz-cyrl': 'Сумка ва рюкзаклар', en: 'Bags & backpacks' },
  'chasy': { uz: 'Soatlar', 'uz-cyrl': 'Соатлар', en: 'Watches' },
  'ukrasheniya': { uz: 'Taqinchoqlar', 'uz-cyrl': 'Тақинчоқлар', en: 'Jewellery' },
  'ochki': { uz: "Ko'zoynaklar", 'uz-cyrl': 'Кўзойнаклар', en: 'Sunglasses' },
  'krasota-i-uhod': { uz: "Go'zallik va parvarish", 'uz-cyrl': 'Гўзаллик ва парвариш', en: 'Beauty & care' },
  'dekorativnaya-kosmetika': { uz: 'Kosmetika', 'uz-cyrl': 'Косметика', en: 'Makeup' },
  'manikyur': { uz: 'Manikyur', 'uz-cyrl': 'Маникюр', en: 'Nails' },
  'parfyumeriya': { uz: 'Atirlar', 'uz-cyrl': 'Атирлар', en: 'Fragrances' },
  'uhod-za-kozhey': { uz: 'Teri parvarishi', 'uz-cyrl': 'Тери парвариши', en: 'Skin care' },
  'uhod-za-telom': { uz: 'Tana parvarishi', 'uz-cyrl': 'Тана парвариши', en: 'Body care' },
  'dom-i-sad': { uz: "Uy va bog'", 'uz-cyrl': 'Уй ва боғ', en: 'Home & garden' },
  'mebel': { uz: 'Mebel', 'uz-cyrl': 'Мебель', en: 'Furniture' },
  'dekor': { uz: 'Dekor', 'uz-cyrl': 'Декор', en: 'Decor' },
  'osveschenie': { uz: 'Yoritish', 'uz-cyrl': 'Ёритиш', en: 'Lighting' },
  'posuda': { uz: 'Idish-tovoq', 'uz-cyrl': 'Идиш-товоқ', en: 'Tableware' },
  'kuhonnye-prinadlezhnosti': { uz: 'Oshxona anjomlari', 'uz-cyrl': 'Ошхона анжомлари', en: 'Kitchen tools' },
  'kastryuli-i-skovorody': { uz: 'Qozon va tovalar', 'uz-cyrl': 'Қозон ва товалар', en: 'Pots & pans' },
  'hozyaystvennye-tovary': { uz: "Xo'jalik mollari", 'uz-cyrl': 'Хўжалик моллари', en: 'Household goods' },
  'detskie-tovary': { uz: 'Bolalar mahsulotlari', 'uz-cyrl': 'Болалар маҳсулотлари', en: 'Kids' },
  'detskaya-odezhda': { uz: 'Bolalar kiyimi', 'uz-cyrl': 'Болалар кийими', en: "Kids' clothing" },
  'igrushki-i-myachi': { uz: "O'yinchoqlar va to'plar", 'uz-cyrl': 'Ўйинчоқлар ва тўплар', en: 'Toys & balls' },
  'dlya-shkoly': { uz: 'Maktab uchun', 'uz-cyrl': 'Мактаб учун', en: 'For school' },
  'sport-i-otdyh': { uz: 'Sport va dam olish', 'uz-cyrl': 'Спорт ва дам олиш', en: 'Sports & outdoors' },
  'komandnye-igry': { uz: "Jamoaviy o'yinlar", 'uz-cyrl': 'Жамоавий ўйинлар', en: 'Team sports' },
  'tennis-i-badminton': { uz: 'Tennis va badminton', 'uz-cyrl': 'Теннис ва бадминтон', en: 'Tennis & badminton' },
  'golf': { uz: 'Golf', 'uz-cyrl': 'Гольф', en: 'Golf' },
  'beysbol-i-kriket': { uz: 'Beysbol va kriket', 'uz-cyrl': 'Бейсбол ва крикет', en: 'Baseball & cricket' },
  'sportivnoe-pitanie': { uz: 'Sport ovqatlanishi', 'uz-cyrl': 'Спорт овқатланиши', en: 'Sports nutrition' },
  'avtotovary': { uz: 'Avtomahsulotlar', 'uz-cyrl': 'Автомаҳсулотлар', en: 'Automotive' },
  'avtomobili': { uz: 'Avtomobillar', 'uz-cyrl': 'Автомобиллар', en: 'Cars' },
  'mototsikly': { uz: 'Mototsikllar', 'uz-cyrl': 'Мотоцикллар', en: 'Motorcycles' },
  'skutery': { uz: 'Skuterlar', 'uz-cyrl': 'Скутерлар', en: 'Scooters' },
  'produkty-pitaniya': { uz: 'Oziq-ovqat', 'uz-cyrl': 'Озиқ-овқат', en: 'Groceries' },
  'frukty-i-yagody': { uz: 'Meva va rezavorlar', 'uz-cyrl': 'Мева ва резаворлар', en: 'Fruits & berries' },
  'ovoschi': { uz: 'Sabzavotlar', 'uz-cyrl': 'Сабзавотлар', en: 'Vegetables' },
  'myaso-i-ryba': { uz: "Go'sht va baliq", 'uz-cyrl': 'Гўшт ва балиқ', en: 'Meat & fish' },
  'molochnye-produkty-i-yaytsa': { uz: 'Sut mahsulotlari va tuxum', 'uz-cyrl': 'Сут маҳсулотлари ва тухум', en: 'Dairy & eggs' },
  'napitki': { uz: 'Ichimliklar', 'uz-cyrl': 'Ичимликлар', en: 'Drinks' },
  'bakaleya': { uz: 'Bakaleya', 'uz-cyrl': 'Бакалея', en: 'Pantry' },
  'vse': { uz: 'Barcha turkumlar', 'uz-cyrl': 'Барча туркумлар', en: 'All categories' },
}

export function categoryTitle(slug: string, fallback: string, locale: MockLocale): string {
  if (locale === 'ru') return fallback
  return T[slug]?.[locale] ?? fallback
}

/** Копия дерева с названиями на языке запроса (исходный массив не трогаем). */
export function localizeCategories(list: Category[], locale: MockLocale): Category[] {
  if (locale === 'ru') return list
  return list.map(c => ({
    ...c,
    title: categoryTitle(c.slug, c.title, locale),
    children: c.children?.map(ch => ({ ...ch, title: categoryTitle(ch.slug, ch.title, locale) })),
  }))
}
