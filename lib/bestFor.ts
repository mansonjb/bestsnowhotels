import type { Locale } from '@/app/[locale]/dictionaries'
import type { Destination } from './destinations'
import {
  isEurope,
  isJapan,
  isUSA,
  isCanada,
  isSouthKorea,
  isAustralia,
  isNewZealand,
  isChile,
  isAfrica,
} from './countries'
import bestForExtra from '@/data/bestForExtra.json'

interface ExtraContent {
  name: Record<Locale, string>
  intro: Record<Locale, string>
  description: Record<Locale, string>
}
const EXTRA = bestForExtra as Record<string, ExtraContent>
const x = (slug: string): ExtraContent => {
  const c = EXTRA[slug]
  if (!c) throw new Error(`Missing best-for extra content for ${slug}`)
  return c
}

/**
 * Curated "Best for ..." lists for programmatic SEO. Each list is a localised
 * intent ("snow-sure", "family", "luxury", etc.) with a pure filter over the
 * destinations data and a sort key. Pages live at /[locale]/best/[slug].
 */
export interface BestForList {
  slug: string
  name: Record<Locale, string>
  intro: Record<Locale, string>
  description: Record<Locale, string>
  filter: (d: Destination) => boolean
  /** Higher = better; resorts are sorted by this score, desc. */
  sort: (d: Destination) => number
  /** Optional cap. Defaults to 24. */
  limit?: number
  /** Iconic member slug used as the page hero photo. */
  heroSlug: string
}

const LUX_VIBES = new Set(['luxury', 'elegance', 'old-money', 'royal', 'luxury-iberian'])

/** Hand-picked resorts known for serious snowparks and freestyle culture. */
const FREESTYLE_RESORTS = new Set([
  'laax', 'avoriaz', 'mayrhofen', 'livigno', 'madonna-di-campiglio',
  'saalbach', 'val-thorens', 'les-deux-alpes', 'kaprun', 'hintertux',
  'stubai', 'grandvalira', 'saas-fee', 'flachau', 'ischgl',
  'la-plagne', 'serfaus-fiss-ladis', 'fieberbrunn', 'kuhtai', 'kitzbuhel',
])

/** Great-circle distance in kilometres between two lat/lng points. */
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const CITIES = {
  geneva: { lat: 46.2044, lng: 6.1432, radiusKm: 200 },
  lyon: { lat: 45.764, lng: 4.8357, radiusKm: 250 },
  munich: { lat: 48.1351, lng: 11.582, radiusKm: 300 },
  barcelona: { lat: 41.3851, lng: 2.1734, radiusKm: 300 },
  paris: { lat: 48.8566, lng: 2.3522, radiusKm: 850 },
}

/** Resorts London-based skiers reach by flight + drive (Geneva / Salzburg / Sapporo gateways). */
const NEAR_LONDON_SLUGS = new Set([
  'chamonix', 'val-thorens', 'meribel', 'courchevel', 'tignes', 'val-d-isere',
  'verbier', 'zermatt', 'st-anton', 'ischgl', 'saalbach',
  'kitzbuhel', 'mayrhofen', 'solden', 'avoriaz', 'morzine',
  'hakuba-happo-one', 'niseko', 'whistler-blackcomb',
])

/** Curated romantic / luxury / quiet resorts that work for a honeymoon. */
const HONEYMOON_SLUGS = new Set([
  'st-moritz', 'gstaad', 'megeve', 'courchevel', 'zermatt', 'cortina-d-ampezzo',
  'lech-zurs', 'aspen-snowmass', 'beaver-creek', 'niseko', 'tomamu',
  'deer-valley', 'telluride', 'verbier', 'saint-luc',
])

/** Curated value resorts: low base price, accessible Europe + Andorra. */
const CHEAP_SKI_SLUGS = new Set([
  'la-molina', 'masella', 'cerler', 'astun', 'candanchu', 'panticosa',
  'port-aine', 'espot', 'vallter-2000', 'port-del-comte',
  'grandvalira', 'vallnord-pal-arinsal', 'ordino-arcalis',
  'aprica', 'foppolo', 'piancavallo', 'forni-di-sopra', 'sappada',
  'ponte-di-legno', 'tarvisio', 'limone-piemonte', 'sella-nevea',
  'cervinia', 'andalo', 'folgaria',
  'praz-de-lys-sommand', 'porte-puymorens', 'ax-3-domaines', 'formiguères',
  'luchon-superbagneres', 'piau-engaly', 'guzet', 'gourette',
])

// Continent / country helpers now live in lib/countries.ts as the single
// source of truth (COUNTRY_META + derived predicates). See the imports above.

/** US powder-focused subset (snow + freeride + tree-skiing pedigree). */
const USA_POWDER_RESORTS = new Set([
  'snowbird', 'alta', 'jackson-hole', 'steamboat', 'big-sky',
  'mammoth-mountain', 'whitefish', 'taos-ski-valley',
])

/** US East Coast resorts (Green Mountains today, room to expand). */
const USA_EAST_SLUGS = new Set(['stowe', 'killington'])
/** Colorado Rockies cluster. */
const USA_COLORADO_SLUGS = new Set([
  'vail', 'aspen-snowmass', 'beaver-creek', 'breckenridge', 'telluride', 'steamboat',
])
/** Utah Wasatch cluster (powder mecca). */
const USA_UTAH_SLUGS = new Set(['park-city', 'deer-valley', 'snowbird', 'alta'])

