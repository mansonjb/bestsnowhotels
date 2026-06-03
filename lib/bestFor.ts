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

export const BEST_FOR_LISTS: BestForList[] = [
  {
    slug: 'snow-sure',
    heroSlug: 'val-thorens',
    name: {
      en: 'Best snow-sure ski resorts in Europe',
      fr: "Stations de ski les plus sûres en neige d'Europe",
      es: 'Mejores estaciones con nieve garantizada de Europa',
      pt: 'Melhores estâncias com neve garantida da Europa',
    },
    intro: {
      en: 'The Alps and Pyrenees resorts most likely to deliver real snow, picked by our 0 to 100 snow score and high-altitude pedigree.',
      fr: "Les stations des Alpes et des Pyrénées les plus sûres en neige, classées par notre score de 0 à 100 et leur altitude.",
      es: "Las estaciones de los Alpes y los Pirineos con la nieve más fiable, ordenadas por nuestra puntuación de 0 a 100 y su altitud.",
      pt: "As estâncias dos Alpes e dos Pirenéus com a neve mais fiável, ordenadas pela nossa pontuação de 0 a 100 e pela altitude.",
    },
    description: {
      en: 'Snow is the whole point of a ski trip, and these resorts have the altitude and aspect to deliver it more reliably than the rest. We rank by our snow score, a 0 to 100 measure combining base and summit altitude, historical snow record and aspect. Expect resorts that open early, close late and survive lean winters when lower neighbours close.',
      fr: "La neige reste l'objet d'un voyage au ski, et ces stations ont l'altitude et l'orientation pour la garantir mieux que les autres. Nous les classons par notre score neige, une mesure de 0 à 100 qui combine altitudes de base et de sommet, historique d'enneigement et exposition. Attendez-vous à des stations qui ouvrent tôt, ferment tard et survivent aux hivers maigres quand les voisines plus basses baissent le rideau.",
      es: "La nieve es lo que se busca en un viaje de esquí, y estas estaciones tienen la altitud y la orientación para garantizarla mejor que el resto. Las ordenamos por nuestra puntuación de nieve, una medida de 0 a 100 que combina altitudes de base y cima, histórico de nieve y orientación. Espera estaciones que abren pronto, cierran tarde y resisten los inviernos flojos cuando las vecinas más bajas tiran la toalla.",
      pt: "A neve é o objetivo de uma viagem de esqui, e estas estâncias têm a altitude e a exposição para a garantir melhor do que as outras. Ordenamo-las pela nossa pontuação de neve, uma medida de 0 a 100 que combina altitudes de base e cume, histórico de neve e exposição. Espere estâncias que abrem cedo, fecham tarde e resistem aos invernos fracos quando as vizinhas mais baixas desistem.",
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
    },
    intro: {
      en: 'Wide, gentle slopes, traffic-free villages and dedicated kids\' areas: the resorts that get parents and children right.',
      fr: "Pentes larges et douces, villages sans circulation et espaces enfants dédiés : les stations qui font le bonheur des parents comme des enfants.",
      es: "Laderas amplias y suaves, pueblos sin tráfico y zonas infantiles dedicadas: las estaciones que aciertan con padres e hijos.",
      pt: "Encostas amplas e suaves, aldeias sem trânsito e zonas infantis dedicadas: as estâncias que acertam com pais e filhos.",
    },
    description: {
      en: 'A great family resort needs more than a good kids\' club: it wants gentle gradients, easy lift-served beginner zones, a safe village to walk around in and plenty of indoor backup for snowy days. These resorts tick all the boxes, from car-free Wengen and the underground-train Serfaus-Fiss-Ladis to slope-side Avoriaz. They are still proper mountains, but they are kid-friendly first.',
      fr: "Une grande station familiale ne se limite pas à un bon club enfants : il faut des pentes douces, des espaces débutants desservis par remontées, un village sûr où se promener et des activités intérieures pour les jours de neige. Ces stations cochent toutes les cases, de la sans-voitures Wengen au métro souterrain de Serfaus-Fiss-Ladis en passant par Avoriaz au pied des pistes. De vraies montagnes, mais d'abord pensées pour les enfants.",
      es: "Una gran estación familiar es más que un buen club infantil: hacen falta pendientes suaves, zonas de debutantes con remontes, un pueblo seguro para pasear y planes bajo techo para días de nieve. Estas estaciones marcan todas las casillas, de la sin coches Wengen al metro subterráneo de Serfaus-Fiss-Ladis o la Avoriaz a pie de pista. Auténticas montañas, pero pensadas primero para los niños.",
      pt: "Uma grande estância familiar é mais do que um bom clube infantil: precisa de pendentes suaves, zonas de iniciação com teleféricos, uma aldeia segura para passear e atividades de interior para dias de neve. Estas estâncias têm tudo, da sem-carros Wengen ao metro subterrâneo de Serfaus-Fiss-Ladis ou à Avoriaz no sopé das pistas. Verdadeiras montanhas, mas pensadas primeiro para as crianças.",
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
    },
    intro: {
      en: 'The most polished, high-end addresses in the Alps and Pyrenees, where Michelin stars and ski-in concierge come standard.',
      fr: "Les adresses les plus chic des Alpes et des Pyrénées, où étoiles Michelin et conciergerie ski aux pieds vont de soi.",
      es: "Las direcciones más chic de los Alpes y los Pirineos, donde estrellas Michelin y conserjería ski-in son lo normal.",
      pt: "As moradas mais chiques dos Alpes e dos Pirenéus, onde estrelas Michelin e conciergerie ski-in são o normal.",
    },
    description: {
      en: 'Cosy, intimate or just outright glamorous, these are the resorts where the local high street looks more like Bond Street and the chalet bath is the size of your bedroom. From Courchevel and Megève in France to Gstaad, Zermatt and St. Moritz in Switzerland and Cortina in Italy, the lifestyle and the grooming are equally curated.',
      fr: "Cosy, intimes ou résolument glamour, ce sont les stations où la rue principale ressemble à Bond Street et où la baignoire du chalet fait la taille de votre chambre. De Courchevel et Megève en France à Gstaad, Zermatt et St. Moritz en Suisse, en passant par Cortina en Italie, le style de vie et le damage sont aussi soignés.",
      es: "Acogedoras, íntimas o francamente glamurosas, son las estaciones donde la calle principal parece Bond Street y la bañera del chalet tiene el tamaño de tu habitación. De Courchevel y Megève en Francia a Gstaad, Zermatt y St. Moritz en Suiza, pasando por Cortina en Italia, el estilo de vida y el pisado están igualmente cuidados.",
      pt: "Acolhedoras, íntimas ou abertamente glamorosas, são as estâncias onde a rua principal parece a Bond Street e a banheira do chalé tem o tamanho do seu quarto. De Courchevel e Megève em França a Gstaad, Zermatt e St. Moritz na Suíça, passando por Cortina em Itália, o estilo de vida e o pisado são igualmente cuidados.",
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
    },
    intro: {
      en: 'Resorts with year-round or autumn-opening glacier skiing, where the snow keeps coming when the rest of the Alps run out.',
      fr: "Stations avec un glacier ouvert toute l'année ou dès l'automne, où la neige continue quand le reste des Alpes en manque.",
      es: "Estaciones con glaciar abierto todo el año o desde el otoño, donde la nieve sigue cuando el resto de los Alpes se queda sin ella.",
      pt: "Estâncias com glaciar aberto todo o ano ou desde o outono, onde a neve continua quando o resto dos Alpes fica sem ela.",
    },
    description: {
      en: 'When a glacier is part of the ski area, the season runs longer, the snow is more reliable and you can usually find a few runs whatever the weather. From the famously 365-days-a-year Hintertux to Tignes, Saas-Fee, Les Deux Alpes, Kitzsteinhorn and the Stubai, these are the resorts where high-altitude ice does the heavy lifting.',
      fr: "Quand un glacier fait partie du domaine, la saison s'allonge, la neige est plus fiable et l'on trouve presque toujours quelques pistes, quel que soit le temps. Du célèbre Hintertux ouvert 365 jours par an à Tignes, Saas-Fee, Les Deux Alpes, Kitzsteinhorn et au Stubai, ce sont les stations où la glace d'altitude fait tout le travail.",
      es: "Cuando un glaciar forma parte del dominio, la temporada se alarga, la nieve es más fiable y casi siempre se encuentran algunas pistas, haga el tiempo que haga. Del famoso Hintertux abierto los 365 días del año a Tignes, Saas-Fee, Les Deux Alpes, Kitzsteinhorn y el Stubai, son las estaciones donde el hielo de altura hace todo el trabajo.",
      pt: "Quando um glaciar faz parte do domínio, a época alonga-se, a neve é mais fiável e quase sempre se encontram algumas pistas, faça o tempo que fizer. Do famoso Hintertux aberto 365 dias por ano a Tignes, Saas-Fee, Les Deux Alpes, Kitzsteinhorn e ao Stubai, são as estâncias onde o gelo de altitude faz todo o trabalho.",
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
    },
    intro: {
      en: 'The biggest connected ski domains in Europe by lift-served piste kilometres, for skiers who want somewhere different every day.',
      fr: "Les plus grands domaines reliés d'Europe en kilomètres de pistes, pour les skieurs qui veulent un endroit différent chaque jour.",
      es: "Los mayores dominios enlazados de Europa por kilómetros de pista, para esquiadores que quieren un sitio distinto cada día.",
      pt: "Os maiores domínios ligados da Europa por quilómetros de pista, para esquiadores que querem um sítio diferente todos os dias.",
    },
    description: {
      en: 'These resorts are huge: each links into 200 km or more of piste on one lift pass, from the giant Trois Vallées and Paradiski to the cross-border Portes du Soleil and the Italian Dolomiti Superski. A week here barely scratches the surface, and seven days in you can still ski a piste you have not tried yet.',
      fr: "Ces stations sont gigantesques : chacune se relie à 200 km ou plus de pistes sur un seul forfait, des Trois Vallées et de Paradiski au transfrontalier Portes du Soleil et au Dolomiti Superski italien. Une semaine y suffit à peine, et au septième jour il reste encore des pistes que l'on n'a pas faites.",
      es: "Estas estaciones son enormes: cada una se conecta con 200 km o más de pistas con un solo forfait, de las Trois Vallées y Paradiski al transfronterizo Portes du Soleil y al Dolomiti Superski italiano. Una semana apenas rasca la superficie, y al séptimo día todavía quedan pistas sin probar.",
      pt: "Estas estâncias são enormes: cada uma liga-se a 200 km ou mais de pistas num só passe, das Trois Vallées e Paradiski ao transfronteiriço Portes du Soleil e ao Dolomiti Superski italiano. Uma semana mal arranha a superfície, e ao sétimo dia ainda há pistas por experimentar.",
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
    },
    intro: {
      en: 'Big mountains, low prices: where lift passes, hotels and lunches all run cheaper than the headline names.',
      fr: "Grandes montagnes, petits prix : où forfaits, hôtels et déjeuners restent moins chers que dans les grands noms.",
      es: "Grandes montañas, precios bajos: donde forfaits, hoteles y comidas siguen siendo más baratos que en los grandes nombres.",
      pt: "Grandes montanhas, preços baixos: onde passes, hotéis e almoços continuam mais baratos do que nos grandes nomes.",
    },
    description: {
      en: 'Skiing in the Alps does not have to mean Courchevel prices. These resorts, from Italy\'s Bormio and Sauze d\'Oulx to the Spanish Pyrenees and the southern French Alps, deliver real mountain skiing at notably gentler prices. Same snow, half the bill.',
      fr: "Skier dans les Alpes ne veut pas dire payer Courchevel. Ces stations, de Bormio et Sauze d'Oulx en Italie aux Pyrénées espagnoles et aux Alpes du Sud françaises, offrent du vrai ski de montagne à des tarifs nettement plus doux. Même neige, moitié de la note.",
      es: "Esquiar en los Alpes no es pagar Courchevel. Estas estaciones, de Bormio y Sauze d'Oulx en Italia a los Pirineos españoles y los Alpes del Sur franceses, brindan esquí de montaña de verdad a precios notablemente más suaves. Misma nieve, la mitad de la cuenta.",
      pt: "Esquiar nos Alpes não é pagar Courchevel. Estas estâncias, de Bormio e Sauze d'Oulx em Itália aos Pirenéus espanhóis e aos Alpes do Sul franceses, dão esqui de montanha a sério a preços notavelmente mais suaves. Mesma neve, metade da conta.",
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
    },
    intro: {
      en: 'Where the off-piste is the point: lift-served descents, big terrain and the snow culture to back it up.',
      fr: "Là où le hors-piste fait tout : descentes accessibles en remontées, grand terrain et culture neige qui va avec.",
      es: "Donde el fuera de pista es lo que cuenta: bajadas con remontes, gran terreno y cultura de la nieve que lo respalda.",
      pt: "Onde o fora-de-pista é o que conta: descidas com teleféricos, grande terreno e cultura da neve a apoiar.",
    },
    description: {
      en: 'Freeride means leaving the groomed runs behind, and these resorts are built for it: north-facing slopes, long off-piste descents, easy heli access and a serious safety culture. From Engelberg and Alagna in legend to Sainte-Foy, Ordino-Arcalís and Fieberbrunn, this is where powder hounds book their weeks first.',
      fr: "Le freeride, c'est quitter les pistes damées, et ces stations sont conçues pour : pentes orientées nord, longues descentes hors-piste, accès facile à l'héliski et vraie culture de la sécurité. D'Engelberg et Alagna, légendes du genre, à Sainte-Foy, Ordino-Arcalís et Fieberbrunn, c'est là que les chasseurs de poudreuse réservent leurs semaines en premier.",
      es: "El freeride es dejar las pistas pisadas atrás, y estas estaciones están hechas para ello: laderas orientadas al norte, largos descensos fuera de pista, fácil acceso al helicóptero y cultura seria de seguridad. De Engelberg y Alagna, leyendas del género, a Sainte-Foy, Ordino-Arcalís y Fieberbrunn, aquí es donde los cazadores de polvo reservan sus semanas primero.",
      pt: "O freeride é deixar para trás as pistas pisadas, e estas estâncias foram feitas para isso: encostas viradas a norte, longas descidas fora-de-pista, acesso fácil ao helicóptero e cultura séria de segurança. De Engelberg e Alagna, lendas do género, a Sainte-Foy, Ordino-Arcalís e Fieberbrunn, é aqui que os caçadores de neve pó reservam as suas semanas primeiro.",
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
    },
    intro: {
      en: 'Resorts with the biggest beginner areas and the gentlest slopes, so first-time skiers can find their feet without fear.',
      fr: "Stations aux plus grands espaces débutants et aux pentes les plus douces, pour apprendre à skier sans appréhension.",
      es: "Estaciones con las mayores zonas de debutantes y las pendientes más suaves, para aprender a esquiar sin miedo.",
      pt: "Estâncias com as maiores zonas de iniciação e as pendentes mais suaves, para aprender a esquiar sem medo.",
    },
    description: {
      en: 'Learning to ski is a different sport from cruising blue runs, and the right resort matters: dedicated nursery slopes, magic carpets, a friendly ski school and easy access to long gentle pistes. These resorts have all of that, and our pick favours French, Spanish and Andorran domains where the marked green run system gives beginners safe terrain they can read.',
      fr: "Apprendre à skier est un autre sport que dévaler des bleues, et le choix de la station compte : espaces débutants dédiés, tapis magiques, école de ski accueillante et accès facile à de longues pistes douces. Ces stations cochent tout, et notre sélection privilégie les domaines français, espagnols et andorrans, où les vertes balisées donnent aux débutants un terrain sûr et lisible.",
      es: "Aprender a esquiar es otro deporte que bajar azules, y la estación elegida importa: zonas de debutantes dedicadas, alfombras mágicas, una escuela de esquí cercana y acceso fácil a largas pistas suaves. Estas estaciones cumplen todo, y nuestra selección prioriza dominios franceses, españoles y andorranos, donde las verdes balizadas dan a los debutantes un terreno seguro y legible.",
      pt: "Aprender a esquiar é um desporto diferente de descer azuis, e a estância escolhida conta: zonas de iniciação dedicadas, tapetes mágicos, uma escola de esqui acolhedora e acesso fácil a longas pistas suaves. Estas estâncias têm tudo, e a nossa seleção privilegia domínios franceses, espanhóis e andorranos, onde as verdes balizadas dão aos principiantes um terreno seguro e fácil de ler.",
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
    },
    intro: {
      en: 'Where the village itself sits high: the resorts with the loftiest base altitudes in the Alps and Pyrenees.',
      fr: "Là où le village lui-même est haut : les stations à la plus haute altitude de base des Alpes et des Pyrénées.",
      es: "Donde el propio pueblo está alto: las estaciones con la mayor altitud de base de los Alpes y los Pirineos.",
      pt: "Onde a própria aldeia está alta: as estâncias com a maior altitude de base dos Alpes e dos Pirenéus.",
    },
    description: {
      en: 'High village altitude is the simplest snow-insurance you can buy. These are the resorts where the bed is already at 1800 m or above, so the snow on the doorstep almost always works even in lean winters, from Val Thorens at 2300 m to Tignes, Val d\'Isère, Avoriaz and Kühtai.',
      fr: "Une altitude de village élevée est l'assurance neige la plus simple à acheter. Ce sont les stations où le lit est déjà à 1800 m ou plus, alors la neige au pas de la porte fonctionne presque toujours, même lors des hivers maigres, de Val Thorens à 2300 m à Tignes, Val d'Isère, Avoriaz et Kühtai.",
      es: "Una altitud de pueblo elevada es el seguro de nieve más simple que se puede comprar. Son las estaciones donde la cama ya está a 1800 m o más, así que la nieve a la puerta funciona casi siempre, incluso en inviernos flojos, de Val Thorens a 2300 m a Tignes, Val d'Isère, Avoriaz y Kühtai.",
      pt: "Uma altitude de aldeia elevada é o seguro de neve mais simples que se pode comprar. São as estâncias onde a cama já está a 1800 m ou mais, por isso a neve à porta funciona quase sempre, mesmo em invernos fracos, de Val Thorens a 2300 m a Tignes, Val d'Isère, Avoriaz e Kühtai.",
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
    },
    intro: {
      en: 'Resorts where the village itself bans cars, with horse-drawn sleighs and electric taxis instead.',
      fr: "Stations où le village interdit la voiture, avec traîneaux à cheval et taxis électriques à la place.",
      es: "Estaciones donde el propio pueblo prohíbe los coches, con trineos tirados por caballos y taxis eléctricos en su lugar.",
      pt: "Estâncias onde a própria aldeia proíbe carros, com trenós puxados por cavalos e táxis elétricos no seu lugar.",
    },
    description: {
      en: 'A car-free village is one of the great quiet luxuries of skiing, with the only sounds the clip-clop of horses and skis on the snow. From Zermatt, Wengen and Mürren in Switzerland to Avoriaz and Vaujany in France, these are the resorts where you leave the car at the valley and let the railway, gondola or sleigh take you up.',
      fr: "Un village sans voitures est l'un des grands luxes calmes du ski : seul résonne le pas des chevaux et le glissement des skis sur la neige. De Zermatt, Wengen et Mürren en Suisse à Avoriaz et Vaujany en France, ce sont les stations où l'on laisse la voiture dans la vallée et où le train, la télécabine ou le traîneau s'occupent du reste.",
      es: "Un pueblo sin coches es uno de los grandes lujos tranquilos del esquí: solo suenan los cascos de los caballos y los esquís sobre la nieve. De Zermatt, Wengen y Mürren en Suiza a Avoriaz y Vaujany en Francia, son las estaciones donde dejas el coche en el valle y el tren, la telecabina o el trineo se encargan del resto.",
      pt: "Uma aldeia sem carros é um dos grandes luxos tranquilos do esqui: só se ouvem os cascos dos cavalos e os esquis sobre a neve. De Zermatt, Wengen e Mürren na Suíça a Avoriaz e Vaujany em França, são as estâncias onde se deixa o carro no vale e o comboio, o telecabine ou o trenó se encarregam do resto.",
    },
    filter: (d) => d.vibes.includes('car-free'),
    sort: (d) => d.snowScore,
  },
]

export function getBestForList(slug: string): BestForList | undefined {
  return BEST_FOR_LISTS.find((l) => l.slug === slug)
}
