/**
 * Каталог общих товаров 1mart.
 *
 * СГЕНЕРИРОВАНО один раз из публичного каталога DummyJSON
 * (https://dummyjson.com/products?limit=0): фотографии берутся прямо с
 * cdn.dummyjson.com, названия и описания переписаны на русском, цены —
 * в сумах (в тийины переводит mocks/data.ts). Во время работы ничего не
 * запрашивается — это статические данные мока.
 *
 * TODO: Connect to backend endpoint GET /products — настоящий каталог придёт с бэкенда.
 */

export interface RawGoods {
  id: number
  title: string
  description: string
  /** Слаг корневой категории */
  category: string
  /** Слаг подкатегории */
  subcategory: string
  brand: string
  /** Машинный код страны, подпись — в mocks/data.ts */
  country: string
  /** Машинный код цвета */
  color: string
  /** Машинный код материала */
  material?: string
  /** Варианты памяти — у смартфонов, планшетов и ноутбуков */
  memory?: string[]
  /** Размерная сетка — у одежды и обуви */
  sizes?: string[]
  /** Цена в сумах */
  price: number
  /** Цена до скидки в сумах; null — скидки нет */
  oldPrice: number | null
  rating: number
  reviews: number
  orders: number
  stock: number
  /** Через сколько дней доставка */
  deliveryDays: number
  images: string[]
  thumbnail: string
  /** Дополнительные характеристики: [название, значение, галочка?] */
  attributes: Array<[string, string] | [string, string, boolean]>
  /** Синонимы для поиска: «телефон» у смартфонов, «духи» у парфюмерии */
  keywords: string
}

