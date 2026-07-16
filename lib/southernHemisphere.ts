import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Content for the evergreen Southern Hemisphere hub (/[locale]/southern-hemisphere).
 *
 * The page targets the seasonal intent that peaks every Northern-Hemisphere summer:
 * "where to ski in July / August / September", "summer skiing", "southern hemisphere
 * ski resorts". It groups our 26 SH resorts into regional sections, each with an
 * editorial blurb, resort cards and a prominent Stay22 hotel map.
 *
 * Copy rules: 5-locale (en/fr/es/pt/it), zero em/en dashes, straight apostrophes,
 * PT-PT post-Acordo. Every localized value uses double-quote delimiters so that a
 * straight apostrophe inside the copy can never terminate the string.
 */

const LOCALES: Locale[] = ['en', 'fr', 'es', 'pt', 'it']

export interface ShSection {
  /** stable key used in anchors */
  key: string
  /** country codes (from Destination.countryCode) that belong to this section */
  countryCodes: string[]
  flag: string
  /** slug of the resort the Stay22 map centers on (the lodging hub) */
  mapSlug: string
  /** map zoom: regional overview so several resorts' hotels show */
  mapZoom: number
  name: Record<Locale, string>
  blurb: Record<Locale, string>
}

export const SH_SECTIONS: ShSection[] = [
  {
    key: 'chile',
    countryCodes: ['CL'],
    flag: '🇨🇱',
    mapSlug: 'valle-nevado',
    mapZoom: 10,
    name: { en: "Chile", fr: "Chili", es: "Chile", pt: "Chile", it: "Cile" },
    blurb: {
      en: "Chile's resorts sit high in the central Andes, an hour or two above Santiago. Valle Nevado, El Colorado and La Parva share the vast Tres Valles off Farellones, while Portillo's single iconic yellow hotel above the frozen Laguna del Inca is a bucket-list classic. The season runs mid-June to early October and peaks in July and August.",
      fr: "Les stations chiliennes culminent haut dans les Andes centrales, à une ou deux heures au-dessus de Santiago. Valle Nevado, El Colorado et La Parva se partagent l'immense Tres Valles depuis Farellones, tandis que l'unique hôtel jaune de Portillo, au-dessus de la Laguna del Inca gelée, reste un classique à cocher une fois dans sa vie. La saison va de mi-juin à début octobre et culmine en juillet et août.",
      es: "Las estaciones chilenas se alzan en lo alto de los Andes centrales, a una o dos horas por encima de Santiago. Valle Nevado, El Colorado y La Parva comparten los vastos Tres Valles desde Farellones, mientras que el icónico hotel amarillo de Portillo, sobre la helada Laguna del Inca, es un clásico de lista de deseos. La temporada va de mediados de junio a principios de octubre y su punto álgido es julio y agosto.",
      pt: "As estâncias chilenas erguem-se no alto dos Andes centrais, a uma ou duas horas acima de Santiago. Valle Nevado, El Colorado e La Parva partilham os vastos Tres Valles a partir de Farellones, enquanto o icónico hotel amarelo de Portillo, sobre a gelada Laguna del Inca, é um clássico da lista de sonhos. A época decorre de meados de junho a início de outubro e atinge o auge em julho e agosto.",
      it: "Le località cilene si innalzano in quota sulle Ande centrali, a un'ora o due sopra Santiago. Valle Nevado, El Colorado e La Parva si dividono le vaste Tres Valles sopra Farellones, mentre l'iconico hotel giallo di Portillo, sopra la gelata Laguna del Inca, resta un classico da spuntare una volta nella vita. La stagione va da metà giugno a inizio ottobre e culmina a luglio e agosto.",
    },
  },
  {
    key: 'argentina',
    countryCodes: ['AR'],
    flag: '🇦🇷',
    mapSlug: 'cerro-catedral',
    mapZoom: 10,
    name: { en: "Argentina", fr: "Argentine", es: "Argentina", pt: "Argentina", it: "Argentina" },
    blurb: {
      en: "Argentina strings its resorts down the Andes from Mendoza to deep Patagonia. Cerro Catedral above Bariloche is the largest ski area in South America, Las Leñas is the continent's reference for steep, high-altitude off-piste, and Cerro Castor near Ushuaia is the southernmost resort on earth, with the longest season of all. Expect winter from mid-June into October.",
      fr: "L'Argentine égrène ses stations le long des Andes, de Mendoza jusqu'au fond de la Patagonie. Cerro Catedral, au-dessus de Bariloche, est le plus grand domaine d'Amérique du Sud, Las Leñas est la référence du continent pour le hors-piste raide et d'altitude, et Cerro Castor, près d'Ushuaia, est la station la plus australe de la planète, avec la plus longue saison qui soit. L'hiver s'installe de mi-juin à octobre.",
      es: "Argentina reparte sus estaciones a lo largo de los Andes, de Mendoza hasta la Patagonia profunda. Cerro Catedral, sobre Bariloche, es el mayor dominio esquiable de Sudamérica, Las Leñas es la referencia del continente para el fuera de pista empinado y de altura, y Cerro Castor, junto a Ushuaia, es la estación más austral del planeta, con la temporada más larga de todas. El invierno va de mediados de junio a octubre.",
      pt: "A Argentina distribui as suas estâncias ao longo dos Andes, de Mendoza até à Patagónia profunda. O Cerro Catedral, sobre Bariloche, é o maior domínio esquiável da América do Sul, Las Leñas é a referência do continente para o fora de pista íngreme e de altitude, e o Cerro Castor, junto a Ushuaia, é a estância mais austral do planeta, com a época mais longa de todas. O inverno decorre de meados de junho a outubro.",
      it: "L'Argentina distribuisce le sue località lungo le Ande, da Mendoza fino alla Patagonia più profonda. Il Cerro Catedral, sopra Bariloche, è il comprensorio più grande del Sud America, Las Leñas è il riferimento del continente per il fuoripista ripido e d'alta quota, e il Cerro Castor, vicino a Ushuaia, è la località più a sud del pianeta, con la stagione più lunga in assoluto. L'inverno va da metà giugno a ottobre.",
    },
  },
  {
    key: 'new-zealand',
    countryCodes: ['NZ'],
    flag: '🇳🇿',
    mapSlug: 'queenstown',
    mapZoom: 10,
    name: { en: "New Zealand", fr: "Nouvelle-Zélande", es: "Nueva Zelanda", pt: "Nova Zelândia", it: "Nuova Zelanda" },
    blurb: {
      en: "New Zealand's South Island has the most dramatic skiing south of the equator: glacial valleys, lake-edge views and genuine alpine character. Cardrona and Treble Cone rise above Wanaka, while Coronet Peak and The Remarkables sit a short drive from Queenstown, the adventure capital that doubles as the region's base. Mt Hutt on the Canterbury plains catches the most snow. Season runs mid-June to early October.",
      fr: "L'île du Sud de la Nouvelle-Zélande offre le ski le plus spectaculaire de l'hémisphère sud : vallées glaciaires, vues sur les lacs et vrai caractère alpin. Cardrona et Treble Cone dominent Wanaka, tandis que Coronet Peak et The Remarkables sont à quelques minutes de Queenstown, la capitale de l'aventure qui sert aussi de camp de base. Mt Hutt, sur les plaines de Canterbury, reçoit le plus de neige. La saison va de mi-juin à début octobre.",
      es: "La Isla Sur de Nueva Zelanda ofrece el esquí más espectacular al sur del ecuador: valles glaciares, vistas a los lagos y auténtico carácter alpino. Cardrona y Treble Cone se alzan sobre Wanaka, mientras que Coronet Peak y The Remarkables quedan a pocos minutos de Queenstown, la capital de la aventura que hace de campo base. Mt Hutt, en las llanuras de Canterbury, recibe la mayor cantidad de nieve. La temporada va de mediados de junio a principios de octubre.",
      pt: "A Ilha Sul da Nova Zelândia oferece o esqui mais espetacular a sul do equador: vales glaciares, vistas sobre os lagos e verdadeiro carácter alpino. Cardrona e Treble Cone erguem-se sobre Wanaka, enquanto Coronet Peak e The Remarkables ficam a poucos minutos de Queenstown, a capital da aventura que serve também de base. O Mt Hutt, nas planícies de Canterbury, recebe a maior quantidade de neve. A época decorre de meados de junho a início de outubro.",
      it: "L'Isola del Sud della Nuova Zelanda offre lo sci più spettacolare a sud dell'equatore: valli glaciali, vedute sui laghi e autentico carattere alpino. Cardrona e Treble Cone dominano Wanaka, mentre Coronet Peak e The Remarkables sono a pochi minuti da Queenstown, la capitale dell'avventura che fa anche da campo base. Il Mt Hutt, sulle pianure di Canterbury, riceve la maggior quantità di neve. La stagione va da metà giugno a inizio ottobre.",
    },
  },
  {
    key: 'australia',
    countryCodes: ['AU'],
    flag: '🇦🇺',
    mapSlug: 'thredbo',
    mapZoom: 10,
    name: { en: "Australia", fr: "Australie", es: "Australia", pt: "Austrália", it: "Australia" },
    blurb: {
      en: "Australia's snowfields run mid-June to September across New South Wales and Victoria. Perisher is the largest resort in the Southern Hemisphere, Thredbo has the country's longest vertical, and Falls Creek, Mt Buller and Mt Hotham deliver the best village feel. The snow-gum forests give it all a look you will find nowhere else, and access from Sydney or Melbourne is the easiest in the hemisphere.",
      fr: "Les champs de neige australiens fonctionnent de mi-juin à septembre, en Nouvelle-Galles du Sud et dans le Victoria. Perisher est la plus grande station de l'hémisphère sud, Thredbo offre le plus grand dénivelé du pays, et Falls Creek, Mt Buller et Mt Hotham signent les meilleures ambiances de village. Les forêts d'eucalyptus des neiges leur donnent une allure unique, et l'accès depuis Sydney ou Melbourne est le plus simple de l'hémisphère.",
      es: "Los campos de nieve australianos funcionan de mediados de junio a septiembre, en Nueva Gales del Sur y Victoria. Perisher es la mayor estación del hemisferio sur, Thredbo tiene el mayor desnivel del país, y Falls Creek, Mt Buller y Mt Hotham firman el mejor ambiente de pueblo. Los bosques de eucaliptos de las nieves les dan un aspecto único, y el acceso desde Sídney o Melbourne es el más sencillo del hemisferio.",
      pt: "Os campos de neve australianos funcionam de meados de junho a setembro, em Nova Gales do Sul e Vitória. Perisher é a maior estância do hemisfério sul, Thredbo tem o maior desnível do país, e Falls Creek, Mt Buller e Mt Hotham oferecem o melhor ambiente de aldeia. As florestas de eucaliptos das neves dão-lhes um aspeto único, e o acesso a partir de Sydney ou Melbourne é o mais fácil do hemisfério.",
      it: "I campi da neve australiani funzionano da metà giugno a settembre, nel Nuovo Galles del Sud e nel Victoria. Perisher è la località più grande dell'emisfero sud, Thredbo ha il dislivello più ampio del paese, e Falls Creek, Mt Buller e Mt Hotham offrono la migliore atmosfera di villaggio. Le foreste di eucalipto delle nevi regalano un aspetto che non si trova altrove, e l'accesso da Sydney o Melbourne è il più semplice dell'emisfero.",
    },
  },
  {
    key: 'africa',
    countryCodes: ['LS', 'ZA'],
    flag: '🇱🇸',
    mapSlug: 'afriski',
    mapZoom: 9,
    name: { en: "Southern Africa", fr: "Afrique australe", es: "África austral", pt: "África Austral", it: "Africa australe" },
    blurb: {
      en: "Africa's two ski spots are pure adventure. Afriski, high in Lesotho's Maluti Mountains above 3000 m, skis June to August on a single well-groomed run with a proper lodge, and Tiffindell in South Africa's Eastern Cape offers a handful of pistes against the African plateau. Small, unlikely, and a story you will tell for years.",
      fr: "Les deux spots de ski d'Afrique sont de pures aventures. Afriski, perché dans les monts Maluti du Lesotho au-dessus de 3000 m, se skie de juin à août sur une unique piste bien damée avec un vrai lodge, et Tiffindell, dans le Cap-Oriental sud-africain, aligne quelques pistes face au plateau africain. Petit, improbable, et une histoire que vous raconterez pendant des années.",
      es: "Los dos rincones de esquí de África son pura aventura. Afriski, en lo alto de los montes Maluti de Lesoto por encima de los 3000 m, se esquía de junio a agosto en una única pista bien pisada con un buen lodge, y Tiffindell, en el Cabo Oriental sudafricano, alinea un puñado de pistas frente a la meseta africana. Pequeño, improbable y una historia que contarás durante años.",
      pt: "Os dois recantos de esqui de África são pura aventura. O Afriski, no alto dos montes Maluti do Lesoto acima dos 3000 m, esquia-se de junho a agosto numa única pista bem pisada com um bom lodge, e o Tiffindell, no Cabo Oriental sul-africano, alinha um punhado de pistas diante do planalto africano. Pequeno, improvável e uma história que contará durante anos.",
      it: "I due angoli di sci dell'Africa sono pura avventura. Afriski, in cima ai monti Maluti del Lesotho oltre i 3000 m, si scia da giugno ad agosto su un'unica pista ben battuta con un vero lodge, e Tiffindell, nel Capo Orientale sudafricano, allinea una manciata di piste di fronte all'altopiano africano. Piccolo, improbabile e una storia che racconterai per anni.",
    },
  },
]

