import type { Locale } from '@/app/[locale]/dictionaries'
import type { Destination } from './destinations'

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
}

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
    filter: (d) => d.snowScore >= 85,
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
    filter: (d) => d.vibes.includes('family'),
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
    filter: (d) => d.vibes.some((v) => LUX_VIBES.has(v)),
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
    filter: (d) => d.vibes.includes('glacier'),
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
    filter: (d) => d.pistesKm >= 200,
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
    filter: (d) => d.vibes.includes('value'),
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
    filter: (d) => d.vibes.includes('freeride'),
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
    filter: (d) => d.pisteCounts.green >= 10,
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
    filter: (d) => d.altitudeBase >= 1800,
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
    filter: (d) => d.vibes.includes('car-free'),
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
    filter: (d) => FREESTYLE_RESORTS.has(d.slug),
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
]

export function getBestForList(slug: string): BestForList | undefined {
  return BEST_FOR_LISTS.find((l) => l.slug === slug)
}