export const CATALOG_GOODS: RawGoods[] = [
  {
    "id": 1001,
    "title": "Тушь для ресниц Essence Lash Princess, объём и удлинение",
    "description": "Тушь с коническим силиконовым аппликатором разделяет и подкручивает каждую ресницу. Даёт заметный объём и длину без комочков. Стойкая формула держится весь день и не осыпается.",
    "category": "krasota-i-uhod",
    "subcategory": "dekorativnaya-kosmetika",
    "brand": "Essence",
    "country": "germany",
    "color": "black",
    "price": 69000,
    "oldPrice": null,
    "rating": 4,
    "reviews": 40,
    "orders": 93,
    "stock": 99,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "12 мл"
      ],
      [
        "Эффект",
        "Объём и удлинение"
      ],
      [
        "Гарантия",
        "1 неделя"
      ]
    ],
    "keywords": "тушь косметика макияж"
  },
  {
    "id": 1002,
    "title": "Палетка теней для век Glamour Beauty с зеркалом, 12 оттенков",
    "description": "Двенадцать матовых и мерцающих оттенков — от нюдовых до вечерних. Тени плотно ложатся, легко растушёвываются и не скатываются. Встроенное зеркало удобно брать с собой.",
    "category": "krasota-i-uhod",
    "subcategory": "dekorativnaya-kosmetika",
    "brand": "Glamour Beauty",
    "country": "korea",
    "color": "multi",
    "price": 149000,
    "oldPrice": 182000,
    "rating": 4.1,
    "reviews": 77,
    "orders": 146,
    "stock": 34,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp",
    "attributes": [
      [
        "Количество оттенков",
        "12"
      ],
      [
        "Финиш",
        "Матовый и мерцающий"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "тени палетка макияж косметика"
  },
  {
    "id": 1003,
    "title": "Рассыпчатая пудра Velvet Touch, матирующая",
    "description": "Невесомая рассыпчатая пудра фиксирует тональное средство и убирает жирный блеск. Не забивает поры и не подчёркивает шелушения. В комплекте мягкая пуховка.",
    "category": "krasota-i-uhod",
    "subcategory": "dekorativnaya-kosmetika",
    "brand": "Velvet Touch",
    "country": "france",
    "color": "beige",
    "price": 119000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 114,
    "orders": 199,
    "stock": 89,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/beauty/powder-canister/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "20 г"
      ],
      [
        "Тип кожи",
        "Для всех типов"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "пудра косметика макияж"
  },
  {
    "id": 1004,
    "title": "Помада для губ Chic Cosmetics, классический красный",
    "description": "Кремовая помада насыщенного красного оттенка с полуматовым финишем. Масло ши и витамин E ухаживают за губами и не сушат их. Цвет держится до шести часов.",
    "category": "krasota-i-uhod",
    "subcategory": "dekorativnaya-kosmetika",
    "brand": "Chic Cosmetics",
    "country": "italy",
    "color": "red",
    "price": 89000,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 151,
    "orders": 252,
    "stock": 91,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/beauty/red-lipstick/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp",
    "attributes": [
      [
        "Финиш",
        "Полуматовый"
      ],
      [
        "Вес",
        "3.5 г"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "помада губы косметика макияж"
  },
  {
    "id": 1005,
    "title": "Лак для ногтей Nail Couture, красный глянцевый",
    "description": "Яркий красный лак с глянцевым блеском, как после салона. Широкая кисть закрашивает ноготь в один-два слоя. Сохнет за пять минут и не скалывается до недели.",
    "category": "krasota-i-uhod",
    "subcategory": "manikyur",
    "brand": "Nail Couture",
    "country": "usa",
    "color": "red",
    "price": 59000,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 188,
    "orders": 305,
    "stock": 79,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "10 мл"
      ],
      [
        "Финиш",
        "Глянцевый"
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "лак ногти маникюр"
  },
  {
    "id": 1006,
    "title": "Туалетная вода Calvin Klein CK One, унисекс, 100 мл",
    "description": "Культовый свежий аромат для него и для неё. Цитрусовые ноты бергамота и лимона раскрываются зелёным чаем и мускусом. Подходит на каждый день, в любое время года.",
    "category": "krasota-i-uhod",
    "subcategory": "parfyumeriya",
    "brand": "Calvin Klein",
    "country": "usa",
    "color": "white",
    "material": "glass",
    "price": 690000,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 225,
    "orders": 358,
    "stock": 29,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/1.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/2.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "100 мл"
      ],
      [
        "Тип",
        "Туалетная вода"
      ],
      [
        "Для кого",
        "Унисекс"
      ],
      [
        "Гарантия",
        "1 неделя"
      ]
    ],
    "keywords": "духи парфюм аромат туалетная вода atir"
  },
  {
    "id": 1007,
    "title": "Парфюмерная вода Chanel Coco Noir, 100 мл",
    "description": "Глубокий восточный аромат для вечерних выходов. Бергамот и грейпфрут в начале, роза и жасмин в сердце, пачули и ваниль в шлейфе. Стойкость — до десяти часов.",
    "category": "krasota-i-uhod",
    "subcategory": "parfyumeriya",
    "brand": "Chanel",
    "country": "france",
    "color": "black",
    "material": "glass",
    "price": 2390000,
    "oldPrice": 2880000,
    "rating": 4.7,
    "reviews": 262,
    "orders": 411,
    "stock": 58,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/1.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/2.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "100 мл"
      ],
      [
        "Тип",
        "Парфюмерная вода"
      ],
      [
        "Для кого",
        "Женский"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "духи парфюм аромат atir"
  },
  {
    "id": 1008,
    "title": "Парфюмерная вода Dior J'adore, 100 мл",
    "description": "Цветочный букет из иланг-иланга, дамасской розы и жасмина самбак. Аромат женственный, светлый и узнаваемый с первой ноты. Флакон в форме амфоры станет украшением туалетного столика.",
    "category": "krasota-i-uhod",
    "subcategory": "parfyumeriya",
    "brand": "Dior",
    "country": "france",
    "color": "gold",
    "material": "glass",
    "price": 1890000,
    "oldPrice": 2220000,
    "rating": 4.5,
    "reviews": 299,
    "orders": 464,
    "stock": 98,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/fragrances/dior-j%27adore/1.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/dior-j%27adore/2.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/dior-j%27adore/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/fragrances/dior-j%27adore/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "100 мл"
      ],
      [
        "Тип",
        "Парфюмерная вода"
      ],
      [
        "Для кого",
        "Женский"
      ],
      [
        "Гарантия",
        "1 неделя"
      ]
    ],
    "keywords": "духи парфюм аромат atir"
  },
  {
    "id": 1009,
    "title": "Парфюмерная вода Dolce & Gabbana Dolce Shine, 75 мл",
    "description": "Солнечный фруктово-цветочный аромат с манго, жасмином и белым мускусом. Лёгкий и игривый — для дня, прогулок и отпуска. Яркий флакон с золотыми гранями.",
    "category": "krasota-i-uhod",
    "subcategory": "parfyumeriya",
    "brand": "Dolce & Gabbana",
    "country": "italy",
    "color": "yellow",
    "material": "glass",
    "price": 1090000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 336,
    "orders": 517,
    "stock": 4,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/1.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/2.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "75 мл"
      ],
      [
        "Тип",
        "Парфюмерная вода"
      ],
      [
        "Для кого",
        "Женский"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "духи парфюм аромат atir"
  },
  {
    "id": 1010,
    "title": "Парфюмерная вода Gucci Bloom, 100 мл",
    "description": "Аромат, вдохновлённый цветущим садом: тубероза, жасмин и редкая ранкуния. Насыщенный, но не тяжёлый, раскрывается на коже весь день. Классика современной парфюмерии.",
    "category": "krasota-i-uhod",
    "subcategory": "parfyumeriya",
    "brand": "Gucci",
    "country": "italy",
    "color": "pink",
    "material": "glass",
    "price": 1490000,
    "oldPrice": 1730000,
    "rating": 4.1,
    "reviews": 373,
    "orders": 570,
    "stock": 91,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/1.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/2.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "100 мл"
      ],
      [
        "Тип",
        "Парфюмерная вода"
      ],
      [
        "Для кого",
        "Женский"
      ],
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "духи парфюм аромат atir"
  },
  {
    "id": 1011,
    "title": "Кровать двуспальная Annibale Colombo, 160×200 см",
    "description": "Итальянская кровать с мягким изголовьем в обивке из натуральной кожи. Каркас из массива бука выдерживает до 300 кг. Матрас и бельё в комплект не входят.",
    "category": "dom-i-sad",
    "subcategory": "mebel",
    "brand": "Annibale Colombo",
    "country": "italy",
    "color": "beige",
    "material": "leather",
    "price": 23900000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 410,
    "orders": 623,
    "stock": 88,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/1.webp",
      "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/2.webp",
      "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp",
    "attributes": [
      [
        "Размер спального места",
        "160×200 см"
      ],
      [
        "Каркас",
        "Массив бука"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "кровать мебель спальня"
  },
  {
    "id": 1012,
    "title": "Диван трёхместный Annibale Colombo, кожаный",
    "description": "Просторный диван ручной работы с глубокой посадкой и пухлыми подушками. Обивка из мягкой итальянской кожи, ножки из полированного металла. Подойдёт для гостиной в классическом и современном стиле.",
    "category": "dom-i-sad",
    "subcategory": "mebel",
    "brand": "Annibale Colombo",
    "country": "italy",
    "color": "brown",
    "material": "leather",
    "price": 31500000,
    "oldPrice": 36630000,
    "rating": 4.6,
    "reviews": 27,
    "orders": 676,
    "stock": 60,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/1.webp",
      "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/2.webp",
      "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp",
    "attributes": [
      [
        "Ширина",
        "230 см"
      ],
      [
        "Количество мест",
        "3"
      ],
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "диван мебель гостиная"
  },
  {
    "id": 1013,
    "title": "Прикроватная тумба из африканской вишни, 2 ящика",
    "description": "Компактная тумба из массива с тёплой текстурой дерева. Два выдвижных ящика на доводчиках закрываются бесшумно. Покрыта защитным маслом, не боится влаги.",
    "category": "dom-i-sad",
    "subcategory": "mebel",
    "brand": "Furniture Co.",
    "country": "turkey",
    "color": "brown",
    "material": "wood",
    "price": 3790000,
    "oldPrice": 4680000,
    "rating": 4.1,
    "reviews": 64,
    "orders": 729,
    "stock": 64,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/1.webp",
      "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/2.webp",
      "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp",
    "attributes": [
      [
        "Размеры",
        "50×40×55 см"
      ],
      [
        "Количество ящиков",
        "2"
      ],
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "тумба мебель спальня"
  },
  {
    "id": 1014,
    "title": "Офисное кресло Knoll Saarinen Executive",
    "description": "Дизайнерское кресло руководителя с мягким сиденьем и подлокотниками. Поворотная база на колёсиках и газлифт для регулировки высоты. Обивка из износостойкой ткани.",
    "category": "dom-i-sad",
    "subcategory": "mebel",
    "brand": "Knoll",
    "country": "usa",
    "color": "red",
    "material": "textile",
    "price": 6290000,
    "oldPrice": null,
    "rating": 5,
    "reviews": 101,
    "orders": 782,
    "stock": 26,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/1.webp",
      "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/2.webp",
      "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/thumbnail.webp",
    "attributes": [
      [
        "Максимальная нагрузка",
        "120 кг"
      ],
      [
        "Регулировка высоты",
        "Есть"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "кресло стул офис мебель"
  },
  {
    "id": 1015,
    "title": "Тумба под раковину с зеркалом Bath Trends, дерево",
    "description": "Комплект для ванной: тумба из влагостойкого дерева с раковиной и зеркало в раме. Внутри — вместительная полка для бытовой химии. Смеситель приобретается отдельно.",
    "category": "dom-i-sad",
    "subcategory": "mebel",
    "brand": "Bath Trends",
    "country": "turkey",
    "color": "brown",
    "material": "wood",
    "price": 9990000,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 138,
    "orders": 835,
    "stock": 7,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/1.webp",
      "https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/2.webp",
      "https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/thumbnail.webp",
    "attributes": [
      [
        "Ширина",
        "80 см"
      ],
      [
        "Комплектация",
        "Тумба, раковина, зеркало"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "ванная раковина мебель зеркало"
  },
  {
    "id": 1016,
    "title": "Яблоки красные сладкие, 1 кг",
    "description": "Сочные хрустящие яблоки нового урожая из садов Ферганской долины. Сладкие, с лёгкой кислинкой. Подходят для перекуса, выпечки и детского меню.",
    "category": "produkty-pitaniya",
    "subcategory": "frukty-i-yagody",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "red",
    "price": 18000,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 175,
    "orders": 888,
    "stock": 8,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/apple/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "1 кг"
      ]
    ],
    "keywords": "яблоко фрукты olma"
  },
  {
    "id": 1017,
    "title": "Стейк говяжий рибай охлаждённый, 500 г",
    "description": "Мраморная говядина от бычков зернового откорма. Стейк толщиной 3 см — идеален для гриля и сковороды. Поставляется в вакуумной упаковке, хранится до 7 дней.",
    "category": "produkty-pitaniya",
    "subcategory": "myaso-i-ryba",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "red",
    "price": 129000,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 212,
    "orders": 941,
    "stock": 86,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/beef-steak/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/beef-steak/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "500 г"
      ],
      [
        "Условия хранения",
        "0…+4 °C"
      ]
    ],
    "keywords": "мясо говядина стейк go'sht"
  },
  {
    "id": 1019,
    "title": "Филе куриное охлаждённое, 1 кг",
    "description": "Нежное филе грудки без кожи и костей. Птица выращена без гормонов роста. Подходит для запекания, плова и диетического питания.",
    "category": "produkty-pitaniya",
    "subcategory": "myaso-i-ryba",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "white",
    "price": 52000,
    "oldPrice": 60000,
    "rating": 4.3,
    "reviews": 286,
    "orders": 1047,
    "stock": 97,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/chicken-meat/1.webp",
      "https://cdn.dummyjson.com/product-images/groceries/chicken-meat/2.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/chicken-meat/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "1 кг"
      ],
      [
        "Условия хранения",
        "0…+4 °C"
      ]
    ],
    "keywords": "курица мясо филе tovuq"
  },
  {
    "id": 1020,
    "title": "Масло подсолнечное рафинированное, 1 л",
    "description": "Рафинированное дезодорированное масло без запаха. Подходит для жарки, выпечки и заправки салатов. Не пенится и не дымит при нагреве.",
    "category": "produkty-pitaniya",
    "subcategory": "bakaleya",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "yellow",
    "price": 24000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 323,
    "orders": 1100,
    "stock": 10,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/cooking-oil/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/cooking-oil/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "1 л"
      ]
    ],
    "keywords": "масло бакалея yog'"
  },
  {
    "id": 1023,
    "title": "Яйца куриные отборные С0, 10 шт",
    "description": "Крупные свежие яйца от кур свободного выгула. Яркий желток и плотный белок. Дата сбора указана на упаковке.",
    "category": "produkty-pitaniya",
    "subcategory": "molochnye-produkty-i-yaytsa",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "white",
    "price": 19000,
    "oldPrice": null,
    "rating": 4,
    "reviews": 14,
    "orders": 1259,
    "stock": 9,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/eggs/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/eggs/thumbnail.webp",
    "attributes": [
      [
        "Количество",
        "10 шт"
      ],
      [
        "Категория",
        "С0"
      ]
    ],
    "keywords": "яйца tuxum"
  },
  {
    "id": 1024,
    "title": "Стейк из сёмги охлаждённый, 400 г",
    "description": "Стейки атлантической сёмги с плотным розовым мясом. Богаты Омега-3 и белком. Готовятся на гриле или в духовке за 15 минут.",
    "category": "produkty-pitaniya",
    "subcategory": "myaso-i-ryba",
    "brand": "Green Field",
    "country": "russia",
    "color": "pink",
    "price": 149000,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 51,
    "orders": 1312,
    "stock": 74,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/fish-steak/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/fish-steak/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "400 г"
      ],
      [
        "Условия хранения",
        "0…+2 °C"
      ]
    ],
    "keywords": "рыба сёмга лосось baliq"
  },
  {
    "id": 1027,
    "title": "Мёд цветочный натуральный, 500 г",
    "description": "Густой мёд с горных пасек Ташкентской области. Собран с разнотравья, не нагревался и не разбавлялся. Подходит к чаю, выпечке и для здорового перекуса.",
    "category": "produkty-pitaniya",
    "subcategory": "bakaleya",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "yellow",
    "material": "glass",
    "price": 69000,
    "oldPrice": 80000,
    "rating": 4.6,
    "reviews": 162,
    "orders": 1471,
    "stock": 34,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/honey-jar/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/honey-jar/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "500 г"
      ]
    ],
    "keywords": "мёд asal бакалея"
  },
  {
    "id": 1028,
    "title": "Мороженое пломбир ассорти, 4 вкуса",
    "description": "Сливочный пломбир на натуральном молоке в четырёх вкусах: ваниль, шоколад, клубника и фисташка. Без растительных жиров. Набор порадует всю семью.",
    "category": "produkty-pitaniya",
    "subcategory": "molochnye-produkty-i-yaytsa",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "multi",
    "price": 29000,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 199,
    "orders": 1524,
    "stock": 27,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/ice-cream/1.webp",
      "https://cdn.dummyjson.com/product-images/groceries/ice-cream/2.webp",
      "https://cdn.dummyjson.com/product-images/groceries/ice-cream/3.webp",
      "https://cdn.dummyjson.com/product-images/groceries/ice-cream/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/ice-cream/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "4 × 80 г"
      ]
    ],
    "keywords": "мороженое десерт muzqaymoq"
  },
  {
    "id": 1029,
    "title": "Сок апельсиновый 100%, 1 л",
    "description": "Сок прямого отжима из спелых апельсинов без добавления сахара. Богат витамином C. После вскрытия хранить в холодильнике не более трёх дней.",
    "category": "produkty-pitaniya",
    "subcategory": "napitki",
    "brand": "Green Field",
    "country": "turkey",
    "color": "yellow",
    "price": 21000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 236,
    "orders": 1577,
    "stock": 50,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/juice/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/juice/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "1 л"
      ]
    ],
    "keywords": "сок напиток sharbat"
  },
  {
    "id": 1030,
    "title": "Киви свежие, 1 кг",
    "description": "Спелые киви с мягкой сладкой мякотью. Один плод покрывает дневную норму витамина C. Отличны для смузи, десертов и завтраков.",
    "category": "produkty-pitaniya",
    "subcategory": "frukty-i-yagody",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "green",
    "price": 32000,
    "oldPrice": 38000,
    "rating": 5,
    "reviews": 273,
    "orders": 1630,
    "stock": 99,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/kiwi/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/kiwi/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "1 кг"
      ]
    ],
    "keywords": "киви фрукты"
  },
  {
    "id": 1032,
    "title": "Молоко пастеризованное 3.2%, 1 л",
    "description": "Натуральное коровье молоко от местных ферм. Пастеризовано бережно — сохраняет вкус и пользу. Для каши, кофе и выпечки.",
    "category": "produkty-pitaniya",
    "subcategory": "molochnye-produkty-i-yaytsa",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "white",
    "price": 13000,
    "oldPrice": 15000,
    "rating": 4,
    "reviews": 347,
    "orders": 1736,
    "stock": 27,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/milk/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/milk/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "1 л"
      ],
      [
        "Жирность",
        "3.2%"
      ]
    ],
    "keywords": "молоко sut молочные"
  },
  {
    "id": 1033,
    "title": "Шелковица (тут) свежая, 500 г",
    "description": "Сладкая чёрная шелковица, собранная утром в день доставки. Нежная ягода, поэтому упакована в жёсткий контейнер. Вкусна свежей и в компотах.",
    "category": "produkty-pitaniya",
    "subcategory": "frukty-i-yagody",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "purple",
    "price": 25000,
    "oldPrice": null,
    "rating": 5,
    "reviews": 384,
    "orders": 1789,
    "stock": 99,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/mulberry/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/mulberry/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "500 г"
      ]
    ],
    "keywords": "шелковица тут ягоды tut"
  },
  {
    "id": 1034,
    "title": "Кофе растворимый Nescafe Classic, 190 г",
    "description": "Классический растворимый кофе с насыщенным вкусом и ароматом. Удобная стеклянная банка с плотной крышкой. Из одной банки выходит около 100 чашек.",
    "category": "produkty-pitaniya",
    "subcategory": "napitki",
    "brand": "Nescafe",
    "country": "russia",
    "color": "brown",
    "material": "glass",
    "price": 89000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 421,
    "orders": 1842,
    "stock": 57,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "190 г"
      ]
    ],
    "keywords": "кофе qahva напиток"
  },
  {
    "id": 1035,
    "title": "Картофель молодой, 1 кг",
    "description": "Молодой картофель с тонкой кожурой из Самаркандской области. Хорошо разваривается и подходит для пюре, жарки и супов. Мытый, без земли.",
    "category": "produkty-pitaniya",
    "subcategory": "ovoschi",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "yellow",
    "price": 7000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 38,
    "orders": 1895,
    "stock": 13,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/potatoes/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/potatoes/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "1 кг"
      ]
    ],
    "keywords": "картошка овощи kartoshka"
  },
  {
    "id": 1036,
    "title": "Протеин сывороточный, ваниль, 900 г",
    "description": "Сывороточный протеин для набора мышечной массы и восстановления после тренировок. 24 г белка в порции. Легко растворяется в воде и молоке.",
    "category": "sport-i-otdyh",
    "subcategory": "sportivnoe-pitanie",
    "brand": "ProSport",
    "country": "usa",
    "color": "white",
    "material": "plastic",
    "price": 289000,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 75,
    "orders": 1948,
    "stock": 80,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/protein-powder/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/protein-powder/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "900 г"
      ],
      [
        "Вкус",
        "Ваниль"
      ],
      [
        "Гарантия",
        "1 неделя"
      ]
    ],
    "keywords": "протеин спортпит спорт"
  },
  {
    "id": 1037,
    "title": "Лук красный, 1 кг",
    "description": "Сладкий красный лук для салатов и маринадов. Сочный, без горечи. Хорошо хранится в прохладном месте.",
    "category": "produkty-pitaniya",
    "subcategory": "ovoschi",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "purple",
    "price": 8000,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 112,
    "orders": 2001,
    "stock": 82,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/red-onions/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/red-onions/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "1 кг"
      ]
    ],
    "keywords": "лук овощи piyoz"
  },
  {
    "id": 1038,
    "title": "Рис девзира для плова, 1 кг",
    "description": "Знаменитый ферганский рис девзира с розоватым зерном. Не разваривается, впитывает зирвак и делает плов рассыпчатым. Перед готовкой рекомендуем замочить на час.",
    "category": "produkty-pitaniya",
    "subcategory": "bakaleya",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "pink",
    "price": 32000,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 149,
    "orders": 2054,
    "stock": 59,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/rice/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/rice/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "1 кг"
      ]
    ],
    "keywords": "рис плов guruch бакалея"
  },
  {
    "id": 1039,
    "title": "Газированный напиток со вкусом колы, 1.5 л",
    "description": "Освежающий газированный напиток с классическим вкусом. Подавайте охлаждённым со льдом. Удобная бутылка с закручивающейся крышкой.",
    "category": "produkty-pitaniya",
    "subcategory": "napitki",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "red",
    "material": "plastic",
    "price": 12000,
    "oldPrice": 14000,
    "rating": 4.9,
    "reviews": 186,
    "orders": 2107,
    "stock": 53,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/soft-drinks/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/soft-drinks/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "1.5 л"
      ]
    ],
    "keywords": "газировка напиток кола"
  },
  {
    "id": 1040,
    "title": "Клубника садовая, 500 г",
    "description": "Ароматная клубника с местных плантаций. Крупные сладкие ягоды без белых кончиков. Собрана накануне доставки.",
    "category": "produkty-pitaniya",
    "subcategory": "frukty-i-yagody",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "red",
    "price": 35000,
    "oldPrice": null,
    "rating": 4.2,
    "reviews": 223,
    "orders": 2160,
    "stock": 46,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/strawberry/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/strawberry/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "500 г"
      ]
    ],
    "keywords": "клубника ягоды qulupnay"
  },
  {
    "id": 1041,
    "title": "Салфетки бумажные в коробке, 200 шт",
    "description": "Мягкие двухслойные салфетки в удобной коробке. Не оставляют ворсинок. Для дома, офиса и автомобиля.",
    "category": "dom-i-sad",
    "subcategory": "hozyaystvennye-tovary",
    "brand": "Uy Decor",
    "country": "uzbekistan",
    "color": "white",
    "price": 15000,
    "oldPrice": 17000,
    "rating": 4.1,
    "reviews": 260,
    "orders": 2213,
    "stock": 86,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/tissue-paper-box/1.webp",
      "https://cdn.dummyjson.com/product-images/groceries/tissue-paper-box/2.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/tissue-paper-box/thumbnail.webp",
    "attributes": [
      [
        "Количество",
        "200 шт"
      ]
    ],
    "keywords": "салфетки хозтовары"
  },
  {
    "id": 1042,
    "title": "Вода питьевая негазированная, 1.5 л",
    "description": "Чистая артезианская вода с гор Чимгана. Мягкий вкус, сбалансированный минеральный состав. Подходит для детского питания.",
    "category": "produkty-pitaniya",
    "subcategory": "napitki",
    "brand": "Green Field",
    "country": "uzbekistan",
    "color": "blue",
    "material": "plastic",
    "price": 4000,
    "oldPrice": 5000,
    "rating": 5,
    "reviews": 297,
    "orders": 2266,
    "stock": 53,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/groceries/water/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/groceries/water/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "1.5 л"
      ]
    ],
    "keywords": "вода suv напиток"
  },
  {
    "id": 1043,
    "title": "Подвесные качели-кокон для дома и сада",
    "description": "Плетёное кресло-кокон с мягкой подушкой и прочным креплением. Выдерживает до 120 кг. Подходит для веранды, лоджии и детской.",
    "category": "dom-i-sad",
    "subcategory": "dekor",
    "brand": "Uy Decor",
    "country": "china",
    "color": "beige",
    "material": "textile",
    "price": 690000,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 334,
    "orders": 2319,
    "stock": 47,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/1.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/2.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/thumbnail.webp",
    "attributes": [
      [
        "Максимальная нагрузка",
        "120 кг"
      ],
      [
        "Гарантия",
        "1 неделя"
      ]
    ],
    "keywords": "качели декор сад"
  },
  {
    "id": 1044,
    "title": "Фоторамка «Семейное древо» на 6 фото",
    "description": "Настенная рамка в виде дерева для шести семейных снимков. Металлическая основа с матовым покрытием. Крепёж в комплекте.",
    "category": "dom-i-sad",
    "subcategory": "dekor",
    "brand": "Uy Decor",
    "country": "china",
    "color": "black",
    "material": "metal",
    "price": 249000,
    "oldPrice": 293000,
    "rating": 4.8,
    "reviews": 371,
    "orders": 2372,
    "stock": 77,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/thumbnail.webp",
    "attributes": [
      [
        "Формат фото",
        "10×15 см"
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "рамка фото декор"
  },
  {
    "id": 1045,
    "title": "Искусственное растение в горшке, 60 см",
    "description": "Реалистичное декоративное растение, которому не нужны полив и свет. Листья из качественного пластика не выцветают. Оживит гостиную или офис.",
    "category": "dom-i-sad",
    "subcategory": "dekor",
    "brand": "Uy Decor",
    "country": "china",
    "color": "green",
    "material": "plastic",
    "price": 389000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 408,
    "orders": 2425,
    "stock": 28,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/1.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/2.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/thumbnail.webp",
    "attributes": [
      [
        "Высота",
        "60 см"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "растение цветок декор"
  },
  {
    "id": 1046,
    "title": "Кашпо для цветов керамическое, 18 см",
    "description": "Матовое керамическое кашпо со сливным отверстием и поддоном. Подходит для суккулентов и комнатных растений. Минималистичный дизайн впишется в любой интерьер.",
    "category": "dom-i-sad",
    "subcategory": "dekor",
    "brand": "Uy Decor",
    "country": "turkey",
    "color": "white",
    "material": "ceramic",
    "price": 129000,
    "oldPrice": null,
    "rating": 4.2,
    "reviews": 25,
    "orders": 2478,
    "stock": 59,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/1.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/2.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/3.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/thumbnail.webp",
    "attributes": [
      [
        "Диаметр",
        "18 см"
      ],
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "горшок кашпо цветы"
  },
  {
    "id": 1047,
    "title": "Настольная лампа с тканевым абажуром",
    "description": "Лампа на устойчивом основании для спальни и рабочего стола. Абажур мягко рассеивает свет и не слепит глаза. Цоколь E27, подходит для LED-ламп.",
    "category": "dom-i-sad",
    "subcategory": "osveschenie",
    "brand": "Uy Decor",
    "country": "china",
    "color": "beige",
    "material": "textile",
    "price": 459000,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 62,
    "orders": 2531,
    "stock": 9,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/thumbnail.webp",
    "attributes": [
      [
        "Цоколь",
        "E27"
      ],
      [
        "Высота",
        "45 см"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "лампа светильник освещение"
  },
  {
    "id": 1048,
    "title": "Лопатка бамбуковая для сковороды",
    "description": "Лёгкая и прочная лопатка из бамбука не царапает антипригарное покрытие. Не нагревается и не впитывает запахи. Мыть рекомендуется вручную.",
    "category": "dom-i-sad",
    "subcategory": "kuhonnye-prinadlezhnosti",
    "brand": "HomeChef",
    "country": "china",
    "color": "beige",
    "material": "wood",
    "price": 39000,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 99,
    "orders": 2584,
    "stock": 37,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/bamboo-spatula/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/bamboo-spatula/thumbnail.webp",
    "attributes": [
      [
        "Длина",
        "30 см"
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "лопатка кухня"
  },
  {
    "id": 1049,
    "title": "Кружка-термос алюминиевая, чёрная, 350 мл",
    "description": "Кружка с двойными стенками держит кофе горячим до двух часов. Крышка с силиконовым уплотнителем защищает от протеканий. Удобно брать в дорогу и в машину.",
    "category": "dom-i-sad",
    "subcategory": "posuda",
    "brand": "HomeChef",
    "country": "china",
    "color": "black",
    "material": "aluminium",
    "price": 49000,
    "oldPrice": 58000,
    "rating": 4.8,
    "reviews": 136,
    "orders": 2637,
    "stock": 75,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/1.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/2.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "350 мл"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "кружка термокружка посуда"
  },
  {
    "id": 1050,
    "title": "Венчик для взбивания в силиконе, чёрный",
    "description": "Венчик с силиконовыми прутьями бережно относится к посуде с покрытием. Подходит для кремов, омлетов и теста. Можно мыть в посудомоечной машине.",
    "category": "dom-i-sad",
    "subcategory": "kuhonnye-prinadlezhnosti",
    "brand": "HomeChef",
    "country": "china",
    "color": "black",
    "material": "silicone",
    "price": 45000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 173,
    "orders": 90,
    "stock": 73,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-whisk/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-whisk/thumbnail.webp",
    "attributes": [
      [
        "Длина",
        "27 см"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "венчик кухня"
  },
  {
    "id": 1051,
    "title": "Блендер стационарный HomeChef, 1.5 л, 800 Вт",
    "description": "Мощный блендер для смузи, коктейлей и супов-пюре. Стеклянная чаша на 1.5 литра и четыре ножа из нержавеющей стали. Пять скоростей и импульсный режим для колки льда.",
    "category": "bytovaya-tehnika",
    "subcategory": "kuhonnaya-tehnika",
    "brand": "HomeChef",
    "country": "china",
    "color": "silver",
    "material": "glass",
    "price": 549000,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 210,
    "orders": 143,
    "stock": 9,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/1.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/2.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/3.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/thumbnail.webp",
    "attributes": [
      [
        "Мощность",
        "800 Вт"
      ],
      [
        "Объём чаши",
        "1.5 л"
      ],
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "блендер техника кухня"
  },
  {
    "id": 1052,
    "title": "Сковорода вок из углеродистой стали, 30 см",
    "description": "Классический вок для быстрой обжарки на сильном огне. Углеродистая сталь быстро нагревается и со временем приобретает натуральное антипригарное покрытие. Подходит для газовых и электрических плит.",
    "category": "dom-i-sad",
    "subcategory": "kastryuli-i-skovorody",
    "brand": "HomeChef",
    "country": "china",
    "color": "black",
    "material": "steel",
    "price": 289000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 247,
    "orders": 196,
    "stock": 40,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/carbon-steel-wok/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/carbon-steel-wok/thumbnail.webp",
    "attributes": [
      [
        "Диаметр",
        "30 см"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "вок сковорода посуда"
  },
  {
    "id": 1053,
    "title": "Доска разделочная бамбуковая, 35×25 см",
    "description": "Плотная бамбуковая доска не тупит ножи и не впитывает запахи. Желобок по краю собирает сок от мяса и фруктов. Легко моется и быстро сохнет.",
    "category": "dom-i-sad",
    "subcategory": "kuhonnye-prinadlezhnosti",
    "brand": "HomeChef",
    "country": "china",
    "color": "beige",
    "material": "wood",
    "price": 89000,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 284,
    "orders": 249,
    "stock": 14,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/chopping-board/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/chopping-board/thumbnail.webp",
    "attributes": [
      [
        "Размер",
        "35×25 см"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "доска кухня"
  },
  {
    "id": 1054,
    "title": "Соковыжималка ручная для цитрусовых, жёлтая",
    "description": "Пресс для лимонов и лаймов выжимает сок до последней капли и задерживает косточки. Литой алюминий с пищевым покрытием. Помещается в ящик кухонного стола.",
    "category": "dom-i-sad",
    "subcategory": "kuhonnye-prinadlezhnosti",
    "brand": "HomeChef",
    "country": "china",
    "color": "yellow",
    "material": "aluminium",
    "price": 59000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 321,
    "orders": 302,
    "stock": 22,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/citrus-squeezer-yellow/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/citrus-squeezer-yellow/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "соковыжималка лимон кухня"
  },
  {
    "id": 1056,
    "title": "Электроплита настольная, 2 конфорки, 2000 Вт",
    "description": "Компактная плита для дачи, общежития или съёмной квартиры. Две чугунные конфорки с независимой регулировкой мощности. Корпус из нержавеющей стали легко моется.",
    "category": "bytovaya-tehnika",
    "subcategory": "kuhonnaya-tehnika",
    "brand": "HomeChef",
    "country": "china",
    "color": "black",
    "material": "steel",
    "price": 690000,
    "oldPrice": 802000,
    "rating": 4.6,
    "reviews": 395,
    "orders": 408,
    "stock": 21,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/1.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/2.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/3.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/thumbnail.webp",
    "attributes": [
      [
        "Мощность",
        "2000 Вт"
      ],
      [
        "Количество конфорок",
        "2"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "плита электроплита техника"
  },
  {
    "id": 1057,
    "title": "Сито с мелкой сеткой, 20 см",
    "description": "Сито из нержавеющей стали для муки, круп и процеживания соусов. Удобная ручка и крючок для опоры на кастрюлю. Не ржавеет и не окисляется.",
    "category": "dom-i-sad",
    "subcategory": "kuhonnye-prinadlezhnosti",
    "brand": "HomeChef",
    "country": "china",
    "color": "silver",
    "material": "steel",
    "price": 49000,
    "oldPrice": null,
    "rating": 4.2,
    "reviews": 12,
    "orders": 461,
    "stock": 85,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/fine-mesh-strainer/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/fine-mesh-strainer/thumbnail.webp",
    "attributes": [
      [
        "Диаметр",
        "20 см"
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "сито кухня"
  },
  {
    "id": 1059,
    "title": "Стакан из закалённого стекла, 300 мл",
    "description": "Прозрачный стакан с утолщённым дном для воды, соков и коктейлей. Закалённое стекло выдерживает перепады температур. Можно мыть в посудомоечной машине.",
    "category": "dom-i-sad",
    "subcategory": "posuda",
    "brand": "HomeChef",
    "country": "turkey",
    "color": "white",
    "material": "glass",
    "price": 19000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 86,
    "orders": 567,
    "stock": 46,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/glass/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/glass/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "300 мл"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "стакан посуда"
  },
  {
    "id": 1060,
    "title": "Тёрка четырёхгранная, чёрная",
    "description": "Тёрка с четырьмя видами лезвий: крупная, мелкая, слайсер и для цедры. Нескользящее основание и удобная ручка. Лезвия из нержавеющей стали долго остаются острыми.",
    "category": "dom-i-sad",
    "subcategory": "kuhonnye-prinadlezhnosti",
    "brand": "HomeChef",
    "country": "china",
    "color": "black",
    "material": "steel",
    "price": 59000,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 123,
    "orders": 620,
    "stock": 84,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/grater-black/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/grater-black/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "тёрка кухня"
  },
  {
    "id": 1061,
    "title": "Погружной блендер HomeChef, 600 Вт",
    "description": "Лёгкий погружной блендер для пюре, соусов и детского питания. Насадка из нержавеющей стали не окисляется. Две скорости и турборежим.",
    "category": "bytovaya-tehnika",
    "subcategory": "kuhonnaya-tehnika",
    "brand": "HomeChef",
    "country": "china",
    "color": "white",
    "material": "plastic",
    "price": 399000,
    "oldPrice": 481000,
    "rating": 4.5,
    "reviews": 160,
    "orders": 673,
    "stock": 84,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/hand-blender/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/hand-blender/thumbnail.webp",
    "attributes": [
      [
        "Мощность",
        "600 Вт"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "блендер техника кухня"
  },
  {
    "id": 1064,
    "title": "Нож поварской из нержавеющей стали, 20 см",
    "description": "Универсальный шеф-нож для мяса, овощей и зелени. Лезвие из закалённой стали хорошо держит заточку. Эргономичная рукоять не скользит в руке.",
    "category": "dom-i-sad",
    "subcategory": "kuhonnye-prinadlezhnosti",
    "brand": "HomeChef",
    "country": "china",
    "color": "silver",
    "material": "steel",
    "price": 159000,
    "oldPrice": 196000,
    "rating": 4.3,
    "reviews": 271,
    "orders": 832,
    "stock": 7,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/knife/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/knife/thumbnail.webp",
    "attributes": [
      [
        "Длина лезвия",
        "20 см"
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "нож кухня"
  },
  {
    "id": 1065,
    "title": "Ланч-бокс с отделениями и приборами",
    "description": "Контейнер для обеда с тремя отделениями и плотной крышкой. Ложка и вилка в комплекте. Подходит для микроволновки, не пропускает запахи.",
    "category": "detskie-tovary",
    "subcategory": "dlya-shkoly",
    "brand": "Little Star",
    "country": "china",
    "color": "grey",
    "material": "plastic",
    "price": 79000,
    "oldPrice": null,
    "rating": 5,
    "reviews": 308,
    "orders": 885,
    "stock": 94,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/lunch-box/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/lunch-box/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "1 л"
      ],
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "ланчбокс контейнер школа"
  },
  {
    "id": 1066,
    "title": "Микроволновая печь HomeChef, 20 л, 700 Вт",
    "description": "Микроволновка с механическим управлением для разогрева и разморозки. Пять уровней мощности и таймер до 30 минут. Стеклянный поддон диаметром 24.5 см.",
    "category": "bytovaya-tehnika",
    "subcategory": "kuhonnaya-tehnika",
    "brand": "HomeChef",
    "country": "china",
    "color": "white",
    "material": "steel",
    "price": 1290000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 345,
    "orders": 938,
    "stock": 59,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/1.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/2.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/3.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "20 л"
      ],
      [
        "Мощность",
        "700 Вт"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "микроволновка печь свч техника"
  },
  {
    "id": 1067,
    "title": "Подставка для кружек «Дерево» на 6 крючков",
    "description": "Настольная подставка экономит место в шкафу и быстро сушит кружки. Устойчивое основание не опрокидывается. Металл с порошковым покрытием.",
    "category": "dom-i-sad",
    "subcategory": "posuda",
    "brand": "HomeChef",
    "country": "china",
    "color": "black",
    "material": "metal",
    "price": 99000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 382,
    "orders": 991,
    "stock": 88,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/mug-tree-stand/1.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/mug-tree-stand/2.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/mug-tree-stand/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "подставка кружки кухня"
  },
  {
    "id": 1068,
    "title": "Сковорода с антипригарным покрытием, 26 см",
    "description": "Сковорода с мраморным покрытием — можно жарить почти без масла. Толстое дно равномерно прогревается. Подходит для всех плит, включая индукционные.",
    "category": "dom-i-sad",
    "subcategory": "kastryuli-i-skovorody",
    "brand": "HomeChef",
    "country": "turkey",
    "color": "black",
    "material": "aluminium",
    "price": 229000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 419,
    "orders": 1044,
    "stock": 90,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/pan/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/pan/thumbnail.webp",
    "attributes": [
      [
        "Диаметр",
        "26 см"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "сковорода посуда"
  },
  {
    "id": 1069,
    "title": "Тарелка обеденная фарфоровая, 27 см",
    "description": "Белая тарелка из прочного фарфора для повседневной сервировки. Не впитывает запахи и не теряет блеск. Подходит для микроволновки и посудомоечной машины.",
    "category": "dom-i-sad",
    "subcategory": "posuda",
    "brand": "HomeChef",
    "country": "turkey",
    "color": "white",
    "material": "ceramic",
    "price": 35000,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 36,
    "orders": 1097,
    "stock": 66,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/plate/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/plate/thumbnail.webp",
    "attributes": [
      [
        "Диаметр",
        "27 см"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "тарелка посуда"
  },
  {
    "id": 1071,
    "title": "Кастрюля со стеклянной крышкой, 4 л",
    "description": "Кастрюля из нержавеющей стали с капсульным дном для супов, каш и плова. Крышка из жаропрочного стекла с паровыпускным клапаном. Подходит для индукции.",
    "category": "dom-i-sad",
    "subcategory": "kastryuli-i-skovorody",
    "brand": "HomeChef",
    "country": "turkey",
    "color": "silver",
    "material": "steel",
    "price": 349000,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 110,
    "orders": 1203,
    "stock": 40,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/silver-pot-with-glass-cap/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/silver-pot-with-glass-cap/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "4 л"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "кастрюля посуда"
  },
  {
    "id": 1073,
    "title": "Органайзер для специй на 12 баночек",
    "description": "Вращающаяся стойка с двенадцатью стеклянными баночками для приправ. Всё под рукой и на виду. Наклейки для подписи в комплекте.",
    "category": "dom-i-sad",
    "subcategory": "kuhonnye-prinadlezhnosti",
    "brand": "HomeChef",
    "country": "china",
    "color": "silver",
    "material": "glass",
    "price": 159000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 184,
    "orders": 1309,
    "stock": 79,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/spice-rack/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/spice-rack/thumbnail.webp",
    "attributes": [
      [
        "Количество баночек",
        "12"
      ],
      [
        "Гарантия",
        "1 неделя"
      ]
    ],
    "keywords": "специи органайзер кухня"
  },
  {
    "id": 1075,
    "title": "Поднос сервировочный с ручками",
    "description": "Поднос для завтрака в постель, подачи чая и закусок. Бортики не дают посуде соскользнуть. Лёгкий и прочный.",
    "category": "dom-i-sad",
    "subcategory": "posuda",
    "brand": "HomeChef",
    "country": "china",
    "color": "brown",
    "material": "wood",
    "price": 119000,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 258,
    "orders": 1415,
    "stock": 71,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/tray/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/tray/thumbnail.webp",
    "attributes": [
      [
        "Размер",
        "45×30 см"
      ],
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "поднос посуда"
  },
  {
    "id": 1076,
    "title": "Скалка деревянная, 40 см",
    "description": "Скалка из цельного бука для теста на самсу, лагман и пироги. Гладкая поверхность не прилипает к тесту. Мыть вручную, не замачивать.",
    "category": "dom-i-sad",
    "subcategory": "kuhonnye-prinadlezhnosti",
    "brand": "HomeChef",
    "country": "uzbekistan",
    "color": "beige",
    "material": "wood",
    "price": 45000,
    "oldPrice": null,
    "rating": 4.2,
    "reviews": 295,
    "orders": 1468,
    "stock": 80,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/wooden-rolling-pin/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/kitchen-accessories/wooden-rolling-pin/thumbnail.webp",
    "attributes": [
      [
        "Длина",
        "40 см"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "скалка тесто кухня"
  },
  {
    "id": 1078,
    "title": "Ноутбук Apple MacBook Pro 14\", M1 Pro, Space Grey",
    "description": "Профессиональный ноутбук с дисплеем Liquid Retina XDR и чипом M1 Pro. До 17 часов работы без подзарядки. Три порта Thunderbolt 4, HDMI и слот для SD-карт.",
    "category": "elektronika",
    "subcategory": "noutbuki",
    "brand": "Apple",
    "country": "usa",
    "color": "grey",
    "material": "aluminium",
    "memory": [
      "512 ГБ",
      "1 ТБ"
    ],
    "price": 27990000,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 369,
    "orders": 1574,
    "stock": 24,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp",
      "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/2.webp",
      "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "14.2\""
      ],
      [
        "Оперативная память",
        "16 ГБ"
      ],
      [
        "Процессор",
        "Apple M1 Pro"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "ноутбук макбук laptop noutbuk"
  },
  {
    "id": 1079,
    "title": "Ноутбук Asus Zenbook Pro Duo с двумя экранами",
    "description": "Ноутбук для дизайнеров и монтажёров со вторым сенсорным экраном ScreenPad Plus. Основной OLED-дисплей 15.6\" с разрешением 4K. Процессор Intel Core i9 и видеокарта RTX.",
    "category": "elektronika",
    "subcategory": "noutbuki",
    "brand": "Asus",
    "country": "taiwan",
    "color": "blue",
    "material": "aluminium",
    "memory": [
      "1 ТБ"
    ],
    "price": 24990000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 406,
    "orders": 1627,
    "stock": 45,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/1.webp",
      "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/2.webp",
      "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "15.6\""
      ],
      [
        "Оперативная память",
        "32 ГБ"
      ],
      [
        "Процессор",
        "Intel Core i9"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "ноутбук laptop noutbuk"
  },
  {
    "id": 1080,
    "title": "Ноутбук Huawei MateBook X Pro, 13.9\"",
    "description": "Тонкий алюминиевый ноутбук с сенсорным безрамочным экраном 3K. Весит всего 1.33 кг. Скрытая веб-камера в клавиатуре и быстрая зарядка через USB-C.",
    "category": "elektronika",
    "subcategory": "noutbuki",
    "brand": "Huawei",
    "country": "china",
    "color": "blue",
    "material": "aluminium",
    "memory": [
      "512 ГБ",
      "1 ТБ"
    ],
    "price": 17490000,
    "oldPrice": null,
    "rating": 5,
    "reviews": 23,
    "orders": 1680,
    "stock": 75,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/1.webp",
      "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/2.webp",
      "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "13.9\""
      ],
      [
        "Оперативная память",
        "16 ГБ"
      ],
      [
        "Процессор",
        "Intel Core i7"
      ]
    ],
    "keywords": "ноутбук laptop noutbuk"
  },
  {
    "id": 1081,
    "title": "Ноутбук-трансформер Lenovo Yoga 920, 13.9\"",
    "description": "Экран поворачивается на 360° — ноутбук превращается в планшет. Сенсорный дисплей поддерживает стилус. Корпус из алюминия и до 15 часов автономности.",
    "category": "elektronika",
    "subcategory": "noutbuki",
    "brand": "Lenovo",
    "country": "china",
    "color": "blue",
    "material": "aluminium",
    "memory": [
      "256 ГБ",
      "512 ГБ"
    ],
    "price": 13490000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 60,
    "orders": 1733,
    "stock": 40,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/1.webp",
      "https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/2.webp",
      "https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "13.9\""
      ],
      [
        "Оперативная память",
        "8 ГБ"
      ],
      [
        "Процессор",
        "Intel Core i5"
      ],
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "ноутбук трансформер laptop noutbuk"
  },
  {
    "id": 1082,
    "title": "Ноутбук Dell XPS 13 9300, 13.4\"",
    "description": "Компактный флагман с экраном InfinityEdge почти без рамок. Процессор Intel Core i7 10-го поколения и быстрый SSD. Корпус из алюминия и углепластика.",
    "category": "elektronika",
    "subcategory": "noutbuki",
    "brand": "Dell",
    "country": "usa",
    "color": "silver",
    "material": "aluminium",
    "memory": [
      "512 ГБ",
      "1 ТБ"
    ],
    "price": 18990000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 97,
    "orders": 1786,
    "stock": 74,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/1.webp",
      "https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/2.webp",
      "https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "13.4\""
      ],
      [
        "Оперативная память",
        "16 ГБ"
      ],
      [
        "Процессор",
        "Intel Core i7"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "ноутбук laptop noutbuk"
  },
  {
    "id": 1083,
    "title": "Рубашка мужская в клетку, сине-чёрная",
    "description": "Рубашка прямого кроя из мягкого хлопка. Клетка сочетается с джинсами и чиносами. Подходит для офиса в стиле casual и выходных.",
    "category": "odezhda",
    "subcategory": "muzhskaya-odezhda",
    "brand": "Urban Man",
    "country": "turkey",
    "color": "blue",
    "material": "cotton",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "price": 249000,
    "oldPrice": 293000,
    "rating": 4.5,
    "reviews": 134,
    "orders": 1839,
    "stock": 38,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "рубашка одежда мужская ko'ylak"
  },
  {
    "id": 1084,
    "title": "Футболка мужская Gigabyte Aorus, белая",
    "description": "Хлопковая футболка с принтом геймерского бренда Aorus. Плотный трикотаж не теряет форму после стирки. Свободный крой.",
    "category": "odezhda",
    "subcategory": "muzhskaya-odezhda",
    "brand": "Gigabyte",
    "country": "taiwan",
    "color": "white",
    "material": "cotton",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "price": 189000,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 171,
    "orders": 1892,
    "stock": 90,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "футболка одежда мужская"
  },
  {
    "id": 1085,
    "title": "Рубашка мужская фланелевая в клетку",
    "description": "Тёплая фланелевая рубашка для прохладной погоды. Можно носить как верхний слой поверх футболки. Два нагрудных кармана на пуговицах.",
    "category": "odezhda",
    "subcategory": "muzhskaya-odezhda",
    "brand": "Classic Wear",
    "country": "turkey",
    "color": "red",
    "material": "cotton",
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "price": 289000,
    "oldPrice": 361000,
    "rating": 4.4,
    "reviews": 208,
    "orders": 1945,
    "stock": 82,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 неделя"
      ]
    ],
    "keywords": "рубашка одежда мужская ko'ylak"
  },
  {
    "id": 1086,
    "title": "Рубашка мужская с коротким рукавом, летняя",
    "description": "Лёгкая рубашка из дышащего хлопка для жаркой погоды. Не мнётся в течение дня. Отложной воротник и прямой низ.",
    "category": "odezhda",
    "subcategory": "muzhskaya-odezhda",
    "brand": "Casual Comfort",
    "country": "uzbekistan",
    "color": "blue",
    "material": "cotton",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "price": 179000,
    "oldPrice": null,
    "rating": 4.2,
    "reviews": 245,
    "orders": 1998,
    "stock": 2,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "рубашка одежда мужская ko'ylak"
  },
  {
    "id": 1087,
    "title": "Рубашка мужская в клетку Urban Chic, приталенная",
    "description": "Приталенная рубашка из смесового хлопка в мелкую клетку. Хорошо держит форму и легко гладится. Подходит под пиджак и джемпер.",
    "category": "odezhda",
    "subcategory": "muzhskaya-odezhda",
    "brand": "Urban Chic",
    "country": "turkey",
    "color": "grey",
    "material": "cotton",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "price": 229000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 282,
    "orders": 2051,
    "stock": 95,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/thumbnail.webp",
    "attributes": [],
    "keywords": "рубашка одежда мужская"
  },
  {
    "id": 1088,
    "title": "Кроссовки Nike Air Jordan 1 Mid, красно-чёрные",
    "description": "Легендарные баскетбольные кроссовки в культовой расцветке Chicago. Верх из натуральной кожи, амортизация Air в пятке. Выглядят одинаково уместно на площадке и в городе.",
    "category": "obuv",
    "subcategory": "krossovki",
    "brand": "Nike",
    "country": "usa",
    "color": "red",
    "material": "leather",
    "sizes": [
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "price": 2190000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 319,
    "orders": 2104,
    "stock": 7,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "кроссовки обувь найк krossovka"
  },
  {
    "id": 1089,
    "title": "Бутсы Nike для бейсбола, с шипами",
    "description": "Лёгкие бутсы с формованными шипами для уверенного сцепления на траве и грунте. Синтетический верх поддерживает стопу. Подходят для бейсбола и софтбола.",
    "category": "obuv",
    "subcategory": "butsy",
    "brand": "Nike",
    "country": "usa",
    "color": "white",
    "material": "textile",
    "sizes": [
      "40",
      "41",
      "42",
      "43"
    ],
    "price": 990000,
    "oldPrice": 1207000,
    "rating": 4.6,
    "reviews": 356,
    "orders": 2157,
    "stock": 12,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "бутсы обувь спорт"
  },
  {
    "id": 1090,
    "title": "Кроссовки Puma Future Rider, повседневные",
    "description": "Ретро-кроссовки в стиле беговой обуви 80-х. Мягкая подошва из EVA и замшевые вставки. Лёгкие, подходят для ежедневной носки.",
    "category": "obuv",
    "subcategory": "krossovki",
    "brand": "Puma",
    "country": "germany",
    "color": "multi",
    "material": "textile",
    "sizes": [
      "39",
      "40",
      "41",
      "42",
      "43"
    ],
    "price": 1090000,
    "oldPrice": null,
    "rating": 5,
    "reviews": 393,
    "orders": 2210,
    "stock": 90,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "кроссовки обувь пума krossovka"
  },
  {
    "id": 1091,
    "title": "Кроссовки Off-White, бело-красные",
    "description": "Высокие кроссовки с фирменной стяжкой и надписями в стиле бренда. Комбинация кожи и текстиля. Акцентная пара для уличного образа.",
    "category": "obuv",
    "subcategory": "krossovki",
    "brand": "Off White",
    "country": "italy",
    "color": "white",
    "material": "leather",
    "sizes": [
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "price": 1590000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 10,
    "orders": 2263,
    "stock": 17,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 неделя"
      ]
    ],
    "keywords": "кроссовки обувь krossovka"
  },
  {
    "id": 1092,
    "title": "Кеды Off-White Low, белые с красным",
    "description": "Низкие кеды из гладкой кожи с контрастными деталями. Резиновая подошва не скользит. Сочетаются и с джинсами, и с шортами.",
    "category": "obuv",
    "subcategory": "krossovki",
    "brand": "Off White",
    "country": "italy",
    "color": "white",
    "material": "leather",
    "sizes": [
      "39",
      "40",
      "41",
      "42",
      "43"
    ],
    "price": 1390000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 47,
    "orders": 2316,
    "stock": 62,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-red/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-red/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-red/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-red/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-red/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "кеды кроссовки обувь"
  },
  {
    "id": 1093,
    "title": "Часы мужские на кожаном ремешке, коричневые",
    "description": "Классические кварцевые часы с минималистичным циферблатом. Ремешок из натуральной кожи и защитное минеральное стекло. Водозащита 3 ATM.",
    "category": "aksessuary",
    "subcategory": "chasy",
    "brand": "Fashion Timepieces",
    "country": "china",
    "color": "brown",
    "material": "leather",
    "price": 890000,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 84,
    "orders": 2369,
    "stock": 32,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp",
    "attributes": [
      [
        "Механизм",
        "Кварцевый"
      ],
      [
        "Водозащита",
        "3 ATM"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "часы мужские soat"
  },
  {
    "id": 1094,
    "title": "Часы Longines Master Collection, автоподзавод",
    "description": "Швейцарские механические часы с автоподзаводом и сапфировым стеклом. Корпус из нержавеющей стали 40 мм. Элегантная модель для деловых встреч.",
    "category": "aksessuary",
    "subcategory": "chasy",
    "brand": "Longines",
    "country": "switzerland",
    "color": "silver",
    "material": "steel",
    "price": 24900000,
    "oldPrice": 30000000,
    "rating": 4.5,
    "reviews": 121,
    "orders": 2422,
    "stock": 100,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/thumbnail.webp",
    "attributes": [
      [
        "Механизм",
        "Механический с автоподзаводом"
      ],
      [
        "Диаметр корпуса",
        "40 мм"
      ],
      [
        "Гарантия",
        "1 неделя"
      ]
    ],
    "keywords": "часы швейцарские soat"
  },
  {
    "id": 1095,
    "title": "Часы Rolex Cellini Date, чёрный циферблат",
    "description": "Классические часы Rolex в корпусе из белого золота 39 мм. Чёрный циферблат с датой и ремешок из кожи аллигатора. Механизм собственного производства.",
    "category": "aksessuary",
    "subcategory": "chasy",
    "brand": "Rolex",
    "country": "switzerland",
    "color": "black",
    "material": "leather",
    "price": 129000000,
    "oldPrice": null,
    "rating": 5,
    "reviews": 158,
    "orders": 2475,
    "stock": 40,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/thumbnail.webp",
    "attributes": [
      [
        "Механизм",
        "Механический с автоподзаводом"
      ],
      [
        "Диаметр корпуса",
        "39 мм"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "часы ролекс soat"
  },
  {
    "id": 1096,
    "title": "Часы Rolex Cellini Moonphase",
    "description": "Часы с индикатором фаз Луны на эмалевом диске. Корпус из золота Everose 39 мм. Коллекционная модель с безупречной отделкой.",
    "category": "aksessuary",
    "subcategory": "chasy",
    "brand": "Rolex",
    "country": "switzerland",
    "color": "gold",
    "material": "leather",
    "price": 189000000,
    "oldPrice": 230490000,
    "rating": 4,
    "reviews": 195,
    "orders": 2528,
    "stock": 36,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-moonphase/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-moonphase/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-moonphase/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-moonphase/thumbnail.webp",
    "attributes": [
      [
        "Механизм",
        "Механический с автоподзаводом"
      ],
      [
        "Диаметр корпуса",
        "39 мм"
      ],
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "часы ролекс soat"
  },
  {
    "id": 1097,
    "title": "Часы Rolex Datejust 41, сталь и золото",
    "description": "Икона часового дизайна с датой в окошке под линзой Cyclops. Браслет Jubilee из стали Oystersteel и жёлтого золота. Водозащита 100 метров.",
    "category": "aksessuary",
    "subcategory": "chasy",
    "brand": "Rolex",
    "country": "switzerland",
    "color": "gold",
    "material": "steel",
    "price": 159000000,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 232,
    "orders": 2581,
    "stock": 86,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/thumbnail.webp",
    "attributes": [
      [
        "Механизм",
        "Механический с автоподзаводом"
      ],
      [
        "Водозащита",
        "100 м"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "часы ролекс soat"
  },
  {
    "id": 1098,
    "title": "Часы Rolex Submariner, чёрный безель",
    "description": "Легендарные часы для дайвинга с керамическим вращающимся безелем. Водонепроницаемость до 300 метров. Корпус и браслет из стали Oystersteel.",
    "category": "aksessuary",
    "subcategory": "chasy",
    "brand": "Rolex",
    "country": "switzerland",
    "color": "black",
    "material": "steel",
    "price": 199000000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 269,
    "orders": 2634,
    "stock": 55,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-submariner-watch/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-submariner-watch/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-submariner-watch/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-submariner-watch/thumbnail.webp",
    "attributes": [
      [
        "Механизм",
        "Механический с автоподзаводом"
      ],
      [
        "Водозащита",
        "300 м"
      ],
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "часы ролекс soat"
  },
  {
    "id": 1099,
    "title": "Умная колонка Amazon Echo Plus с голосовым помощником",
    "description": "Колонка с ассистентом Alexa и встроенным хабом Zigbee для умного дома. Объёмный звук с глубокими басами. Управляет лампами, розетками и музыкой голосом.",
    "category": "bytovaya-tehnika",
    "subcategory": "umnyy-dom",
    "brand": "Amazon",
    "country": "usa",
    "color": "grey",
    "material": "textile",
    "price": 1290000,
    "oldPrice": null,
    "rating": 5,
    "reviews": 306,
    "orders": 87,
    "stock": 61,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/1.webp",
      "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/2.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp",
    "attributes": [
      [
        "Подключение",
        "Wi-Fi, Bluetooth, Zigbee"
      ],
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "колонка умный дом alexa"
  },
  {
    "id": 1100,
    "title": "Беспроводные наушники Apple AirPods (2-го поколения)",
    "description": "Наушники мгновенно подключаются к iPhone и переключаются между устройствами Apple. До 5 часов прослушивания, с кейсом — более 24 часов. Двойным касанием можно управлять музыкой и Siri.",
    "category": "elektronika",
    "subcategory": "naushniki",
    "brand": "Apple",
    "country": "usa",
    "color": "white",
    "material": "plastic",
    "price": 1890000,
    "oldPrice": 2250000,
    "rating": 4.7,
    "reviews": 343,
    "orders": 140,
    "stock": 67,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp",
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/2.webp",
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/thumbnail.webp",
    "attributes": [
      [
        "Время работы",
        "До 24 ч с кейсом"
      ],
      [
        "Подключение",
        "Bluetooth 5.0"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "наушники эйрподс airpods quloqchin"
  },
  {
    "id": 1101,
    "title": "Наушники Apple AirPods Max, серебристые",
    "description": "Полноразмерные наушники с активным шумоподавлением и пространственным звуком. Амбушюры с эффектом памяти и стальное оголовье. До 20 часов работы.",
    "category": "elektronika",
    "subcategory": "naushniki",
    "brand": "Apple",
    "country": "usa",
    "color": "silver",
    "material": "aluminium",
    "price": 7490000,
    "oldPrice": 8710000,
    "rating": 4.4,
    "reviews": 380,
    "orders": 193,
    "stock": 59,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp",
    "attributes": [
      [
        "Шумоподавление",
        "Активное"
      ],
      [
        "Время работы",
        "До 20 ч"
      ]
    ],
    "keywords": "наушники airpods quloqchin"
  },
  {
    "id": 1102,
    "title": "Беспроводное зарядное устройство Apple, 15 Вт",
    "description": "Зарядная площадка для iPhone, AirPods и Apple Watch. Достаточно положить устройство — кабель не нужен. Поддерживает быструю беспроводную зарядку.",
    "category": "elektronika",
    "subcategory": "aksessuary-dlya-telefonov",
    "brand": "Apple",
    "country": "usa",
    "color": "white",
    "material": "plastic",
    "price": 690000,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 417,
    "orders": 246,
    "stock": 1,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpower-wireless-charger/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpower-wireless-charger/thumbnail.webp",
    "attributes": [
      [
        "Мощность",
        "15 Вт"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "зарядка зарядное беспроводная телефон"
  },
  {
    "id": 1103,
    "title": "Умная колонка Apple HomePod mini, «серый космос»",
    "description": "Компактная колонка с мощным звуком и голосовым помощником Siri. Управляет устройствами умного дома и работает как интерком. Две колонки объединяются в стереопару.",
    "category": "bytovaya-tehnika",
    "subcategory": "umnyy-dom",
    "brand": "Apple",
    "country": "usa",
    "color": "grey",
    "material": "textile",
    "price": 1390000,
    "oldPrice": 1700000,
    "rating": 4.8,
    "reviews": 34,
    "orders": 299,
    "stock": 27,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-homepod-mini-cosmic-grey/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-homepod-mini-cosmic-grey/thumbnail.webp",
    "attributes": [
      [
        "Подключение",
        "Wi-Fi, Bluetooth"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "колонка умный дом siri"
  },
  {
    "id": 1104,
    "title": "Сетевое зарядное устройство Apple USB-C, 20 Вт",
    "description": "Оригинальный адаптер питания для быстрой зарядки iPhone и iPad. Заряжает iPhone до 50% за 30 минут. Кабель приобретается отдельно.",
    "category": "elektronika",
    "subcategory": "aksessuary-dlya-telefonov",
    "brand": "Apple",
    "country": "usa",
    "color": "white",
    "material": "plastic",
    "price": 299000,
    "oldPrice": 369000,
    "rating": 4.7,
    "reviews": 71,
    "orders": 352,
    "stock": 31,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/1.webp",
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/2.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp",
    "attributes": [
      [
        "Мощность",
        "20 Вт"
      ],
      [
        "Разъём",
        "USB-C"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "зарядка адаптер телефон"
  },
  {
    "id": 1105,
    "title": "Аккумулятор Apple MagSafe Battery Pack",
    "description": "Внешний аккумулятор крепится к задней панели iPhone на магнитах. Заряжает телефон на ходу без проводов. Сам заряжается через Lightning.",
    "category": "elektronika",
    "subcategory": "aksessuary-dlya-telefonov",
    "brand": "Apple",
    "country": "usa",
    "color": "white",
    "material": "silicone",
    "price": 1290000,
    "oldPrice": 1550000,
    "rating": 4.4,
    "reviews": 108,
    "orders": 405,
    "stock": 1,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/1.webp",
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/2.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/thumbnail.webp",
    "attributes": [
      [
        "Совместимость",
        "iPhone 12 и новее"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "павербанк аккумулятор телефон"
  },
  {
    "id": 1106,
    "title": "Умные часы Apple Watch Series 4, 44 мм, золотые",
    "description": "Часы отслеживают пульс, сон и тренировки, умеют снимать ЭКГ и распознают падения. Уведомления и ответы на сообщения прямо с запястья. Водозащита до 50 метров.",
    "category": "elektronika",
    "subcategory": "umnye-chasy",
    "brand": "Apple",
    "country": "usa",
    "color": "gold",
    "material": "aluminium",
    "price": 2990000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 145,
    "orders": 458,
    "stock": 33,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/1.webp",
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/2.webp",
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/thumbnail.webp",
    "attributes": [
      [
        "Размер корпуса",
        "44 мм"
      ],
      [
        "Водозащита",
        "50 м"
      ],
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "смарт часы умные часы watch soat"
  },
  {
    "id": 1107,
    "title": "Беспроводные наушники Beats Flex",
    "description": "Внутриканальные наушники с гибким шейным шнуром и магнитными чашками. До 12 часов воспроизведения. Быстрая зарядка: 10 минут дают 1.5 часа музыки.",
    "category": "elektronika",
    "subcategory": "naushniki",
    "brand": "Beats",
    "country": "usa",
    "color": "yellow",
    "material": "plastic",
    "price": 790000,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 182,
    "orders": 511,
    "stock": 50,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/thumbnail.webp",
    "attributes": [
      [
        "Время работы",
        "До 12 ч"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "наушники quloqchin"
  },
  {
    "id": 1108,
    "title": "Чехол Apple Silicone Case с MagSafe для iPhone 12, сливовый",
    "description": "Оригинальный силиконовый чехол с мягкой подкладкой из микрофибры. Встроенные магниты для зарядки MagSafe. Плотно облегает корпус и защищает от царапин.",
    "category": "elektronika",
    "subcategory": "aksessuary-dlya-telefonov",
    "brand": "Apple",
    "country": "usa",
    "color": "purple",
    "material": "silicone",
    "price": 390000,
    "oldPrice": 453000,
    "rating": 4.4,
    "reviews": 219,
    "orders": 564,
    "stock": 69,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/1.webp",
      "https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/2.webp",
      "https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/3.webp",
      "https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/thumbnail.webp",
    "attributes": [
      [
        "Совместимость",
        "iPhone 12, 12 Pro"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "чехол телефон айфон g'ilof"
  },
  {
    "id": 1109,
    "title": "Монопод TechGear для камеры и смартфона",
    "description": "Телескопический монопод из алюминия раскладывается до 160 см. Резьба 1/4\" подходит для камер и держателей смартфона. Прорезиненная ручка и петля на запястье.",
    "category": "elektronika",
    "subcategory": "foto-i-video",
    "brand": "TechGear",
    "country": "china",
    "color": "black",
    "material": "aluminium",
    "price": 159000,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 256,
    "orders": 617,
    "stock": 48,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/monopod/1.webp",
      "https://cdn.dummyjson.com/product-images/mobile-accessories/monopod/2.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/monopod/thumbnail.webp",
    "attributes": [
      [
        "Максимальная высота",
        "160 см"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "монопод штатив камера"
  },
  {
    "id": 1110,
    "title": "Селфи-лампа кольцевая на клипсе для смартфона",
    "description": "Кольцевая подсветка крепится к телефону или ноутбуку. Три режима цвета и десять уровней яркости. Аккумулятора хватает на два часа съёмки.",
    "category": "elektronika",
    "subcategory": "aksessuary-dlya-telefonov",
    "brand": "GadgetMaster",
    "country": "china",
    "color": "white",
    "material": "plastic",
    "price": 119000,
    "oldPrice": 147000,
    "rating": 4.4,
    "reviews": 293,
    "orders": 670,
    "stock": 58,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lamp-with-iphone/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lamp-with-iphone/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "селфи лампа подсветка телефон"
  },
  {
    "id": 1111,
    "title": "Селфи-палка SnapTech с Bluetooth-пультом",
    "description": "Складная селфи-палка с беспроводной кнопкой спуска. Держатель поворачивается на 360°. В сложенном виде помещается в карман.",
    "category": "elektronika",
    "subcategory": "aksessuary-dlya-telefonov",
    "brand": "SnapTech",
    "country": "china",
    "color": "black",
    "material": "aluminium",
    "price": 99000,
    "oldPrice": 122000,
    "rating": 4.6,
    "reviews": 330,
    "orders": 723,
    "stock": 11,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-stick-monopod/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-stick-monopod/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "селфи палка монопод телефон"
  },
  {
    "id": 1112,
    "title": "Студийный штатив-пьедестал ProVision для камеры",
    "description": "Профессиональная стойка на колёсах для телевизионной и студийной съёмки. Плавная регулировка высоты и фиксация колёс. Выдерживает камеры весом до 25 кг.",
    "category": "elektronika",
    "subcategory": "foto-i-video",
    "brand": "ProVision",
    "country": "china",
    "color": "black",
    "material": "metal",
    "price": 5990000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 367,
    "orders": 776,
    "stock": 15,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/mobile-accessories/tv-studio-camera-pedestal/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/mobile-accessories/tv-studio-camera-pedestal/thumbnail.webp",
    "attributes": [
      [
        "Максимальная нагрузка",
        "25 кг"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "штатив студия камера"
  },
  {
    "id": 1113,
    "title": "Мотоцикл дорожный Generic Motors 250",
    "description": "Надёжный дорожный мотоцикл для города и трассы. Двигатель 250 см³ с жидкостным охлаждением и экономичным расходом. Дисковые тормоза на обоих колёсах.",
    "category": "avtotovary",
    "subcategory": "mototsikly",
    "brand": "Generic Motors",
    "country": "china",
    "color": "black",
    "material": "metal",
    "price": 42000000,
    "oldPrice": null,
    "rating": 5,
    "reviews": 404,
    "orders": 829,
    "stock": 34,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/1.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/2.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/3.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp",
    "attributes": [
      [
        "Объём двигателя",
        "250 см³"
      ],
      [
        "Коробка передач",
        "Механическая, 6 ступеней"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "мотоцикл мото mototsikl"
  },
  {
    "id": 1114,
    "title": "Мотоцикл Kawasaki Z800",
    "description": "Агрессивный нейкед с рядной «четвёркой» на 806 см³ и мощностью 113 л.с. Точная управляемость и мощный разгон. Узнаваемый дизайн в стиле Sugomi.",
    "category": "avtotovary",
    "subcategory": "mototsikly",
    "brand": "Kawasaki",
    "country": "japan",
    "color": "black",
    "material": "metal",
    "price": 119000000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 21,
    "orders": 882,
    "stock": 52,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/motorcycle/kawasaki-z800/1.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/kawasaki-z800/2.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/kawasaki-z800/3.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/kawasaki-z800/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/motorcycle/kawasaki-z800/thumbnail.webp",
    "attributes": [
      [
        "Объём двигателя",
        "806 см³"
      ],
      [
        "Мощность",
        "113 л.с."
      ],
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "мотоцикл кавасаки mototsikl"
  },
  {
    "id": 1115,
    "title": "Спортбайк MotoGP CI.H1, гоночная реплика",
    "description": "Реплика гоночного мотоцикла с аэродинамическим обтекателем. Карбоновые детали и спортивная посадка. Для опытных райдеров и трек-дней.",
    "category": "avtotovary",
    "subcategory": "mototsikly",
    "brand": "MotoGP",
    "country": "italy",
    "color": "red",
    "material": "metal",
    "price": 189000000,
    "oldPrice": null,
    "rating": 4.2,
    "reviews": 58,
    "orders": 935,
    "stock": 10,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/motorcycle/motogp-ci.h1/1.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/motogp-ci.h1/2.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/motogp-ci.h1/3.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/motogp-ci.h1/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/motorcycle/motogp-ci.h1/thumbnail.webp",
    "attributes": [
      [
        "Объём двигателя",
        "1000 см³"
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "мотоцикл спортбайк mototsikl"
  },
  {
    "id": 1116,
    "title": "Скутер ScootMaster 150",
    "description": "Экономичный скутер для поездок по городу. Двигатель 150 см³, вариатор и электростартер. Вместительный багажник под сиденьем.",
    "category": "avtotovary",
    "subcategory": "skutery",
    "brand": "ScootMaster",
    "country": "china",
    "color": "black",
    "material": "metal",
    "price": 29900000,
    "oldPrice": null,
    "rating": 4,
    "reviews": 95,
    "orders": 988,
    "stock": 84,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/motorcycle/scooter-motorcycle/1.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/scooter-motorcycle/2.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/scooter-motorcycle/3.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/scooter-motorcycle/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/motorcycle/scooter-motorcycle/thumbnail.webp",
    "attributes": [
      [
        "Объём двигателя",
        "150 см³"
      ],
      [
        "Коробка передач",
        "Вариатор"
      ],
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "скутер мопед"
  },
  {
    "id": 1117,
    "title": "Спортбайк SpeedMaster 600",
    "description": "Спортивный мотоцикл среднего класса с двигателем 600 см³. Лёгкая рама и регулируемая подвеска. Отличный выбор для перехода с начального уровня.",
    "category": "avtotovary",
    "subcategory": "mototsikly",
    "brand": "SpeedMaster",
    "country": "china",
    "color": "black",
    "material": "metal",
    "price": 89000000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 132,
    "orders": 1041,
    "stock": 0,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/motorcycle/sportbike-motorcycle/1.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/sportbike-motorcycle/2.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/sportbike-motorcycle/3.webp",
      "https://cdn.dummyjson.com/product-images/motorcycle/sportbike-motorcycle/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/motorcycle/sportbike-motorcycle/thumbnail.webp",
    "attributes": [
      [
        "Объём двигателя",
        "600 см³"
      ],
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "мотоцикл спортбайк mototsikl"
  },
  {
    "id": 1118,
    "title": "Жидкое мыло для рук Attitude Super Leaves, 473 мл",
    "description": "Гипоаллергенное мыло с экстрактами листьев чая и оливы. Мягко очищает и не сушит кожу. Без парабенов и фталатов.",
    "category": "krasota-i-uhod",
    "subcategory": "uhod-za-telom",
    "brand": "Attitude",
    "country": "canada",
    "color": "green",
    "material": "plastic",
    "price": 79000,
    "oldPrice": 96000,
    "rating": 4.3,
    "reviews": 169,
    "orders": 1094,
    "stock": 94,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/1.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/2.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "473 мл"
      ],
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "мыло руки уход"
  },
  {
    "id": 1119,
    "title": "Гель для душа Olay Ultra Moisture с маслом ши, 500 мл",
    "description": "Кремовый гель с маслом ши для сухой кожи. Обильно пенится и оставляет кожу мягкой. Нежный аромат держится после душа.",
    "category": "krasota-i-uhod",
    "subcategory": "uhod-za-telom",
    "brand": "Olay",
    "country": "usa",
    "color": "white",
    "material": "plastic",
    "price": 99000,
    "oldPrice": 118000,
    "rating": 4.8,
    "reviews": 206,
    "orders": 1147,
    "stock": 34,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/1.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/2.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "500 мл"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "гель душ уход"
  },
  {
    "id": 1120,
    "title": "Лосьон для лица и тела Vaseline Men, 400 мл",
    "description": "Лёгкий мужской лосьон быстро впитывается и не оставляет жирной плёнки. Увлажняет кожу на 24 часа. Подходит для ежедневного использования после бритья.",
    "category": "krasota-i-uhod",
    "subcategory": "uhod-za-kozhey",
    "brand": "Vaseline",
    "country": "usa",
    "color": "blue",
    "material": "plastic",
    "price": 89000,
    "oldPrice": 102000,
    "rating": 4.3,
    "reviews": 243,
    "orders": 1200,
    "stock": 95,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/1.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/2.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/thumbnail.webp",
    "attributes": [
      [
        "Объём",
        "400 мл"
      ],
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "лосьон крем уход кожа"
  },
  {
    "id": 1121,
    "title": "Смартфон Apple iPhone 5s, восстановленный",
    "description": "Компактный iPhone с экраном 4\" и сканером отпечатков Touch ID. Восстановлен сервисным центром, новый аккумулятор. Хороший вариант запасного телефона.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Apple",
    "country": "usa",
    "color": "grey",
    "material": "aluminium",
    "memory": [
      "16 ГБ",
      "32 ГБ"
    ],
    "price": 1490000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 280,
    "orders": 1253,
    "stock": 25,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "4\""
      ],
      [
        "Камера",
        "8 Мп"
      ],
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "телефон смартфон айфон iphone telefon"
  },
  {
    "id": 1122,
    "title": "Смартфон Apple iPhone 6, восстановленный",
    "description": "iPhone с экраном 4.7\" и тонким алюминиевым корпусом. Восстановлен, проверен по 30 параметрам. Гарантия от продавца.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Apple",
    "country": "usa",
    "color": "silver",
    "material": "aluminium",
    "memory": [
      "32 ГБ",
      "64 ГБ"
    ],
    "price": 1990000,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 317,
    "orders": 1306,
    "stock": 60,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "4.7\""
      ],
      [
        "Камера",
        "8 Мп"
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "телефон смартфон айфон iphone telefon"
  },
  {
    "id": 1123,
    "title": "Смартфон Apple iPhone 13 Pro, небесно-голубой",
    "description": "Флагман с дисплеем ProMotion 120 Гц и тройной камерой с макросъёмкой. Чип A15 Bionic и до 22 часов видео. Корпус из нержавеющей стали и стекла Ceramic Shield.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Apple",
    "country": "usa",
    "color": "blue",
    "material": "steel",
    "memory": [
      "128 ГБ",
      "256 ГБ",
      "512 ГБ"
    ],
    "price": 14490000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 354,
    "orders": 1359,
    "stock": 56,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "6.1\""
      ],
      [
        "Камера",
        "12 + 12 + 12 Мп"
      ],
      [
        "Процессор",
        "A15 Bionic"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "телефон смартфон айфон iphone telefon"
  },
  {
    "id": 1124,
    "title": "Смартфон Apple iPhone X, серебристый",
    "description": "Первый iPhone с безрамочным OLED-экраном и Face ID. Двойная камера с оптической стабилизацией. Поддержка беспроводной зарядки.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Apple",
    "country": "usa",
    "color": "silver",
    "material": "glass",
    "memory": [
      "64 ГБ",
      "256 ГБ"
    ],
    "price": 5490000,
    "oldPrice": 6860000,
    "rating": 4,
    "reviews": 391,
    "orders": 1412,
    "stock": 37,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-x/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-x/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-x/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/iphone-x/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "5.8\""
      ],
      [
        "Камера",
        "12 + 12 Мп"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "телефон смартфон айфон iphone telefon"
  },
  {
    "id": 1125,
    "title": "Смартфон Oppo A57, 4/64 ГБ",
    "description": "Доступный смартфон с ёмким аккумулятором 5000 мА·ч и быстрой зарядкой 33 Вт. Экран 6.56\" и стереодинамики. Сканер отпечатка в кнопке питания.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Oppo",
    "country": "china",
    "color": "gold",
    "material": "plastic",
    "memory": [
      "64 ГБ",
      "128 ГБ"
    ],
    "price": 2290000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 8,
    "orders": 1465,
    "stock": 19,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/oppo-a57/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/oppo-a57/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/oppo-a57/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/oppo-a57/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "6.56\""
      ],
      [
        "Аккумулятор",
        "5000 мА·ч"
      ],
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "телефон смартфон оппо telefon"
  },
  {
    "id": 1126,
    "title": "Смартфон Oppo F19 Pro+ 5G",
    "description": "Смартфон с AMOLED-экраном и поддержкой 5G. Четыре камеры с ночным режимом для портретов. Быстрая зарядка 50 Вт заряжает телефон за 48 минут.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Oppo",
    "country": "china",
    "color": "silver",
    "material": "plastic",
    "memory": [
      "128 ГБ",
      "256 ГБ"
    ],
    "price": 3490000,
    "oldPrice": 4310000,
    "rating": 4.4,
    "reviews": 45,
    "orders": 1518,
    "stock": 78,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/oppo-f19-pro-plus/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/oppo-f19-pro-plus/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/oppo-f19-pro-plus/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/oppo-f19-pro-plus/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "6.43\""
      ],
      [
        "Камера",
        "48 Мп"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "телефон смартфон оппо telefon"
  },
  {
    "id": 1127,
    "title": "Смартфон Oppo K1 с подэкранным сканером",
    "description": "Смартфон с каплевидным вырезом и сканером отпечатков под экраном. Двойная камера 25 Мп для селфи. Стильный градиентный корпус.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Oppo",
    "country": "china",
    "color": "blue",
    "material": "glass",
    "memory": [
      "64 ГБ",
      "128 ГБ"
    ],
    "price": 2690000,
    "oldPrice": 3280000,
    "rating": 4.7,
    "reviews": 82,
    "orders": 1571,
    "stock": 55,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/oppo-k1/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/oppo-k1/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/oppo-k1/3.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/oppo-k1/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/oppo-k1/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "6.4\""
      ],
      [
        "Фронтальная камера",
        "25 Мп"
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "телефон смартфон оппо telefon"
  },
  {
    "id": 1128,
    "title": "Смартфон Realme C35, 4/64 ГБ",
    "description": "Бюджетный смартфон с камерой 50 Мп и экраном 6.6\" FHD+. Аккумулятор 5000 мА·ч хватает на два дня. Плоские грани и тонкий корпус 8.1 мм.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Realme",
    "country": "china",
    "color": "green",
    "material": "plastic",
    "memory": [
      "64 ГБ",
      "128 ГБ"
    ],
    "price": 1790000,
    "oldPrice": 2110000,
    "rating": 4.7,
    "reviews": 119,
    "orders": 1624,
    "stock": 48,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/realme-c35/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/realme-c35/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/realme-c35/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/realme-c35/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "6.6\""
      ],
      [
        "Камера",
        "50 Мп"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "телефон смартфон реалми telefon"
  },
  {
    "id": 1129,
    "title": "Смартфон Realme X с выдвижной камерой",
    "description": "Безрамочный AMOLED-экран без выреза благодаря выдвижной фронтальной камере. Основная камера 48 Мп. Процессор Snapdragon 710.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Realme",
    "country": "china",
    "color": "blue",
    "material": "glass",
    "memory": [
      "64 ГБ",
      "128 ГБ"
    ],
    "price": 2890000,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 156,
    "orders": 1677,
    "stock": 12,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/realme-x/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/realme-x/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/realme-x/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/realme-x/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "6.53\""
      ],
      [
        "Камера",
        "48 + 5 Мп"
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "телефон смартфон реалми telefon"
  },
  {
    "id": 1130,
    "title": "Смартфон Realme XT, 64 Мп",
    "description": "Смартфон с четверной камерой 64 Мп для детальных снимков. AMOLED-экран и сканер отпечатков под стеклом. Быстрая зарядка VOOC 20 Вт.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Realme",
    "country": "china",
    "color": "blue",
    "material": "glass",
    "memory": [
      "64 ГБ",
      "128 ГБ"
    ],
    "price": 3190000,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 193,
    "orders": 1730,
    "stock": 80,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/realme-xt/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/realme-xt/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/realme-xt/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/realme-xt/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "6.4\""
      ],
      [
        "Камера",
        "64 Мп"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "телефон смартфон реалми telefon"
  },
  {
    "id": 1131,
    "title": "Смартфон Samsung Galaxy S7, восстановленный",
    "description": "Компактный флагман Samsung с влагозащитой IP68. Камера с быстрым автофокусом Dual Pixel. Восстановлен, новый аккумулятор.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Samsung",
    "country": "korea",
    "color": "black",
    "material": "glass",
    "memory": [
      "32 ГБ"
    ],
    "price": 2490000,
    "oldPrice": 3110000,
    "rating": 4.3,
    "reviews": 230,
    "orders": 1783,
    "stock": 67,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s7/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s7/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s7/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s7/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "5.1\""
      ],
      [
        "Камера",
        "12 Мп"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "телефон смартфон самсунг samsung telefon"
  },
  {
    "id": 1132,
    "title": "Смартфон Samsung Galaxy S8, Midnight Black",
    "description": "Безрамочный экран Infinity Display с закруглёнными краями. Защита от воды IP68 и беспроводная зарядка. Восстановленный, с гарантией продавца.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Samsung",
    "country": "korea",
    "color": "black",
    "material": "glass",
    "memory": [
      "64 ГБ"
    ],
    "price": 3290000,
    "oldPrice": 4060000,
    "rating": 4.8,
    "reviews": 267,
    "orders": 1836,
    "stock": 0,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "5.8\""
      ],
      [
        "Камера",
        "12 Мп"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "телефон смартфон самсунг samsung telefon"
  },
  {
    "id": 1133,
    "title": "Смартфон Samsung Galaxy S10, 8/128 ГБ",
    "description": "Dynamic AMOLED-экран, ультразвуковой сканер отпечатков и тройная камера с широкоугольным модулем. Реверсивная беспроводная зарядка. Корпус из стекла Gorilla Glass 6.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Samsung",
    "country": "korea",
    "color": "black",
    "material": "glass",
    "memory": [
      "128 ГБ",
      "512 ГБ"
    ],
    "price": 5990000,
    "oldPrice": null,
    "rating": 4.2,
    "reviews": 304,
    "orders": 1889,
    "stock": 19,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "6.1\""
      ],
      [
        "Камера",
        "12 + 12 + 16 Мп"
      ]
    ],
    "keywords": "телефон смартфон самсунг samsung telefon"
  },
  {
    "id": 1134,
    "title": "Смартфон Vivo S1, 4/128 ГБ",
    "description": "Смартфон с Super AMOLED-экраном и тройной камерой с ИИ. Фронтальная камера 32 Мп для селфи. Аккумулятор 4500 мА·ч.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Vivo",
    "country": "china",
    "color": "blue",
    "material": "plastic",
    "memory": [
      "128 ГБ"
    ],
    "price": 2490000,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 341,
    "orders": 1942,
    "stock": 50,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/vivo-s1/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/vivo-s1/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/vivo-s1/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/vivo-s1/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "6.38\""
      ],
      [
        "Фронтальная камера",
        "32 Мп"
      ],
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "телефон смартфон виво telefon"
  },
  {
    "id": 1135,
    "title": "Смартфон Vivo V9, 4/64 ГБ",
    "description": "Смартфон с экраном 6.3\" и двойной основной камерой. Фронтальная камера 24 Мп с режимом портрета. Тонкий корпус с глянцевой задней панелью.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Vivo",
    "country": "china",
    "color": "gold",
    "material": "plastic",
    "memory": [
      "64 ГБ"
    ],
    "price": 2690000,
    "oldPrice": 3280000,
    "rating": 4.4,
    "reviews": 378,
    "orders": 1995,
    "stock": 82,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/vivo-v9/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/vivo-v9/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/vivo-v9/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/vivo-v9/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "6.3\""
      ],
      [
        "Фронтальная камера",
        "24 Мп"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "телефон смартфон виво telefon"
  },
  {
    "id": 1136,
    "title": "Смартфон Vivo X21 со сканером в экране",
    "description": "Один из первых смартфонов со сканером отпечатков в экране. Super AMOLED 6.28\" и двойная камера с ИИ-обработкой. Быстрая зарядка 18 Вт.",
    "category": "elektronika",
    "subcategory": "smartfony",
    "brand": "Vivo",
    "country": "china",
    "color": "red",
    "material": "glass",
    "memory": [
      "128 ГБ"
    ],
    "price": 3990000,
    "oldPrice": 4810000,
    "rating": 4.7,
    "reviews": 415,
    "orders": 2048,
    "stock": 7,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/smartphones/vivo-x21/1.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/vivo-x21/2.webp",
      "https://cdn.dummyjson.com/product-images/smartphones/vivo-x21/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/smartphones/vivo-x21/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "6.28\""
      ],
      [
        "Камера",
        "12 + 5 Мп"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "телефон смартфон виво telefon"
  },
  {
    "id": 1137,
    "title": "Мяч для американского футбола, детский",
    "description": "Мяч уменьшенного размера для детей от 6 лет. Прорезиненная поверхность с рельефом удобно ложится в руку. Подходит для игр во дворе и на пляже.",
    "category": "detskie-tovary",
    "subcategory": "igrushki-i-myachi",
    "brand": "ProSport",
    "country": "china",
    "color": "brown",
    "material": "leather",
    "price": 189000,
    "oldPrice": null,
    "rating": 5,
    "reviews": 32,
    "orders": 2101,
    "stock": 53,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/thumbnail.webp",
    "attributes": [
      [
        "Размер",
        "Junior"
      ],
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "мяч игрушка дети"
  },
  {
    "id": 1138,
    "title": "Мяч бейсбольный тренировочный",
    "description": "Мяч с пробковым ядром и кожаным покрытием на красной прошивке. Официальный размер и вес. Для тренировок и любительских матчей.",
    "category": "sport-i-otdyh",
    "subcategory": "beysbol-i-kriket",
    "brand": "ProSport",
    "country": "china",
    "color": "white",
    "material": "leather",
    "price": 79000,
    "oldPrice": null,
    "rating": 4,
    "reviews": 69,
    "orders": 2154,
    "stock": 100,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-ball/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-ball/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "бейсбол мяч спорт"
  },
  {
    "id": 1139,
    "title": "Перчатка бейсбольная кожаная, 12\"",
    "description": "Ловушка из натуральной кожи для игроков полевой зоны. Глубокий карман надёжно удерживает мяч. Регулируемый ремешок на запястье.",
    "category": "sport-i-otdyh",
    "subcategory": "beysbol-i-kriket",
    "brand": "ProSport",
    "country": "china",
    "color": "brown",
    "material": "leather",
    "price": 289000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 106,
    "orders": 2207,
    "stock": 22,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/1.webp",
      "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/2.webp",
      "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/thumbnail.webp",
    "attributes": [
      [
        "Размер",
        "12\""
      ],
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "бейсбол перчатка спорт"
  },
  {
    "id": 1140,
    "title": "Мяч баскетбольный, размер 7",
    "description": "Мяч из композитной кожи для зала и улицы. Глубокие канавки обеспечивают уверенный хват. Официальный размер для мужских игр.",
    "category": "sport-i-otdyh",
    "subcategory": "komandnye-igry",
    "brand": "ProSport",
    "country": "china",
    "color": "brown",
    "material": "leather",
    "price": 169000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 143,
    "orders": 2260,
    "stock": 75,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/basketball/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/basketball/thumbnail.webp",
    "attributes": [
      [
        "Размер",
        "7"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "баскетбол мяч спорт"
  },
  {
    "id": 1141,
    "title": "Кольцо баскетбольное с сеткой, 45 см",
    "description": "Стальное кольцо стандартного диаметра с нейлоновой сеткой. Крепится к щиту или стене. Порошковое покрытие защищает от ржавчины.",
    "category": "sport-i-otdyh",
    "subcategory": "komandnye-igry",
    "brand": "ProSport",
    "country": "china",
    "color": "red",
    "material": "steel",
    "price": 449000,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 180,
    "orders": 2313,
    "stock": 43,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/basketball-rim/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/basketball-rim/thumbnail.webp",
    "attributes": [
      [
        "Диаметр",
        "45 см"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "баскетбол кольцо спорт"
  },
  {
    "id": 1142,
    "title": "Мяч для крикета кожаный",
    "description": "Классический красный мяч с прошитым швом для игр с твёрдым мячом. Пробково-резиновое ядро. Для клубных тренировок.",
    "category": "sport-i-otdyh",
    "subcategory": "beysbol-i-kriket",
    "brand": "ProSport",
    "country": "india",
    "color": "red",
    "material": "leather",
    "price": 99000,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 217,
    "orders": 2366,
    "stock": 30,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-ball/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-ball/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "крикет мяч спорт"
  },
  {
    "id": 1143,
    "title": "Бита для крикета из английской ивы",
    "description": "Бита ручной работы с хорошо сбалансированным весом. Прорезиненная ручка гасит вибрацию. Подходит для профессиональных игр.",
    "category": "sport-i-otdyh",
    "subcategory": "beysbol-i-kriket",
    "brand": "ProSport",
    "country": "india",
    "color": "beige",
    "material": "wood",
    "price": 349000,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 254,
    "orders": 2419,
    "stock": 98,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-bat/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-bat/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "крикет бита спорт"
  },
  {
    "id": 1144,
    "title": "Шлем для крикета защитный",
    "description": "Шлем с прочным корпусом и стальной решёткой для лица. Мягкая подкладка и регулировка по размеру. Вентиляционные отверстия не дают перегреться.",
    "category": "sport-i-otdyh",
    "subcategory": "beysbol-i-kriket",
    "brand": "ProSport",
    "country": "india",
    "color": "blue",
    "material": "plastic",
    "price": 549000,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 291,
    "orders": 2472,
    "stock": 10,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet/1.webp",
      "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet/2.webp",
      "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet/3.webp",
      "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "крикет шлем спорт"
  },
  {
    "id": 1145,
    "title": "Калитка для крикета, набор стоек",
    "description": "Набор из трёх стоек и двух перекладин для разметки поля. Устойчивое основание для игры на любом покрытии. Удобная сумка для переноски.",
    "category": "sport-i-otdyh",
    "subcategory": "beysbol-i-kriket",
    "brand": "ProSport",
    "country": "india",
    "color": "beige",
    "material": "wood",
    "price": 329000,
    "oldPrice": 396000,
    "rating": 4.9,
    "reviews": 328,
    "orders": 2525,
    "stock": 25,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-wicket/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-wicket/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "крикет спорт"
  },
  {
    "id": 1146,
    "title": "Воланы перьевые для бадминтона, 12 шт",
    "description": "Воланы из натурального гусиного пера с пробковой головкой. Стабильная траектория полёта. Для тренировок и турниров.",
    "category": "sport-i-otdyh",
    "subcategory": "tennis-i-badminton",
    "brand": "ProSport",
    "country": "china",
    "color": "white",
    "price": 69000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 365,
    "orders": 2578,
    "stock": 95,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/feather-shuttlecock/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/feather-shuttlecock/thumbnail.webp",
    "attributes": [
      [
        "Количество",
        "12 шт"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "бадминтон воланы спорт"
  },
  {
    "id": 1147,
    "title": "Мяч футбольный, размер 5",
    "description": "Мяч с термосклеенными панелями для игры на натуральном и искусственном газоне. Отлично держит форму и не впитывает воду. Официальный размер.",
    "category": "sport-i-otdyh",
    "subcategory": "komandnye-igry",
    "brand": "ProSport",
    "country": "china",
    "color": "white",
    "material": "leather",
    "price": 199000,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 402,
    "orders": 2631,
    "stock": 96,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/football/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/football/thumbnail.webp",
    "attributes": [
      [
        "Размер",
        "5"
      ],
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "футбол мяч спорт futbol"
  },
  {
    "id": 1148,
    "title": "Мячи для гольфа, 3 шт",
    "description": "Двухслойные мячи с ионономерным покрытием для дальнего полёта. Подходят начинающим и любителям. Устойчивы к порезам.",
    "category": "sport-i-otdyh",
    "subcategory": "golf",
    "brand": "ProSport",
    "country": "usa",
    "color": "white",
    "price": 119000,
    "oldPrice": 143000,
    "rating": 4.7,
    "reviews": 19,
    "orders": 84,
    "stock": 84,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/golf-ball/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/golf-ball/thumbnail.webp",
    "attributes": [
      [
        "Количество",
        "3 шт"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "гольф мяч спорт"
  },
  {
    "id": 1149,
    "title": "Клюшка для гольфа, айрон №7",
    "description": "Клюшка со стальным валом и полостью в задней части головы для прощения ошибок. Резиновая рукоятка не скользит. Для правшей.",
    "category": "sport-i-otdyh",
    "subcategory": "golf",
    "brand": "ProSport",
    "country": "usa",
    "color": "silver",
    "material": "steel",
    "price": 790000,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 56,
    "orders": 137,
    "stock": 90,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/iron-golf/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/iron-golf/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "гольф клюшка спорт"
  },
  {
    "id": 1150,
    "title": "Бита бейсбольная алюминиевая, 32\"",
    "description": "Лёгкая и прочная бита из авиационного алюминия. Сбалансирована для быстрого замаха. Подходит для тренировок и самообороны в машине.",
    "category": "sport-i-otdyh",
    "subcategory": "beysbol-i-kriket",
    "brand": "ProSport",
    "country": "china",
    "color": "silver",
    "material": "aluminium",
    "price": 359000,
    "oldPrice": 449000,
    "rating": 4.9,
    "reviews": 93,
    "orders": 190,
    "stock": 16,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/metal-baseball-bat/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/metal-baseball-bat/thumbnail.webp",
    "attributes": [
      [
        "Длина",
        "32\""
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "бейсбол бита спорт"
  },
  {
    "id": 1151,
    "title": "Мячи для большого тенниса, 3 шт",
    "description": "Мячи с войлочным покрытием для всех типов кортов. Стабильный отскок даже после долгой игры. В герметичной банке.",
    "category": "sport-i-otdyh",
    "subcategory": "tennis-i-badminton",
    "brand": "ProSport",
    "country": "china",
    "color": "yellow",
    "price": 79000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 130,
    "orders": 243,
    "stock": 28,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/tennis-ball/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/tennis-ball/thumbnail.webp",
    "attributes": [
      [
        "Количество",
        "3 шт"
      ],
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "теннис мяч спорт"
  },
  {
    "id": 1152,
    "title": "Ракетка для большого тенниса, графит",
    "description": "Лёгкая ракетка из графита для любителей и продвинутых игроков. Увеличенная головка прощает неточные удары. Чехол в комплекте.",
    "category": "sport-i-otdyh",
    "subcategory": "tennis-i-badminton",
    "brand": "ProSport",
    "country": "china",
    "color": "red",
    "material": "plastic",
    "price": 690000,
    "oldPrice": 863000,
    "rating": 4.6,
    "reviews": 167,
    "orders": 296,
    "stock": 6,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/tennis-racket/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/tennis-racket/thumbnail.webp",
    "attributes": [
      [
        "Вес",
        "280 г"
      ],
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "теннис ракетка спорт"
  },
  {
    "id": 1153,
    "title": "Мяч волейбольный мягкий, для детей",
    "description": "Мягкий мяч уменьшенного веса для первых тренировок. Не отбивает руки и безопасен для игры в помещении. Яркая расцветка.",
    "category": "detskie-tovary",
    "subcategory": "igrushki-i-myachi",
    "brand": "ProSport",
    "country": "china",
    "color": "blue",
    "material": "leather",
    "price": 129000,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 204,
    "orders": 349,
    "stock": 0,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/sports-accessories/volleyball/1.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sports-accessories/volleyball/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 неделя"
      ]
    ],
    "keywords": "мяч волейбол игрушка дети"
  },
  {
    "id": 1154,
    "title": "Солнцезащитные очки Fashion Shades, чёрные",
    "description": "Очки с поляризационными линзами и защитой UV400. Пластиковая оправа классической формы. Подходят для города и пляжа.",
    "category": "aksessuary",
    "subcategory": "ochki",
    "brand": "Fashion Shades",
    "country": "china",
    "color": "black",
    "material": "plastic",
    "price": 249000,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 241,
    "orders": 402,
    "stock": 60,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/1.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/thumbnail.webp",
    "attributes": [
      [
        "Защита",
        "UV400"
      ]
    ],
    "keywords": "очки солнцезащитные ko'zoynak"
  },
  {
    "id": 1155,
    "title": "Солнцезащитные очки классические",
    "description": "Универсальные очки в лёгкой оправе с тонированными линзами. Защищают от ультрафиолета категории UV400. Футляр в комплекте.",
    "category": "aksessuary",
    "subcategory": "ochki",
    "brand": "Fashion Shades",
    "country": "china",
    "color": "blue",
    "material": "plastic",
    "price": 219000,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 278,
    "orders": 455,
    "stock": 1,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/1.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/thumbnail.webp",
    "attributes": [
      [
        "Защита",
        "UV400"
      ],
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "очки солнцезащитные ko'zoynak"
  },
  {
    "id": 1156,
    "title": "Солнцезащитные очки зелёно-чёрные",
    "description": "Очки с зеркальными зелёными линзами в чёрной оправе. Поляризация убирает блики от воды и асфальта. Удобные заушники не давят.",
    "category": "aksessuary",
    "subcategory": "ochki",
    "brand": "Fashion Shades",
    "country": "china",
    "color": "green",
    "material": "plastic",
    "price": 279000,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 315,
    "orders": 508,
    "stock": 24,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/1.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/thumbnail.webp",
    "attributes": [
      [
        "Защита",
        "UV400"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "очки солнцезащитные ko'zoynak"
  },
  {
    "id": 1157,
    "title": "Очки для вечеринки в яркой оправе",
    "description": "Забавные очки для фотосессий, праздников и тематических вечеринок. Лёгкая оправа и тонированные линзы. Отличный подарок.",
    "category": "aksessuary",
    "subcategory": "ochki",
    "brand": "Fashion Fun",
    "country": "china",
    "color": "red",
    "material": "plastic",
    "price": 99000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 352,
    "orders": 561,
    "stock": 86,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/sunglasses/party-glasses/1.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/party-glasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/party-glasses/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sunglasses/party-glasses/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "очки вечеринка"
  },
  {
    "id": 1158,
    "title": "Солнцезащитные очки-авиаторы",
    "description": "Классические авиаторы в металлической оправе. Линзы с защитой UV400. Подходят к любой форме лица.",
    "category": "aksessuary",
    "subcategory": "ochki",
    "brand": "Fashion Shades",
    "country": "china",
    "color": "gold",
    "material": "metal",
    "price": 199000,
    "oldPrice": null,
    "rating": 4.2,
    "reviews": 389,
    "orders": 614,
    "stock": 27,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/1.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/thumbnail.webp",
    "attributes": [
      [
        "Защита",
        "UV400"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "очки солнцезащитные авиаторы ko'zoynak"
  },
  {
    "id": 1159,
    "title": "Планшет Apple iPad mini 2021, «сияющая звезда»",
    "description": "Компактный iPad с экраном Liquid Retina 8.3\" и чипом A15 Bionic. Поддержка Apple Pencil 2 и 5G. Удобен для чтения, заметок и игр.",
    "category": "elektronika",
    "subcategory": "planshety",
    "brand": "Apple",
    "country": "usa",
    "color": "gold",
    "material": "aluminium",
    "memory": [
      "64 ГБ",
      "256 ГБ"
    ],
    "price": 7990000,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 6,
    "orders": 667,
    "stock": 47,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/1.webp",
      "https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/2.webp",
      "https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/3.webp",
      "https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "8.3\""
      ],
      [
        "Процессор",
        "A15 Bionic"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "планшет айпад ipad planshet"
  },
  {
    "id": 1160,
    "title": "Планшет Samsung Galaxy Tab S8+, графит",
    "description": "Планшет с Super AMOLED-экраном 12.4\" и стилусом S Pen в комплекте. Процессор Snapdragon 8 Gen 1. Четыре динамика AKG.",
    "category": "elektronika",
    "subcategory": "planshety",
    "brand": "Samsung",
    "country": "korea",
    "color": "grey",
    "material": "aluminium",
    "memory": [
      "128 ГБ",
      "256 ГБ"
    ],
    "price": 10490000,
    "oldPrice": 12060000,
    "rating": 4.9,
    "reviews": 43,
    "orders": 720,
    "stock": 62,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-s8-plus-grey/1.webp",
      "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-s8-plus-grey/2.webp",
      "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-s8-plus-grey/3.webp",
      "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-s8-plus-grey/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-s8-plus-grey/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "12.4\""
      ],
      [
        "Стилус",
        "S Pen в комплекте"
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "планшет самсунг planshet"
  },
  {
    "id": 1161,
    "title": "Планшет Samsung Galaxy Tab A, белый",
    "description": "Доступный планшет для учёбы, видео и видеозвонков. Экран 10.1\" и ёмкий аккумулятор. Режим «Дети» с родительским контролем.",
    "category": "elektronika",
    "subcategory": "planshety",
    "brand": "Samsung",
    "country": "korea",
    "color": "white",
    "material": "aluminium",
    "memory": [
      "32 ГБ",
      "64 ГБ"
    ],
    "price": 3990000,
    "oldPrice": 4870000,
    "rating": 4.5,
    "reviews": 80,
    "orders": 773,
    "stock": 92,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-white/1.webp",
      "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-white/2.webp",
      "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-white/3.webp",
      "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-white/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-white/thumbnail.webp",
    "attributes": [
      [
        "Диагональ",
        "10.1\""
      ],
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "планшет самсунг planshet"
  },
  {
    "id": 1162,
    "title": "Платье для девочки голубое, хлопок",
    "description": "Нарядное платье из мягкого хлопка с пышной юбкой. Застёжка на спине на пуговицах. Подходит для праздников и прогулок.",
    "category": "detskie-tovary",
    "subcategory": "detskaya-odezhda",
    "brand": "Little Star",
    "country": "uzbekistan",
    "color": "blue",
    "material": "cotton",
    "sizes": [
      "110",
      "116",
      "122",
      "128"
    ],
    "price": 189000,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 117,
    "orders": 826,
    "stock": 52,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/tops/blue-frock/1.webp",
      "https://cdn.dummyjson.com/product-images/tops/blue-frock/2.webp",
      "https://cdn.dummyjson.com/product-images/tops/blue-frock/3.webp",
      "https://cdn.dummyjson.com/product-images/tops/blue-frock/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "платье девочка детская одежда"
  },
  {
    "id": 1163,
    "title": "Летнее платье для девочки, хлопок",
    "description": "Лёгкое платье из натурального хлопка для жарких дней. Свободный силуэт не сковывает движений. Не теряет цвет после стирки.",
    "category": "detskie-tovary",
    "subcategory": "detskaya-odezhda",
    "brand": "Little Star",
    "country": "uzbekistan",
    "color": "grey",
    "material": "cotton",
    "sizes": [
      "104",
      "110",
      "116",
      "122"
    ],
    "price": 159000,
    "oldPrice": 196000,
    "rating": 4.9,
    "reviews": 154,
    "orders": 879,
    "stock": 43,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/1.webp",
      "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/2.webp",
      "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/3.webp",
      "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "платье сарафан девочка детская одежда"
  },
  {
    "id": 1164,
    "title": "Платье женское серое миди",
    "description": "Платье прямого силуэта из мягкого трикотажа. Длина миди и рукав три четверти. Подходит для офиса и повседневных образов.",
    "category": "odezhda",
    "subcategory": "platya",
    "brand": "Bella Moda",
    "country": "turkey",
    "color": "grey",
    "material": "textile",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "price": 349000,
    "oldPrice": 406000,
    "rating": 4.1,
    "reviews": 191,
    "orders": 932,
    "stock": 55,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/tops/gray-dress/1.webp",
      "https://cdn.dummyjson.com/product-images/tops/gray-dress/2.webp",
      "https://cdn.dummyjson.com/product-images/tops/gray-dress/3.webp",
      "https://cdn.dummyjson.com/product-images/tops/gray-dress/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/tops/gray-dress/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "платье женская одежда ko'ylak"
  },
  {
    "id": 1165,
    "title": "Платье короткое для девочки",
    "description": "Короткое платье-трапеция для девочки. Ткань дышит и не мнётся. Для садика, школы и прогулок.",
    "category": "detskie-tovary",
    "subcategory": "detskaya-odezhda",
    "brand": "Little Star",
    "country": "uzbekistan",
    "color": "blue",
    "material": "cotton",
    "sizes": [
      "98",
      "104",
      "110",
      "116"
    ],
    "price": 169000,
    "oldPrice": 194000,
    "rating": 4.3,
    "reviews": 228,
    "orders": 985,
    "stock": 22,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/tops/short-frock/1.webp",
      "https://cdn.dummyjson.com/product-images/tops/short-frock/2.webp",
      "https://cdn.dummyjson.com/product-images/tops/short-frock/3.webp",
      "https://cdn.dummyjson.com/product-images/tops/short-frock/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/tops/short-frock/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "платье девочка детская одежда"
  },
  {
    "id": 1166,
    "title": "Платье женское в клетку тартан, серое",
    "description": "Платье в шотландскую клетку с отложным воротником и поясом. Плотная ткань для прохладной погоды. Сочетается с ботинками и колготками.",
    "category": "odezhda",
    "subcategory": "platya",
    "brand": "Bella Moda",
    "country": "turkey",
    "color": "grey",
    "material": "textile",
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "price": 389000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 265,
    "orders": 1038,
    "stock": 73,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/tops/tartan-dress/1.webp",
      "https://cdn.dummyjson.com/product-images/tops/tartan-dress/2.webp",
      "https://cdn.dummyjson.com/product-images/tops/tartan-dress/3.webp",
      "https://cdn.dummyjson.com/product-images/tops/tartan-dress/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/tops/tartan-dress/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "платье женская одежда ko'ylak"
  },
  {
    "id": 1167,
    "title": "Автомобиль Chrysler 300 Touring, седан",
    "description": "Полноразмерный седан с просторным салоном и плавным ходом. Двигатель V6 3.6 л, 8-ступенчатый автомат. Кожаный салон и мультимедиа Uconnect.",
    "category": "avtotovary",
    "subcategory": "avtomobili",
    "brand": "Chrysler",
    "country": "usa",
    "color": "black",
    "material": "metal",
    "price": 420000000,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 302,
    "orders": 1091,
    "stock": 54,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/vehicle/300-touring/1.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/300-touring/2.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/300-touring/3.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/300-touring/4.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/300-touring/5.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/300-touring/6.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/vehicle/300-touring/thumbnail.webp",
    "attributes": [
      [
        "Двигатель",
        "3.6 л V6"
      ],
      [
        "Коробка передач",
        "Автомат"
      ],
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "машина авто автомобиль mashina"
  },
  {
    "id": 1168,
    "title": "Автомобиль Dodge Charger SXT RWD",
    "description": "Спортивный седан с задним приводом и узнаваемым агрессивным дизайном. Двигатель V6 мощностью 300 л.с. Пять полноценных мест.",
    "category": "avtotovary",
    "subcategory": "avtomobili",
    "brand": "Dodge",
    "country": "usa",
    "color": "blue",
    "material": "metal",
    "price": 480000000,
    "oldPrice": null,
    "rating": 4,
    "reviews": 339,
    "orders": 1144,
    "stock": 57,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/vehicle/charger-sxt-rwd/1.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/charger-sxt-rwd/2.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/charger-sxt-rwd/3.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/charger-sxt-rwd/4.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/charger-sxt-rwd/5.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/charger-sxt-rwd/6.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/vehicle/charger-sxt-rwd/thumbnail.webp",
    "attributes": [
      [
        "Двигатель",
        "3.6 л V6"
      ],
      [
        "Мощность",
        "300 л.с."
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "машина авто автомобиль mashina"
  },
  {
    "id": 1169,
    "title": "Автомобиль Dodge Hornet GT Plus, кроссовер",
    "description": "Компактный кроссовер с полным приводом и турбомотором 268 л.с. Цифровая панель приборов и адаптивный круиз-контроль. Удобен и в городе, и за городом.",
    "category": "avtotovary",
    "subcategory": "avtomobili",
    "brand": "Dodge",
    "country": "usa",
    "color": "grey",
    "material": "metal",
    "price": 360000000,
    "oldPrice": null,
    "rating": 4.1,
    "reviews": 376,
    "orders": 1197,
    "stock": 82,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/vehicle/dodge-hornet-gt-plus/1.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/dodge-hornet-gt-plus/2.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/dodge-hornet-gt-plus/3.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/dodge-hornet-gt-plus/4.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/dodge-hornet-gt-plus/5.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/dodge-hornet-gt-plus/6.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/vehicle/dodge-hornet-gt-plus/thumbnail.webp",
    "attributes": [
      [
        "Двигатель",
        "2.0 л турбо"
      ],
      [
        "Привод",
        "Полный"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "машина авто кроссовер mashina"
  },
  {
    "id": 1170,
    "title": "Автомобиль Dodge Durango SXT RWD, внедорожник",
    "description": "Семиместный внедорожник с мощным V6 и вместительным багажником. Буксирует прицеп до 2.8 тонн. Три ряда комфортных сидений.",
    "category": "avtotovary",
    "subcategory": "avtomobili",
    "brand": "Dodge",
    "country": "usa",
    "color": "black",
    "material": "metal",
    "price": 540000000,
    "oldPrice": 642860000,
    "rating": 4.6,
    "reviews": 413,
    "orders": 1250,
    "stock": 95,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/vehicle/durango-sxt-rwd/1.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/durango-sxt-rwd/2.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/durango-sxt-rwd/3.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/durango-sxt-rwd/4.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/durango-sxt-rwd/5.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/durango-sxt-rwd/6.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/vehicle/durango-sxt-rwd/thumbnail.webp",
    "attributes": [
      [
        "Количество мест",
        "7"
      ],
      [
        "Двигатель",
        "3.6 л V6"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "машина авто внедорожник mashina"
  },
  {
    "id": 1171,
    "title": "Автомобиль Chrysler Pacifica Touring, минивэн",
    "description": "Семейный минивэн с раздвижными дверями и сиденьями Stow 'n Go, убирающимися в пол. Восемь мест и развлекательная система для задних рядов. Экономичный и тихий.",
    "category": "avtotovary",
    "subcategory": "avtomobili",
    "brand": "Chrysler",
    "country": "usa",
    "color": "grey",
    "material": "metal",
    "price": 470000000,
    "oldPrice": 552940000,
    "rating": 4.4,
    "reviews": 30,
    "orders": 1303,
    "stock": 53,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/vehicle/pacifica-touring/1.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/pacifica-touring/2.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/pacifica-touring/3.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/pacifica-touring/4.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/pacifica-touring/5.webp",
      "https://cdn.dummyjson.com/product-images/vehicle/pacifica-touring/6.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/vehicle/pacifica-touring/thumbnail.webp",
    "attributes": [
      [
        "Количество мест",
        "8"
      ],
      [
        "Двигатель",
        "3.6 л V6"
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "машина авто минивэн mashina"
  },
  {
    "id": 1172,
    "title": "Сумка женская Fashionista, синяя",
    "description": "Вместительная сумка-тоут из экокожи с двумя ручками. Внутри — карман на молнии и отделение для телефона. Подходит для работы и покупок.",
    "category": "aksessuary",
    "subcategory": "sumki",
    "brand": "Fashionista",
    "country": "china",
    "color": "blue",
    "material": "leather",
    "price": 449000,
    "oldPrice": 548000,
    "rating": 4.2,
    "reviews": 67,
    "orders": 1356,
    "stock": 76,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-bags/blue-women%27s-handbag/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/blue-women%27s-handbag/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/blue-women%27s-handbag/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-bags/blue-women%27s-handbag/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "сумка женская sumka"
  },
  {
    "id": 1173,
    "title": "Сумка женская Heshe из натуральной кожи",
    "description": "Сумка из мягкой натуральной кожи с регулируемым плечевым ремнём. Три отделения и магнитная застёжка. Кожа со временем становится только красивее.",
    "category": "aksessuary",
    "subcategory": "sumki",
    "brand": "Heshe",
    "country": "china",
    "color": "brown",
    "material": "leather",
    "price": 1290000,
    "oldPrice": null,
    "rating": 5,
    "reviews": 104,
    "orders": 1409,
    "stock": 99,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women%27s-leather-bag/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women%27s-leather-bag/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women%27s-leather-bag/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women%27s-leather-bag/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "сумка кожаная sumka"
  },
  {
    "id": 1174,
    "title": "Сумка Prada женская, сафьяновая кожа",
    "description": "Культовая сумка из сафьяновой кожи с металлическим логотипом. Две ручки и съёмный плечевой ремень. Поставляется с пыльником и карточкой подлинности.",
    "category": "aksessuary",
    "subcategory": "sumki",
    "brand": "Prada",
    "country": "italy",
    "color": "blue",
    "material": "leather",
    "price": 8990000,
    "oldPrice": 10450000,
    "rating": 4.1,
    "reviews": 141,
    "orders": 1462,
    "stock": 75,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "сумка прада sumka"
  },
  {
    "id": 1175,
    "title": "Рюкзак женский Urban Chic из экокожи, белый",
    "description": "Городской рюкзак с отделением для планшета до 10\". Мягкие регулируемые лямки и карман на спинке от карманников. Лёгкий и стильный.",
    "category": "aksessuary",
    "subcategory": "sumki",
    "brand": "Urban Chic",
    "country": "china",
    "color": "white",
    "material": "leather",
    "price": 389000,
    "oldPrice": 458000,
    "rating": 4.3,
    "reviews": 178,
    "orders": 1515,
    "stock": 39,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "рюкзак сумка ryukzak"
  },
  {
    "id": 1176,
    "title": "Сумка женская Elegance Collection, чёрная",
    "description": "Строгая сумка структурированной формы для делового гардероба. Помещает документы А4. Металлическая фурнитура и подкладка из сатина.",
    "category": "aksessuary",
    "subcategory": "sumki",
    "brand": "Elegance Collection",
    "country": "turkey",
    "color": "black",
    "material": "leather",
    "price": 549000,
    "oldPrice": null,
    "rating": 4.2,
    "reviews": 215,
    "orders": 1568,
    "stock": 11,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "сумка женская sumka"
  },
  {
    "id": 1177,
    "title": "Платье вечернее женское чёрное, в пол",
    "description": "Элегантное платье в пол с открытыми плечами. Струящаяся ткань красиво драпируется. Для выпускного, свадьбы и торжеств.",
    "category": "odezhda",
    "subcategory": "platya",
    "brand": "Bella Moda",
    "country": "turkey",
    "color": "black",
    "material": "textile",
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "price": 1190000,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 252,
    "orders": 1621,
    "stock": 25,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-dresses/black-women%27s-gown/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/black-women%27s-gown/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/black-women%27s-gown/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/black-women%27s-gown/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-dresses/black-women%27s-gown/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "платье вечернее женская одежда"
  },
  {
    "id": 1178,
    "title": "Комплект: кожаный корсет и юбка",
    "description": "Эффектный комплект из корсета на шнуровке и юбки-карандаша из экокожи. Подчёркивает талию и силуэт. Для вечеринок и фотосессий.",
    "category": "odezhda",
    "subcategory": "kostyumy-i-yubki",
    "brand": "Bella Moda",
    "country": "turkey",
    "color": "red",
    "material": "leather",
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "price": 890000,
    "oldPrice": 1060000,
    "rating": 4.2,
    "reviews": 289,
    "orders": 1674,
    "stock": 30,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "корсет юбка женская одежда"
  },
  {
    "id": 1179,
    "title": "Корсет с чёрной юбкой, комплект",
    "description": "Комплект из корсетного топа и пышной юбки миди. Плотная ткань держит форму. Застёжка-молния сбоку.",
    "category": "odezhda",
    "subcategory": "kostyumy-i-yubki",
    "brand": "Bella Moda",
    "country": "turkey",
    "color": "black",
    "material": "textile",
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "price": 790000,
    "oldPrice": 929000,
    "rating": 4.8,
    "reviews": 326,
    "orders": 1727,
    "stock": 33,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "корсет юбка женская одежда"
  },
  {
    "id": 1180,
    "title": "Платье женское в горошек",
    "description": "Романтичное платье в мелкий горошек с расклешённой юбкой. Пояс подчёркивает талию. Лёгкая вискоза для тёплой погоды.",
    "category": "odezhda",
    "subcategory": "platya",
    "brand": "Bella Moda",
    "country": "turkey",
    "color": "white",
    "material": "textile",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "price": 459000,
    "oldPrice": 560000,
    "rating": 5,
    "reviews": 363,
    "orders": 1780,
    "stock": 6,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "платье горошек женская одежда ko'ylak"
  },
  {
    "id": 1181,
    "title": "Костюм женский Marni, красно-чёрный",
    "description": "Брючный костюм из пиджака и прямых брюк. Контрастные лацканы и свободная посадка. Смелый образ для офиса и выхода.",
    "category": "odezhda",
    "subcategory": "kostyumy-i-yubki",
    "brand": "Marni",
    "country": "italy",
    "color": "red",
    "material": "textile",
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "price": 1690000,
    "oldPrice": 2090000,
    "rating": 4.8,
    "reviews": 400,
    "orders": 1833,
    "stock": 62,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "костюм женская одежда"
  },
  {
    "id": 1182,
    "title": "Серьги с зелёными кристаллами",
    "description": "Нарядные серьги-подвески с гранёными кристаллами изумрудного цвета. Основа из серебра 925 пробы. Застёжка-английский замок.",
    "category": "aksessuary",
    "subcategory": "ukrasheniya",
    "brand": "Silver Line",
    "country": "turkey",
    "color": "green",
    "material": "metal",
    "price": 289000,
    "oldPrice": 340000,
    "rating": 4.6,
    "reviews": 17,
    "orders": 1886,
    "stock": 54,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-jewellery/green-crystal-earring/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-jewellery/green-crystal-earring/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-jewellery/green-crystal-earring/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-crystal-earring/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "серьги украшения sirg'a"
  },
  {
    "id": 1183,
    "title": "Серьги овальные с зелёной вставкой",
    "description": "Лаконичные серьги с овальной вставкой из стекла. Позолоченная фурнитура. Подходят к вечерним и дневным образам.",
    "category": "aksessuary",
    "subcategory": "ukrasheniya",
    "brand": "Silver Line",
    "country": "turkey",
    "color": "green",
    "material": "metal",
    "price": 239000,
    "oldPrice": 281000,
    "rating": 4.4,
    "reviews": 54,
    "orders": 1939,
    "stock": 73,
    "deliveryDays": 3,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-jewellery/green-oval-earring/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-jewellery/green-oval-earring/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-jewellery/green-oval-earring/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-oval-earring/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 месяца"
      ]
    ],
    "keywords": "серьги украшения sirg'a"
  },
  {
    "id": 1184,
    "title": "Серьги «Тропики» с подвесками",
    "description": "Яркие летние серьги с подвесками в тропическом стиле. Лёгкие, не оттягивают мочку. Гипоаллергенный сплав.",
    "category": "aksessuary",
    "subcategory": "ukrasheniya",
    "brand": "Silver Line",
    "country": "china",
    "color": "multi",
    "material": "metal",
    "price": 189000,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 91,
    "orders": 1992,
    "stock": 1,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-jewellery/tropical-earring/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-jewellery/tropical-earring/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-jewellery/tropical-earring/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-jewellery/tropical-earring/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "3 года"
      ]
    ],
    "keywords": "серьги украшения sirg'a"
  },
  {
    "id": 1185,
    "title": "Тапочки домашние чёрно-коричневые",
    "description": "Тёплые тапочки с мягкой стелькой из пены с эффектом памяти. Нескользящая подошва. Можно стирать в машинке.",
    "category": "obuv",
    "subcategory": "domashnyaya-obuv",
    "brand": "Comfort Trends",
    "country": "china",
    "color": "brown",
    "material": "textile",
    "sizes": [
      "36",
      "37",
      "38",
      "39",
      "40"
    ],
    "price": 129000,
    "oldPrice": null,
    "rating": 4,
    "reviews": 128,
    "orders": 2045,
    "stock": 3,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-shoes/black-&-brown-slipper/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/black-&-brown-slipper/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/black-&-brown-slipper/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/black-&-brown-slipper/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-shoes/black-&-brown-slipper/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "Пожизненная"
      ]
    ],
    "keywords": "тапочки обувь домашняя shippak"
  },
  {
    "id": 1186,
    "title": "Туфли женские Calvin Klein на каблуке",
    "description": "Классические лодочки из гладкой кожи на устойчивом каблуке 9 см. Мягкая стелька для комфорта весь день. Для офиса и мероприятий.",
    "category": "obuv",
    "subcategory": "zhenskie-tufli",
    "brand": "Calvin Klein",
    "country": "usa",
    "color": "black",
    "material": "leather",
    "sizes": [
      "36",
      "37",
      "38",
      "39",
      "40"
    ],
    "price": 990000,
    "oldPrice": null,
    "rating": 5,
    "reviews": 165,
    "orders": 2098,
    "stock": 93,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "туфли каблук обувь женская tufli"
  },
  {
    "id": 1187,
    "title": "Туфли женские золотистые",
    "description": "Праздничные туфли с металлическим блеском на среднем каблуке. Ремешок вокруг щиколотки надёжно фиксирует стопу. Для торжеств и вечеринок.",
    "category": "obuv",
    "subcategory": "zhenskie-tufli",
    "brand": "Fashion Diva",
    "country": "turkey",
    "color": "gold",
    "material": "leather",
    "sizes": [
      "36",
      "37",
      "38",
      "39"
    ],
    "price": 549000,
    "oldPrice": 638000,
    "rating": 4.3,
    "reviews": 202,
    "orders": 2151,
    "stock": 88,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-shoes/golden-shoes-woman/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/golden-shoes-woman/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/golden-shoes-woman/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/golden-shoes-woman/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-shoes/golden-shoes-woman/thumbnail.webp",
    "attributes": [
      [
        "Гарантия",
        "6 месяцев"
      ]
    ],
    "keywords": "туфли обувь женская tufli"
  },
  {
    "id": 1188,
    "title": "Туфли Pampi повседневные",
    "description": "Удобные туфли на низком ходу для ежедневной носки. Мягкая кожа и гибкая подошва. Не натирают с первого дня.",
    "category": "obuv",
    "subcategory": "povsednevnaya-obuv",
    "brand": "Pampi",
    "country": "turkey",
    "color": "beige",
    "material": "leather",
    "sizes": [
      "36",
      "37",
      "38",
      "39",
      "40"
    ],
    "price": 349000,
    "oldPrice": 406000,
    "rating": 4.2,
    "reviews": 239,
    "orders": 2204,
    "stock": 49,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-shoes/pampi-shoes/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/pampi-shoes/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/pampi-shoes/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/pampi-shoes/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-shoes/pampi-shoes/thumbnail.webp",
    "attributes": [],
    "keywords": "туфли обувь женская"
  },
  {
    "id": 1189,
    "title": "Туфли женские красные",
    "description": "Яркие туфли-лодочки с острым носком. Каблук 7 см устойчив и удобен. Добавят акцент любому образу.",
    "category": "obuv",
    "subcategory": "zhenskie-tufli",
    "brand": "Fashion Express",
    "country": "turkey",
    "color": "red",
    "material": "leather",
    "sizes": [
      "36",
      "37",
      "38",
      "39"
    ],
    "price": 389000,
    "oldPrice": 474000,
    "rating": 4.3,
    "reviews": 276,
    "orders": 2257,
    "stock": 7,
    "deliveryDays": 6,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes/4.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes/thumbnail.webp",
    "attributes": [],
    "keywords": "туфли обувь женская tufli"
  },
  {
    "id": 1190,
    "title": "Часы IWC Ingenieur Automatic, сталь",
    "description": "Швейцарские часы с антимагнитной защитой и механизмом собственного производства. Стальной корпус 40 мм и интегрированный браслет. Водозащита 100 м.",
    "category": "aksessuary",
    "subcategory": "chasy",
    "brand": "IWC",
    "country": "switzerland",
    "color": "silver",
    "material": "steel",
    "price": 64900000,
    "oldPrice": null,
    "rating": 4.2,
    "reviews": 313,
    "orders": 2310,
    "stock": 90,
    "deliveryDays": 1,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-watches/iwc-ingenieur-automatic-steel/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-watches/iwc-ingenieur-automatic-steel/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-watches/iwc-ingenieur-automatic-steel/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-watches/iwc-ingenieur-automatic-steel/thumbnail.webp",
    "attributes": [
      [
        "Механизм",
        "Механический с автоподзаводом"
      ],
      [
        "Водозащита",
        "100 м"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "часы швейцарские soat"
  },
  {
    "id": 1191,
    "title": "Часы Rolex Cellini Moonphase, женская версия",
    "description": "Изящные часы с лунным календарём на синем эмалевом диске. Корпус из розового золота. Безупречный выбор для особого подарка.",
    "category": "aksessuary",
    "subcategory": "chasy",
    "brand": "Rolex",
    "country": "switzerland",
    "color": "gold",
    "material": "leather",
    "price": 199000000,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 350,
    "orders": 2363,
    "stock": 52,
    "deliveryDays": 4,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-watches/rolex-cellini-moonphase/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-watches/rolex-cellini-moonphase/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-watches/rolex-cellini-moonphase/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-cellini-moonphase/thumbnail.webp",
    "attributes": [
      [
        "Механизм",
        "Механический с автоподзаводом"
      ],
      [
        "Гарантия",
        "1 месяц"
      ]
    ],
    "keywords": "часы ролекс женские soat"
  },
  {
    "id": 1192,
    "title": "Часы Rolex Datejust 31 женские",
    "description": "Классические женские часы с датой и бриллиантовыми метками. Браслет Jubilee из стали и золота. Вечная модель, которая не выходит из моды.",
    "category": "aksessuary",
    "subcategory": "chasy",
    "brand": "Rolex",
    "country": "switzerland",
    "color": "gold",
    "material": "steel",
    "price": 149000000,
    "oldPrice": 177380000,
    "rating": 4.1,
    "reviews": 387,
    "orders": 2416,
    "stock": 4,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-watches/rolex-datejust-women/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-watches/rolex-datejust-women/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-watches/rolex-datejust-women/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-datejust-women/thumbnail.webp",
    "attributes": [
      [
        "Механизм",
        "Механический с автоподзаводом"
      ],
      [
        "Диаметр корпуса",
        "31 мм"
      ],
      [
        "Гарантия",
        "5 лет"
      ]
    ],
    "keywords": "часы ролекс женские soat"
  },
  {
    "id": 1193,
    "title": "Часы женские Fashion Gold, золотистые",
    "description": "Элегантные кварцевые часы с браслетом-цепочкой. Циферблат украшен стразами. Поставляются в подарочной коробке.",
    "category": "aksessuary",
    "subcategory": "chasy",
    "brand": "Fashion Gold",
    "country": "china",
    "color": "gold",
    "material": "steel",
    "price": 1490000,
    "oldPrice": 1820000,
    "rating": 4.7,
    "reviews": 4,
    "orders": 2469,
    "stock": 0,
    "deliveryDays": 2,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-watches/watch-gold-for-women/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-watches/watch-gold-for-women/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-watches/watch-gold-for-women/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-watches/watch-gold-for-women/thumbnail.webp",
    "attributes": [
      [
        "Механизм",
        "Кварцевый"
      ],
      [
        "Гарантия",
        "2 года"
      ]
    ],
    "keywords": "часы женские soat"
  },
  {
    "id": 1194,
    "title": "Часы наручные женские Fashion Co., на ремешке",
    "description": "Повседневные часы с крупным читаемым циферблатом. Ремешок из экокожи и стальной корпус. Водозащита 3 ATM.",
    "category": "aksessuary",
    "subcategory": "chasy",
    "brand": "Fashion Co.",
    "country": "china",
    "color": "black",
    "material": "leather",
    "price": 590000,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 41,
    "orders": 2522,
    "stock": 12,
    "deliveryDays": 5,
    "images": [
      "https://cdn.dummyjson.com/product-images/womens-watches/women%27s-wrist-watch/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-watches/women%27s-wrist-watch/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-watches/women%27s-wrist-watch/3.webp"
    ],
    "thumbnail": "https://cdn.dummyjson.com/product-images/womens-watches/women%27s-wrist-watch/thumbnail.webp",
    "attributes": [
      [
        "Механизм",
        "Кварцевый"
      ],
      [
        "Водозащита",
        "3 ATM"
      ],
      [
        "Гарантия",
        "1 год"
      ]
    ],
    "keywords": "часы женские soat"
  }
]