export const SH_COPY = {
  metaTitle: {
    en: "Where to Ski in July, August & September: Southern Hemisphere Guide",
    fr: "Où skier en juillet, août et septembre : le guide de l'hémisphère sud",
    es: "Dónde esquiar en julio, agosto y septiembre: guía del hemisferio sur",
    pt: "Onde esquiar em julho, agosto e setembro: guia do hemisfério sul",
    it: "Dove sciare a luglio, agosto e settembre: guida all'emisfero sud",
  } as Record<Locale, string>,
  heroTitle: {
    en: "Ski in July, August and September",
    fr: "Skier en juillet, août et septembre",
    es: "Esquiar en julio, agosto y septiembre",
    pt: "Esquiar em julho, agosto e setembro",
    it: "Sciare a luglio, agosto e settembre",
  } as Record<Locale, string>,
  heroKicker: {
    en: "Southern Hemisphere ski season",
    fr: "Saison de ski de l'hémisphère sud",
    es: "Temporada de esquí del hemisferio sur",
    pt: "Época de esqui do hemisfério sul",
    it: "Stagione sciistica dell'emisfero sud",
  } as Record<Locale, string>,
  heroIntro: {
    en: "When the Alps and the Rockies melt into summer, the snow flips south. From June to October, real winter runs across the Andes of Chile and Argentina, the Southern Alps of New Zealand and the mountains of Australia. Here is where to go, when to book and which ski-in/ski-out hotels put you on the snow.",
    fr: "Quand les Alpes et les Rocheuses fondent en plein été, la neige bascule au sud. De juin à octobre, l'hiver s'installe pour de vrai dans les Andes du Chili et d'Argentine, les Alpes du Sud néo-zélandaises et les montagnes d'Australie. Voici où partir, quand réserver et quels hôtels au pied des pistes vous posent sur la neige.",
    es: "Cuando los Alpes y las Rocosas se derriten en verano, la nieve se pasa al sur. De junio a octubre, el invierno de verdad recorre los Andes de Chile y Argentina, los Alpes del Sur de Nueva Zelanda y las montañas de Australia. Aquí tienes adónde ir, cuándo reservar y qué hoteles a pie de pista te dejan sobre la nieve.",
    pt: "Quando os Alpes e as Montanhas Rochosas derretem no verão, a neve passa para sul. De junho a outubro, o inverno a sério instala-se nos Andes do Chile e da Argentina, nos Alpes do Sul da Nova Zelândia e nas montanhas da Austrália. Eis para onde ir, quando reservar e que hotéis à beira das pistas o deixam na neve.",
    it: "Quando le Alpi e le Montagne Rocciose si sciolgono in piena estate, la neve si sposta a sud. Da giugno a ottobre l'inverno vero attraversa le Ande di Cile e Argentina, le Alpi del Sud della Nuova Zelanda e le montagne dell'Australia. Ecco dove andare, quando prenotare e quali hotel sulle piste ti mettono sulla neve.",
  } as Record<Locale, string>,
  geoTitle: {
    en: "The short answer",
    fr: "En bref",
    es: "En resumen",
    pt: "Em resumo",
    it: "In breve",
  } as Record<Locale, string>,
  geoBody: {
    en: "The Southern Hemisphere ski season runs from mid-June to early October and peaks in July and August. Chile and Argentina hold the highest, biggest terrain in the Andes; New Zealand has the most dramatic alpine scenery; Australia has the easiest access and the liveliest villages. July is school-holiday high season, so August often brings the best mix of deep snow and open space.",
    fr: "La saison de ski de l'hémisphère sud va de mi-juin à début octobre et culmine en juillet et août. Le Chili et l'Argentine possèdent les domaines les plus hauts et les plus vastes, dans les Andes ; la Nouvelle-Zélande offre les paysages alpins les plus spectaculaires ; l'Australie a l'accès le plus simple et les villages les plus animés. Juillet est la haute saison des vacances scolaires, si bien qu'août réunit souvent le meilleur compromis entre neige abondante et espace.",
    es: "La temporada de esquí del hemisferio sur va de mediados de junio a principios de octubre y su punto álgido es julio y agosto. Chile y Argentina tienen los dominios más altos y extensos, en los Andes; Nueva Zelanda ofrece los paisajes alpinos más espectaculares; Australia tiene el acceso más fácil y los pueblos más animados. Julio es temporada alta por las vacaciones escolares, así que agosto suele reunir la mejor combinación de nieve abundante y espacio.",
    pt: "A época de esqui do hemisfério sul vai de meados de junho a início de outubro e atinge o auge em julho e agosto. O Chile e a Argentina têm os domínios mais altos e extensos, nos Andes; a Nova Zelândia oferece as paisagens alpinas mais espetaculares; a Austrália tem o acesso mais fácil e as aldeias mais animadas. Julho é época alta por causa das férias escolares, pelo que agosto costuma reunir a melhor combinação de neve abundante e espaço.",
    it: "La stagione sciistica dell'emisfero sud va da metà giugno a inizio ottobre e culmina a luglio e agosto. Cile e Argentina hanno i comprensori più alti ed estesi, sulle Ande; la Nuova Zelanda offre i paesaggi alpini più spettacolari; l'Australia ha l'accesso più facile e i villaggi più vivaci. Luglio è alta stagione per le vacanze scolastiche, perciò agosto riunisce spesso il miglior compromesso tra neve abbondante e spazio.",
  } as Record<Locale, string>,
  monthsTitle: {
    en: "The season, month by month",
    fr: "La saison, mois par mois",
    es: "La temporada, mes a mes",
    pt: "A época, mês a mês",
    it: "La stagione, mese per mese",
  } as Record<Locale, string>,
  months: [
    {
      tag: { en: "June", fr: "Juin", es: "Junio", pt: "Junho", it: "Giugno" },
      body: {
        en: "Early season. Resorts open mid-month as the first storms build a base. Fewer crowds and lower prices, but check that the terrain you want is actually open.",
        fr: "Début de saison. Les stations ouvrent vers la mi-juin quand les premières tempêtes constituent le manteau. Moins de monde et des prix plus doux, mais vérifiez que le secteur voulu est bien ouvert.",
        es: "Inicio de temporada. Las estaciones abren a mediados de mes cuando las primeras tormentas forman la base. Menos gente y precios más bajos, pero comprueba que el sector que quieres esté abierto.",
        pt: "Início de época. As estâncias abrem a meio do mês quando as primeiras tempestades formam a base. Menos gente e preços mais baixos, mas confirme que o setor que quer está aberto.",
        it: "Inizio stagione. Le località aprono a metà mese quando le prime tempeste formano il fondo. Meno folla e prezzi più bassi, ma verifica che il settore che vuoi sia davvero aperto.",
      },
    },
    {
      tag: { en: "July to August", fr: "Juillet à août", es: "Julio a agosto", pt: "Julho a agosto", it: "Luglio e agosto" },
      body: {
        en: "Peak season and the most reliable snow. School holidays fill the villages in July, so August often blends full conditions with a little more room. Book hotels well ahead.",
        fr: "Cœur de saison et neige la plus fiable. Les vacances scolaires remplissent les villages en juillet, si bien qu'août mêle souvent conditions optimales et un peu plus de place. Réservez vos hôtels bien à l'avance.",
        es: "Plena temporada y la nieve más fiable. Las vacaciones escolares llenan los pueblos en julio, así que agosto suele combinar buenas condiciones con algo más de sitio. Reserva los hoteles con antelación.",
        pt: "Plena época e a neve mais fiável. As férias escolares enchem as aldeias em julho, pelo que agosto costuma juntar boas condições com um pouco mais de espaço. Reserve os hotéis com antecedência.",
        it: "Piena stagione e neve più affidabile. Le vacanze scolastiche riempiono i villaggi a luglio, perciò agosto unisce spesso condizioni ottimali e un po' più di spazio. Prenota gli hotel con largo anticipo.",
      },
    },
    {
      tag: { en: "September to October", fr: "Septembre à octobre", es: "Septiembre a octubre", pt: "Setembro a outubro", it: "Settembre e ottobre" },
      body: {
        en: "Spring skiing: long sunny days, softer snow and the best deals. Higher Andes resorts hold on longest, while Cerro Castor in Patagonia can run into October.",
        fr: "Ski de printemps : longues journées ensoleillées, neige plus souple et meilleures affaires. Les stations andines d'altitude tiennent le plus longtemps, et Cerro Castor, en Patagonie, peut tourner jusqu'en octobre.",
        es: "Esquí de primavera: días largos y soleados, nieve más blanda y las mejores ofertas. Las estaciones andinas de altura aguantan más, y Cerro Castor, en la Patagonia, puede llegar a octubre.",
        pt: "Esqui de primavera: dias longos e soalheiros, neve mais mole e as melhores ofertas. As estâncias andinas de altitude aguentam mais tempo, e o Cerro Castor, na Patagónia, pode ir até outubro.",
        it: "Sci primaverile: giornate lunghe e soleggiate, neve più morbida e le offerte migliori. Le località andine d'alta quota reggono più a lungo, e il Cerro Castor, in Patagonia, può arrivare fino a ottobre.",
      },
    },
  ] as { tag: Record<Locale, string>; body: Record<Locale, string> }[],
  sectionsTitle: {
    en: "Where to ski, region by region",
    fr: "Où skier, région par région",
    es: "Dónde esquiar, región por región",
    pt: "Onde esquiar, região a região",
    it: "Dove sciare, regione per regione",
  } as Record<Locale, string>,
  resortsLabel: {
    en: "Resorts",
    fr: "Stations",
    es: "Estaciones",
    pt: "Estâncias",
    it: "Località",
  } as Record<Locale, string>,
  mapLabel: {
    en: "Find a hotel near",
    fr: "Trouver un hôtel près de",
    es: "Encuentra un hotel cerca de",
    pt: "Encontre um hotel perto de",
    it: "Trova un hotel vicino a",
  } as Record<Locale, string>,
  bookCta: {
    en: "Compare hotels",
    fr: "Comparer les hôtels",
    es: "Comparar hoteles",
    pt: "Comparar hotéis",
    it: "Confronta gli hotel",
  } as Record<Locale, string>,
  faqTitle: {
    en: "Southern Hemisphere skiing: common questions",
    fr: "Ski dans l'hémisphère sud : questions fréquentes",
    es: "Esquí en el hemisferio sur: preguntas frecuentes",
    pt: "Esqui no hemisfério sul: perguntas frequentes",
    it: "Sci nell'emisfero sud: domande frequenti",
  } as Record<Locale, string>,
  faq: [
    {
      q: {
        en: "When is the Southern Hemisphere ski season?",
        fr: "Quand a lieu la saison de ski de l'hémisphère sud ?",
        es: "¿Cuándo es la temporada de esquí del hemisferio sur?",
        pt: "Quando é a época de esqui do hemisfério sul?",
        it: "Quando è la stagione sciistica dell'emisfero sud?",
      },
      a: {
        en: "Roughly mid-June to early October, peaking in July and August. Higher Andes resorts and Cerro Castor in Patagonia hold their season the longest, sometimes into October.",
        fr: "Grosso modo de mi-juin à début octobre, avec un pic en juillet et août. Les stations andines d'altitude et Cerro Castor, en Patagonie, prolongent le plus la saison, parfois jusqu'en octobre.",
        es: "Aproximadamente de mediados de junio a principios de octubre, con su punto álgido en julio y agosto. Las estaciones andinas de altura y Cerro Castor, en la Patagonia, alargan más la temporada, a veces hasta octubre.",
        pt: "Sensivelmente de meados de junho a início de outubro, com auge em julho e agosto. As estâncias andinas de altitude e o Cerro Castor, na Patagónia, prolongam mais a época, por vezes até outubro.",
        it: "All'incirca da metà giugno a inizio ottobre, con il picco a luglio e agosto. Le località andine d'alta quota e il Cerro Castor, in Patagonia, prolungano di più la stagione, a volte fino a ottobre.",
      },
    },
    {
      q: {
        en: "Where can you ski in July and August?",
        fr: "Où peut-on skier en juillet et août ?",
        es: "¿Dónde se puede esquiar en julio y agosto?",
        pt: "Onde se pode esquiar em julho e agosto?",
        it: "Dove si può sciare a luglio e agosto?",
      },
      a: {
        en: "Across the Southern Hemisphere: Chile and Argentina in the Andes, New Zealand and Australia, plus Afriski in Lesotho. These are the only places on earth in full winter while the Alps and Rockies are green.",
        fr: "Dans tout l'hémisphère sud : le Chili et l'Argentine dans les Andes, la Nouvelle-Zélande et l'Australie, plus Afriski au Lesotho. Ce sont les seuls endroits de la planète en plein hiver quand les Alpes et les Rocheuses sont vertes.",
        es: "Por todo el hemisferio sur: Chile y Argentina en los Andes, Nueva Zelanda y Australia, además de Afriski en Lesoto. Son los únicos lugares del planeta en pleno invierno mientras los Alpes y las Rocosas están verdes.",
        pt: "Por todo o hemisfério sul: Chile e Argentina nos Andes, Nova Zelândia e Austrália, além do Afriski no Lesoto. São os únicos lugares do planeta em pleno inverno enquanto os Alpes e as Montanhas Rochosas estão verdes.",
        it: "In tutto l'emisfero sud: Cile e Argentina sulle Ande, Nuova Zelanda e Australia, oltre ad Afriski in Lesotho. Sono gli unici luoghi del pianeta in pieno inverno mentre le Alpi e le Montagne Rocciose sono verdi.",
      },
    },
    {
      q: {
        en: "Which resort has the biggest terrain and best snow?",
        fr: "Quelle station a le plus grand domaine et la meilleure neige ?",
        es: "¿Qué estación tiene el mayor dominio y la mejor nieve?",
        pt: "Que estância tem o maior domínio e a melhor neve?",
        it: "Quale località ha il comprensorio più grande e la neve migliore?",
      },
      a: {
        en: "Cerro Catedral in Argentina is the largest ski area in South America. For the biggest snow numbers, the high central Andes of Chile (Valle Nevado and Portillo) and Mt Hutt in New Zealand lead the field. Las Leñas is the pick for serious steep terrain.",
        fr: "Cerro Catedral, en Argentine, est le plus grand domaine d'Amérique du Sud. Pour les plus gros cumuls de neige, les hautes Andes centrales du Chili (Valle Nevado et Portillo) et Mt Hutt en Nouvelle-Zélande mènent la danse. Las Leñas s'impose pour le raide engagé.",
        es: "Cerro Catedral, en Argentina, es el mayor dominio esquiable de Sudamérica. Para las mayores cifras de nieve, los altos Andes centrales de Chile (Valle Nevado y Portillo) y Mt Hutt en Nueva Zelanda encabezan la lista. Las Leñas es la elección para el fuera de pista empinado y exigente.",
        pt: "O Cerro Catedral, na Argentina, é o maior domínio esquiável da América do Sul. Para os maiores valores de neve, os altos Andes centrais do Chile (Valle Nevado e Portillo) e o Mt Hutt na Nova Zelândia lideram. Las Leñas é a escolha para o íngreme exigente.",
        it: "Il Cerro Catedral, in Argentina, è il comprensorio più grande del Sud America. Per i maggiori accumuli di neve, le alte Ande centrali del Cile (Valle Nevado e Portillo) e il Mt Hutt in Nuova Zelanda sono in testa. Las Leñas è la scelta per il ripido impegnativo.",
      },
    },
    {
      q: {
        en: "Is Southern Hemisphere skiing as good as the Alps?",
        fr: "Le ski dans l'hémisphère sud vaut-il celui des Alpes ?",
        es: "¿El esquí en el hemisferio sur es tan bueno como el de los Alpes?",
        pt: "O esqui no hemisfério sul é tão bom como o dos Alpes?",
        it: "Lo sci nell'emisfero sud è all'altezza delle Alpi?",
      },
      a: {
        en: "The terrain is smaller than the Alps or the Rockies, so set expectations right. What you get instead is real winter snow in your home summer, jaw-dropping scenery, and a season-extending trip you can combine with wider travel. For committed skiers it is absolutely worth it.",
        fr: "Les domaines sont plus petits que dans les Alpes ou les Rocheuses, il faut le savoir. En échange, vous skiez sur de la vraie neige d'hiver pendant votre été, dans des paysages saisissants, avec un voyage qui prolonge la saison et se combine à une découverte plus large. Pour un skieur passionné, cela en vaut vraiment la peine.",
        es: "Los dominios son más pequeños que en los Alpes o las Rocosas, conviene saberlo. A cambio, esquías sobre nieve de invierno de verdad durante tu verano, en paisajes impresionantes, con un viaje que alarga la temporada y se combina con una ruta más amplia. Para un esquiador apasionado, merece la pena de sobra.",
        pt: "Os domínios são mais pequenos do que nos Alpes ou nas Montanhas Rochosas, convém sabê-lo. Em troca, esquia sobre neve de inverno a sério durante o seu verão, em paisagens impressionantes, com uma viagem que prolonga a época e se combina com um roteiro mais amplo. Para um esquiador apaixonado, vale mesmo a pena.",
        it: "I comprensori sono più piccoli rispetto alle Alpi o alle Montagne Rocciose, è bene saperlo. In cambio scii su vera neve invernale durante la tua estate, in paesaggi mozzafiato, con un viaggio che prolunga la stagione e si abbina a un itinerario più ampio. Per uno sciatore appassionato ne vale assolutamente la pena.",
      },
    },
    {
      q: {
        en: "Where should families and first-timers go?",
        fr: "Où aller en famille ou pour une première fois ?",
        es: "¿Adónde ir en familia o siendo principiante?",
        pt: "Para onde ir em família ou sendo principiante?",
        it: "Dove andare in famiglia o alle prime armi?",
      },
      a: {
        en: "Australia has the gentlest access and biggest learner areas (Perisher, Falls Creek, Mt Buller). In New Zealand, Coronet Peak and Cardrona are the friendliest for learning, with Queenstown right there for everything off the snow. In the Andes, El Colorado and Cerro Catedral have the widest beginner terrain.",
        fr: "L'Australie offre l'accès le plus doux et les plus grands espaces débutants (Perisher, Falls Creek, Mt Buller). En Nouvelle-Zélande, Coronet Peak et Cardrona sont les plus accueillantes pour apprendre, avec Queenstown juste à côté pour tout le reste. Dans les Andes, El Colorado et Cerro Catedral ont les plus vastes zones débutants.",
        es: "Australia ofrece el acceso más sencillo y las mayores zonas de aprendizaje (Perisher, Falls Creek, Mt Buller). En Nueva Zelanda, Coronet Peak y Cardrona son las más acogedoras para aprender, con Queenstown al lado para todo lo demás. En los Andes, El Colorado y Cerro Catedral tienen las zonas de principiantes más amplias.",
        pt: "A Austrália oferece o acesso mais fácil e as maiores zonas de aprendizagem (Perisher, Falls Creek, Mt Buller). Na Nova Zelândia, Coronet Peak e Cardrona são as mais acolhedoras para aprender, com Queenstown ao lado para tudo o resto. Nos Andes, El Colorado e Cerro Catedral têm as zonas de principiantes mais amplas.",
        it: "L'Australia offre l'accesso più semplice e le aree per principianti più ampie (Perisher, Falls Creek, Mt Buller). In Nuova Zelanda, Coronet Peak e Cardrona sono le più accoglienti per imparare, con Queenstown a fianco per tutto il resto. Sulle Ande, El Colorado e Cerro Catedral hanno i campi scuola più estesi.",
      },
    },
    {
      q: {
        en: "How far are the resorts from a major city or airport?",
        fr: "À quelle distance des grandes villes ou aéroports se trouvent les stations ?",
        es: "¿A qué distancia están las estaciones de una gran ciudad o aeropuerto?",
        pt: "A que distância estão as estâncias de uma grande cidade ou aeroporto?",
        it: "Quanto distano le località da una grande città o aeroporto?",
      },
      a: {
        en: "Chile: one to two hours from Santiago. Argentina: Bariloche and Mendoza have their own airports, with resorts 20 to 70 minutes on. New Zealand: Queenstown airport sits under an hour from four resorts. Australia: three to six hours from Sydney or Melbourne, so most people make a weekend or longer of it.",
        fr: "Chili : une à deux heures de Santiago. Argentine : Bariloche et Mendoza ont leurs aéroports, les stations sont à 20 à 70 minutes. Nouvelle-Zélande : l'aéroport de Queenstown est à moins d'une heure de quatre stations. Australie : trois à six heures de Sydney ou Melbourne, la plupart des gens y passent donc au moins un week-end.",
        es: "Chile: de una a dos horas desde Santiago. Argentina: Bariloche y Mendoza tienen aeropuerto, con las estaciones a 20 o 70 minutos. Nueva Zelanda: el aeropuerto de Queenstown está a menos de una hora de cuatro estaciones. Australia: de tres a seis horas desde Sídney o Melbourne, así que la mayoría se queda al menos un fin de semana.",
        pt: "Chile: uma a duas horas desde Santiago. Argentina: Bariloche e Mendoza têm aeroporto, com as estâncias a 20 ou 70 minutos. Nova Zelândia: o aeroporto de Queenstown fica a menos de uma hora de quatro estâncias. Austrália: três a seis horas desde Sydney ou Melbourne, pelo que a maioria fica pelo menos um fim de semana.",
        it: "Cile: una o due ore da Santiago. Argentina: Bariloche e Mendoza hanno un aeroporto, con le località a 20 o 70 minuti. Nuova Zelanda: l'aeroporto di Queenstown è a meno di un'ora da quattro località. Australia: da tre a sei ore da Sydney o Melbourne, quindi la maggior parte si ferma almeno un fine settimana.",
      },
    },
  ] as { q: Record<Locale, string>; a: Record<Locale, string> }[],
  relatedTitle: {
    en: "Keep planning",
    fr: "Continuer à préparer",
    es: "Sigue planificando",
    pt: "Continue a planear",
    it: "Continua a pianificare",
  } as Record<Locale, string>,
  compareTitle: {
    en: "Head to head",
    fr: "Face à face",
    es: "Cara a cara",
    pt: "Frente a frente",
    it: "Testa a testa",
  } as Record<Locale, string>,
}

/** SH comparison pair slugs surfaced on the hub for internal linking. */
export const SH_COMPARE_SLUGS = [
  'valle-nevado-vs-portillo',
  'valle-nevado-vs-cerro-catedral',
  'cerro-catedral-vs-las-lenas',
  'perisher-vs-thredbo',
  'coronet-peak-vs-the-remarkables',
]

/** Dev-time parity guard: every localized field must have all 5 locales. */
export function assertShParity(): void {
  const check = (obj: Record<string, unknown>, path: string) => {
    for (const l of LOCALES) {
      if (typeof obj[l] !== 'string' || !(obj[l] as string).trim()) {
        throw new Error(`southernHemisphere: missing locale '${l}' at ${path}`)
      }
    }
  }
  for (const s of SH_SECTIONS) {
    check(s.name, `section ${s.key} name`)
    check(s.blurb, `section ${s.key} blurb`)
  }
  for (const [k, v] of Object.entries(SH_COPY)) {
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        for (const [field, rec] of Object.entries(item)) check(rec as Record<string, unknown>, `${k}[${i}].${field}`)
      })
    } else {
      check(v as Record<string, unknown>, k)
    }
  }
}
