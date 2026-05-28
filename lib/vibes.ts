import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Localised vibe labels shown as chips on cards and destination pages.
 * Source slugs live in data/destinations.json. Industry terms that natives
 * use as-is (freeride, freestyle, boutique, Skicircus, Sellaronda) and proper
 * nouns are kept untranslated on purpose, exactly as a local writer would.
 */
const VIBES: Record<string, Record<Locale, string>> = {
  'high-altitude': { en: 'high altitude', fr: 'haute altitude', es: 'alta altitud', pt: 'alta altitude' },
  party: { en: 'party', fr: 'fête', es: 'fiesta', pt: 'festa' },
  freeride: { en: 'freeride', fr: 'freeride', es: 'freeride', pt: 'freeride' },
  luxury: { en: 'luxury', fr: 'luxe', es: 'lujo', pt: 'luxo' },
  racing: { en: 'racing', fr: 'compétition', es: 'competición', pt: 'competição' },
  family: { en: 'family', fr: 'famille', es: 'familia', pt: 'família' },
  gastronomy: { en: 'gastronomy', fr: 'gastronomie', es: 'gastronomía', pt: 'gastronomia' },
  chalet: { en: 'chalet', fr: 'chalet', es: 'chalet', pt: 'chalé' },
  'british-friendly': { en: 'British-friendly', fr: 'public britannique', es: 'público británico', pt: 'público britânico' },
  mountaineering: { en: 'mountaineering', fr: 'alpinisme', es: 'alpinismo', pt: 'alpinismo' },
  iconic: { en: 'iconic', fr: 'emblématique', es: 'icónico', pt: 'icónico' },
  value: { en: 'value', fr: 'bon plan', es: 'buena relación', pt: 'boa relação' },
  glacier: { en: 'glacier', fr: 'glacier', es: 'glaciar', pt: 'glaciar' },
  sunny: { en: 'sunny', fr: 'ensoleillé', es: 'soleado', pt: 'solarengo' },
  authentic: { en: 'authentic', fr: 'authentique', es: 'auténtico', pt: 'autêntico' },
  'tree-skiing': { en: 'tree skiing', fr: 'ski en forêt', es: 'esquí en bosque', pt: 'esqui em floresta' },
  thermal: { en: 'thermal', fr: 'thermal', es: 'termal', pt: 'termal' },
  'winter-sports': { en: 'winter sports', fr: 'sports d\'hiver', es: 'deportes de invierno', pt: 'desportos de inverno' },
  'car-free': { en: 'car-free', fr: 'sans voitures', es: 'sin coches', pt: 'sem carros' },
  'summer-ski': { en: 'summer skiing', fr: 'ski d\'été', es: 'esquí de verano', pt: 'esqui de verão' },
  'big-domain': { en: 'big domain', fr: 'grand domaine', es: 'gran dominio', pt: 'grande domínio' },
  wellness: { en: 'wellness', fr: 'bien-être', es: 'bienestar', pt: 'bem-estar' },
  expert: { en: 'expert', fr: 'expert', es: 'experto', pt: 'experto' },
  concerts: { en: 'concerts', fr: 'concerts', es: 'conciertos', pt: 'concertos' },
  'duty-free': { en: 'duty-free', fr: 'détaxé', es: 'libre de impuestos', pt: 'isento de impostos' },
  freestyle: { en: 'freestyle', fr: 'freestyle', es: 'freestyle', pt: 'freestyle' },
  historic: { en: 'historic', fr: 'historique', es: 'histórico', pt: 'histórico' },
  'old-money': { en: 'old money', fr: 'chic discret', es: 'lujo clásico', pt: 'luxo clássico' },
  skicircus: { en: 'Skicircus', fr: 'Skicircus', es: 'Skicircus', pt: 'Skicircus' },
  'snow-sure': { en: 'snow-sure', fr: 'enneigement garanti', es: 'nieve garantizada', pt: 'neve garantida' },
  discreet: { en: 'discreet', fr: 'discret', es: 'discreto', pt: 'discreto' },
  dolomites: { en: 'Dolomites', fr: 'Dolomites', es: 'Dolomitas', pt: 'Dolomitas' },
  scenic: { en: 'scenic', fr: 'panoramique', es: 'panorámico', pt: 'panorâmico' },
  'cross-border': { en: 'cross-border', fr: 'transfrontalier', es: 'transfronterizo', pt: 'transfronteiriço' },
  elegance: { en: 'elegance', fr: 'élégance', es: 'elegancia', pt: 'elegância' },
  italian: { en: 'Italian', fr: 'à l\'italienne', es: 'a la italiana', pt: 'à italiana' },
  habsburg: { en: 'Habsburg', fr: 'Habsbourg', es: 'Habsburgo', pt: 'Habsburgo' },
  'milky-way': { en: 'Milky Way', fr: 'Voie lactée', es: 'Vía láctea', pt: 'Via láctea' },
  'dolomiti-superski': { en: 'Dolomiti Superski', fr: 'Dolomiti Superski', es: 'Dolomiti Superski', pt: 'Dolomiti Superski' },
  sellaronda: { en: 'Sellaronda', fr: 'Sellaronda', es: 'Sellaronda', pt: 'Sellaronda' },
  panoramic: { en: 'panoramic', fr: 'panoramique', es: 'panorámico', pt: 'panorâmico' },
  'luxury-iberian': { en: 'Iberian luxury', fr: 'luxe ibérique', es: 'lujo ibérico', pt: 'luxo ibérico' },
  royal: { en: 'royal', fr: 'royal', es: 'real', pt: 'real' },
  village: { en: 'village', fr: 'village', es: 'pueblo', pt: 'aldeia' },
  altitude: { en: 'altitude', fr: 'altitude', es: 'altitud', pt: 'altitude' },
  'young-crowd': { en: 'young crowd', fr: 'public jeune', es: 'público joven', pt: 'público jovem' },
  beginner: { en: 'beginner', fr: 'débutant', es: 'principiante', pt: 'principiante' },
  'altitude-pyrenees': { en: 'high Pyrenees', fr: 'Pyrénées d\'altitude', es: 'Pirineos en altitud', pt: 'Pirenéus em altitude' },
  sunshine: { en: 'sunshine', fr: 'soleil', es: 'sol', pt: 'sol' },
  'altitude-training': { en: 'altitude training', fr: 'entraînement en altitude', es: 'entrenamiento en altitud', pt: 'treino em altitude' },
  'pyrenees-grand': { en: 'grand Pyrenees', fr: 'grandes Pyrénées', es: 'grandes Pirineos', pt: 'grandes Pirenéus' },
  'cycling-meets-ski': { en: 'cycling meets ski', fr: 'vélo et ski', es: 'ciclismo y esquí', pt: 'ciclismo e esqui' },
  'thermal-belle-epoque': { en: 'Belle Époque spa', fr: 'thermal Belle Époque', es: 'termal Belle Époque', pt: 'termal Belle Époque' },
  'national-park': { en: 'national park', fr: 'parc national', es: 'parque nacional', pt: 'parque nacional' },
  boutique: { en: 'boutique', fr: 'boutique', es: 'boutique', pt: 'boutique' },
  renaissance: { en: 'renaissance', fr: 'renaissance', es: 'renacimiento', pt: 'renascimento' },
}

export function localizeVibe(slug: string, locale: Locale): string {
  const entry = VIBES[slug]
  if (entry) return entry[locale]
  // Fallback: turn the slug into a readable label.
  return slug.replace(/-/g, ' ')
}