export const BEST_FOR_LISTS: BestForList[] = [
  {
    slug: 'snow-sure',
    heroSlug: 'val-thorens',
    name: {
      en: 'Best snow-sure ski resorts in Europe',
      fr: "Stations de ski les plus sûres en neige d'Europe",
      es: 'Mejores estaciones con nieve garantizada de Europa',
      pt: 'Melhores estâncias com neve garantida da Europa',
      it: "Migliori località con neve sicura d'Europa",
    },
    intro: {
      en: 'The Alps and Pyrenees resorts most likely to deliver real snow, picked by our 0 to 100 snow score and high-altitude pedigree.',
      fr: "Les stations des Alpes et des Pyrénées les plus sûres en neige, classées par notre score de 0 à 100 et leur altitude.",
      es: "Las estaciones de los Alpes y los Pirineos con la nieve más fiable, ordenadas por nuestra puntuación de 0 a 100 y su altitud.",
      pt: "As estâncias dos Alpes e dos Pirenéus com a neve mais fiável, ordenadas pela nossa pontuação de 0 a 100 e pela altitude.",
      it: "Le località delle Alpi e dei Pirenei più affidabili sulla neve, ordinate per il nostro punteggio da 0 a 100 e per la quota.",
    },
    description: {
      en: 'Snow is the whole point of a ski trip, and these resorts have the altitude and aspect to deliver it more reliably than the rest. We rank by our snow score, a 0 to 100 measure combining base and summit altitude, historical snow record and aspect. Expect resorts that open early, close late and survive lean winters when lower neighbours close.',
      fr: "La neige reste l'objet d'un voyage au ski, et ces stations ont l'altitude et l'orientation pour la garantir mieux que les autres. Nous les classons par notre score neige, une mesure de 0 à 100 qui combine altitudes de base et de sommet, historique d'enneigement et exposition. Attendez-vous à des stations qui ouvrent tôt, ferment tard et survivent aux hivers maigres quand les voisines plus basses baissent le rideau.",
      es: "La nieve es lo que se busca en un viaje de esquí, y estas estaciones tienen la altitud y la orientación para garantizarla mejor que el resto. Las ordenamos por nuestra puntuación de nieve, una medida de 0 a 100 que combina altitudes de base y cima, histórico de nieve y orientación. Espera estaciones que abren pronto, cierran tarde y resisten los inviernos flojos cuando las vecinas más bajas tiran la toalla.",
      pt: "A neve é o objetivo de uma viagem de esqui, e estas estâncias têm a altitude e a exposição para a garantir melhor do que as outras. Ordenamo-las pela nossa pontuação de neve, uma medida de 0 a 100 que combina altitudes de base e cume, histórico de neve e exposição. Espere estâncias que abrem cedo, fecham tarde e resistem aos invernos fracos quando as vizinhas mais baixas desistem.",
      it: "La neve è il senso di un viaggio sulla neve, e queste località hanno la quota e l'esposizione per garantirla meglio delle altre. Le ordiniamo per il nostro punteggio neve, una misura da 0 a 100 che combina quote di base e di cima, storico dell'innevamento ed esposizione. Aspettati località che aprono presto, chiudono tardi e sopravvivono agli inverni magri quando le vicine più basse abbassano la saracinesca.",
    },
    filter: (d) => isEurope(d) && d.snowScore >= 85,
    sort: (d) => d.snowScore,
  },
  {
    slug: 'family',
    heroSlug: 'serfaus-fiss-ladis',
    name: {
      en: 'Best family ski resorts in Europe',
      fr: "Meilleures stations de ski familiales d'Europe",
      es: 'Mejores estaciones de esquí familiares de Europa',
      pt: 'Melhores estâncias de esqui familiares da Europa',
      it: "Migliori località sciistiche per famiglie d'Europa",
    },
    intro: {
      en: 'Wide, gentle slopes, traffic-free villages and dedicated kids\' areas: the resorts that get parents and children right.',
      fr: "Pentes larges et douces, villages sans circulation et espaces enfants dédiés : les stations qui font le bonheur des parents comme des enfants.",
      es: "Laderas amplias y suaves, pueblos sin tráfico y zonas infantiles dedicadas: las estaciones que aciertan con padres e hijos.",
      pt: "Encostas amplas e suaves, aldeias sem trânsito e zonas infantis dedicadas: as estâncias que acertam com pais e filhos.",
      it: "Pendii ampi e dolci, borghi senza traffico e aree bimbi dedicate: le località che fanno felici genitori e figli.",
    },
    description: {
      en: 'A great family resort needs more than a good kids\' club: it wants gentle gradients, easy lift-served beginner zones, a safe village to walk around in and plenty of indoor backup for snowy days. These resorts tick all the boxes, from car-free Wengen and the underground-train Serfaus-Fiss-Ladis to slope-side Avoriaz. They are still proper mountains, but they are kid-friendly first.',
      fr: "Une grande station familiale ne se limite pas à un bon club enfants : il faut des pentes douces, des espaces débutants desservis par remontées, un village sûr où se promener et des activités intérieures pour les jours de neige. Ces stations cochent toutes les cases, de la sans-voitures Wengen au métro souterrain de Serfaus-Fiss-Ladis en passant par Avoriaz au pied des pistes. De vraies montagnes, mais d'abord pensées pour les enfants.",
      es: "Una gran estación familiar es más que un buen club infantil: hacen falta pendientes suaves, zonas de debutantes con remontes, un pueblo seguro para pasear y planes bajo techo para días de nieve. Estas estaciones marcan todas las casillas, de la sin coches Wengen al metro subterráneo de Serfaus-Fiss-Ladis o la Avoriaz a pie de pista. Auténticas montañas, pero pensadas primero para los niños.",
      pt: "Uma grande estância familiar é mais do que um bom clube infantil: precisa de pendentes suaves, zonas de iniciação com teleféricos, uma aldeia segura para passear e atividades de interior para dias de neve. Estas estâncias têm tudo, da sem-carros Wengen ao metro subterrâneo de Serfaus-Fiss-Ladis ou à Avoriaz no sopé das pistas. Verdadeiras montanhas, mas pensadas primeiro para as crianças.",
      it: "Una grande località per famiglie è molto più di un buon mini club: servono pendenze morbide, aree per chi inizia servite da impianti, un borgo sicuro dove camminare e attività al coperto per le giornate di neve. Queste località mettono insieme tutto, dalla senza-auto Wengen al metro sotterraneo di Serfaus-Fiss-Ladis fino ad Avoriaz ai piedi delle piste. Vere montagne, ma pensate prima per i bambini.",
    },
    filter: (d) => isEurope(d) && d.vibes.includes('family'),
    sort: (d) => d.snowScore,
  },
  {
    slug: 'luxury',
    heroSlug: 'courchevel',
    name: {
      en: 'Most luxurious ski resorts in Europe',
      fr: "Stations de ski les plus luxueuses d'Europe",
      es: 'Estaciones de esquí más lujosas de Europa',
      pt: 'Estâncias de esqui mais luxuosas da Europa',
      it: "Le località sciistiche più lussuose d'Europa",
    },
    intro: {
      en: 'The most polished, high-end addresses in the Alps and Pyrenees, where Michelin stars and ski-in concierge come standard.',
      fr: "Les adresses les plus chic des Alpes et des Pyrénées, où étoiles Michelin et conciergerie ski aux pieds vont de soi.",
      es: "Las direcciones más chic de los Alpes y los Pirineos, donde estrellas Michelin y conserjería ski-in son lo normal.",
      pt: "As moradas mais chiques dos Alpes e dos Pirenéus, onde estrelas Michelin e conciergerie ski-in são o normal.",
      it: "Gli indirizzi più chic delle Alpi e dei Pirenei, dove le stelle Michelin e la concierge ski-in sono di serie.",
    },
    description: {
      en: 'Cosy, intimate or just outright glamorous, these are the resorts where the local high street looks more like Bond Street and the chalet bath is the size of your bedroom. From Courchevel and Megève in France to Gstaad, Zermatt and St. Moritz in Switzerland and Cortina in Italy, the lifestyle and the grooming are equally curated.',
      fr: "Cosy, intimes ou résolument glamour, ce sont les stations où la rue principale ressemble à Bond Street et où la baignoire du chalet fait la taille de votre chambre. De Courchevel et Megève en France à Gstaad, Zermatt et St. Moritz en Suisse, en passant par Cortina en Italie, le style de vie et le damage sont aussi soignés.",
      es: "Acogedoras, íntimas o francamente glamurosas, son las estaciones donde la calle principal parece Bond Street y la bañera del chalet tiene el tamaño de tu habitación. De Courchevel y Megève en Francia a Gstaad, Zermatt y St. Moritz en Suiza, pasando por Cortina en Italia, el estilo de vida y el pisado están igualmente cuidados.",
      pt: "Acolhedoras, íntimas ou abertamente glamorosas, são as estâncias onde a rua principal parece a Bond Street e a banheira do chalé tem o tamanho do seu quarto. De Courchevel e Megève em França a Gstaad, Zermatt e St. Moritz na Suíça, passando por Cortina em Itália, o estilo de vida e o pisado são igualmente cuidados.",
      it: "Accoglienti, intime o apertamente glamour, sono le località dove la via principale somiglia a Bond Street e la vasca dello chalet ha le dimensioni della tua camera. Da Courchevel e Megève in Francia a Gstaad, Zermatt e St. Moritz in Svizzera, passando per Cortina in Italia, lo stile di vita e la battitura sono altrettanto curati.",
    },
    filter: (d) => isEurope(d) && d.vibes.some((v) => LUX_VIBES.has(v)),
    sort: (d) => d.snowScore,
  },
  {
    slug: 'glacier',
    heroSlug: 'hintertux',
    name: {
      en: 'Best ski resorts with a glacier',
      fr: 'Meilleures stations de ski avec glacier',
      es: 'Mejores estaciones de esquí con glaciar',
      pt: 'Melhores estâncias de esqui com glaciar',
      it: 'Migliori località sciistiche con ghiacciaio',
    },
    intro: {
      en: 'Resorts with year-round or autumn-opening glacier skiing, where the snow keeps coming when the rest of the Alps run out.',
      fr: "Stations avec un glacier ouvert toute l'année ou dès l'automne, où la neige continue quand le reste des Alpes en manque.",
      es: "Estaciones con glaciar abierto todo el año o desde el otoño, donde la nieve sigue cuando el resto de los Alpes se queda sin ella.",
      pt: "Estâncias com glaciar aberto todo o ano ou desde o outono, onde a neve continua quando o resto dos Alpes fica sem ela.",
      it: "Località con un ghiacciaio aperto tutto l'anno o già in autunno, dove la neve continua quando il resto delle Alpi resta a secco.",
    },
    description: {
      en: 'When a glacier is part of the ski area, the season runs longer, the snow is more reliable and you can usually find a few runs whatever the weather. From the famously 365-days-a-year Hintertux to Tignes, Saas-Fee, Les Deux Alpes, Kitzsteinhorn and the Stubai, these are the resorts where high-altitude ice does the heavy lifting.',
      fr: "Quand un glacier fait partie du domaine, la saison s'allonge, la neige est plus fiable et l'on trouve presque toujours quelques pistes, quel que soit le temps. Du célèbre Hintertux ouvert 365 jours par an à Tignes, Saas-Fee, Les Deux Alpes, Kitzsteinhorn et au Stubai, ce sont les stations où la glace d'altitude fait tout le travail.",
      es: "Cuando un glaciar forma parte del dominio, la temporada se alarga, la nieve es más fiable y casi siempre se encuentran algunas pistas, haga el tiempo que haga. Del famoso Hintertux abierto los 365 días del año a Tignes, Saas-Fee, Les Deux Alpes, Kitzsteinhorn y el Stubai, son las estaciones donde el hielo de altura hace todo el trabajo.",
      pt: "Quando um glaciar faz parte do domínio, a época alonga-se, a neve é mais fiável e quase sempre se encontram algumas pistas, faça o tempo que fizer. Do famoso Hintertux aberto 365 dias por ano a Tignes, Saas-Fee, Les Deux Alpes, Kitzsteinhorn e ao Stubai, são as estâncias onde o gelo de altitude faz todo o trabalho.",
      it: "Quando un ghiacciaio fa parte del comprensorio, la stagione si allunga, la neve è più affidabile e si trovano quasi sempre alcune piste, qualunque sia il meteo. Dal famoso Hintertux aperto 365 giorni l'anno a Tignes, Saas-Fee, Les Deux Alpes, Kitzsteinhorn e allo Stubai, sono le località dove il ghiaccio d'alta quota fa tutto il lavoro.",
    },
    filter: (d) => isEurope(d) && d.vibes.includes('glacier'),
    sort: (d) => d.altitudeSummit,
  },
  {
    slug: 'big-domain',
    heroSlug: 'val-thorens',
    name: {
      en: 'Biggest ski domains in Europe',
      fr: "Plus grands domaines skiables d'Europe",
      es: 'Mayores dominios esquiables de Europa',
      pt: 'Maiores domínios esquiáveis da Europa',
      it: "I più grandi comprensori sciistici d'Europa",
    },
    intro: {
      en: 'The biggest connected ski domains in Europe by lift-served piste kilometres, for skiers who want somewhere different every day.',
      fr: "Les plus grands domaines reliés d'Europe en kilomètres de pistes, pour les skieurs qui veulent un endroit différent chaque jour.",
      es: "Los mayores dominios enlazados de Europa por kilómetros de pista, para esquiadores que quieren un sitio distinto cada día.",
      pt: "Os maiores domínios ligados da Europa por quilómetros de pista, para esquiadores que querem um sítio diferente todos os dias.",
      it: "I più grandi comprensori collegati d'Europa per chilometri di piste servite dagli impianti, per chi vuole un posto diverso ogni giorno.",
    },
    description: {
      en: 'These resorts are huge: each links into 200 km or more of piste on one lift pass, from the giant Trois Vallées and Paradiski to the cross-border Portes du Soleil and the Italian Dolomiti Superski. A week here barely scratches the surface, and seven days in you can still ski a piste you have not tried yet.',
      fr: "Ces stations sont gigantesques : chacune se relie à 200 km ou plus de pistes sur un seul forfait, des Trois Vallées et de Paradiski au transfrontalier Portes du Soleil et au Dolomiti Superski italien. Une semaine y suffit à peine, et au septième jour il reste encore des pistes que l'on n'a pas faites.",
      es: "Estas estaciones son enormes: cada una se conecta con 200 km o más de pistas con un solo forfait, de las Trois Vallées y Paradiski al transfronterizo Portes du Soleil y al Dolomiti Superski italiano. Una semana apenas rasca la superficie, y al séptimo día todavía quedan pistas sin probar.",
      pt: "Estas estâncias são enormes: cada uma liga-se a 200 km ou mais de pistas num só passe, das Trois Vallées e Paradiski ao transfronteiriço Portes du Soleil e ao Dolomiti Superski italiano. Uma semana mal arranha a superfície, e ao sétimo dia ainda há pistas por experimentar.",
      it: "Queste località sono enormi: ognuna si collega a 200 km o più di piste con un solo skipass, dalle gigantesche Trois Vallées e Paradiski al transfrontaliero Portes du Soleil e all'italiano Dolomiti Superski. Una settimana qui basta appena, e al settimo giorno restano ancora piste da provare.",
    },
    filter: (d) => isEurope(d) && d.pistesKm >= 200,
    sort: (d) => d.pistesKm,
  },
  {
    slug: 'value',
    heroSlug: 'sauze-doulx',
    name: {
      en: 'Best value ski resorts in Europe',
      fr: "Stations de ski au meilleur rapport qualité-prix d'Europe",
      es: 'Estaciones de esquí con mejor relación calidad-precio de Europa',
      pt: 'Estâncias de esqui com melhor relação qualidade-preço da Europa',
      it: "Località sciistiche con il miglior rapporto qualità-prezzo d'Europa",
    },
    intro: {
      en: 'Big mountains, low prices: where lift passes, hotels and lunches all run cheaper than the headline names.',
      fr: "Grandes montagnes, petits prix : où forfaits, hôtels et déjeuners restent moins chers que dans les grands noms.",
      es: "Grandes montañas, precios bajos: donde forfaits, hoteles y comidas siguen siendo más baratos que en los grandes nombres.",
      pt: "Grandes montanhas, preços baixos: onde passes, hotéis e almoços continuam mais baratos do que nos grandes nomes.",
      it: "Grandi montagne, prezzi piccoli: dove skipass, hotel e pranzi restano più economici dei grandi nomi.",
    },
    description: {
      en: 'Skiing in the Alps does not have to mean Courchevel prices. These resorts, from Italy\'s Bormio and Sauze d\'Oulx to the Spanish Pyrenees and the southern French Alps, deliver real mountain skiing at notably gentler prices. Same snow, half the bill.',
      fr: "Skier dans les Alpes ne veut pas dire payer Courchevel. Ces stations, de Bormio et Sauze d'Oulx en Italie aux Pyrénées espagnoles et aux Alpes du Sud françaises, offrent du vrai ski de montagne à des tarifs nettement plus doux. Même neige, moitié de la note.",
      es: "Esquiar en los Alpes no es pagar Courchevel. Estas estaciones, de Bormio y Sauze d'Oulx en Italia a los Pirineos españoles y los Alpes del Sur franceses, brindan esquí de montaña de verdad a precios notablemente más suaves. Misma nieve, la mitad de la cuenta.",
      pt: "Esquiar nos Alpes não é pagar Courchevel. Estas estâncias, de Bormio e Sauze d'Oulx em Itália aos Pirenéus espanhóis e aos Alpes do Sul franceses, dão esqui de montanha a sério a preços notavelmente mais suaves. Mesma neve, metade da conta.",
      it: "Sciare sulle Alpi non significa pagare Courchevel. Queste località, da Bormio e Sauze d'Oulx in Italia ai Pirenei spagnoli e alle Alpi del Sud francesi, regalano vero sci di montagna a prezzi nettamente più morbidi. Stessa neve, metà del conto.",
    },
    filter: (d) => isEurope(d) && d.vibes.includes('value'),
    sort: (d) => d.snowScore,
  },
  {
    slug: 'freeride',
    heroSlug: 'alagna',
    name: {
      en: 'Best ski resorts for freeride',
      fr: 'Meilleures stations de ski pour le freeride',
      es: 'Mejores estaciones de esquí para freeride',
      pt: 'Melhores estâncias de esqui para freeride',
      it: 'Migliori località sciistiche per il freeride',
    },
    intro: {
      en: 'Where the off-piste is the point: lift-served descents, big terrain and the snow culture to back it up.',
      fr: "Là où le hors-piste fait tout : descentes accessibles en remontées, grand terrain et culture neige qui va avec.",
      es: "Donde el fuera de pista es lo que cuenta: bajadas con remontes, gran terreno y cultura de la nieve que lo respalda.",
      pt: "Onde o fora-de-pista é o que conta: descidas com teleféricos, grande terreno e cultura da neve a apoiar.",
      it: "Dove il fuori pista è la sostanza: discese servite da impianti, grandi spazi e la cultura della neve a supporto.",
    },
    description: {
      en: 'Freeride means leaving the groomed runs behind, and these resorts are built for it: north-facing slopes, long off-piste descents, easy heli access and a serious safety culture. From Engelberg and Alagna in legend to Sainte-Foy, Ordino-Arcalís and Fieberbrunn, this is where powder hounds book their weeks first.',
      fr: "Le freeride, c'est quitter les pistes damées, et ces stations sont conçues pour : pentes orientées nord, longues descentes hors-piste, accès facile à l'héliski et vraie culture de la sécurité. D'Engelberg et Alagna, légendes du genre, à Sainte-Foy, Ordino-Arcalís et Fieberbrunn, c'est là que les chasseurs de poudreuse réservent leurs semaines en premier.",
      es: "El freeride es dejar las pistas pisadas atrás, y estas estaciones están hechas para ello: laderas orientadas al norte, largos descensos fuera de pista, fácil acceso al helicóptero y cultura seria de seguridad. De Engelberg y Alagna, leyendas del género, a Sainte-Foy, Ordino-Arcalís y Fieberbrunn, aquí es donde los cazadores de polvo reservan sus semanas primero.",
      pt: "O freeride é deixar para trás as pistas pisadas, e estas estâncias foram feitas para isso: encostas viradas a norte, longas descidas fora-de-pista, acesso fácil ao helicóptero e cultura séria de segurança. De Engelberg e Alagna, lendas do género, a Sainte-Foy, Ordino-Arcalís e Fieberbrunn, é aqui que os caçadores de neve pó reservam as suas semanas primeiro.",
      it: "Il freeride significa lasciarsi alle spalle le piste battute, e queste località sono fatte apposta: versanti esposti a nord, lunghe discese fuori pista, accesso facile all'eliski e una seria cultura della sicurezza. Da Engelberg e Alagna, leggende del genere, a Sainte-Foy, Ordino-Arcalís e Fieberbrunn, è qui che i cacciatori di neve fresca prenotano per primi le settimane.",
    },
    filter: (d) => isEurope(d) && d.vibes.includes('freeride'),
    sort: (d) => d.snowScore,
  },
  {
    slug: 'beginner',
    heroSlug: 'le-grand-bornand',
    name: {
      en: 'Best ski resorts for beginners',
      fr: 'Meilleures stations de ski pour débutants',
      es: 'Mejores estaciones de esquí para principiantes',
      pt: 'Melhores estâncias de esqui para principiantes',
      it: 'Migliori località sciistiche per principianti',
    },
    intro: {
      en: 'Resorts with the biggest beginner areas and the gentlest slopes, so first-time skiers can find their feet without fear.',
      fr: "Stations aux plus grands espaces débutants et aux pentes les plus douces, pour apprendre à skier sans appréhension.",
      es: "Estaciones con las mayores zonas de debutantes y las pendientes más suaves, para aprender a esquiar sin miedo.",
      pt: "Estâncias com as maiores zonas de iniciação e as pendentes mais suaves, para aprender a esquiar sem medo.",
      it: "Località con le più grandi aree per principianti e le pendenze più dolci, per imparare a sciare senza paura.",
    },
    description: {
      en: 'Learning to ski is a different sport from cruising blue runs, and the right resort matters: dedicated nursery slopes, magic carpets, a friendly ski school and easy access to long gentle pistes. These resorts have all of that, and our pick favours French, Spanish and Andorran domains where the marked green run system gives beginners safe terrain they can read.',
      fr: "Apprendre à skier est un autre sport que dévaler des bleues, et le choix de la station compte : espaces débutants dédiés, tapis magiques, école de ski accueillante et accès facile à de longues pistes douces. Ces stations cochent tout, et notre sélection privilégie les domaines français, espagnols et andorrans, où les vertes balisées donnent aux débutants un terrain sûr et lisible.",
      es: "Aprender a esquiar es otro deporte que bajar azules, y la estación elegida importa: zonas de debutantes dedicadas, alfombras mágicas, una escuela de esquí cercana y acceso fácil a largas pistas suaves. Estas estaciones cumplen todo, y nuestra selección prioriza dominios franceses, españoles y andorranos, donde las verdes balizadas dan a los debutantes un terreno seguro y legible.",
      pt: "Aprender a esquiar é um desporto diferente de descer azuis, e a estância escolhida conta: zonas de iniciação dedicadas, tapetes mágicos, uma escola de esqui acolhedora e acesso fácil a longas pistas suaves. Estas estâncias têm tudo, e a nossa seleção privilegia domínios franceses, espanhóis e andorranos, onde as verdes balizadas dão aos principiantes um terreno seguro e fácil de ler.",
      it: "Imparare a sciare è un altro sport rispetto al filare sulle blu, e la scelta della località conta: campi scuola dedicati, tappeti magici, una scuola sci accogliente e accesso facile a lunghe piste dolci. Queste località fanno tutto, e la nostra selezione privilegia i comprensori francesi, spagnoli e andorrani, dove le piste verdi segnalate offrono ai principianti un terreno sicuro e leggibile.",
    },
    filter: (d) => isEurope(d) && d.pisteCounts.green >= 10,
    sort: (d) => d.pisteCounts.green,
  },
  {
    slug: 'highest',
    heroSlug: 'val-thorens',
    name: {
      en: 'Highest ski resorts in Europe',
      fr: "Stations de ski les plus hautes d'Europe",
      es: 'Estaciones de esquí más altas de Europa',
      pt: 'Estâncias de esqui mais altas da Europa',
      it: "Le località sciistiche più alte d'Europa",
    },
    intro: {
      en: 'Where the village itself sits high: the resorts with the loftiest base altitudes in the Alps and Pyrenees.',
      fr: "Là où le village lui-même est haut : les stations à la plus haute altitude de base des Alpes et des Pyrénées.",
      es: "Donde el propio pueblo está alto: las estaciones con la mayor altitud de base de los Alpes y los Pirineos.",
      pt: "Onde a própria aldeia está alta: as estâncias com a maior altitude de base dos Alpes e dos Pirenéus.",
      it: "Dove il borgo stesso è in quota: le località con la più alta quota di base delle Alpi e dei Pirenei.",
    },
    description: {
      en: 'High village altitude is the simplest snow-insurance you can buy. These are the resorts where the bed is already at 1800 m or above, so the snow on the doorstep almost always works even in lean winters, from Val Thorens at 2300 m to Tignes, Val d\'Isère, Avoriaz and Kühtai.',
      fr: "Une altitude de village élevée est l'assurance neige la plus simple à acheter. Ce sont les stations où le lit est déjà à 1800 m ou plus, alors la neige au pas de la porte fonctionne presque toujours, même lors des hivers maigres, de Val Thorens à 2300 m à Tignes, Val d'Isère, Avoriaz et Kühtai.",
      es: "Una altitud de pueblo elevada es el seguro de nieve más simple que se puede comprar. Son las estaciones donde la cama ya está a 1800 m o más, así que la nieve a la puerta funciona casi siempre, incluso en inviernos flojos, de Val Thorens a 2300 m a Tignes, Val d'Isère, Avoriaz y Kühtai.",
      pt: "Uma altitude de aldeia elevada é o seguro de neve mais simples que se pode comprar. São as estâncias onde a cama já está a 1800 m ou mais, por isso a neve à porta funciona quase sempre, mesmo em invernos fracos, de Val Thorens a 2300 m a Tignes, Val d'Isère, Avoriaz e Kühtai.",
      it: "Una quota di paese elevata è la più semplice assicurazione neve che si possa comprare. Sono le località dove il letto è già a 1800 m o più, così la neve sulla porta funziona quasi sempre, anche negli inverni magri, da Val Thorens a 2.300 m a Tignes, Val d'Isère, Avoriaz e Kühtai.",
    },
    filter: (d) => isEurope(d) && d.altitudeBase >= 1800,
    sort: (d) => d.altitudeBase,
  },
  {
    slug: 'car-free',
    heroSlug: 'wengen',
    name: {
      en: 'Car-free ski resorts in Europe',
      fr: 'Stations de ski sans voitures en Europe',
      es: 'Estaciones de esquí sin coches en Europa',
      pt: 'Estâncias de esqui sem carros na Europa',
      it: 'Località sciistiche senza auto in Europa',
    },
    intro: {
      en: 'Resorts where the village itself bans cars, with horse-drawn sleighs and electric taxis instead.',
      fr: "Stations où le village interdit la voiture, avec traîneaux à cheval et taxis électriques à la place.",
      es: "Estaciones donde el propio pueblo prohíbe los coches, con trineos tirados por caballos y taxis eléctricos en su lugar.",
      pt: "Estâncias onde a própria aldeia proíbe carros, com trenós puxados por cavalos e táxis elétricos no seu lugar.",
      it: "Località dove il borgo stesso vieta le auto, con slitte a cavalli e taxi elettrici al loro posto.",
    },
    description: {
      en: 'A car-free village is one of the great quiet luxuries of skiing, with the only sounds the clip-clop of horses and skis on the snow. From Zermatt, Wengen and Mürren in Switzerland to Avoriaz and Vaujany in France, these are the resorts where you leave the car at the valley and let the railway, gondola or sleigh take you up.',
      fr: "Un village sans voitures est l'un des grands luxes calmes du ski : seul résonne le pas des chevaux et le glissement des skis sur la neige. De Zermatt, Wengen et Mürren en Suisse à Avoriaz et Vaujany en France, ce sont les stations où l'on laisse la voiture dans la vallée et où le train, la télécabine ou le traîneau s'occupent du reste.",
      es: "Un pueblo sin coches es uno de los grandes lujos tranquilos del esquí: solo suenan los cascos de los caballos y los esquís sobre la nieve. De Zermatt, Wengen y Mürren en Suiza a Avoriaz y Vaujany en Francia, son las estaciones donde dejas el coche en el valle y el tren, la telecabina o el trineo se encargan del resto.",
      pt: "Uma aldeia sem carros é um dos grandes luxos tranquilos do esqui: só se ouvem os cascos dos cavalos e os esquis sobre a neve. De Zermatt, Wengen e Mürren na Suíça a Avoriaz e Vaujany em França, são as estâncias onde se deixa o carro no vale e o comboio, o telecabine ou o trenó se encarregam do resto.",
      it: "Un borgo senza auto è uno dei grandi lussi silenziosi dello sci: si sentono solo gli zoccoli dei cavalli e gli sci sulla neve. Da Zermatt, Wengen e Mürren in Svizzera ad Avoriaz e Vaujany in Francia, sono le località dove si lascia l'auto a valle e il treno, la cabinovia o la slitta si occupano del resto.",
    },
    filter: (d) => isEurope(d) && d.vibes.includes('car-free'),
    sort: (d) => d.snowScore,
  },
  {
    slug: 'freestyle',
    heroSlug: 'laax',
    name: {
      en: 'Best ski resorts for freestyle and snowparks',
      fr: 'Meilleures stations de ski pour le freestyle et les snowparks',
      es: 'Mejores estaciones de esquí para freestyle y snowparks',
      pt: 'Melhores estâncias de esqui para freestyle e snowparks',
      it: 'Migliori località sciistiche per freestyle e snowpark',
    },
    intro: {
      en: 'Resorts with the biggest, best-shaped snowparks in Europe, for skiers and snowboarders who came for the kickers.',
      fr: "Les stations dotées des plus grands et des mieux shapés snowparks d'Europe, pour les skieurs et snowboardeurs qui viennent pour les sauts.",
      es: 'Las estaciones con los snowparks más grandes y mejor moldeados de Europa, para esquiadores y snowboarders que vienen por los saltos.',
      pt: 'As estâncias com os snowparks maiores e mais bem moldados da Europa, para esquiadores e snowboarders que vêm pelos saltos.',
      it: "Le località con i snowpark più grandi e meglio modellati d'Europa, per chi scia e fa snowboard ed è venuto per i salti.",
    },
    description: {
      en: 'These resorts treat the snowpark as the main attraction, not an afterthought. Laax in Switzerland sets the bar for park shaping; Mayrhofen, Saalbach, Livigno, Madonna di Campiglio, Avoriaz and Grandvalira keep it high. Expect multiple park lines, regular contests, dedicated terrain crews and an after-park culture to match.',
      fr: "Ces stations traitent le snowpark comme l'attraction principale, pas comme un à-côté. Laax en Suisse pose la barre du shaping ; Mayrhofen, Saalbach, Livigno, Madonna di Campiglio, Avoriaz et Grandvalira la tiennent haute. Plusieurs lignes de park, des contests réguliers, des équipes shape dédiées et une culture after-park qui suit.",
      es: 'Estas estaciones tratan el snowpark como atracción principal, no como complemento. Laax en Suiza marca el listón del shaping; Mayrhofen, Saalbach, Livigno, Madonna di Campiglio, Avoriaz y Grandvalira lo mantienen alto. Varias líneas de park, contests regulares, equipos de shape dedicados y una cultura after-park acorde.',
      pt: 'Estas estâncias tratam o snowpark como atração principal, não como acessório. Laax na Suíça põe a fasquia do shaping; Mayrhofen, Saalbach, Livigno, Madonna di Campiglio, Avoriaz e Grandvalira mantêm-na alta. Várias linhas de park, contests regulares, equipas de shape dedicadas e uma cultura after-park à altura.',
      it: "Queste località trattano lo snowpark come l'attrazione principale, non come un accessorio. Laax in Svizzera fissa l'asticella dello shaping; Mayrhofen, Saalbach, Livigno, Madonna di Campiglio, Avoriaz e Grandvalira la tengono alta. Più linee di park, contest regolari, squadre shape dedicate e una cultura after-park all'altezza.",
    },
    filter: (d) => isEurope(d) && FREESTYLE_RESORTS.has(d.slug),
    sort: (d) => d.snowScore,
  },
  {
    slug: 'near-geneva',
    heroSlug: 'megeve',
    name: {
      en: 'Best ski resorts near Geneva',
      fr: 'Meilleures stations de ski près de Genève',
      es: 'Mejores estaciones de esquí cerca de Ginebra',
      pt: 'Melhores estâncias de esqui perto de Genebra',
      it: 'Migliori località sciistiche vicino a Ginevra',
    },
    intro: {
      en: 'Resorts within ~2 hours of Geneva airport, perfect for a long weekend or a one-flight ski week.',
      fr: "Stations à environ 2 heures de l'aéroport de Genève, parfaites pour un long week-end ou une semaine de ski en un seul vol.",
      es: 'Estaciones a unas 2 horas del aeropuerto de Ginebra, perfectas para un fin de semana largo o una semana de esquí con un solo vuelo.',
      pt: "Estâncias a cerca de 2 horas do aeroporto de Genebra, perfeitas para um fim de semana prolongado ou uma semana de esqui num só voo.",
      it: "Località a circa 2 ore dall'aeroporto di Ginevra, perfette per un weekend lungo o una settimana sulla neve con un solo volo.",
    },
    description: {
      en: 'Geneva sits in the middle of the most concentrated ski region in Europe, with the French Northern Alps to the east, Portes du Soleil to the south, and the Swiss Vaud and Valais resorts north and east. From Megève and Chamonix to Avoriaz, Verbier and Crans-Montana, this is the shortlist of resorts you can reach within roughly 200 km of the city, sorted by snow reliability.',
      fr: "Genève est au centre de la région de ski la plus dense d'Europe : Alpes du Nord à l'est, Portes du Soleil au sud, stations vaudoises et valaisannes au nord et à l'est. De Megève et Chamonix à Avoriaz, Verbier et Crans-Montana, voici la liste des stations accessibles à environ 200 km de la ville, classées par fiabilité de la neige.",
      es: 'Ginebra está en el centro de la región de esquí más densa de Europa: Alpes del Norte al este, Portes du Soleil al sur, estaciones del Vaud y Valais al norte y al este. De Megève y Chamonix a Avoriaz, Verbier y Crans-Montana, esta es la lista de estaciones a unos 200 km de la ciudad, ordenadas por fiabilidad de la nieve.',
      pt: 'Genebra fica no centro da região de esqui mais densa da Europa: Alpes do Norte a leste, Portes du Soleil a sul, estâncias do Vaud e Valais a norte e a leste. De Megève e Chamonix a Avoriaz, Verbier e Crans-Montana, esta é a lista de estâncias a cerca de 200 km da cidade, ordenadas pela fiabilidade da neve.',
      it: "Ginevra è al centro della regione sciistica più densa d'Europa: Alpi del Nord a est, Portes du Soleil a sud, località del Vaud e del Vallese a nord ed est. Da Megève e Chamonix ad Avoriaz, Verbier e Crans-Montana, ecco la lista delle località raggiungibili entro 200 km dalla città, ordinate per affidabilità della neve.",
    },
    filter: (d) => distanceKm(CITIES.geneva.lat, CITIES.geneva.lng, d.lat, d.lng) <= CITIES.geneva.radiusKm,
    sort: (d) => d.snowScore,
    limit: 30,
  },
  {
    slug: 'near-lyon',
    heroSlug: 'alpe-d-huez',
    name: {
      en: 'Best ski resorts near Lyon',
      fr: 'Meilleures stations de ski près de Lyon',
      es: 'Mejores estaciones de esquí cerca de Lyon',
      pt: 'Melhores estâncias de esqui perto de Lyon',
      it: 'Migliori località sciistiche vicino a Lione',
    },
    intro: {
      en: 'The French Alps from Lyon: resorts within driving range for a long weekend, picked by snow reliability and lift size.',
      fr: "Les Alpes françaises depuis Lyon : les stations accessibles en voiture pour un long week-end, classées par fiabilité de la neige et taille du domaine.",
      es: 'Los Alpes franceses desde Lyon: estaciones accesibles en coche para un fin de semana largo, ordenadas por fiabilidad de la nieve y tamaño del dominio.',
      pt: 'Os Alpes franceses a partir de Lyon: estâncias acessíveis de carro para um fim de semana prolongado, ordenadas pela fiabilidade da neve e tamanho do domínio.',
      it: 'Le Alpi francesi da Lione: località raggiungibili in auto per un weekend lungo, ordinate per affidabilità della neve e dimensione del comprensorio.',
    },
    description: {
      en: 'Lyon is the natural gateway to the Tarentaise and Maurienne giants, and the southern French Alps come into easy reach too. From Alpe d\'Huez and Les Deux Alpes in the Isère to Val Thorens, Tignes and Les Arcs further east, these are the resorts within roughly 250 km of the city, ranked by snow score.',
      fr: "Lyon est la porte naturelle vers les géants de la Tarentaise et de la Maurienne, et les Alpes du Sud sont elles aussi à portée. De l'Alpe d'Huez et des 2 Alpes en Isère à Val Thorens, Tignes et Les Arcs plus à l'est, voici les stations à environ 250 km de la ville, classées par score neige.",
      es: "Lyon es la puerta natural a los gigantes de la Tarentaise y la Maurienne, y los Alpes del Sur también quedan cerca. De Alpe d'Huez y Les 2 Alpes en Isère a Val Thorens, Tignes y Les Arcs más al este, son las estaciones a unos 250 km de la ciudad, ordenadas por puntuación de nieve.",
      pt: "Lyon é a porta natural para os gigantes da Tarentaise e da Maurienne, e os Alpes do Sul também ficam ao alcance. De Alpe d'Huez e Les 2 Alpes em Isère a Val Thorens, Tignes e Les Arcs mais a leste, são as estâncias a cerca de 250 km da cidade, ordenadas pela pontuação de neve.",
      it: "Lione è la porta naturale verso i giganti della Tarentaise e della Maurienne, e anche le Alpi del Sud sono a portata. Da Alpe d'Huez e Les 2 Alpes in Isère a Val Thorens, Tignes e Les Arcs più a est, ecco le località entro circa 250 km dalla città, ordinate per punteggio neve.",
    },
    filter: (d) => distanceKm(CITIES.lyon.lat, CITIES.lyon.lng, d.lat, d.lng) <= CITIES.lyon.radiusKm,
    sort: (d) => d.snowScore,
    limit: 30,
  },
  {
    slug: 'near-munich',
    heroSlug: 'kitzbuhel',
    name: {
      en: 'Best ski resorts near Munich',
      fr: 'Meilleures stations de ski près de Munich',
      es: 'Mejores estaciones de esquí cerca de Múnich',
      pt: 'Melhores estâncias de esqui perto de Munique',
      it: 'Migliori località sciistiche vicino a Monaco di Baviera',
    },
    intro: {
      en: 'The Austrian Alps from Munich: easy weekend resorts for park, party and Tirolean cruising, with snow you can count on.',
      fr: "Les Alpes autrichiennes depuis Munich : des stations parfaites pour un week-end de park, de fête et de cruising tyrolien, avec de la neige sur laquelle on peut compter.",
      es: 'Los Alpes austriacos desde Múnich: estaciones perfectas para un fin de semana de park, fiesta y cruising tirolés, con nieve fiable.',
      pt: 'Os Alpes austríacos a partir de Munique: estâncias perfeitas para um fim de semana de park, festa e cruising tirolês, com neve fiável.',
      it: 'Le Alpi austriache da Monaco: località perfette per un weekend di park, festa e cruising tirolese, con neve su cui contare.',
    },
    description: {
      en: 'Munich is just a couple of hours from the heart of the Tirol and a short drive from Salzburg and the Salzburger Land. Kitzbühel, Sölden, Ischgl, the Zillertal hubs of Mayrhofen, Hintertux and Gerlos, plus the Stubai glacier and the Kühtai, all line up within 300 km of the city. Snow-sure, après-loud and famously efficient.',
      fr: "Munich n'est qu'à quelques heures du cœur du Tyrol et tout proche de Salzbourg et du Salzburger Land. Kitzbühel, Sölden, Ischgl, les pôles du Zillertal (Mayrhofen, Hintertux, Gerlos), plus le glacier du Stubai et le Kühtai, s'alignent dans un rayon de 300 km autour de la ville. Neige garantie, après bruyant, efficacité légendaire.",
      es: 'Múnich está a solo un par de horas del corazón del Tirol y muy cerca de Salzburgo y el Salzburger Land. Kitzbühel, Sölden, Ischgl, los polos del Zillertal (Mayrhofen, Hintertux, Gerlos), más el glaciar del Stubai y el Kühtai, se alinean en un radio de 300 km de la ciudad. Nieve garantizada, après ruidoso y eficiencia legendaria.',
      pt: 'Munique está a apenas algumas horas do coração do Tirol e bem perto de Salzburgo e do Salzburger Land. Kitzbühel, Sölden, Ischgl, os polos do Zillertal (Mayrhofen, Hintertux, Gerlos), mais o glaciar do Stubai e o Kühtai, alinham-se num raio de 300 km da cidade. Neve garantida, après barulhento e eficiência lendária.',
      it: "Monaco è a poche ore dal cuore del Tirolo e a un soffio da Salisburgo e dal Salzburger Land. Kitzbühel, Sölden, Ischgl, i poli dello Zillertal (Mayrhofen, Hintertux, Gerlos), più il ghiacciaio dello Stubai e il Kühtai, si allineano entro 300 km dalla città. Neve sicura, après chiassoso, efficienza leggendaria.",
    },
    filter: (d) => distanceKm(CITIES.munich.lat, CITIES.munich.lng, d.lat, d.lng) <= CITIES.munich.radiusKm,
    sort: (d) => d.snowScore,
    limit: 30,
  },
  {
    slug: 'near-barcelona',
    heroSlug: 'baqueira-beret',
    name: {
      en: 'Best ski resorts near Barcelona',
      fr: 'Meilleures stations de ski près de Barcelone',
      es: 'Mejores estaciones de esquí cerca de Barcelona',
      pt: 'Melhores estâncias de esqui perto de Barcelona',
      it: 'Migliori località sciistiche vicino a Barcellona',
    },
    intro: {
      en: 'The Spanish, Andorran and Catalan Pyrenees on a short drive from Barcelona, all on the same side of the mountain as the sun.',
      fr: "Les Pyrénées espagnoles, andorranes et catalanes à courte distance en voiture de Barcelone, toutes du côté ensoleillé de la montagne.",
      es: 'Los Pirineos españoles, andorranos y catalanes a poca distancia en coche de Barcelona, todos en la cara soleada de la montaña.',
      pt: 'Os Pirenéus espanhóis, andorranos e catalães a pouca distância de carro de Barcelona, todos no lado soalheiro da montanha.',
      it: 'I Pirenei spagnoli, andorrani e catalani a breve distanza in auto da Barcellona, tutti sul versante soleggiato della montagna.',
    },
    description: {
      en: 'Barcelona is the easiest big-city base for the southern Pyrenees: Baqueira-Beret, Grandvalira and Vallnord in Andorra, La Molina and Masella on the Catalan side, plus the smaller Aragonese resorts further west. Within 300 km of the city you can chase late sun on Spanish piste or cross into Andorra for duty-free beers, all on one weekend.',
      fr: "Barcelone est la base grande-ville la plus facile pour les Pyrénées du Sud : Baqueira-Beret, Grandvalira et Vallnord en Andorre, La Molina et Masella côté catalan, plus les petites stations aragonaises plus à l'ouest. Dans un rayon de 300 km autour de la ville, on chasse le soleil tardif sur les pistes espagnoles ou on passe en Andorre pour des bières détaxées, le tout sur un week-end.",
      es: 'Barcelona es la base de gran ciudad más fácil para el Pirineo sur: Baqueira-Beret, Grandvalira y Vallnord en Andorra, La Molina y Masella del lado catalán, más las estaciones aragonesas más al oeste. En un radio de 300 km de la ciudad puedes perseguir el sol tardío en pistas españolas o cruzar a Andorra para cervezas libres de impuestos, todo en un fin de semana.',
      pt: "Barcelona é a base de cidade grande mais fácil para os Pirenéus do Sul: Baqueira-Beret, Grandvalira e Vallnord em Andorra, La Molina e Masella do lado catalão, mais as estâncias aragonesas mais a oeste. Num raio de 300 km da cidade pode-se perseguir o sol tardio em pistas espanholas ou atravessar para Andorra por cervejas duty-free, tudo num fim de semana.",
      it: "Barcellona è la base di grande città più semplice per i Pirenei del Sud: Baqueira-Beret, Grandvalira e Vallnord in Andorra, La Molina e Masella sul versante catalano, più le piccole località aragonesi più a ovest. Entro 300 km dalla città si insegue il sole tardo sulle piste spagnole o si passa in Andorra per birre duty-free, il tutto in un weekend.",
    },
    filter: (d) => distanceKm(CITIES.barcelona.lat, CITIES.barcelona.lng, d.lat, d.lng) <= CITIES.barcelona.radiusKm,
    sort: (d) => d.snowScore,
    limit: 30,
  },
  {
    slug: 'japan',
    heroSlug: 'niseko',
    name: {
      en: 'Best ski resorts in Japan',
      fr: 'Meilleures stations de ski au Japon',
      es: 'Mejores estaciones de esquí de Japón',
      pt: 'Melhores estâncias de esqui do Japão',
      it: "Migliori località sciistiche in Giappone",
    },
    intro: {
      en: 'Japow on tap: the Hokkaido + Honshu resorts that earn Japan its powder-skiing reputation, ranked by snow score.',
      fr: "Japow à volonté : les stations de Hokkaido et de Honshu qui ont fait la réputation de poudreuse du Japon, classées par score neige.",
      es: 'Japow a discreción: las estaciones de Hokkaido y Honshu que han hecho la fama de Japón en nieve polvo, ordenadas por puntuación de nieve.',
      pt: 'Japow sem limites: as estâncias de Hokkaido e Honshu que fizeram a fama do Japão em neve fresca, ordenadas pela pontuação de neve.',
      it: "Japow a fiumi: le località di Hokkaido e Honshu che hanno fatto la fama del Giappone in polvere, ordinate per punteggio neve.",
    },
    description: {
      en: 'A Siberian airmass crossing the Sea of Japan dumps the world\'s driest, deepest snow on Hokkaido and the Japanese Alps from December into March. These twelve resorts span the powder bowls of Niseko and Kiroro, the tree-skiing of Rusutsu and Furano, the historic onsen ski-towns of Nozawa, Myoko and Zao, and the Olympic terrain of Hakuba. Add ryokan stays, hot-spring soaks at the end of every day, and a service standard the Alps cannot match.',
      fr: "Une masse d'air sibérienne traverse la mer du Japon et déverse la neige la plus sèche et la plus profonde de la planète sur Hokkaido et les Alpes japonaises, de décembre à mars. Ces douze stations couvrent les bowls de Niseko et Kiroro, le ski en forêt de Rusutsu et Furano, les villages historiques aux onsen de Nozawa, Myoko et Zao, et le terrain olympique d'Hakuba. Ajoutez les ryokan, les bains chauds en fin de journée et un service que les Alpes ne savent pas atteindre.",
      es: "Una masa de aire siberiano cruza el Mar de Japón y deja la nieve más seca y profunda del planeta sobre Hokkaido y los Alpes japoneses, de diciembre a marzo. Estas doce estaciones abarcan los cuencos de polvo de Niseko y Kiroro, el esquí en bosque de Rusutsu y Furano, los pueblos onsen históricos de Nozawa, Myoko y Zao, y el terreno olímpico de Hakuba. Suma los ryokan, los baños termales al final del día y un nivel de servicio que los Alpes no alcanzan.",
      pt: "Uma massa de ar siberiana atravessa o Mar do Japão e deixa a neve mais seca e profunda do planeta sobre Hokkaido e os Alpes japoneses, de dezembro a março. Estas doze estâncias cobrem os bowls de Niseko e Kiroro, o esqui em floresta de Rusutsu e Furano, as aldeias onsen históricas de Nozawa, Myoko e Zao, e o terreno olímpico de Hakuba. Junte os ryokan, os banhos termais ao fim do dia e um nível de serviço que os Alpes não conseguem igualar.",
      it: "Una massa d'aria siberiana attraversa il Mar del Giappone e scarica la neve più asciutta e profonda del pianeta su Hokkaido e sulle Alpi giapponesi, da dicembre a marzo. Queste dodici località coprono le conche di Niseko e Kiroro, lo sci tra i boschi di Rusutsu e Furano, i borghi onsen storici di Nozawa, Myoko e Zao, e il terreno olimpico di Hakuba. Aggiungi i ryokan, i bagni termali a fine giornata e uno standard di servizio che le Alpi non sanno eguagliare.",
    },
    filter: (d) => isJapan(d),
    sort: (d) => d.snowScore,
    limit: 24,
  },
  {
    slug: 'japan-powder',
    heroSlug: 'rusutsu',
    name: {
      en: 'Best powder resorts in Japan',
      fr: 'Meilleures stations de poudreuse au Japon',
      es: 'Mejores estaciones de nieve polvo de Japón',
      pt: 'Melhores estâncias de neve fresca do Japão',
      it: 'Migliori località per la polvere in Giappone',
    },
    intro: {
      en: 'The Japanese resorts that earn the japow nickname every winter: ridiculous snowfall, light dry flakes, and trees made for it.',
      fr: "Les stations japonaises qui gagnent leur surnom de japow chaque hiver : enneigement délirant, flocons légers et secs, et forêts faites pour ça.",
      es: 'Las estaciones japonesas que ganan su apodo de japow cada invierno: nieve delirante, copos ligeros y secos, y bosques hechos para ello.',
      pt: 'As estâncias japonesas que merecem a alcunha de japow todos os invernos: nevadas delirantes, flocos leves e secos, e florestas feitas para isso.',
      it: 'Le località giapponesi che si guadagnano il soprannome japow ogni inverno: nevicate folli, fiocchi leggeri e asciutti, e foreschi fatti apposta.',
    },
    description: {
      en: 'Niseko, Rusutsu, Kiroro and Furano on Hokkaido catch the heaviest deliveries, with 14 to 21 m of annual snowfall on a base that rarely freezes. Honshu adds Myoko Akakura, where 13 m a year falls on traditional onsen-town terrain. We pick by snow score, japow vibe and tree-skiing tradition: powder-day breakfasts before sunrise, then chairlifts through birch glades until the lifts close.',
      fr: "Niseko, Rusutsu, Kiroro et Furano sur Hokkaido reçoivent les plus grosses livraisons, avec 14 à 21 m de neige par an sur un manteau qui ne gèle presque jamais. Honshu ajoute Myoko Akakura, où il tombe 13 m par an sur du terrain d'onsen traditionnel. Sélection par score neige, vibe japow et tradition du ski en forêt : petit déjeuner aux premières lueurs les jours de poudreuse, puis télésièges entre les bouleaux jusqu'à la fermeture.",
      es: "Niseko, Rusutsu, Kiroro y Furano en Hokkaido reciben las descargas más generosas, con 14 a 21 m de nieve al año sobre una base que casi nunca se congela. Honshu suma Myoko Akakura, donde caen 13 m anuales sobre terreno tradicional de onsen. Selección por puntuación de nieve, vibe japow y tradición del esquí en bosque: desayunos de día de polvo antes del amanecer, luego telesillas entre abedules hasta el cierre.",
      pt: "Niseko, Rusutsu, Kiroro e Furano em Hokkaido recebem as cargas mais generosas, com 14 a 21 m de neve por ano sobre uma base que quase nunca congela. Honshu acrescenta Myoko Akakura, onde caem 13 m anuais sobre terreno tradicional de onsen. Seleção pela pontuação de neve, vibe japow e tradição de esqui em floresta: pequenos-almoços antes do nascer do sol nos dias de pó, depois teleféricos entre bétulas até ao fecho.",
      it: "Niseko, Rusutsu, Kiroro e Furano in Hokkaido prendono le consegne più generose, con 14, 21 m di neve all'anno su un manto che quasi non gela mai. Honshu aggiunge Myoko Akakura, dove cadono 13 m all'anno su terreno tradizionale di onsen. Selezione per punteggio neve, vibe japow e tradizione dello sci tra i boschi: colazioni prima dell'alba nei powder day, poi seggiovie tra le betulle fino alla chiusura.",
    },
    filter: (d) => isJapan(d) && (d.vibes.includes('japow') || d.vibes.includes('powder')),
    sort: (d) => d.snowScore,
    limit: 20,
  },
  {
    slug: 'usa',
    heroSlug: 'jackson-hole',
    name: {
      en: 'Best ski resorts in the United States',
      fr: "Meilleures stations de ski aux États-Unis",
      es: 'Mejores estaciones de esquí de Estados Unidos',
      pt: 'Melhores estâncias de esqui dos Estados Unidos',
      it: 'Migliori località sciistiche degli Stati Uniti',
    },
    intro: {
      en: 'The crown jewels of US skiing across the Rockies, the Wasatch, the Sierra Nevada, the Tetons and the East Coast: twenty resorts ranked by snow and terrain.',
      fr: "Les joyaux du ski américain, des Rocheuses au Wasatch, en passant par la Sierra Nevada, les Tetons et la côte Est : vingt stations classées par neige et terrain.",
      es: 'Las joyas del esquí estadounidense en las Rocosas, el Wasatch, la Sierra Nevada, los Tetons y la costa Este: veinte estaciones ordenadas por nieve y terreno.',
      pt: 'As joias do esqui americano nas Rochosas, no Wasatch, na Serra Nevada, nos Tetons e na costa Leste: vinte estâncias ordenadas pela neve e pelo terreno.',
      it: "I gioielli dello sci americano sulle Rocciose, sul Wasatch, sulla Sierra Nevada, sui Teton e sulla costa orientale: venti località ordinate per neve e terreno.",
    },
    description: {
      en: 'America runs the world\'s biggest ski market and the variety is the point: Colorado\'s high-altitude Rockies (Vail, Aspen, Breckenridge, Telluride, Steamboat), Utah\'s powder-hammered Wasatch (Snowbird, Alta, Park City), California\'s Sierra Nevada (Mammoth, Palisades Tahoe, Heavenly), the wild expert terrain of Jackson Hole and Big Sky, and the rugged charm of Stowe and Killington back East. Sun Valley vintage, Taos\' desert powder and Whitefish value round out the season.',
      fr: "Les États-Unis pilotent le plus grand marché de ski au monde, et c'est la variété qui fait tout : les Rocheuses d'altitude du Colorado (Vail, Aspen, Breckenridge, Telluride, Steamboat), le Wasatch tapissé de poudreuse de l'Utah (Snowbird, Alta, Park City), la Sierra Nevada californienne (Mammoth, Palisades Tahoe, Heavenly), le terrain sauvage et expert de Jackson Hole et Big Sky, et le charme rugueux de Stowe et Killington sur la côte Est. Sun Valley en mode rétro, Taos en mode désert et Whitefish en mode bon plan complètent le tableau.",
      es: "Estados Unidos lidera el mayor mercado de esquí del mundo, y la variedad es el punto: las Rocosas de altura del Colorado (Vail, Aspen, Breckenridge, Telluride, Steamboat), el Wasatch de Utah martilleado por la nieve polvo (Snowbird, Alta, Park City), la Sierra Nevada de California (Mammoth, Palisades Tahoe, Heavenly), el terreno salvaje y experto de Jackson Hole y Big Sky, y el encanto rudo de Stowe y Killington en el Este. Sun Valley vintage, Taos con su nieve de desierto y Whitefish como buen plan completan la temporada.",
      pt: "Os Estados Unidos lideram o maior mercado de esqui do mundo, e a variedade é o ponto: as Rochosas de altitude do Colorado (Vail, Aspen, Breckenridge, Telluride, Steamboat), o Wasatch do Utah martelado pela neve em pó (Snowbird, Alta, Park City), a Serra Nevada californiana (Mammoth, Palisades Tahoe, Heavenly), o terreno selvagem de Jackson Hole e Big Sky, e o charme rude de Stowe e Killington a Leste. Sun Valley vintage, Taos com a sua neve de deserto e Whitefish como bom preço fecham a época.",
      it: "Gli Stati Uniti guidano il più grande mercato sciistico al mondo, e la varietà è il punto: le Rocciose d'alta quota del Colorado (Vail, Aspen, Breckenridge, Telluride, Steamboat), il Wasatch dello Utah martellato dalla polvere (Snowbird, Alta, Park City), la Sierra Nevada californiana (Mammoth, Palisades Tahoe, Heavenly), il terreno selvaggio di Jackson Hole e Big Sky, e il fascino ruvido di Stowe e Killington sulla costa orientale. Sun Valley vintage, Taos con la sua polvere del deserto e Whitefish dal buon prezzo chiudono la stagione.",
    },
    filter: (d) => isUSA(d),
    sort: (d) => d.snowScore,
    limit: 24,
  },
  {
    slug: 'usa-powder',
    heroSlug: 'snowbird',
    name: {
      en: 'Best powder ski resorts in the United States',
      fr: "Meilleures stations de poudreuse aux États-Unis",
      es: 'Mejores estaciones de nieve polvo de Estados Unidos',
      pt: 'Melhores estâncias de neve em pó dos Estados Unidos',
      it: 'Migliori località per la polvere degli Stati Uniti',
    },
    intro: {
      en: 'Where North American skiers chase the goods: the resorts with the highest snowfall and the steepest in-bounds terrain in the Lower 48.',
      fr: "Là où les skieurs nord-américains chassent la poudre : les stations aux plus gros enneigements et au terrain le plus raide des États-Unis continentaux.",
      es: 'Donde los esquiadores norteamericanos persiguen la nieve: las estaciones con más nevadas y terreno más empinado de los Estados Unidos continentales.',
      pt: 'Onde os esquiadores norte-americanos perseguem a neve: as estâncias com mais nevadas e terreno mais íngreme dos Estados Unidos continentais.',
      it: "Dove gli sciatori nordamericani cercano la roba buona: le località con più neve e il terreno più ripido degli Stati Uniti continentali.",
    },
    description: {
      en: 'Utah\'s Little Cottonwood Canyon delivers 14 m+ of snow a year onto Snowbird and Alta, two of the snowiest mountains in the Lower 48. Jackson Hole turns the same air into expert lines. Steamboat\'s Champagne Powder, Big Sky\'s Lone Peak, Whitefish\'s Big Mountain, Mammoth\'s Eastern Sierra storms and Taos\' high-desert deliveries round out the list. These are the resorts to plan a powder trip around, not just visit.',
      fr: "Le Little Cottonwood Canyon de l'Utah livre plus de 14 m de neige par an sur Snowbird et Alta, deux des montagnes les plus enneigées des USA continentaux. Jackson Hole transforme cette même neige en lignes expertes. La Champagne Powder de Steamboat, le Lone Peak de Big Sky, la Big Mountain de Whitefish, les tempêtes du Mammoth dans la Sierra et la neige de haute altitude de Taos complètent la liste. Des stations autour desquelles on planifie un voyage poudreuse, pas seulement une visite.",
      es: "El Little Cottonwood Canyon de Utah deposita más de 14 m de nieve al año en Snowbird y Alta, dos de las montañas más nevadas de los Estados Unidos continentales. Jackson Hole convierte ese mismo aire en líneas expertas. El Champagne Powder de Steamboat, el Lone Peak de Big Sky, la Big Mountain de Whitefish, las tormentas de Mammoth en la Sierra y la nieve de altura de Taos completan la lista. Estaciones para planificar un viaje de polvo, no solo para visitar.",
      pt: "O Little Cottonwood Canyon do Utah deposita mais de 14 m de neve por ano em Snowbird e Alta, duas das montanhas mais nevadas dos Estados Unidos continentais. Jackson Hole transforma esse ar em linhas para experts. O Champagne Powder de Steamboat, o Lone Peak de Big Sky, a Big Mountain de Whitefish, as tempestades de Mammoth na Serra e a neve de altitude de Taos fecham a lista. Estâncias para planear uma viagem de pó, não apenas para visitar.",
      it: "Il Little Cottonwood Canyon dello Utah deposita oltre 14 m di neve all'anno su Snowbird e Alta, due delle montagne più innevate degli Stati Uniti continentali. Jackson Hole trasforma quell'aria in linee da esperti. La Champagne Powder di Steamboat, il Lone Peak di Big Sky, la Big Mountain di Whitefish, le tempeste del Mammoth sulla Sierra e la polvere d'alta quota di Taos chiudono la lista. Località su cui pianificare un viaggio di polvere, non solo da visitare.",
    },
    filter: (d) => isUSA(d) && USA_POWDER_RESORTS.has(d.slug),
    sort: (d) => d.snowScore,
    limit: 20,
  },
  {
    slug: 'colorado-rockies',
    heroSlug: 'vail',
    name: {
      en: 'Best ski resorts in the Colorado Rockies',
      fr: 'Meilleures stations de ski des Rocheuses du Colorado',
      es: 'Mejores estaciones de esquí de las Rocosas de Colorado',
      pt: 'Melhores estâncias de esqui das Rochosas do Colorado',
      it: 'Migliori località sciistiche delle Montagne Rocciose del Colorado',
    },
    intro: {
      en: 'The Colorado classics: high-altitude Rockies skiing from Vail and Aspen to Telluride, Breckenridge and Steamboat, all reachable from Denver or Eagle.',
      fr: "Les classiques du Colorado : ski d'altitude dans les Rocheuses, de Vail et Aspen à Telluride, Breckenridge et Steamboat, accessibles depuis Denver ou Eagle.",
      es: 'Los clásicos de Colorado: esquí de altura en las Rocosas, de Vail y Aspen a Telluride, Breckenridge y Steamboat, accesibles desde Denver o Eagle.',
      pt: 'Os clássicos do Colorado: esqui de altitude nas Rochosas, de Vail e Aspen a Telluride, Breckenridge e Steamboat, acessíveis a partir de Denver ou Eagle.',
      it: "I classici del Colorado: sci d'alta quota sulle Rocciose, da Vail e Aspen a Telluride, Breckenridge e Steamboat, raggiungibili da Denver o Eagle.",
    },
    description: {
      en: 'Colorado holds the highest concentration of marquee American ski resorts in one state, all above 2 100 m of base altitude. Vail leads with its 7 Back Bowls and Bavarian-style mid-mountain village; Aspen Snowmass spreads four mountains and an old-money town around its base; Breckenridge tops out at the highest in-bounds lift in the US; Telluride hides in the most dramatic box canyon setting in the country; Beaver Creek polishes its luxury; Steamboat brings the ranching town and the Champagne Powder.',
      fr: "Le Colorado concentre la plus grande densité de stations américaines de renom dans un seul État, toutes avec une base au-dessus de 2 100 m. Vail mène avec ses 7 Back Bowls et son village bavarois à mi-montagne ; Aspen Snowmass étale quatre montagnes et une ville old money autour de sa base ; Breckenridge culmine au télésiège le plus haut des USA ; Telluride se cache dans le canyon le plus spectaculaire du pays ; Beaver Creek peaufine son luxe ; Steamboat apporte la ville de ranch et la Champagne Powder.",
      es: "Colorado concentra la mayor densidad de estaciones americanas de renombre en un solo estado, todas con base por encima de 2 100 m. Vail lidera con sus 7 Back Bowls y su pueblo bávaro a media montaña; Aspen Snowmass extiende cuatro montañas y un pueblo de old money en su base; Breckenridge culmina en el telesilla más alto de Estados Unidos; Telluride se esconde en el cañón más espectacular del país; Beaver Creek pule su lujo; Steamboat aporta el pueblo ranchero y la Champagne Powder.",
      pt: "O Colorado concentra a maior densidade de estâncias americanas de renome num só estado, todas com base acima dos 2 100 m. Vail lidera com os seus 7 Back Bowls e a aldeia bávara a meio da montanha; Aspen Snowmass espalha quatro montanhas e uma vila old money em torno da base; Breckenridge culmina no teleférico mais alto dos EUA; Telluride esconde-se no canyon mais espetacular do país; Beaver Creek pole o seu luxo; Steamboat traz a vila de ranchos e a Champagne Powder.",
      it: "Il Colorado concentra la più alta densità di località americane di richiamo in un solo stato, tutte con base sopra i 2 100 m. Vail guida con i suoi 7 Back Bowls e il borgo bavarese a metà montagna; Aspen Snowmass dispiega quattro montagne e una cittadina old money attorno alla base; Breckenridge culmina nel seggiovia in quota più alto degli USA; Telluride si nasconde nel canyon più spettacolare del paese; Beaver Creek lima il suo lusso; Steamboat porta il paese di ranch e la Champagne Powder.",
    },
    filter: (d) => isUSA(d) && USA_COLORADO_SLUGS.has(d.slug),
    sort: (d) => d.snowScore,
    limit: 10,
  },
  {
    slug: 'utah-wasatch',
    heroSlug: 'alta',
    name: {
      en: 'Best ski resorts in the Utah Wasatch',
      fr: 'Meilleures stations de ski du Wasatch (Utah)',
      es: 'Mejores estaciones de esquí del Wasatch (Utah)',
      pt: 'Melhores estâncias de esqui do Wasatch (Utah)',
      it: 'Migliori località sciistiche del Wasatch (Utah)',
    },
    intro: {
      en: 'The greatest snow on earth, or so the licence plates say: Snowbird, Alta, Park City and Deer Valley, all within 45 minutes of Salt Lake City airport.',
      fr: "La meilleure neige du monde, comme l'affichent les plaques d'immatriculation : Snowbird, Alta, Park City et Deer Valley, toutes à 45 minutes de l'aéroport de Salt Lake City.",
      es: 'La mejor nieve del mundo, según rezan las matrículas: Snowbird, Alta, Park City y Deer Valley, todas a 45 minutos del aeropuerto de Salt Lake City.',
      pt: 'A melhor neve do mundo, como dizem as matrículas: Snowbird, Alta, Park City e Deer Valley, todas a 45 minutos do aeroporto de Salt Lake City.',
      it: "La neve più bella del mondo, come dichiarano le targhe: Snowbird, Alta, Park City e Deer Valley, tutte a 45 minuti dall'aeroporto di Salt Lake City.",
    },
    description: {
      en: 'The Wasatch Range above Salt Lake City gets some of the lightest, driest snow in North America, channeled into a handful of canyon-end ski resorts. Snowbird and Alta in Little Cottonwood Canyon are powder royalty; Park City Mountain is the biggest US ski resort by skiable acreage; Deer Valley keeps it ski-only and white-tablecloth. From plane to first chair: under two hours.',
      fr: "La chaîne du Wasatch au-dessus de Salt Lake City reçoit l'une des neiges les plus légères et les plus sèches d'Amérique du Nord, canalisée dans une poignée de stations en fond de canyon. Snowbird et Alta dans le Little Cottonwood sont la royauté de la poudreuse ; Park City Mountain est la plus grande station des USA en superficie skiable ; Deer Valley reste ski seulement et nappe blanche. De l'avion au premier siège : moins de deux heures.",
      es: "La cadena del Wasatch sobre Salt Lake City recibe una de las nieves más ligeras y secas de Norteamérica, canalizada en un puñado de estaciones al fondo del cañón. Snowbird y Alta en Little Cottonwood son la realeza del polvo; Park City Mountain es la mayor estación de EE. UU. por superficie esquiable; Deer Valley se queda con esquí solo y mantel blanco. Del avión a la primera silla: menos de dos horas.",
      pt: "A cordilheira do Wasatch acima de Salt Lake City recebe uma das neves mais leves e secas da América do Norte, canalizada para um punhado de estâncias no fundo do canyon. Snowbird e Alta em Little Cottonwood são a realeza do pó; Park City Mountain é a maior estância dos EUA em área esquiável; Deer Valley mantém-se só esqui e toalha branca. Do avião à primeira cadeira: menos de duas horas.",
      it: "La catena del Wasatch sopra Salt Lake City riceve una delle nevi più leggere e asciutte del Nord America, incanalata in un pugno di località in fondo al canyon. Snowbird e Alta nel Little Cottonwood sono la nobiltà della polvere; Park City Mountain è la più grande località degli USA per superficie sciabile; Deer Valley resta solo sci e tovaglia bianca. Dall'aereo alla prima seggiovia: meno di due ore.",
    },
    filter: (d) => isUSA(d) && USA_UTAH_SLUGS.has(d.slug),
    sort: (d) => d.snowScore,
    limit: 10,
  },
  {
    slug: 'east-coast-usa',
    heroSlug: 'stowe',
    name: {
      en: 'Best ski resorts on the US East Coast',
      fr: 'Meilleures stations de ski sur la côte Est des USA',
      es: 'Mejores estaciones de esquí en la costa Este de EE. UU.',
      pt: 'Melhores estâncias de esqui na costa Leste dos EUA',
      it: "Migliori località sciistiche sulla costa orientale degli USA",
    },
    intro: {
      en: 'New England ski country, where the sport grew up in the 1930s: classic Vermont resorts a drive from Boston, New York or Montréal.',
      fr: "Le pays du ski de Nouvelle-Angleterre, là où le sport a grandi dans les années 1930 : stations classiques du Vermont à quelques heures de Boston, New York ou Montréal.",
      es: 'El país del esquí de Nueva Inglaterra, donde el deporte creció en los años 30: estaciones clásicas del Vermont a unas horas de Boston, Nueva York o Montreal.',
      pt: 'O país do esqui da Nova Inglaterra, onde o desporto cresceu nos anos 30: estâncias clássicas do Vermont a algumas horas de Boston, Nova Iorque ou Montreal.',
      it: "Il paese sciistico del New England, dove lo sport è cresciuto negli anni '30: località classiche del Vermont a poche ore da Boston, New York o Montréal.",
    },
    description: {
      en: 'East Coast skiing is its own discipline: cold smoke when the storms align, ice-armoured groomers when they do not, and a culture of tough locals who keep skiing through both. Stowe under Mt Mansfield is Vermont\'s most polished classic; Killington is the Beast of the East, the largest in the region with the longest season. Both deliver on a weekend trip from Boston, New York or Montréal.',
      fr: "Le ski de la côte Est, c'est sa propre discipline : powder froid quand les tempêtes s'alignent, pistes blindées de glace quand elles ne le font pas, et une culture de locaux coriaces qui skient à travers les deux. Stowe sous le Mt Mansfield est le classique le plus soigné du Vermont ; Killington est la Bête de l'Est, la plus grande de la région et celle qui ouvre le plus longtemps. Les deux marchent en mode week-end depuis Boston, New York ou Montréal.",
      es: "El esquí de la costa Este es una disciplina propia: humo frío cuando las tormentas se alinean, pistas blindadas de hielo cuando no, y una cultura de locales duros que esquían en ambas. Stowe bajo Mt Mansfield es el clásico más pulido del Vermont; Killington es la Bestia del Este, la mayor de la región y la de temporada más larga. Las dos funcionan para un fin de semana desde Boston, Nueva York o Montreal.",
      pt: "O esqui da costa Leste é uma disciplina própria: fumo frio quando as tempestades se alinham, pistas blindadas de gelo quando não, e uma cultura de locais duros que esquia em ambas. Stowe sob o Mt Mansfield é o clássico mais polido do Vermont; Killington é a Besta do Leste, a maior da região e a de época mais longa. Ambas funcionam para um fim de semana a partir de Boston, Nova Iorque ou Montreal.",
      it: "Lo sci della costa orientale è una disciplina a sé: fumo freddo quando le tempeste si allineano, piste corazzate di ghiaccio quando no, e una cultura di locali tosti che scia in entrambe. Stowe sotto il Mt Mansfield è il classico più curato del Vermont; Killington è la Bestia dell'Est, la più grande della regione e con la stagione più lunga. Entrambe reggono un weekend da Boston, New York o Montréal.",
    },
    filter: (d) => isUSA(d) && USA_EAST_SLUGS.has(d.slug),
    sort: (d) => d.snowScore,
    limit: 10,
  },
  {
    slug: 'africa',
    heroSlug: 'oukaimeden',
    name: {
      en: 'Ski resorts in Africa',
      fr: "Stations de ski d'Afrique",
      es: 'Estaciones de esquí de África',
      pt: 'Estâncias de esqui de África',
      it: "Località sciistiche in Africa",
    },
    intro: {
      en: 'Yes, you can ski in Africa: Morocco\'s Atlas, Algeria\'s Djurdjura, Lesotho\'s Maluti, South Africa\'s Drakensberg and even an indoor slope in Cairo.',
      fr: "Oui, on skie en Afrique : l'Atlas marocain, le Djurdjura algérien, les Maluti du Lesotho, le Drakensberg sud-africain, et même une piste indoor au Caire.",
      es: 'Sí, se puede esquiar en África: el Atlas marroquí, el Djurdjura argelino, los Maluti de Lesoto, el Drakensberg sudafricano y hasta una pista cubierta en El Cairo.',
      pt: 'Sim, esquia-se em África: o Atlas marroquino, o Djurdjura argelino, os Maluti do Lesoto, o Drakensberg sul-africano e até uma pista indoor no Cairo.',
      it: "Sì, in Africa si scia: l'Atlante marocchino, il Djurdjura algerino, i Maluti del Lesotho, il Drakensberg sudafricano e perfino una pista indoor al Cairo.",
    },
    description: {
      en: 'African skiing is short, often unreliable, and almost always small. That is the appeal. Oukaïmeden in the Moroccan High Atlas is the headline act at 2620 m with 7 lifts and Mt Toubkal as the backdrop; Mischliffen and a handful of Middle Atlas resorts add cedar-forest skiing near Ifrane. Algeria runs Chréa above Blida and the Djurdjura pair of Tikjda and Tala-Guilef. Afriski in Lesotho is the highest base in Africa (3050 m) and skis southern-hemisphere winter June to August, joined by South Africa\'s Tiffindell. Ski Egypt in Cairo is indoor and year-round. None of this is the Alps. All of it is improbable in the best way.',
      fr: "Le ski africain est court, souvent peu fiable et presque toujours petit. C'est précisément ce qui en fait le sel. Oukaïmeden, dans le Haut Atlas marocain, tient la tête d'affiche à 2620 m avec 7 remontées et le Toubkal en toile de fond ; Mischliffen et une poignée de domaines du Moyen Atlas ajoutent le ski en cédraie autour d'Ifrane. L'Algérie aligne Chréa au-dessus de Blida et le duo du Djurdjura (Tikjda + Tala-Guilef). Afriski au Lesotho détient la plus haute base d'Afrique (3050 m) et skie l'hiver austral de juin à août, accompagné de Tiffindell en Afrique du Sud. Ski Egypt au Caire est indoor, toute l'année. Rien de tout cela n'égale les Alpes. Tout est improbable au meilleur sens.",
      es: "El esquí africano es corto, a menudo poco fiable y casi siempre pequeño. Justo eso es lo que lo hace especial. Oukaïmeden, en el Alto Atlas marroquí, es la cabeza de cartel a 2620 m con 7 remontes y el Toubkal de fondo; Mischliffen y un puñado de estaciones del Atlas Medio suman esquí en cedrales cerca de Ifrane. Argelia juega con Chréa sobre Blida y el dúo del Djurdjura (Tikjda + Tala-Guilef). Afriski en Lesoto tiene la base más alta de África (3050 m) y esquía el invierno austral de junio a agosto, acompañado de Tiffindell en Sudáfrica. Ski Egypt en El Cairo es cubierto y abre todo el año. Nada de esto iguala a los Alpes. Todo es improbable, en el mejor sentido.",
      pt: "O esqui africano é curto, muitas vezes pouco fiável e quase sempre pequeno. É precisamente por isso que é especial. Oukaïmeden, no Alto Atlas marroquino, é o cabeça de cartaz a 2620 m com 7 teleféricos e o Toubkal como cenário; Mischliffen e um punhado de estâncias do Atlas Médio juntam esqui em cedrais perto de Ifrane. A Argélia alinha Chréa acima de Blida e o duo do Djurdjura (Tikjda + Tala-Guilef). O Afriski no Lesoto tem a base mais alta de África (3050 m) e esquia o inverno austral de junho a agosto, com Tiffindell na África do Sul a acompanhar. O Ski Egypt no Cairo é indoor, aberto todo o ano. Nada disto iguala os Alpes. Tudo é improvável, no melhor dos sentidos.",
      it: "Lo sci africano è breve, spesso poco affidabile e quasi sempre piccolo. È esattamente questo a renderlo speciale. Oukaïmeden, nell'Alto Atlante marocchino, è la testa di cartellone a 2620 m con 7 impianti e il Toubkal sullo sfondo; Mischliffen e un pugno di località dell'Atlante Medio aggiungono lo sci tra i cedri vicino a Ifrane. L'Algeria schiera Chréa sopra Blida e la coppia del Djurdjura (Tikjda + Tala-Guilef). Afriski in Lesotho ha la base più alta d'Africa (3050 m) e scia l'inverno australe da giugno ad agosto, con Tiffindell in Sudafrica al seguito. Ski Egypt al Cairo è indoor, aperto tutto l'anno. Nulla di tutto questo è all'altezza delle Alpi. Tutto è improbabile, nel senso migliore.",
    },
    filter: (d) => isAfrica(d),
    sort: (d) => d.snowScore,
    limit: 12,
  },
  {
    slug: 'canada',
    heroSlug: 'whistler-blackcomb',
    name: {
      en: 'Best ski resorts in Canada',
      fr: 'Meilleures stations de ski au Canada',
      es: 'Mejores estaciones de esquí de Canadá',
      pt: 'Melhores estâncias de esqui do Canadá',
      it: 'Migliori località sciistiche del Canada',
    },
    intro: {
      en: "Whistler's Pacific maritime giant, the Banff National Park trio, the alpine steeps of Kicking Horse and Revelstoke, plus East-Coast Tremblant and Mont-Sainte-Anne: ten resorts that frame Canadian skiing in one list.",
      fr: "Le géant maritime du Pacifique à Whistler, le trio du parc national de Banff, le raide alpin de Kicking Horse et Revelstoke, plus Tremblant et le Mont-Sainte-Anne côté Est : dix stations qui résument le ski canadien en une liste.",
      es: 'El gigante marítimo del Pacífico en Whistler, el trío del parque nacional de Banff, los empinados alpinos de Kicking Horse y Revelstoke, más Tremblant y Mont-Sainte-Anne en el Este: diez estaciones que resumen el esquí canadiense.',
      pt: 'O gigante marítimo do Pacífico em Whistler, o trio do parque nacional de Banff, os íngremes alpinos de Kicking Horse e Revelstoke, mais Tremblant e Mont-Sainte-Anne no Leste: dez estâncias que resumem o esqui canadiano.',
      it: "Il gigante marittimo del Pacifico a Whistler, il trio del parco nazionale di Banff, le ripide alpine di Kicking Horse e Revelstoke, più Tremblant e Mont-Sainte-Anne sul versante Est: dieci località che riassumono lo sci canadese.",
    },
    description: {
      en: "Canada packs two ski countries onto one passport. The West runs maritime + continental in big chunks: Whistler Blackcomb on the Pacific with the Peak 2 Peak Gondola, the Banff park trio (Sunshine + Lake Louise + Marmot Basin) trading on altitude and national-park scenery, the BC Interior offering Big White and Sun Peaks for family powder, Revelstoke for the highest vertical in North America, Kicking Horse for the steepest in-bounds Canadian terrain. The East runs colder and smaller: Tremblant's pedestrian village 2 hr from Montreal, Mont-Sainte-Anne's St-Lawrence views 30 min from Quebec City. November-to-May seasons on both coasts.",
      fr: "Le Canada loge deux pays de ski sur un même passeport. L'Ouest, c'est du maritime + du continental par gros blocs : Whistler Blackcomb sur le Pacifique avec la Peak 2 Peak Gondola, le trio du parc de Banff (Sunshine + Lake Louise + Marmot Basin) qui mise sur l'altitude et les paysages de parc national, l'intérieur de la C.-B. avec Big White et Sun Peaks pour la poudreuse en famille, Revelstoke pour le plus gros dénivelé d'Amérique du Nord, Kicking Horse pour le plus raide en bord de piste du pays. L'Est est plus froid et plus petit : le village piéton de Tremblant à 2 h de Montréal, les vues sur le Saint-Laurent du Mont-Sainte-Anne à 30 min de Québec. Saisons de novembre à mai des deux côtés.",
      es: "Canadá mete dos países de esquí en un solo pasaporte. El Oeste corre marítimo + continental por grandes bloques: Whistler Blackcomb en el Pacífico con la Peak 2 Peak Gondola, el trío del parque de Banff (Sunshine + Lake Louise + Marmot Basin) que apuesta por la altitud y los paisajes de parque nacional, el interior de la Columbia Británica con Big White y Sun Peaks para polvo en familia, Revelstoke para el mayor desnivel de Norteamérica, Kicking Horse para el terreno más empinado dentro de pistas del país. El Este corre más frío y más pequeño: el pueblo peatonal de Tremblant a 2 h de Montreal, las vistas al San Lorenzo de Mont-Sainte-Anne a 30 min de Quebec. Temporadas de noviembre a mayo en ambos lados.",
      pt: "O Canadá mete dois países de esqui num só passaporte. O Oeste corre marítimo + continental em grandes blocos: Whistler Blackcomb no Pacífico com a Peak 2 Peak Gondola, o trio do parque de Banff (Sunshine + Lake Louise + Marmot Basin) que aposta na altitude e nas paisagens de parque nacional, o interior da Colúmbia Britânica com Big White e Sun Peaks para neve em pó em família, Revelstoke para o maior desnível da América do Norte, Kicking Horse para o terreno mais íngreme dentro de pistas do país. O Leste corre mais frio e mais pequeno: a vila pedonal de Tremblant a 2 h de Montreal, as vistas para o São Lourenço de Mont-Sainte-Anne a 30 min de Quebec. Épocas de novembro a maio dos dois lados.",
      it: "Il Canada infila due paesi sciistici in un solo passaporto. L'Ovest corre marittimo + continentale a grandi blocchi: Whistler Blackcomb sul Pacifico con la Peak 2 Peak Gondola, il trio del parco di Banff (Sunshine + Lake Louise + Marmot Basin) che punta sulla quota e sui paesaggi da parco nazionale, l'interno della Columbia Britannica con Big White e Sun Peaks per la polvere in famiglia, Revelstoke per il maggior dislivello del Nord America, Kicking Horse per il terreno più ripido in pista del paese. L'Est corre più freddo e più piccolo: il villaggio pedonale di Tremblant a 2 h da Montréal, le viste sul San Lorenzo del Mont-Sainte-Anne a 30 min da Québec. Stagioni da novembre a maggio su entrambi i versanti.",
    },
    filter: (d) => isCanada(d),
    sort: (d) => d.snowScore,
    limit: 12,
  },
  {
    slug: 'south-korea',
    heroSlug: 'yongpyong',
    name: {
      en: 'Best ski resorts in South Korea',
      fr: 'Meilleures stations de ski en Corée du Sud',
      es: 'Mejores estaciones de esquí de Corea del Sur',
      pt: 'Melhores estâncias de esqui da Coreia do Sul',
      it: 'Migliori località sciistiche della Corea del Sud',
    },
    intro: {
      en: 'The PyeongChang 2018 Olympic legacy plus the Seoul day-trip resorts and the southern outlier: ten ski destinations that frame the Korean winter on one ranked list.',
      fr: "L'héritage des Jeux olympiques de PyeongChang 2018, les stations de week-end de Séoul et l'outsider du Sud : dix destinations qui résument l'hiver coréen en une liste classée.",
      es: 'El legado olímpico de PyeongChang 2018 más las estaciones de fin de semana cerca de Seúl y el atípico del sur: diez destinos que resumen el invierno coreano en una lista clasificada.',
      pt: 'O legado olímpico de PyeongChang 2018 mais as estâncias de fim de semana perto de Seul e o atípico do sul: dez destinos que resumem o inverno coreano numa lista ordenada.',
      it: 'Il lascito olimpico di PyeongChang 2018 più le località da weekend vicino a Seoul e l\'atipica del Sud: dieci destinazioni che riassumono l\'inverno coreano in una lista ordinata.',
    },
    description: {
      en: 'South Korea\'s ski map is dominated by Gangwon Province, where PyeongChang hosted the 2018 Olympics. Yongpyong ran the alpine slalom + GS, Phoenix Pyeongchang the freestyle + snowboard, Alpensia the jumping + nordic + sliding. High1 in Jeongseon is the family-friendly mass-market giant. Closer to Seoul, Vivaldi Park, Konjiam and Oak Valley pack day-trippers in for night skiing under stadium lights, while Welli Hilli Park sits in between. Further south, Muju Deogyusan hides Korea\'s highest skiable peak at 1614 m, and Eden Valley above Busan rounds the list as the most southerly ski resort in the country. Heavy snowmaking, lifts into the small hours, KTX trains to the door.',
      fr: "La carte du ski sud-coréen est dominée par le Gangwon, où PyeongChang a accueilli les Jeux 2018. Yongpyong a accueilli le slalom + GS, Phoenix Pyeongchang le freestyle + le snowboard, Alpensia le saut + nordique + sliding. High1 à Jeongseon est le géant familial. Plus près de Séoul, Vivaldi Park, Konjiam et Oak Valley remplissent leurs pistes d'excursionnistes pour le ski de nuit sous projecteurs de stade, Welli Hilli Park se trouve entre les deux. Plus au sud, Muju Deogyusan cache le plus haut sommet skiable de Corée à 1614 m, et Eden Valley au-dessus de Busan ferme la liste, plus méridional du pays. Forte neige de culture, remontées tard, KTX jusqu'à la porte.",
      es: "El mapa del esquí surcoreano está dominado por la provincia de Gangwon, donde PyeongChang acogió los Juegos 2018. Yongpyong albergó el slalom + GS, Phoenix Pyeongchang el freestyle + snowboard, Alpensia los saltos + nórdico + sliding. High1 en Jeongseon es el gigante familiar. Más cerca de Seúl, Vivaldi Park, Konjiam y Oak Valley llenan sus pistas de visitantes de día para esquí nocturno bajo focos de estadio, Welli Hilli Park queda en medio. Más al sur, Muju Deogyusan esconde la cima esquiable más alta de Corea a 1614 m, y Eden Valley sobre Busan cierra la lista como la más austral del país. Producción de nieve intensa, remontes hasta tarde, KTX a la puerta.",
      pt: "O mapa do esqui sul-coreano é dominado pela província de Gangwon, onde PyeongChang acolheu os Jogos 2018. Yongpyong recebeu o slalom + GS, Phoenix Pyeongchang o freestyle + snowboard, Alpensia os saltos + nórdico + sliding. O High1 em Jeongseon é o gigante familiar. Mais perto de Seul, Vivaldi Park, Konjiam e Oak Valley enchem-se de visitantes de dia para esqui noturno sob holofotes de estádio, Welli Hilli Park fica no meio. Mais a sul, Muju Deogyusan esconde o pico esquiável mais alto da Coreia a 1614 m, e Eden Valley sobre Busan fecha a lista como a mais a sul do país. Forte produção de neve artificial, teleféricos até tarde, KTX à porta.",
      it: "La mappa dello sci sudcoreano è dominata dalla provincia di Gangwon, dove PyeongChang ha ospitato i Giochi 2018. Yongpyong ha ospitato lo slalom + GS, Phoenix Pyeongchang il freestyle + lo snowboard, Alpensia i salti + nordico + sliding. High1 a Jeongseon è il gigante familiare. Più vicino a Seoul, Vivaldi Park, Konjiam e Oak Valley si riempiono di visitatori giornalieri per lo sci notturno sotto luci da stadio, Welli Hilli Park sta nel mezzo. Più a sud, Muju Deogyusan nasconde la cima sciabile più alta di Corea a 1614 m, ed Eden Valley sopra Busan chiude la lista come la più meridionale del paese. Forte innevamento artificiale, impianti fino a tardi, KTX alla porta.",
    },
    filter: (d) => isSouthKorea(d),
    sort: (d) => d.snowScore,
    limit: 12,
  },
  {
    slug: 'australia',
    heroSlug: 'thredbo',
    name: {
      en: 'Best ski resorts in Australia',
      fr: 'Meilleures stations de ski en Australie',
      es: 'Mejores estaciones de esquí de Australia',
      pt: 'Melhores estâncias de esqui da Austrália',
      it: 'Migliori località sciistiche in Australia',
    },
    intro: {
      en: 'The Snowy Mountains and the Victorian Alps: five resorts that frame Australian skiing on one ranked list, all Southern Hemisphere winter Jun-Sep.',
      fr: "Les Snowy Mountains et les Alpes victoriennes : cinq stations qui résument le ski australien en une liste classée, toutes en hiver de l'hémisphère sud (juin à septembre).",
      es: 'Las Snowy Mountains y los Alpes victorianos: cinco estaciones que resumen el esquí australiano en una lista clasificada, todas en invierno del hemisferio sur (junio a septiembre).',
      pt: 'As Snowy Mountains e os Alpes Victorianos: cinco estâncias que resumem o esqui australiano numa lista ordenada, todas no inverno do hemisfério sul (junho a setembro).',
      it: "Le Snowy Mountains e le Alpi Victoriane: cinque località che riassumono lo sci australiano in una lista ordinata, tutte nell'inverno dell'emisfero sud (da giugno a settembre).",
    },
    description: {
      en: 'Perisher in NSW runs the largest lift fleet in the Southern Hemisphere (47 lifts across 4 linked villages). Thredbo offers Australia\'s biggest vertical (672 m) under Mt Kosciuszko. The Victorian Alps add Falls Creek (car-free pedestrian village, strong nordic), Mt Hotham ("Powder Capital of Australia," ski-down-to-village layout) and Mt Buller (closest major to Melbourne, 80 km of pistes). Snow gum eucalyptus forests give every run an identity unlike anywhere in the Northern Hemisphere.',
      fr: "Perisher (Nouvelle-Galles du Sud) aligne le plus grand parc de remontées de l'hémisphère sud (47 remontées sur 4 villages reliés). Thredbo offre le plus grand dénivelé d'Australie (672 m) sous le Mt Kosciuszko. Les Alpes victoriennes ajoutent Falls Creek (village piéton sans voitures, fort en nordique), Mt Hotham (« capitale de la poudreuse australienne », village sur la crête où on skie vers le bas) et Mt Buller (le plus proche de Melbourne, 80 km de pistes). Les forêts de snow gum (eucalyptus) donnent à chaque piste une identité unique.",
      es: 'Perisher (Nueva Gales del Sur) alinea la mayor flota de remontes del hemisferio sur (47 remontes sobre 4 pueblos enlazados). Thredbo ofrece el mayor desnivel de Australia (672 m) bajo el Mt Kosciuszko. Los Alpes victorianos suman Falls Creek (pueblo peatonal sin coches, fuerte en nórdico), Mt Hotham ("capital de la nieve polvo australiana," pueblo en la cresta donde se esquía hacia abajo) y Mt Buller (el más cercano a Melbourne, 80 km de pistas). Los bosques de snow gum (eucaliptos) dan a cada pista una identidad única.',
      pt: "Perisher (Nova Gales do Sul) alinha a maior frota de teleféricos do hemisfério sul (47 teleféricos sobre 4 vilas ligadas). Thredbo oferece o maior desnível da Austrália (672 m) sob o Mt Kosciuszko. Os Alpes Victorianos somam Falls Creek (vila pedonal sem carros, forte em nórdico), Mt Hotham (\"capital da neve em pó australiana,\" vila na crista onde se esquia para baixo) e Mt Buller (o mais próximo de Melbourne, 80 km de pistas). As florestas de snow gum (eucaliptos) dão a cada pista uma identidade única.",
      it: "Perisher (Nuovo Galles del Sud) schiera la maggior flotta di impianti dell'emisfero sud (47 impianti su 4 villaggi collegati). Thredbo offre il maggior dislivello d'Australia (672 m) sotto il Mt Kosciuszko. Le Alpi Victoriane aggiungono Falls Creek (borgo pedonale senza auto, forte sul nordico), Mt Hotham (\"capitale della polvere australiana,\" borgo sulla cresta dove si scia verso il basso) e Mt Buller (il più vicino a Melbourne, 80 km di piste). I boschi di snow gum (eucalipti) danno a ogni pista un'identità unica.",
    },
    filter: (d) => isAustralia(d),
    sort: (d) => d.snowScore,
    limit: 10,
  },
  {
    slug: 'new-zealand',
    heroSlug: 'treble-cone',
    name: {
      en: 'Best ski resorts in New Zealand',
      fr: 'Meilleures stations de ski en Nouvelle-Zélande',
      es: 'Mejores estaciones de esquí de Nueva Zelanda',
      pt: 'Melhores estâncias de esqui da Nova Zelândia',
      it: 'Migliori località sciistiche in Nuova Zelanda',
    },
    intro: {
      en: 'The Southern Alps of South Island: five resorts above Wanaka, Queenstown and Methven, Southern Hemisphere season Jun-Oct, no on-mountain lodging.',
      fr: "Les Alpes du Sud de l'île du Sud : cinq stations au-dessus de Wanaka, Queenstown et Methven, hiver de l'hémisphère sud de juin à octobre, sans hébergement sur le domaine.",
      es: 'Los Alpes del Sur de la Isla Sur: cinco estaciones sobre Wanaka, Queenstown y Methven, invierno del hemisferio sur de junio a octubre, sin alojamiento en montaña.',
      pt: 'Os Alpes do Sul da Ilha do Sul: cinco estâncias acima de Wanaka, Queenstown e Methven, inverno do hemisfério sul de junho a outubro, sem alojamento na montanha.',
      it: "Le Alpi del Sud dell'Isola del Sud: cinque località sopra Wanaka, Queenstown e Methven, inverno dell'emisfero sud da giugno a ottobre, niente alloggio in quota.",
    },
    description: {
      en: 'Around Wanaka, Cardrona is the family-friendly freestyle classic and Treble Cone the expert freeride mecca. Around Queenstown, Coronet Peak runs night skiing under floodlights and The Remarkables name themselves for the jagged Single Cone above Lake Wakatipu. North on South Island, Mt Hutt above Methven runs the longest commercial season in NZ (Jun to late Oct). Almost no resort has ski-in/ski-out lodging: you sleep in the lakeside towns and drive up daily.',
      fr: "Autour de Wanaka, Cardrona est le classique freestyle familial et Treble Cone le repère du freeride expert. Autour de Queenstown, Coronet Peak ouvre le ski de nuit sous projecteurs, et les Remarkables portent leur nom des pics dentelés du Single Cone au-dessus du lac Wakatipu. Plus au nord sur l'île du Sud, Mt Hutt au-dessus de Methven tient la saison commerciale la plus longue de Nouvelle-Zélande (juin à fin octobre). Quasiment aucune station n'offre de ski-in/ski-out : on dort dans les villes au bord du lac et on monte chaque jour.",
      es: "Cerca de Wanaka, Cardrona es el clásico freestyle familiar y Treble Cone la meca del freeride experto. Cerca de Queenstown, Coronet Peak abre el esquí nocturno bajo focos, y los Remarkables toman su nombre de los picos dentados del Single Cone sobre el lago Wakatipu. Más al norte en la Isla Sur, Mt Hutt sobre Methven mantiene la temporada comercial más larga de Nueva Zelanda (de junio a finales de octubre). Casi ninguna estación ofrece ski-in/ski-out: se duerme en los pueblos junto al lago y se sube cada día.",
      pt: "Perto de Wanaka, Cardrona é o clássico freestyle familiar e Treble Cone a meca do freeride para experts. Perto de Queenstown, Coronet Peak abre o esqui noturno sob holofotes, e os Remarkables ganham o nome dos picos serrilhados do Single Cone sobre o lago Wakatipu. Mais a norte na Ilha do Sul, Mt Hutt acima de Methven tem a época comercial mais longa da Nova Zelândia (de junho a finais de outubro). Quase nenhuma estância oferece ski-in/ski-out: dorme-se nas vilas à beira-lago e sobe-se todos os dias.",
      it: "Intorno a Wanaka, Cardrona è il classico freestyle familiare e Treble Cone la mecca del freeride da esperti. Intorno a Queenstown, Coronet Peak apre lo sci notturno sotto i fari, e i Remarkables prendono il nome dalle vette frastagliate del Single Cone sopra il lago Wakatipu. Più a nord sull'Isola del Sud, Mt Hutt sopra Methven tiene la stagione commerciale più lunga della Nuova Zelanda (da giugno a fine ottobre). Quasi nessuna località offre ski-in/ski-out: si dorme nei paesi sul lago e si sale ogni giorno.",
    },
    filter: (d) => isNewZealand(d),
    sort: (d) => d.snowScore,
    limit: 10,
  },
  {
    slug: 'chile',
    heroSlug: 'portillo',
    name: {
      en: 'Best ski resorts in Chile',
      fr: 'Meilleures stations de ski au Chili',
      es: 'Mejores estaciones de esquí de Chile',
      pt: 'Melhores estâncias de esqui do Chile',
      it: 'Migliori località sciistiche in Cile',
    },
    intro: {
      en: 'The Andes around Santiago: three classics that frame Chilean skiing — Portillo on Laguna del Inca, Valle Nevado and La Parva in the Tres Valles cluster, Southern Hemisphere Jun-Oct.',
      fr: "Les Andes autour de Santiago : trois classiques qui résument le ski chilien, Portillo sur la Laguna del Inca, Valle Nevado et La Parva dans la grappe des Tres Valles, hiver austral de juin à octobre.",
      es: 'Los Andes alrededor de Santiago: tres clásicos que resumen el esquí chileno, Portillo sobre la Laguna del Inca, Valle Nevado y La Parva en el grupo Tres Valles, invierno austral de junio a octubre.',
      pt: 'Os Andes em torno de Santiago: três clássicos que resumem o esqui chileno, Portillo sobre a Laguna del Inca, Valle Nevado e La Parva no cluster dos Tres Valles, inverno austral de junho a outubro.',
      it: "Le Ande attorno a Santiago: tre classici che riassumono lo sci cileno, Portillo sulla Laguna del Inca, Valle Nevado e La Parva nel gruppo dei Tres Valles, inverno australe da giugno a ottobre.",
    },
    description: {
      en: "Chile's three Andean classics each frame a different facet of South American skiing. Portillo (2 hours north of Santiago, base 2880 m) hosted the only Alpine World Championships ever held in the Southern Hemisphere (1966) and remains the August training base for US, Canadian and European national teams, with the iconic yellow Hotel Portillo on Laguna del Inca. Valle Nevado (1 hour 30 east of Santiago, base 3025 m, highest in Chile) runs modern Compagnie des Alpes design with a Three Valleys interconnect to El Colorado and La Parva. La Parva (Tres Valles too) leans residential and quieter, with Las Lomas alpine bowls and the Falsa Parva freeride hike-to. Southern Hemisphere season runs June to October. The Andes do the work; Santiago is the gateway 1 to 3 hours below.",
      fr: "Les trois classiques andins du Chili résument chacun une facette du ski sud-américain. Portillo (2 h au nord de Santiago, base 2880 m) a accueilli les seuls Championnats du monde alpins jamais organisés dans l'hémisphère sud (1966) et reste le camp d'entraînement d'août pour les équipes nationales américaines, canadiennes et européennes, avec l'emblématique Hotel Portillo jaune sur la Laguna del Inca. Valle Nevado (1 h 30 à l'est de Santiago, base 3025 m, la plus haute du Chili) propose un design moderne signé Compagnie des Alpes avec une interconnexion Tres Valles vers El Colorado et La Parva. La Parva (Tres Valles aussi) joue la carte résidentielle et plus calme, avec les bowls alpins de Las Lomas et le freeride hike-to de Falsa Parva. Saison de juin à octobre.",
      es: "Los tres clásicos andinos de Chile marcan cada uno una faceta del esquí sudamericano. Portillo (2 h al norte de Santiago, base 2880 m) acogió los únicos Campeonatos del Mundo alpinos jamás celebrados en el hemisferio sur (1966) y sigue siendo el campamento de agosto de los equipos nacionales de EE. UU., Canadá y Europa, con el icónico Hotel Portillo amarillo sobre la Laguna del Inca. Valle Nevado (1 h 30 al este de Santiago, base 3025 m, la más alta de Chile) propone diseño moderno de la Compagnie des Alpes con interconexión Tres Valles hacia El Colorado y La Parva. La Parva (Tres Valles también) apuesta por lo residencial y tranquilo, con los bowls alpinos de Las Lomas y el freeride hike-to de Falsa Parva. Temporada de junio a octubre.",
      pt: "Os três clássicos andinos do Chile retratam cada um uma faceta do esqui sul-americano. Portillo (2 h a norte de Santiago, base 2880 m) acolheu os únicos Campeonatos do Mundo alpinos jamais realizados no hemisfério sul (1966) e continua a ser o campo de agosto das equipas nacionais dos EUA, Canadá e Europa, com o icónico Hotel Portillo amarelo sobre a Laguna del Inca. Valle Nevado (1 h 30 a leste de Santiago, base 3025 m, a mais alta do Chile) propõe design moderno da Compagnie des Alpes com interligação Tres Valles para El Colorado e La Parva. La Parva (Tres Valles também) joga a carta residencial e mais calma, com os bowls alpinos de Las Lomas e o freeride hike-to de Falsa Parva. Época de junho a outubro.",
      it: "I tre classici andini del Cile dipingono ciascuno una faccia dello sci sudamericano. Portillo (2 ore a nord di Santiago, base 2880 m) ha ospitato gli unici Mondiali di sci alpino mai disputati nell'emisfero sud (1966) e resta il campo di allenamento di agosto delle nazionali statunitense, canadese ed europea, con l'iconico Hotel Portillo giallo sulla Laguna del Inca. Valle Nevado (1 h 30 a est di Santiago, base 3025 m, la più alta del Cile) propone design moderno della Compagnie des Alpes con collegamento Tres Valles verso El Colorado e La Parva. La Parva (anche Tres Valles) gioca la carta residenziale e tranquilla, con le conche alpine di Las Lomas e il freeride hike-to di Falsa Parva. Stagione da giugno a ottobre.",
    },
    filter: (d) => isChile(d),
    sort: (d) => d.snowScore,
    limit: 10,
  },
  // ---------- Wave 15: high-intent SEO traffic pages ----------
  {
    slug: 'cheap-ski',
    heroSlug: 'cervinia',
    ...x('cheap-ski'),
    filter: (d) =>
      isEurope(d) &&
      (CHEAP_SKI_SLUGS.has(d.slug) || d.vibes.includes('value')),
    sort: (d) => (d.vibes.includes('value') ? 5 : 0) + d.snowScore / 20 + d.pistesKm / 100,
    limit: 24,
  },
  {
    slug: 'ski-near-paris',
    heroSlug: 'tignes',
    ...x('ski-near-paris'),
    filter: (d) =>
      distanceKm(CITIES.paris.lat, CITIES.paris.lng, d.lat, d.lng) <= CITIES.paris.radiusKm,
    sort: (d) => d.snowScore + d.pistesKm / 50,
    limit: 24,
  },
  {
    slug: 'ski-near-london',
    heroSlug: 'chamonix',
    ...x('ski-near-london'),
    filter: (d) => NEAR_LONDON_SLUGS.has(d.slug),
    sort: (d) => d.snowScore + d.pistesKm / 50,
    limit: 20,
  },
  {
    slug: 'spring-skiing',
    heroSlug: 'saas-fee',
    ...x('spring-skiing'),
    filter: (d) =>
      d.altitudeBase >= 2000 ||
      d.vibes.includes('glacier') ||
      d.vibes.includes('summer-ski') ||
      d.vibes.includes('snow-sure'),
    sort: (d) => d.altitudeBase / 100 + d.snowScore,
    limit: 24,
  },
  {
    slug: 'ski-honeymoon',
    heroSlug: 'zermatt',
    ...x('ski-honeymoon'),
    filter: (d) => HONEYMOON_SLUGS.has(d.slug),
    sort: (d) => d.snowScore + (d.vibes.some((v) => LUX_VIBES.has(v)) ? 10 : 0),
    limit: 16,
  },
  {
    slug: 'highest-world',
    heroSlug: 'zermatt',
    ...x('highest-world'),
    // Worldwide, ranked by the highest lift-served point. Per-resort summit
    // altitude (not a shared linked-domain figure), so the ranking is clean.
    filter: () => true,
    sort: (d) => d.altitudeSummit,
    limit: 24,
  },
]

export function getBestForList(slug: string): BestForList | undefined {
  return BEST_FOR_LISTS.find((l) => l.slug === slug)
}
