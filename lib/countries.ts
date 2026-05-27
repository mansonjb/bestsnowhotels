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
      en: 'The biggest linked ski areas in the world (Les 3 Vallées, Paradiski, Espace Killy) and the longest reliable season — French Alps stations rule the European market for sheer scale and altitude.',
      fr: 'Les plus grands domaines reliés au monde (3 Vallées, Paradiski, Espace Killy) et la saison la plus fiable — les stations des Alpes françaises dominent le marché européen par leur taille et leur altitude.',
      es: 'Los mayores dominios enlazados del mundo (Les 3 Vallées, Paradiski, Espace Killy) y la temporada más fiable — las estaciones de los Alpes franceses dominan el mercado europeo por escala y altitud.',
      pt: 'Os maiores domínios ligados do mundo (Les 3 Vallées, Paradiski, Espace Killy) e a época mais fiável — as estâncias dos Alpes franceses dominam o mercado europeu pela escala e altitude.',
    },
  },
  {
    slug: 'switzerland',
    name: 'Switzerland',
    countryCode: 'CH',
    flag: '🇨🇭',
    intro: {
      en: 'Iconic peaks (Matterhorn, Eiger, Jungfrau), the highest village in Europe (Zermatt), car-free luxury and the best-groomed runs in the Alps. Premium pricing, premium product.',
      fr: 'Sommets iconiques (Cervin, Eiger, Jungfrau), le plus haut village d\'Europe (Zermatt), luxe sans voitures et les pistes les mieux damées des Alpes. Prix premium, produit premium.',
      es: 'Cumbres icónicas (Matterhorn, Eiger, Jungfrau), el pueblo más alto de Europa (Zermatt), lujo sin coches y las pistas mejor pisadas de los Alpes. Precio premium, producto premium.',
      pt: 'Cumes icónicos (Matterhorn, Eiger, Jungfrau), a aldeia mais alta da Europa (Zermatt), luxo sem carros e as pistas mais bem batidas dos Alpes. Preço premium, produto premium.',
    },
  },
  {
    slug: 'austria',
    name: 'Austria',
    countryCode: 'AT',
    flag: '🇦🇹',
    intro: {
      en: 'The home of alpine skiing: cradle of the Arlberg method, dense ski-in/ski-out villages, the loudest après-ski in Europe (St. Anton, Ischgl) and World Cup history at Kitzbühel.',
      fr: 'La patrie du ski alpin : berceau de la méthode Arlberg, villages ski-in/ski-out denses, l\'après-ski le plus bruyant d\'Europe (St. Anton, Ischgl) et l\'histoire de la Coupe du Monde à Kitzbühel.',
      es: 'La cuna del esquí alpino: origen del método Arlberg, pueblos ski-in/ski-out densos, el après-ski más ruidoso de Europa (St. Anton, Ischgl) y la historia de la Copa del Mundo en Kitzbühel.',
      pt: 'A pátria do esqui alpino: berço do método Arlberg, aldeias ski-in/ski-out densas, o après-ski mais ruidoso da Europa (St. Anton, Ischgl) e a história da Taça do Mundo em Kitzbühel.',
    },
  },
  {
    slug: 'italy',
    name: 'Italy',
    countryCode: 'IT',
    flag: '🇮🇹',
    intro: {
      en: 'Dolomiti Superski (1,200 km in one pass), 2026 Winter Olympics, the most photogenic lunches on the slopes, and the best price-quality ratio in the Alps.',
      fr: 'Dolomiti Superski (1 200 km sur un seul forfait), Jeux Olympiques d\'hiver 2026, les déjeuners sur les pistes les plus photogéniques, et le meilleur rapport qualité-prix des Alpes.',
      es: 'Dolomiti Superski (1.200 km con un solo forfait), Juegos Olímpicos de Invierno 2026, los almuerzos en las pistas más fotogénicos y la mejor relación calidad-precio de los Alpes.',
      pt: 'Dolomiti Superski (1.200 km com um único forfait), Jogos Olímpicos de Inverno 2026, os almoços nas pistas mais fotogénicos e a melhor relação qualidade-preço dos Alpes.',
    },
  },
  {
    slug: 'spain',
    name: 'Spain',
    countryCode: 'ES',
    flag: '🇪🇸',
    intro: {
      en: 'Pyrenees skiing with sunshine — the Spanish side gets more sun than the French side. Baqueira-Beret is royalty\'s choice, Formigal hosts Spain\'s best après-ski.',
      fr: 'Le ski des Pyrénées sous le soleil — le versant espagnol prend plus de soleil que le français. Baqueira-Beret est le choix de la famille royale, Formigal a le meilleur après-ski d\'Espagne.',
      es: 'Esquí en los Pirineos con sol — la vertiente española recibe más sol que la francesa. Baqueira-Beret es la elección de la familia real, Formigal tiene el mejor après-ski de España.',
      pt: 'Esqui nos Pirenéus com sol — a vertente espanhola recebe mais sol que a francesa. Baqueira-Beret é a escolha da família real, Formigal tem o melhor après-ski de Espanha.',
    },
  },
  {
    slug: 'andorra',
    name: 'Andorra',
    countryCode: 'AD',
    flag: '🇦🇩',
    intro: {
      en: 'Tax-free shopping plus the largest ski domain in the Pyrenees (Grandvalira). The best value for money in the European ski market — beginner-friendly and budget-friendly.',
      fr: 'Shopping détaxé et le plus grand domaine skiable des Pyrénées (Grandvalira). Le meilleur rapport qualité-prix du marché ski européen — idéal débutants et budgets serrés.',
      es: 'Compras libres de impuestos y el mayor dominio esquiable de los Pirineos (Grandvalira). La mejor relación calidad-precio del mercado de esquí europeo — ideal para principiantes y presupuestos ajustados.',
      pt: 'Compras isentas de impostos e o maior domínio esquiável dos Pirenéus (Grandvalira). A melhor relação qualidade-preço do mercado de esqui europeu — ideal para principiantes e orçamentos apertados.',
    },
  },
]

export function getCountry(slug: string): Country | undefined {
  return COUNTRIES.find((c) => c.slug === slug)
}
