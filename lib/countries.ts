import type { Locale } from '@/app/[locale]/dictionaries'

export interface Country {
  slug: string
  name: string
  countryCode: string
  flag: string
  intro: Record<Locale, string>
}

/**
 * Slug = canonical country slug (lowercase, hyphenated).
 * Matches the `country` field in data/destinations.json after slugify.
 */
export function countrySlug(country: string): string {
  return country
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export const COUNTRIES: Country[] = [
  {
    slug: 'france',
    name: 'France',
    countryCode: 'FR',
    flag: '🇫🇷',
    intro: {
      en: 'France runs the largest linked ski areas in the world (Les 3 Vallées, Paradiski, Espace Killy) and offers the most reliable season in Europe. French Alps resorts dominate the market on sheer scale and altitude.',
      fr: 'La France abrite les plus grands domaines reliés au monde (3 Vallées, Paradiski, Espace Killy) et propose la saison la plus fiable d\'Europe. Les stations des Alpes françaises dominent le marché par la taille et l\'altitude.',
      es: 'Francia alberga los mayores dominios conectados del mundo (Les 3 Vallées, Paradiski, Espace Killy) y ofrece la temporada más fiable de Europa. Las estaciones de los Alpes franceses dominan el mercado por tamaño y altitud.',
      pt: 'A França alberga os maiores domínios ligados do mundo (Les 3 Vallées, Paradiski, Espace Killy) e oferece a época mais fiável da Europa. As estâncias dos Alpes franceses dominam o mercado pela escala e altitude.',
    },
  },
  {
    slug: 'switzerland',
    name: 'Switzerland',
    countryCode: 'CH',
    flag: '🇨🇭',
    intro: {
      en: 'Iconic peaks (Matterhorn, Eiger, Jungfrau), the highest village in Europe at Zermatt, car-free luxury and the best-groomed runs in the Alps. Premium pricing for a premium product.',
      fr: 'Sommets iconiques (Cervin, Eiger, Jungfrau), plus haut village d\'Europe à Zermatt, luxe sans voitures et les pistes les mieux damées des Alpes. Tarifs premium pour un produit premium.',
      es: 'Cumbres icónicas (Matterhorn, Eiger, Jungfrau), el pueblo más alto de Europa en Zermatt, lujo sin coches y las pistas mejor pisadas de los Alpes. Tarifas premium para un producto premium.',
      pt: 'Cumes icónicos (Matterhorn, Eiger, Jungfrau), a aldeia mais alta da Europa em Zermatt, luxo sem carros e as pistas mais bem batidas dos Alpes. Tarifas premium para um produto premium.',
    },
  },
  {
    slug: 'austria',
    name: 'Austria',
    countryCode: 'AT',
    flag: '🇦🇹',
    intro: {
      en: 'Austria is the home of alpine skiing: cradle of the Arlberg method, dense ski-in/ski-out villages, the loudest après-ski in Europe at St. Anton and Ischgl, and World Cup history at Kitzbühel.',
      fr: 'L\'Autriche est la patrie du ski alpin : berceau de la méthode de l\'Arlberg, villages ski-in/ski-out très denses, après-ski le plus déchaîné d\'Europe à Saint-Anton et Ischgl, et toute l\'histoire de la Coupe du Monde à Kitzbühel.',
      es: 'Austria es la cuna del esquí alpino : origen de la escuela del Arlberg, pueblos ski-in/ski-out muy densos, el après-ski más desbocado de Europa en Saint Anton e Ischgl, y la historia de la Copa del Mundo en Kitzbühel.',
      pt: 'A Áustria é a pátria do esqui alpino: berço da escola de Arlberg, aldeias ski-in/ski-out muito densas, o après-ski mais desenfreado da Europa em Saint Anton e Ischgl, e toda a história da Taça do Mundo em Kitzbühel.',
    },
  },
  {
    slug: 'italy',
    name: 'Italy',
    countryCode: 'IT',
    flag: '🇮🇹',
    intro: {
      en: 'Italy gives you the Dolomiti Superski (1,200 km on a single pass), hosts the 2026 Winter Olympics at Cortina, and serves up the most photogenic lunches on the slopes in the Alps. Strong price-to-quality ratio too.',
      fr: 'L\'Italie, c\'est le Dolomiti Superski (1 200 km sur un seul forfait), l\'organisation des Jeux Olympiques d\'hiver 2026 à Cortina, et les déjeuners sur les pistes les plus photogéniques des Alpes. Excellent rapport qualité-prix en prime.',
      es: 'Italia ofrece el Dolomiti Superski (1.200 km con un solo forfait), la organización de los Juegos Olímpicos de Invierno 2026 en Cortina, y los almuerzos en las pistas más fotogénicos de los Alpes. Excelente relación calidad-precio además.',
      pt: 'A Itália oferece o Dolomiti Superski (1.200 km com um único forfait), a organização dos Jogos Olímpicos de Inverno 2026 em Cortina, e os almoços nas pistas mais fotogénicos dos Alpes. Excelente relação qualidade-preço por cima.',
    },
  },
  {
    slug: 'spain',
    name: 'Spain',
    countryCode: 'ES',
    flag: '🇪🇸',
    intro: {
      en: 'Pyrenees skiing with sunshine: the Spanish side gets more sun than the French side. Baqueira-Beret is the royal family\'s choice, and Formigal hosts the wildest après-ski in Spain.',
      fr: 'Le ski des Pyrénées sous le soleil : le versant espagnol est plus ensoleillé que le français. Baqueira-Beret est le choix de la famille royale et Formigal accueille l\'après-ski le plus déchaîné d\'Espagne.',
      es: 'Esquí en los Pirineos con sol : la vertiente española recibe más sol que la francesa. Baqueira-Beret es la elección de la familia real y Formigal acoge el après-ski más desbocado de España.',
      pt: 'Esqui nos Pirenéus com sol: a vertente espanhola apanha mais sol do que a francesa. Baqueira-Beret é a escolha da família real e Formigal acolhe o après-ski mais desenfreado de Espanha.',
    },
  },
  {
    slug: 'andorra',
    name: 'Andorra',
    countryCode: 'AD',
    flag: '🇦🇩',
    intro: {
      en: 'Tax-free shopping combined with the largest ski domain in the Pyrenees, Grandvalira. It is the best value-for-money pick on the European ski map, particularly friendly to beginners and tighter budgets.',
      fr: 'Shopping détaxé et plus grand domaine skiable des Pyrénées, Grandvalira. C\'est le meilleur rapport qualité-prix du ski européen, idéal pour les débutants et les budgets serrés.',
      es: 'Compras libres de impuestos y el mayor dominio esquiable de los Pirineos, Grandvalira. Es la mejor relación calidad-precio del esquí europeo, ideal para principiantes y presupuestos ajustados.',
      pt: 'Compras isentas de impostos e o maior domínio esquiável dos Pirenéus, Grandvalira. É a melhor relação qualidade-preço do esqui europeu, ideal para principiantes e orçamentos mais apertados.',
    },
  },
]

export function getCountry(slug: string): Country | undefined {
  return COUNTRIES.find((c) => c.slug === slug)
}
