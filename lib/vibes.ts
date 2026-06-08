import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Localised vibe labels shown as chips on cards and destination pages.
 * Source slugs live in data/destinations.json. Industry terms that natives
 * use as-is (freeride, freestyle, boutique, Skicircus, Sellaronda) and proper
 * nouns are kept untranslated on purpose, exactly as a local writer would.
 */
const VIBES: Record<string, Record<Locale, string>> = {
  'high-altitude': { en: 'high altitude', fr: 'haute altitude', es: 'alta altitud', pt: 'alta altitude', it: 'alta quota' },
  party: { en: 'party', fr: 'fête', es: 'fiesta', pt: 'festa', it: 'festa' },
  freeride: { en: 'freeride', fr: 'freeride', es: 'freeride', pt: 'freeride', it: 'freeride' },
  luxury: { en: 'luxury', fr: 'luxe', es: 'lujo', pt: 'luxo', it: 'lusso' },
  racing: { en: 'racing', fr: 'compétition', es: 'competición', pt: 'competição', it: 'agonismo' },
  family: { en: 'family', fr: 'famille', es: 'familia', pt: 'família', it: 'famiglia' },
  gastronomy: { en: 'gastronomy', fr: 'gastronomie', es: 'gastronomía', pt: 'gastronomia', it: 'gastronomia' },
  chalet: { en: 'chalet', fr: 'chalet', es: 'chalet', pt: 'chalé', it: 'chalet' },
  'british-friendly': { en: 'British-friendly', fr: 'public britannique', es: 'público británico', pt: 'público britânico', it: 'pubblico britannico' },
  mountaineering: { en: 'mountaineering', fr: 'alpinisme', es: 'alpinismo', pt: 'alpinismo', it: 'alpinismo' },
  iconic: { en: 'iconic', fr: 'emblématique', es: 'icónico', pt: 'icónico', it: 'iconica' },
  value: { en: 'value', fr: 'bon plan', es: 'buena relación', pt: 'boa relação', it: 'ottimo prezzo' },
  glacier: { en: 'glacier', fr: 'glacier', es: 'glaciar', pt: 'glaciar', it: 'ghiacciaio' },
  sunny: { en: 'sunny', fr: 'ensoleillé', es: 'soleado', pt: 'solarengo', it: 'soleggiata' },
  authentic: { en: 'authentic', fr: 'authentique', es: 'auténtico', pt: 'autêntico', it: 'autentica' },
  'tree-skiing': { en: 'tree skiing', fr: 'ski en forêt', es: 'esquí en bosque', pt: 'esqui em floresta', it: 'sci nei boschi' },
  thermal: { en: 'thermal', fr: 'thermal', es: 'termal', pt: 'termal', it: 'terme' },
  'winter-sports': { en: 'winter sports', fr: 'sports d\'hiver', es: 'deportes de invierno', pt: 'desportos de inverno', it: 'sport invernali' },
  'car-free': { en: 'car-free', fr: 'sans voitures', es: 'sin coches', pt: 'sem carros', it: 'senza auto' },
  'summer-ski': { en: 'summer skiing', fr: 'ski d\'été', es: 'esquí de verano', pt: 'esqui de verão', it: 'sci estivo' },
  'big-domain': { en: 'big domain', fr: 'grand domaine', es: 'gran dominio', pt: 'grande domínio', it: 'grande comprensorio' },
  wellness: { en: 'wellness', fr: 'bien-être', es: 'bienestar', pt: 'bem-estar', it: 'benessere' },
  expert: { en: 'expert', fr: 'expert', es: 'experto', pt: 'experto', it: 'esperti' },
  concerts: { en: 'concerts', fr: 'concerts', es: 'conciertos', pt: 'concertos', it: 'concerti' },
  'duty-free': { en: 'duty-free', fr: 'détaxé', es: 'libre de impuestos', pt: 'isento de impostos', it: 'duty-free' },
  freestyle: { en: 'freestyle', fr: 'freestyle', es: 'freestyle', pt: 'freestyle', it: 'freestyle' },
  historic: { en: 'historic', fr: 'historique', es: 'histórico', pt: 'histórico', it: 'storica' },
  'old-money': { en: 'old money', fr: 'chic discret', es: 'lujo clásico', pt: 'luxo clássico', it: 'eleganza discreta' },
  skicircus: { en: 'Skicircus', fr: 'Skicircus', es: 'Skicircus', pt: 'Skicircus', it: 'Skicircus' },
  'snow-sure': { en: 'snow-sure', fr: 'enneigement garanti', es: 'nieve garantizada', pt: 'neve garantida', it: 'neve sicura' },
  discreet: { en: 'discreet', fr: 'discret', es: 'discreto', pt: 'discreto', it: 'discreta' },
  dolomites: { en: 'Dolomites', fr: 'Dolomites', es: 'Dolomitas', pt: 'Dolomitas', it: 'Dolomiti' },
  scenic: { en: 'scenic', fr: 'panoramique', es: 'panorámico', pt: 'panorâmico', it: 'panoramica' },
  'cross-border': { en: 'cross-border', fr: 'transfrontalier', es: 'transfronterizo', pt: 'transfronteiriço', it: 'transfrontaliera' },
  elegance: { en: 'elegance', fr: 'élégance', es: 'elegancia', pt: 'elegância', it: 'eleganza' },
  italian: { en: 'Italian', fr: 'à l\'italienne', es: 'a la italiana', pt: 'à italiana', it: 'all\'italiana' },
  habsburg: { en: 'Habsburg', fr: 'Habsbourg', es: 'Habsburgo', pt: 'Habsburgo', it: 'Asburgo' },
  'milky-way': { en: 'Milky Way', fr: 'Voie lactée', es: 'Vía láctea', pt: 'Via láctea', it: 'Via Lattea' },
  'dolomiti-superski': { en: 'Dolomiti Superski', fr: 'Dolomiti Superski', es: 'Dolomiti Superski', pt: 'Dolomiti Superski', it: 'Dolomiti Superski' },
  sellaronda: { en: 'Sellaronda', fr: 'Sellaronda', es: 'Sellaronda', pt: 'Sellaronda', it: 'Sellaronda' },
  panoramic: { en: 'panoramic', fr: 'panoramique', es: 'panorámico', pt: 'panorâmico', it: 'panoramica' },
  'luxury-iberian': { en: 'Iberian luxury', fr: 'luxe ibérique', es: 'lujo ibérico', pt: 'luxo ibérico', it: 'lusso iberico' },
  royal: { en: 'royal', fr: 'royal', es: 'real', pt: 'real', it: 'reale' },
  village: { en: 'village', fr: 'village', es: 'pueblo', pt: 'aldeia', it: 'borgo' },
  altitude: { en: 'altitude', fr: 'altitude', es: 'altitud', pt: 'altitude', it: 'quota' },
  'young-crowd': { en: 'young crowd', fr: 'public jeune', es: 'público joven', pt: 'público jovem', it: 'pubblico giovane' },
  beginner: { en: 'beginner', fr: 'débutant', es: 'principiante', pt: 'principiante', it: 'principianti' },
  'altitude-pyrenees': { en: 'high Pyrenees', fr: 'Pyrénées d\'altitude', es: 'Pirineos en altitud', pt: 'Pirenéus em altitude', it: 'Pirenei in quota' },
  sunshine: { en: 'sunshine', fr: 'soleil', es: 'sol', pt: 'sol', it: 'sole' },
  'altitude-training': { en: 'altitude training', fr: 'entraînement en altitude', es: 'entrenamiento en altitud', pt: 'treino em altitude', it: 'allenamento in quota' },
  'pyrenees-grand': { en: 'grand Pyrenees', fr: 'grandes Pyrénées', es: 'grandes Pirineos', pt: 'grandes Pirenéus', it: 'grandi Pirenei' },
  'cycling-meets-ski': { en: 'cycling meets ski', fr: 'vélo et ski', es: 'ciclismo y esquí', pt: 'ciclismo e esqui', it: 'ciclismo e sci' },
  'thermal-belle-epoque': { en: 'Belle Époque spa', fr: 'thermal Belle Époque', es: 'termal Belle Époque', pt: 'termal Belle Époque', it: 'terme Belle Époque' },
  'national-park': { en: 'national park', fr: 'parc national', es: 'parque nacional', pt: 'parque nacional', it: 'parco nazionale' },
  boutique: { en: 'boutique', fr: 'boutique', es: 'boutique', pt: 'boutique', it: 'boutique' },
  renaissance: { en: 'renaissance', fr: 'renaissance', es: 'renacimiento', pt: 'renascimento', it: 'rinascita' },
  japow: { en: 'japow', fr: 'japow', es: 'japow', pt: 'japow', it: 'japow' },
  onsen: { en: 'onsen', fr: 'onsen', es: 'onsen', pt: 'onsen', it: 'onsen' },
  traditional: { en: 'traditional', fr: 'traditionnel', es: 'tradicional', pt: 'tradicional', it: 'tradizionale' },
  'big-mountain': { en: 'big mountain', fr: 'grande montagne', es: 'gran montaña', pt: 'grande montanha', it: 'grande montagna' },
  olympic: { en: 'Olympic', fr: 'olympique', es: 'olímpico', pt: 'olímpico', it: 'olimpico' },
  'city-access': { en: 'city access', fr: "à un pas de la ville", es: 'acceso urbano', pt: 'acesso urbano', it: 'a un passo dalla città' },
  'snow-monsters': { en: 'snow monsters', fr: 'monstres de neige', es: 'monstruos de nieve', pt: 'monstros de neve', it: 'mostri di neve' },
  'ice-village': { en: 'ice village', fr: 'village de glace', es: 'aldea de hielo', pt: 'aldeia de gelo', it: 'villaggio di ghiaccio' },
  'back-bowls': { en: 'back bowls', fr: 'bowls de poudreuse', es: 'cuencos de polvo', pt: 'bowls de neve', it: 'conche di polvere' },
  powder: { en: 'powder', fr: 'poudreuse', es: 'nieve polvo', pt: 'neve em pó', it: 'neve fresca' },
  'east-coast': { en: 'East Coast', fr: 'côte Est', es: 'costa Este', pt: 'costa Leste', it: 'costa orientale' },
  vintage: { en: 'vintage', fr: 'rétro chic', es: 'vintage', pt: 'vintage', it: 'vintage' },
  tram: { en: 'tram-access', fr: 'téléphérique-roi', es: 'teleférico estrella', pt: 'teleférico ícone', it: 'funivia regina' },
  isolated: { en: 'isolated', fr: 'isolée', es: 'aislada', pt: 'isolada', it: 'isolata' },
  'ski-only': { en: 'ski-only', fr: 'skis seulement', es: 'solo esquí', pt: 'só esqui', it: 'solo sci' },
}

export function localizeVibe(slug: string, locale: Locale): string {
  const entry = VIBES[slug]
  if (entry) return entry[locale]
  // Fallback: turn the slug into a readable label.
  return slug.replace(/-/g, ' ')
}
