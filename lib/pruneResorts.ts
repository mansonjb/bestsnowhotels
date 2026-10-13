/**
 * Stations obscures a tres faible valeur : 1-3 hotels (reel, pas un artefact de
 * scrape sur ces stations la) ET ~0 impression sur 3 mois ET hors champion
 * famille / couverture StaysInSwitzerland / grand domaine relie. Mises en
 * noindex,follow + exclues du sitemap pour baisser le ratio de pages minces
 * (recuperation apres le spam update Google de septembre 2026). Reversible :
 * retirer le slug d'ici reindexe la station.
 *
 * NE PAS confondre avec les stations CELEBRES a peu d'hotels (St-Moritz,
 * Grandvalira, Portillo, Zell am See...) : celles-la sont sous-scrapees et
 * doivent etre ENRICHIES (re-scrape ville-base), pas coupees.
 */
export const PRUNE_RESORTS = new Set<string>([
  'valfrejus',
  'port-aine',
  'hauteluce',
  'ascou',
  'saint-leger-les-melezes',
  'aillons-margeriaz',
  'carezza',
  'see',
  'klewenalp-stockhuette',
  'tschiertschen',
  'reallon',
  'saint-honore-1500',
  'castelrotto',
  'pizol',
  'ofterschwang',
  'roldal',
  'riksgransen',
  'funasdalen',
  'taos-ski-valley',
  'welli-hilli-park',
  'sugarloaf',
])

export const isPruned = (slug: string): boolean => PRUNE_RESORTS.has(slug)
