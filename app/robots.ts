import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/**
 * Crawlers commerciaux sans valeur SEO ni GEO : outils de backlink, scrapers
 * de data B2B, agrégateurs. Ils ne nous envoient aucun trafic et aucune
 * citation, mais ils crawlent en volume et chaque hit sur une page ISR
 * expirée declenche une regeneration facturee (ISR Writes + Fast Origin
 * Transfer). Blocage = pure economie, zero perte de visibilite.
 */
const COST_HOSTILE_BOTS = [
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'BLEXBot',
  'DataForSeoBot',
  'Barkrowler',
  'SeekportBot',
  'serpstatbot',
  'ZoominfoBot',
  'MegaIndex.ru',
  'SiteAuditBot',
  'Bytespider',
  'PetalBot',
  'ImagesiftBot',
  'magpie-crawler',
  'YisouSpider',
  'VelenPublicWebCrawler',
  'Timpibot',
  'Diffbot',
  'omgili',
  'omgilibot',
  'TurnitinBot',
  'SEOkicks',
  'linkdexbot',
  'spbot',
  'trendictionbot',
  'AwarioBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Les routes opengraph-image sont des fonctions : chaque fetch coute une
      // invocation + du CPU. Ce sont des images, elles n'ont rien a faire dans
      // l'index. Les scrapers sociaux passent par la regle '*' ci-dessus, donc
      // les apercus de lien continuent de marcher.
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: '/',
        disallow: ['/api/', '/_next/', '/*opengraph-image'],
      },
      // Crawlers IA / LLM : bienvenus, on veut etre cite dans les reponses.
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'Amazonbot', allow: '/' },
      { userAgent: 'DuckAssistBot', allow: '/' },
      { userAgent: COST_HOSTILE_BOTS, disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
