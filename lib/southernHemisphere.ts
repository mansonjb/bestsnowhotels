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
    name: { en: "Chile", fr: "Chili", es: "Chile", pt: "Chile", it: "Cile", ja: "チリ", 'zh-hk': "智利", nl: "Chili" },
    blurb: {
      en: "Chile's resorts sit high in the central Andes, an hour or two above Santiago. Valle Nevado, El Colorado and La Parva share the vast Tres Valles off Farellones, while Portillo's single iconic yellow hotel above the frozen Laguna del Inca is a bucket-list classic. The season runs mid-June to early October and peaks in July and August.",
      fr: "Les stations chiliennes culminent haut dans les Andes centrales, à une ou deux heures au-dessus de Santiago. Valle Nevado, El Colorado et La Parva se partagent l'immense Tres Valles depuis Farellones, tandis que l'unique hôtel jaune de Portillo, au-dessus de la Laguna del Inca gelée, reste un classique à cocher une fois dans sa vie. La saison va de mi-juin à début octobre et culmine en juillet et août.",
      es: "Las estaciones chilenas se alzan en lo alto de los Andes centrales, a una o dos horas por encima de Santiago. Valle Nevado, El Colorado y La Parva comparten los vastos Tres Valles desde Farellones, mientras que el icónico hotel amarillo de Portillo, sobre la helada Laguna del Inca, es un clásico de lista de deseos. La temporada va de mediados de junio a principios de octubre y su punto álgido es julio y agosto.",
      pt: "As estâncias chilenas erguem-se no alto dos Andes centrais, a uma ou duas horas acima de Santiago. Valle Nevado, El Colorado e La Parva partilham os vastos Tres Valles a partir de Farellones, enquanto o icónico hotel amarelo de Portillo, sobre a gelada Laguna del Inca, é um clássico da lista de sonhos. A época decorre de meados de junho a início de outubro e atinge o auge em julho e agosto.",
      it: "Le località cilene si innalzano in quota sulle Ande centrali, a un'ora o due sopra Santiago. Valle Nevado, El Colorado e La Parva si dividono le vaste Tres Valles sopra Farellones, mentre l'iconico hotel giallo di Portillo, sopra la gelata Laguna del Inca, resta un classico da spuntare una volta nella vita. La stagione va da metà giugno a inizio ottobre e culmina a luglio e agosto.",
      ja: "チリのスキー場は中央アンデスの高地にあり、Santiagoから1〜2時間ほど。Valle Nevado、El Colorado、La ParvaはFarellonesの先に広がる広大なTres Vallesを共有し、凍りついたLaguna del Inca湖畔に建つPortilloの黄色いホテルは一生に一度は泊まりたい定番として知られる。シーズンは6月中旬から10月上旬までで、7月と8月がピーク。",
      'zh-hk': "智利的滑雪場坐落於中安第斯山脈高處，車程距離Santiago約一至兩小時。Valle Nevado、El Colorado及La Parva共享Farellones一帶廣闊的Tres Valles，而Portillo那間標誌性的黃色酒店，矗立於結冰的Laguna del Inca湖畔，是必到清單上的經典之選。雪季由六月中旬持續至十月初，七月及八月為高峰期。",
      nl: "De resorts van Chili liggen hoog in de centrale Andes, een uur of twee boven Santiago. Valle Nevado, El Colorado en La Parva delen het uitgestrekte Tres Valles bij Farellones, terwijl het iconische gele hotel van Portillo, boven de bevroren Laguna del Inca, een echte bucketlistklassieker is. Het seizoen loopt van half juni tot begin oktober en piekt in juli en augustus.",
    },
  },
  {
    key: 'argentina',
    countryCodes: ['AR'],
    flag: '🇦🇷',
    mapSlug: 'cerro-catedral',
    mapZoom: 10,
    name: { en: "Argentina", fr: "Argentine", es: "Argentina", pt: "Argentina", it: "Argentina", ja: "アルゼンチン", 'zh-hk': "阿根廷", nl: "Argentinië" },
    blurb: {
      en: "Argentina strings its resorts down the Andes from Mendoza to deep Patagonia. Cerro Catedral above Bariloche is the largest ski area in South America, Las Leñas is the continent's reference for steep, high-altitude off-piste, and Cerro Castor near Ushuaia is the southernmost resort on earth, with the longest season of all. Expect winter from mid-June into October.",
      fr: "L'Argentine égrène ses stations le long des Andes, de Mendoza jusqu'au fond de la Patagonie. Cerro Catedral, au-dessus de Bariloche, est le plus grand domaine d'Amérique du Sud, Las Leñas est la référence du continent pour le hors-piste raide et d'altitude, et Cerro Castor, près d'Ushuaia, est la station la plus australe de la planète, avec la plus longue saison qui soit. L'hiver s'installe de mi-juin à octobre.",
      es: "Argentina reparte sus estaciones a lo largo de los Andes, de Mendoza hasta la Patagonia profunda. Cerro Catedral, sobre Bariloche, es el mayor dominio esquiable de Sudamérica, Las Leñas es la referencia del continente para el fuera de pista empinado y de altura, y Cerro Castor, junto a Ushuaia, es la estación más austral del planeta, con la temporada más larga de todas. El invierno va de mediados de junio a octubre.",
      pt: "A Argentina distribui as suas estâncias ao longo dos Andes, de Mendoza até à Patagónia profunda. O Cerro Catedral, sobre Bariloche, é o maior domínio esquiável da América do Sul, Las Leñas é a referência do continente para o fora de pista íngreme e de altitude, e o Cerro Castor, junto a Ushuaia, é a estância mais austral do planeta, com a época mais longa de todas. O inverno decorre de meados de junho a outubro.",
      it: "L'Argentina distribuisce le sue località lungo le Ande, da Mendoza fino alla Patagonia più profonda. Il Cerro Catedral, sopra Bariloche, è il comprensorio più grande del Sud America, Las Leñas è il riferimento del continente per il fuoripista ripido e d'alta quota, e il Cerro Castor, vicino a Ushuaia, è la località più a sud del pianeta, con la stagione più lunga in assoluto. L'inverno va da metà giugno a ottobre.",
      ja: "アルゼンチンはアンデス沿いに、Mendozaから奥深いPatagoniaまでスキー場が連なる。BarilocheのCerro Catedralは南米最大のスキーエリア、Las Leñasは険しい高所オフピステでは大陸随一、Ushuaia近郊のCerro Castorは地球最南端のスキー場でシーズンの長さも随一。冬は6月中旬から10月まで続く。",
      'zh-hk': "阿根廷的滑雪場沿安第斯山脈一路延伸，由Mendoza直達Patagonia深處。Bariloche上方的Cerro Catedral是南美洲最大的滑雪場，Las Leñas是全洲陡峭高海拔野雪的標竿，而Ushuaia附近的Cerro Castor則是全球最南端的滑雪場，雪季亦是當中最長的。冬季由六月中旬持續至十月。",
      nl: "Argentinië rijgt zijn resorts aaneen langs de Andes, van Mendoza tot diep in Patagonië. Cerro Catedral, boven Bariloche, is het grootste skigebied van Zuid-Amerika, Las Leñas is het continentale referentiepunt voor steile off-piste op grote hoogte, en Cerro Castor, bij Ushuaia, is het zuidelijkste resort op aarde, met het langste seizoen van allemaal. Reken op winter van half juni tot in oktober.",
    },
  },
  {
    key: 'new-zealand',
    countryCodes: ['NZ'],
    flag: '🇳🇿',
    mapSlug: 'queenstown',
    mapZoom: 10,
    name: { en: "New Zealand", fr: "Nouvelle-Zélande", es: "Nueva Zelanda", pt: "Nova Zelândia", it: "Nuova Zelanda", ja: "ニュージーランド", 'zh-hk': "紐西蘭", nl: "Nieuw-Zeeland" },
    blurb: {
      en: "New Zealand's South Island has the most dramatic skiing south of the equator: glacial valleys, lake-edge views and genuine alpine character. Cardrona and Treble Cone rise above Wanaka, while Coronet Peak and The Remarkables sit a short drive from Queenstown, the adventure capital that doubles as the region's base. Mt Hutt on the Canterbury plains catches the most snow. Season runs mid-June to early October.",
      fr: "L'île du Sud de la Nouvelle-Zélande offre le ski le plus spectaculaire de l'hémisphère sud : vallées glaciaires, vues sur les lacs et vrai caractère alpin. Cardrona et Treble Cone dominent Wanaka, tandis que Coronet Peak et The Remarkables sont à quelques minutes de Queenstown, la capitale de l'aventure qui sert aussi de camp de base. Mt Hutt, sur les plaines de Canterbury, reçoit le plus de neige. La saison va de mi-juin à début octobre.",
      es: "La Isla Sur de Nueva Zelanda ofrece el esquí más espectacular al sur del ecuador: valles glaciares, vistas a los lagos y auténtico carácter alpino. Cardrona y Treble Cone se alzan sobre Wanaka, mientras que Coronet Peak y The Remarkables quedan a pocos minutos de Queenstown, la capital de la aventura que hace de campo base. Mt Hutt, en las llanuras de Canterbury, recibe la mayor cantidad de nieve. La temporada va de mediados de junio a principios de octubre.",
      pt: "A Ilha Sul da Nova Zelândia oferece o esqui mais espetacular a sul do equador: vales glaciares, vistas sobre os lagos e verdadeiro carácter alpino. Cardrona e Treble Cone erguem-se sobre Wanaka, enquanto Coronet Peak e The Remarkables ficam a poucos minutos de Queenstown, a capital da aventura que serve também de base. O Mt Hutt, nas planícies de Canterbury, recebe a maior quantidade de neve. A época decorre de meados de junho a início de outubro.",
      it: "L'Isola del Sud della Nuova Zelanda offre lo sci più spettacolare a sud dell'equatore: valli glaciali, vedute sui laghi e autentico carattere alpino. Cardrona e Treble Cone dominano Wanaka, mentre Coronet Peak e The Remarkables sono a pochi minuti da Queenstown, la capitale dell'avventura che fa anche da campo base. Il Mt Hutt, sulle pianure di Canterbury, riceve la maggior quantità di neve. La stagione va da metà giugno a inizio ottobre.",
      ja: "ニュージーランドの南島は赤道以南で最もドラマチックなスキーが楽しめる場所で、氷河の谷、湖畔の眺め、本格的な高山の雰囲気が魅力。CardronaとTreble ConeはWanakaの上にそびえ、Coronet PeakとThe RemarkablesはQueenstownから車ですぐの距離。Queenstownはアドベンチャーの都であると同時にこの地域の拠点でもある。Canterbury平野のMt Huttは積雪量が最も多い。シーズンは6月中旬から10月上旬まで。",
      'zh-hk': "紐西蘭南島擁有赤道以南最壯觀的滑雪體驗：冰川山谷、湖畔美景及濃厚的高山氛圍。Cardrona及Treble Cone聳立於Wanaka之上，Coronet Peak及The Remarkables則距離Queenstown車程僅數分鐘，這座探險之都同時也是這個地區的落腳據點。Canterbury平原上的Mt Hutt降雪量最為豐富。雪季由六月中旬持續至十月初。",
      nl: "Het Zuidereiland van Nieuw-Zeeland biedt het meest spectaculaire skiën ten zuiden van de evenaar: gletsjervalleien, uitzicht over meren en authentiek alpien karakter. Cardrona en Treble Cone torenen boven Wanaka uit, terwijl Coronet Peak en The Remarkables op korte afstand van Queenstown liggen, de avonturenhoofdstad die ook dienstdoet als uitvalsbasis van de regio. Mt Hutt, op de vlaktes van Canterbury, vangt de meeste sneeuw. Het seizoen loopt van half juni tot begin oktober.",
    },
  },
  {
    key: 'australia',
    countryCodes: ['AU'],
    flag: '🇦🇺',
    mapSlug: 'thredbo',
    mapZoom: 10,
    name: { en: "Australia", fr: "Australie", es: "Australia", pt: "Austrália", it: "Australia", ja: "オーストラリア", 'zh-hk': "澳洲", nl: "Australië" },
    blurb: {
      en: "Australia's snowfields run mid-June to September across New South Wales and Victoria. Perisher is the largest resort in the Southern Hemisphere, Thredbo has the country's longest vertical, and Falls Creek, Mt Buller and Mt Hotham deliver the best village feel. The snow-gum forests give it all a look you will find nowhere else, and access from Sydney or Melbourne is the easiest in the hemisphere.",
      fr: "Les champs de neige australiens fonctionnent de mi-juin à septembre, en Nouvelle-Galles du Sud et dans le Victoria. Perisher est la plus grande station de l'hémisphère sud, Thredbo offre le plus grand dénivelé du pays, et Falls Creek, Mt Buller et Mt Hotham signent les meilleures ambiances de village. Les forêts d'eucalyptus des neiges leur donnent une allure unique, et l'accès depuis Sydney ou Melbourne est le plus simple de l'hémisphère.",
      es: "Los campos de nieve australianos funcionan de mediados de junio a septiembre, en Nueva Gales del Sur y Victoria. Perisher es la mayor estación del hemisferio sur, Thredbo tiene el mayor desnivel del país, y Falls Creek, Mt Buller y Mt Hotham firman el mejor ambiente de pueblo. Los bosques de eucaliptos de las nieves les dan un aspecto único, y el acceso desde Sídney o Melbourne es el más sencillo del hemisferio.",
      pt: "Os campos de neve australianos funcionam de meados de junho a setembro, em Nova Gales do Sul e Vitória. Perisher é a maior estância do hemisfério sul, Thredbo tem o maior desnível do país, e Falls Creek, Mt Buller e Mt Hotham oferecem o melhor ambiente de aldeia. As florestas de eucaliptos das neves dão-lhes um aspeto único, e o acesso a partir de Sydney ou Melbourne é o mais fácil do hemisfério.",
      it: "I campi da neve australiani funzionano da metà giugno a settembre, nel Nuovo Galles del Sud e nel Victoria. Perisher è la località più grande dell'emisfero sud, Thredbo ha il dislivello più ampio del paese, e Falls Creek, Mt Buller e Mt Hotham offrono la migliore atmosfera di villaggio. Le foreste di eucalipto delle nevi regalano un aspetto che non si trova altrove, e l'accesso da Sydney o Melbourne è il più semplice dell'emisfero.",
      ja: "オーストラリアのスキー場はNew South WalesとVictoriaにまたがり、6月中旬から9月まで営業する。Perisherは南半球最大のスキー場、Thredboは国内最大の標高差を誇り、Falls Creek、Mt Buller、Mt Hothamは村の雰囲気が抜群。スノーガムの森が他では見られない独特の景観を生み出し、SydneyやMelbourneからのアクセスの良さも南半球随一。",
      'zh-hk': "澳洲的滑雪場遍佈New South Wales及Victoria兩地，雪季由六月中旬持續至九月。Perisher是南半球最大的滑雪場，Thredbo擁有全國最大的垂直落差，而Falls Creek、Mt Buller及Mt Hotham則帶來最濃厚的村莊氛圍。雪桉樹林賦予這裡獨一無二的景致，由Sydney或Melbourne出發，交通亦是南半球之中最便捷的。",
      nl: "De sneeuwvelden van Australië zijn open van half juni tot september, verspreid over New South Wales en Victoria. Perisher is het grootste resort van het zuidelijk halfrond, Thredbo heeft het grootste hoogteverschil van het land, en Falls Creek, Mt Buller en Mt Hotham bieden de beste dorpssfeer. De sneeuweucalyptusbossen geven het geheel een aanblik die je nergens anders vindt, en de toegang vanaf Sydney of Melbourne is de makkelijkste van het halfrond.",
    },
  },
  {
    key: 'africa',
    countryCodes: ['LS', 'ZA'],
    flag: '🇱🇸',
    mapSlug: 'afriski',
    mapZoom: 9,
    name: { en: "Southern Africa", fr: "Afrique australe", es: "África austral", pt: "África Austral", it: "Africa australe", ja: "南部アフリカ", 'zh-hk': "南部非洲", nl: "Zuidelijk Afrika" },
    blurb: {
      en: "Africa's two ski spots are pure adventure. Afriski, high in Lesotho's Maluti Mountains above 3000 m, skis June to August on a single well-groomed run with a proper lodge, and Tiffindell in South Africa's Eastern Cape offers a handful of pistes against the African plateau. Small, unlikely, and a story you will tell for years.",
      fr: "Les deux spots de ski d'Afrique sont de pures aventures. Afriski, perché dans les monts Maluti du Lesotho au-dessus de 3000 m, se skie de juin à août sur une unique piste bien damée avec un vrai lodge, et Tiffindell, dans le Cap-Oriental sud-africain, aligne quelques pistes face au plateau africain. Petit, improbable, et une histoire que vous raconterez pendant des années.",
      es: "Los dos rincones de esquí de África son pura aventura. Afriski, en lo alto de los montes Maluti de Lesoto por encima de los 3000 m, se esquía de junio a agosto en una única pista bien pisada con un buen lodge, y Tiffindell, en el Cabo Oriental sudafricano, alinea un puñado de pistas frente a la meseta africana. Pequeño, improbable y una historia que contarás durante años.",
      pt: "Os dois recantos de esqui de África são pura aventura. O Afriski, no alto dos montes Maluti do Lesoto acima dos 3000 m, esquia-se de junho a agosto numa única pista bem pisada com um bom lodge, e o Tiffindell, no Cabo Oriental sul-africano, alinha um punhado de pistas diante do planalto africano. Pequeno, improvável e uma história que contará durante anos.",
      it: "I due angoli di sci dell'Africa sono pura avventura. Afriski, in cima ai monti Maluti del Lesotho oltre i 3000 m, si scia da giugno ad agosto su un'unica pista ben battuta con un vero lodge, e Tiffindell, nel Capo Orientale sudafricano, allinea una manciata di piste di fronte all'altopiano africano. Piccolo, improbabile e una storia che racconterai per anni.",
      ja: "アフリカにある2つのスキー場は、まさに冒険そのもの。標高3000mを超えるレソトのMaluti Mountains高地にあるAfriskiは、6月から8月にかけて手入れの行き届いた1本のゲレンデと本格的なロッジが自慢。南アフリカのEastern CapeにあるTiffindellは、アフリカ高原を背にした数本のゲレンデが楽しめる。小さくて意外性たっぷり、何年も語り草になる体験だ。",
      'zh-hk': "非洲僅有的兩個滑雪點，完全就是純粹的冒險。地勢高企、海拔逾3000m的Afriski坐落於Lesotho的Maluti山脈，六月至八月期間開放一條修整完善的雪道，配有正式的度假小屋；南非東開普省的Tiffindell則在非洲高原背景下，提供數條雪道。規模雖小、地點雖出乎意料，卻是足以讓你津津樂道多年的難忘經歷。",
      nl: "De twee skiplekken van Afrika zijn pure avontuur. Afriski, hoog in het Maluti-gebergte van Lesotho boven de 3000 m, is van juni tot augustus te skiën op één goed geprepareerde piste met een heus lodge, en Tiffindell in de Oost-Kaap van Zuid-Afrika biedt een handvol pistes tegen het Afrikaanse plateau. Klein, onwaarschijnlijk, en een verhaal dat je jarenlang zult vertellen.",
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
    ja: "7月・8月・9月にどこへ滑りに行く：南半球スキーガイド",
    'zh-hk': "七月、八月及九月去哪裡滑雪：南半球滑雪指南",
    nl: "Waar skiën in juli, augustus en september: gids voor het zuidelijk halfrond",
  } as Record<Locale, string>,
  heroTitle: {
    en: "Ski in July, August and September",
    fr: "Skier en juillet, août et septembre",
    es: "Esquiar en julio, agosto y septiembre",
    pt: "Esquiar em julho, agosto e setembro",
    it: "Sciare a luglio, agosto e settembre",
    ja: "7月・8月・9月に滑る",
    'zh-hk': "七月、八月及九月去滑雪",
    nl: "Skiën in juli, augustus en september",
  } as Record<Locale, string>,
  heroKicker: {
    en: "Southern Hemisphere ski season",
    fr: "Saison de ski de l'hémisphère sud",
    es: "Temporada de esquí del hemisferio sur",
    pt: "Época de esqui do hemisfério sul",
    it: "Stagione sciistica dell'emisfero sud",
    ja: "南半球のスキーシーズン",
    'zh-hk': "南半球雪季",
    nl: "Skiseizoen op het zuidelijk halfrond",
  } as Record<Locale, string>,
  heroIntro: {
    en: "When the Alps and the Rockies melt into summer, the snow flips south. From June to October, real winter runs across the Andes of Chile and Argentina, the Southern Alps of New Zealand and the mountains of Australia. Here is where to go, when to book and which ski-in/ski-out hotels put you on the snow.",
    fr: "Quand les Alpes et les Rocheuses fondent en plein été, la neige bascule au sud. De juin à octobre, l'hiver s'installe pour de vrai dans les Andes du Chili et d'Argentine, les Alpes du Sud néo-zélandaises et les montagnes d'Australie. Voici où partir, quand réserver et quels hôtels au pied des pistes vous posent sur la neige.",
    es: "Cuando los Alpes y las Rocosas se derriten en verano, la nieve se pasa al sur. De junio a octubre, el invierno de verdad recorre los Andes de Chile y Argentina, los Alpes del Sur de Nueva Zelanda y las montañas de Australia. Aquí tienes adónde ir, cuándo reservar y qué hoteles a pie de pista te dejan sobre la nieve.",
    pt: "Quando os Alpes e as Montanhas Rochosas derretem no verão, a neve passa para sul. De junho a outubro, o inverno a sério instala-se nos Andes do Chile e da Argentina, nos Alpes do Sul da Nova Zelândia e nas montanhas da Austrália. Eis para onde ir, quando reservar e que hotéis à beira das pistas o deixam na neve.",
    it: "Quando le Alpi e le Montagne Rocciose si sciolgono in piena estate, la neve si sposta a sud. Da giugno a ottobre l'inverno vero attraversa le Ande di Cile e Argentina, le Alpi del Sud della Nuova Zelanda e le montagne dell'Australia. Ecco dove andare, quando prenotare e quali hotel sulle piste ti mettono sulla neve.",
    ja: "アルプスとロッキー山脈が夏を迎えて雪が消える頃、雪は南半球へと移る。6月から10月にかけて、チリとアルゼンチンのアンデス、ニュージーランドのサザンアルプス、オーストラリアの山々で本物の冬が続く。どこへ行くべきか、いつ予約すべきか、そしてどのski-in/ski-outホテルなら雪のすぐそばに泊まれるのかをご紹介する。",
    'zh-hk': "當阿爾卑斯山及洛磯山脈進入炎夏融雪之時，雪就轉移到南半球。由六月至十月，真正的寒冬會降臨智利與阿根廷的安第斯山脈、紐西蘭的南阿爾卑斯山，以及澳洲的群山。以下為你介紹該去哪裡、何時預訂，以及哪些ski-in/ski-out酒店能讓你直接置身雪中。",
    nl: "Als de Alpen en het Rotsgebergte wegsmelten in de zomer, verhuist de sneeuw naar het zuiden. Van juni tot oktober trekt echte winter door de Andes van Chili en Argentinië, de Zuidelijke Alpen van Nieuw-Zeeland en de bergen van Australië. Hier lees je waar je moet zijn, wanneer je moet boeken en welke ski-in/ski-out hotels je op de sneeuw zetten.",
  } as Record<Locale, string>,
  geoTitle: {
    en: "The short answer",
    fr: "En bref",
    es: "En resumen",
    pt: "Em resumo",
    it: "In breve",
    ja: "手短に言うと",
    'zh-hk': "簡而言之",
    nl: "In het kort",
  } as Record<Locale, string>,
  geoBody: {
    en: "The Southern Hemisphere ski season runs from mid-June to early October and peaks in July and August. Chile and Argentina hold the highest, biggest terrain in the Andes; New Zealand has the most dramatic alpine scenery; Australia has the easiest access and the liveliest villages. July is school-holiday high season, so August often brings the best mix of deep snow and open space.",
    fr: "La saison de ski de l'hémisphère sud va de mi-juin à début octobre et culmine en juillet et août. Le Chili et l'Argentine possèdent les domaines les plus hauts et les plus vastes, dans les Andes ; la Nouvelle-Zélande offre les paysages alpins les plus spectaculaires ; l'Australie a l'accès le plus simple et les villages les plus animés. Juillet est la haute saison des vacances scolaires, si bien qu'août réunit souvent le meilleur compromis entre neige abondante et espace.",
    es: "La temporada de esquí del hemisferio sur va de mediados de junio a principios de octubre y su punto álgido es julio y agosto. Chile y Argentina tienen los dominios más altos y extensos, en los Andes; Nueva Zelanda ofrece los paisajes alpinos más espectaculares; Australia tiene el acceso más fácil y los pueblos más animados. Julio es temporada alta por las vacaciones escolares, así que agosto suele reunir la mejor combinación de nieve abundante y espacio.",
    pt: "A época de esqui do hemisfério sul vai de meados de junho a início de outubro e atinge o auge em julho e agosto. O Chile e a Argentina têm os domínios mais altos e extensos, nos Andes; a Nova Zelândia oferece as paisagens alpinas mais espetaculares; a Austrália tem o acesso mais fácil e as aldeias mais animadas. Julho é época alta por causa das férias escolares, pelo que agosto costuma reunir a melhor combinação de neve abundante e espaço.",
    it: "La stagione sciistica dell'emisfero sud va da metà giugno a inizio ottobre e culmina a luglio e agosto. Cile e Argentina hanno i comprensori più alti ed estesi, sulle Ande; la Nuova Zelanda offre i paesaggi alpini più spettacolari; l'Australia ha l'accesso più facile e i villaggi più vivaci. Luglio è alta stagione per le vacanze scolastiche, perciò agosto riunisce spesso il miglior compromesso tra neve abbondante e spazio.",
    ja: "南半球のスキーシーズンは6月中旬から10月上旬まで続き、7月と8月がピーク。チリとアルゼンチンはアンデスに最も標高が高く広大なゲレンデを持ち、ニュージーランドは最もドラマチックな山岳の景観を誇り、オーストラリアはアクセスの良さと賑やかな村が魅力。7月は学校休暇と重なるハイシーズンのため、8月は豊富な積雪と混雑の少なさが両立しやすい時期になる。",
    'zh-hk': "南半球雪季由六月中旬持續至十月初，七月及八月為高峰期。智利及阿根廷坐擁安第斯山脈地勢最高、範圍最廣的雪場；紐西蘭擁有最壯觀的高山景致；澳洲則交通最便捷、村莊氣氛最熱鬧。七月是學校假期旺季，因此八月往往能兼得深厚積雪與較寬鬆的空間。",
    nl: "Het skiseizoen op het zuidelijk halfrond loopt van half juni tot begin oktober en piekt in juli en augustus. Chili en Argentinië hebben de hoogste en grootste skigebieden in de Andes; Nieuw-Zeeland heeft de meest indrukwekkende alpiene landschappen; Australië heeft de makkelijkste toegang en de levendigste dorpen. Juli is hoogseizoen door de schoolvakanties, dus augustus biedt vaak de beste combinatie van diepe sneeuw en ruimte.",
  } as Record<Locale, string>,
  monthsTitle: {
    en: "The season, month by month",
    fr: "La saison, mois par mois",
    es: "La temporada, mes a mes",
    pt: "A época, mês a mês",
    it: "La stagione, mese per mese",
    ja: "シーズンを月別に見る",
    'zh-hk': "雪季逐月導覽",
    nl: "Het seizoen, maand voor maand",
  } as Record<Locale, string>,
  months: [
    {
      tag: { en: "June", fr: "Juin", es: "Junio", pt: "Junho", it: "Giugno", ja: "6月", 'zh-hk': "六月", nl: "Juni" },
      body: {
        en: "Early season. Resorts open mid-month as the first storms build a base. Fewer crowds and lower prices, but check that the terrain you want is actually open.",
        fr: "Début de saison. Les stations ouvrent vers la mi-juin quand les premières tempêtes constituent le manteau. Moins de monde et des prix plus doux, mais vérifiez que le secteur voulu est bien ouvert.",
        es: "Inicio de temporada. Las estaciones abren a mediados de mes cuando las primeras tormentas forman la base. Menos gente y precios más bajos, pero comprueba que el sector que quieres esté abierto.",
        pt: "Início de época. As estâncias abrem a meio do mês quando as primeiras tempestades formam a base. Menos gente e preços mais baixos, mas confirme que o setor que quer está aberto.",
        it: "Inizio stagione. Le località aprono a metà mese quando le prime tempeste formano il fondo. Meno folla e prezzi più bassi, ma verifica che il settore che vuoi sia davvero aperto.",
        ja: "シーズン序盤。月の半ばに最初の嵐が積雪の土台を作り、スキー場がオープンする。混雑も少なく料金も控えめだが、目当てのゲレンデが実際に滑走可能か事前に確認を。",
        'zh-hk': "雪季初段。滑雪場約於月中開放，首批風暴為雪道打好基礎。人流較少、價格較低，但緊記出發前確認心儀的雪道是否已經開放。",
        nl: "Begin van het seizoen. Resorts openen halverwege de maand zodra de eerste stormen een sneeuwbasis opbouwen. Minder drukte en lagere prijzen, maar check of het gebied dat je wilt ook echt open is.",
      },
    },
    {
      tag: { en: "July to August", fr: "Juillet à août", es: "Julio a agosto", pt: "Julho a agosto", it: "Luglio e agosto", ja: "7月〜8月", 'zh-hk': "七月至八月", nl: "Juli tot augustus" },
      body: {
        en: "Peak season and the most reliable snow. School holidays fill the villages in July, so August often blends full conditions with a little more room. Book hotels well ahead.",
        fr: "Cœur de saison et neige la plus fiable. Les vacances scolaires remplissent les villages en juillet, si bien qu'août mêle souvent conditions optimales et un peu plus de place. Réservez vos hôtels bien à l'avance.",
        es: "Plena temporada y la nieve más fiable. Las vacaciones escolares llenan los pueblos en julio, así que agosto suele combinar buenas condiciones con algo más de sitio. Reserva los hoteles con antelación.",
        pt: "Plena época e a neve mais fiável. As férias escolares enchem as aldeias em julho, pelo que agosto costuma juntar boas condições com um pouco mais de espaço. Reserve os hotéis com antecedência.",
        it: "Piena stagione e neve più affidabile. Le vacanze scolastiche riempiono i villaggi a luglio, perciò agosto unisce spesso condizioni ottimali e un po' più di spazio. Prenota gli hotel con largo anticipo.",
        ja: "ピークシーズンで積雪も最も安定。7月は学校休暇で村が賑わうため、8月はコンディションを保ちながらも少し余裕が生まれやすい。ホテルは早めの予約を。",
        'zh-hk': "雪季高峰，積雪亦最為穩定可靠。七月學校假期令村莊人頭湧湧，因此八月往往能兼得理想雪況與較寬鬆的空間。緊記提早預訂酒店。",
        nl: "Hoogseizoen en de meest betrouwbare sneeuw. Schoolvakanties vullen de dorpen in juli, dus augustus combineert vaak topcondities met wat meer ruimte. Boek je hotel ruim op tijd.",
      },
    },
    {
      tag: { en: "September to October", fr: "Septembre à octobre", es: "Septiembre a octubre", pt: "Setembro a outubro", it: "Settembre e ottobre", ja: "9月〜10月", 'zh-hk': "九月至十月", nl: "September tot oktober" },
      body: {
        en: "Spring skiing: long sunny days, softer snow and the best deals. Higher Andes resorts hold on longest, while Cerro Castor in Patagonia can run into October.",
        fr: "Ski de printemps : longues journées ensoleillées, neige plus souple et meilleures affaires. Les stations andines d'altitude tiennent le plus longtemps, et Cerro Castor, en Patagonie, peut tourner jusqu'en octobre.",
        es: "Esquí de primavera: días largos y soleados, nieve más blanda y las mejores ofertas. Las estaciones andinas de altura aguantan más, y Cerro Castor, en la Patagonia, puede llegar a octubre.",
        pt: "Esqui de primavera: dias longos e soalheiros, neve mais mole e as melhores ofertas. As estâncias andinas de altitude aguentam mais tempo, e o Cerro Castor, na Patagónia, pode ir até outubro.",
        it: "Sci primaverile: giornate lunghe e soleggiate, neve più morbida e le offerte migliori. Le località andine d'alta quota reggono più a lungo, e il Cerro Castor, in Patagonia, può arrivare fino a ottobre.",
        ja: "春スキーの季節。日差したっぷりの長い一日、柔らかな雪質、そしてお得な料金が魅力。標高の高いアンデスのスキー場は最後まで営業を続け、PatagoniaのCerro Castorは10月まで滑れることもある。",
        'zh-hk': "春季滑雪：日照時間長、雪質較軟，優惠亦最多。安第斯山脈地勢較高的滑雪場雪季維持最長，而Patagonia的Cerro Castor更可延續至十月。",
        nl: "Voorjaarsskiën: lange zonnige dagen, zachtere sneeuw en de beste deals. Hoger gelegen resorts in de Andes houden het langst vol, terwijl Cerro Castor in Patagonië kan doorgaan tot in oktober.",
      },
    },
  ] as { tag: Record<Locale, string>; body: Record<Locale, string> }[],
  sectionsTitle: {
    en: "Where to ski, region by region",
    fr: "Où skier, région par région",
    es: "Dónde esquiar, región por región",
    pt: "Onde esquiar, região a região",
    it: "Dove sciare, regione per regione",
    ja: "地域別、どこで滑るか",
    'zh-hk': "各地滑雪指南，逐區介紹",
    nl: "Waar skiën, regio voor regio",
  } as Record<Locale, string>,
  resortsLabel: {
    en: "Resorts",
    fr: "Stations",
    es: "Estaciones",
    pt: "Estâncias",
    it: "Località",
    ja: "スキー場",
    'zh-hk': "滑雪場",
    nl: "Resorts",
  } as Record<Locale, string>,
  mapLabel: {
    en: "Find a hotel near",
    fr: "Trouver un hôtel près de",
    es: "Encuentra un hotel cerca de",
    pt: "Encontre um hotel perto de",
    it: "Trova un hotel vicino a",
    ja: "近くのホテルを探す：",
    'zh-hk': "尋找鄰近酒店：",
    nl: "Vind een hotel bij",
  } as Record<Locale, string>,
  bookCta: {
    en: "Compare hotels",
    fr: "Comparer les hôtels",
    es: "Comparar hoteles",
    pt: "Comparar hotéis",
    it: "Confronta gli hotel",
    ja: "ホテルを比較",
    'zh-hk': "比較酒店",
    nl: "Vergelijk hotels",
  } as Record<Locale, string>,
  faqTitle: {
    en: "Southern Hemisphere skiing: common questions",
    fr: "Ski dans l'hémisphère sud : questions fréquentes",
    es: "Esquí en el hemisferio sur: preguntas frecuentes",
    pt: "Esqui no hemisfério sul: perguntas frequentes",
    it: "Sci nell'emisfero sud: domande frequenti",
    ja: "南半球スキーのよくある質問",
    'zh-hk': "南半球滑雪：常見問題",
    nl: "Skiën op het zuidelijk halfrond: veelgestelde vragen",
  } as Record<Locale, string>,
  faq: [
    {
      q: {
        en: "When is the Southern Hemisphere ski season?",
        fr: "Quand a lieu la saison de ski de l'hémisphère sud ?",
        es: "¿Cuándo es la temporada de esquí del hemisferio sur?",
        pt: "Quando é a época de esqui do hemisfério sul?",
        it: "Quando è la stagione sciistica dell'emisfero sud?",
        ja: "南半球のスキーシーズンはいつ？",
        'zh-hk': "南半球雪季是什麼時候？",
        nl: "Wanneer is het skiseizoen op het zuidelijk halfrond?",
      },
      a: {
        en: "Roughly mid-June to early October, peaking in July and August. Higher Andes resorts and Cerro Castor in Patagonia hold their season the longest, sometimes into October.",
        fr: "Grosso modo de mi-juin à début octobre, avec un pic en juillet et août. Les stations andines d'altitude et Cerro Castor, en Patagonie, prolongent le plus la saison, parfois jusqu'en octobre.",
        es: "Aproximadamente de mediados de junio a principios de octubre, con su punto álgido en julio y agosto. Las estaciones andinas de altura y Cerro Castor, en la Patagonia, alargan más la temporada, a veces hasta octubre.",
        pt: "Sensivelmente de meados de junho a início de outubro, com auge em julho e agosto. As estâncias andinas de altitude e o Cerro Castor, na Patagónia, prolongam mais a época, por vezes até outubro.",
        it: "All'incirca da metà giugno a inizio ottobre, con il picco a luglio e agosto. Le località andine d'alta quota e il Cerro Castor, in Patagonia, prolungano di più la stagione, a volte fino a ottobre.",
        ja: "おおよそ6月中旬から10月上旬まで、7月と8月がピーク。標高の高いアンデスのスキー場とPatagoniaのCerro Castorはシーズンが最も長く、10月まで続くこともある。",
        'zh-hk': "大約由六月中旬至十月初，七月及八月為高峰期。安第斯山脈地勢較高的滑雪場及Patagonia的Cerro Castor雪季維持最長，有時甚至可延續至十月。",
        nl: "Ruwweg van half juni tot begin oktober, met een piek in juli en augustus. Hoger gelegen resorts in de Andes en Cerro Castor in Patagonië houden het seizoen het langst vol, soms tot in oktober.",
      },
    },
    {
      q: {
        en: "Where can you ski in July and August?",
        fr: "Où peut-on skier en juillet et août ?",
        es: "¿Dónde se puede esquiar en julio y agosto?",
        pt: "Onde se pode esquiar em julho e agosto?",
        it: "Dove si può sciare a luglio e agosto?",
        ja: "7月と8月にはどこでスキーができる？",
        'zh-hk': "七月及八月可以在哪裡滑雪？",
        nl: "Waar kun je skiën in juli en augustus?",
      },
      a: {
        en: "Across the Southern Hemisphere: Chile and Argentina in the Andes, New Zealand and Australia, plus Afriski in Lesotho. These are the only places on earth in full winter while the Alps and Rockies are green.",
        fr: "Dans tout l'hémisphère sud : le Chili et l'Argentine dans les Andes, la Nouvelle-Zélande et l'Australie, plus Afriski au Lesotho. Ce sont les seuls endroits de la planète en plein hiver quand les Alpes et les Rocheuses sont vertes.",
        es: "Por todo el hemisferio sur: Chile y Argentina en los Andes, Nueva Zelanda y Australia, además de Afriski en Lesoto. Son los únicos lugares del planeta en pleno invierno mientras los Alpes y las Rocosas están verdes.",
        pt: "Por todo o hemisfério sul: Chile e Argentina nos Andes, Nova Zelândia e Austrália, além do Afriski no Lesoto. São os únicos lugares do planeta em pleno inverno enquanto os Alpes e as Montanhas Rochosas estão verdes.",
        it: "In tutto l'emisfero sud: Cile e Argentina sulle Ande, Nuova Zelanda e Australia, oltre ad Afriski in Lesotho. Sono gli unici luoghi del pianeta in pieno inverno mentre le Alpi e le Montagne Rocciose sono verdi.",
        ja: "南半球全域、アンデスのチリとアルゼンチン、ニュージーランド、オーストラリア、そしてレソトのAfriskiが挙げられる。アルプスやロッキー山脈が緑に覆われている間、真冬なのは地球上でこれらの場所だけだ。",
        'zh-hk': "遍佈整個南半球：安第斯山脈的智利及阿根廷、紐西蘭及澳洲，還有Lesotho的Afriski。當阿爾卑斯山及洛磯山脈仍是一片綠油油之際，這些是全球僅有仍處於嚴冬的地方。",
        nl: "Overal op het zuidelijk halfrond: Chili en Argentinië in de Andes, Nieuw-Zeeland en Australië, plus Afriski in Lesotho. Dit zijn de enige plekken op aarde die in volle winter zitten terwijl de Alpen en het Rotsgebergte groen zijn.",
      },
    },
    {
      q: {
        en: "Which resort has the biggest terrain and best snow?",
        fr: "Quelle station a le plus grand domaine et la meilleure neige ?",
        es: "¿Qué estación tiene el mayor dominio y la mejor nieve?",
        pt: "Que estância tem o maior domínio e a melhor neve?",
        it: "Quale località ha il comprensorio più grande e la neve migliore?",
        ja: "最大のゲレンデと最高の積雪を誇るスキー場は？",
        'zh-hk': "哪個滑雪場範圍最大、雪質最好？",
        nl: "Welk resort heeft het grootste skigebied en de beste sneeuw?",
      },
      a: {
        en: "Cerro Catedral in Argentina is the largest ski area in South America. For the biggest snow numbers, the high central Andes of Chile (Valle Nevado and Portillo) and Mt Hutt in New Zealand lead the field. Las Leñas is the pick for serious steep terrain.",
        fr: "Cerro Catedral, en Argentine, est le plus grand domaine d'Amérique du Sud. Pour les plus gros cumuls de neige, les hautes Andes centrales du Chili (Valle Nevado et Portillo) et Mt Hutt en Nouvelle-Zélande mènent la danse. Las Leñas s'impose pour le raide engagé.",
        es: "Cerro Catedral, en Argentina, es el mayor dominio esquiable de Sudamérica. Para las mayores cifras de nieve, los altos Andes centrales de Chile (Valle Nevado y Portillo) y Mt Hutt en Nueva Zelanda encabezan la lista. Las Leñas es la elección para el fuera de pista empinado y exigente.",
        pt: "O Cerro Catedral, na Argentina, é o maior domínio esquiável da América do Sul. Para os maiores valores de neve, os altos Andes centrais do Chile (Valle Nevado e Portillo) e o Mt Hutt na Nova Zelândia lideram. Las Leñas é a escolha para o íngreme exigente.",
        it: "Il Cerro Catedral, in Argentina, è il comprensorio più grande del Sud America. Per i maggiori accumuli di neve, le alte Ande centrali del Cile (Valle Nevado e Portillo) e il Mt Hutt in Nuova Zelanda sono in testa. Las Leñas è la scelta per il ripido impegnativo.",
        ja: "アルゼンチンのCerro Catedralは南米最大のスキーエリア。積雪量ではチリの中央アンデス高地（Valle NevadoとPortillo）とニュージーランドのMt Huttが群を抜く。本格的な急斜面ならLas Leñasが一番の選択肢。",
        'zh-hk': "阿根廷的Cerro Catedral是南美洲最大的滑雪場。若論降雪量，智利中安第斯山脈高處（Valle Nevado及Portillo）及紐西蘭的Mt Hutt則首屈一指。至於認真的陡峭地形，Las Leñas是不二之選。",
        nl: "Cerro Catedral in Argentinië is het grootste skigebied van Zuid-Amerika. Voor de meeste sneeuw voeren de hoge centrale Andes van Chili (Valle Nevado en Portillo) en Mt Hutt in Nieuw-Zeeland de boventoon. Las Leñas is de beste keuze voor serieus steil terrein.",
      },
    },
    {
      q: {
        en: "Is Southern Hemisphere skiing as good as the Alps?",
        fr: "Le ski dans l'hémisphère sud vaut-il celui des Alpes ?",
        es: "¿El esquí en el hemisferio sur es tan bueno como el de los Alpes?",
        pt: "O esqui no hemisfério sul é tão bom como o dos Alpes?",
        it: "Lo sci nell'emisfero sud è all'altezza delle Alpi?",
        ja: "南半球のスキーはアルプスに匹敵する？",
        'zh-hk': "南半球滑雪的質素能媲美阿爾卑斯山嗎？",
        nl: "Is skiën op het zuidelijk halfrond net zo goed als in de Alpen?",
      },
      a: {
        en: "The terrain is smaller than the Alps or the Rockies, so set expectations right. What you get instead is real winter snow in your home summer, jaw-dropping scenery, and a season-extending trip you can combine with wider travel. For committed skiers it is absolutely worth it.",
        fr: "Les domaines sont plus petits que dans les Alpes ou les Rocheuses, il faut le savoir. En échange, vous skiez sur de la vraie neige d'hiver pendant votre été, dans des paysages saisissants, avec un voyage qui prolonge la saison et se combine à une découverte plus large. Pour un skieur passionné, cela en vaut vraiment la peine.",
        es: "Los dominios son más pequeños que en los Alpes o las Rocosas, conviene saberlo. A cambio, esquías sobre nieve de invierno de verdad durante tu verano, en paisajes impresionantes, con un viaje que alarga la temporada y se combina con una ruta más amplia. Para un esquiador apasionado, merece la pena de sobra.",
        pt: "Os domínios são mais pequenos do que nos Alpes ou nas Montanhas Rochosas, convém sabê-lo. Em troca, esquia sobre neve de inverno a sério durante o seu verão, em paisagens impressionantes, com uma viagem que prolonga a época e se combina com um roteiro mais amplo. Para um esquiador apaixonado, vale mesmo a pena.",
        it: "I comprensori sono più piccoli rispetto alle Alpi o alle Montagne Rocciose, è bene saperlo. In cambio scii su vera neve invernale durante la tua estate, in paesaggi mozzafiato, con un viaggio che prolunga la stagione e si abbina a un itinerario più ampio. Per uno sciatore appassionato ne vale assolutamente la pena.",
        ja: "ゲレンデの規模はアルプスやロッキー山脈より小さいので、その点は割り引いて考えたい。その代わりに得られるのは、自国が夏の間に楽しめる本物の冬の雪、息をのむような景観、そしてより広い旅程と組み合わせられるシーズン延長の旅だ。本気のスキーヤーにとっては間違いなく価値がある。",
        'zh-hk': "這裡的雪道範圍比阿爾卑斯山或洛磯山脈細小，宜先調節期望。但換來的是在自己家鄉盛夏之際，仍能體驗真正的寒冬積雪、令人驚嘆的景致，以及一趟可延長雪季、又能結合更廣泛行程的旅程。對認真的滑雪愛好者而言，絕對值得一試。",
        nl: "De skigebieden zijn kleiner dan in de Alpen of het Rotsgebergte, dus stel je verwachtingen daarop af. Wat je ervoor terugkrijgt is echte wintersneeuw tijdens je eigen zomer, adembenemende landschappen en een reis die je seizoen verlengt en die je kunt combineren met een bredere trip. Voor een fervente skiër is het absoluut de moeite waard.",
      },
    },
    {
      q: {
        en: "Where should families and first-timers go?",
        fr: "Où aller en famille ou pour une première fois ?",
        es: "¿Adónde ir en familia o siendo principiante?",
        pt: "Para onde ir em família ou sendo principiante?",
        it: "Dove andare in famiglia o alle prime armi?",
        ja: "家族連れや初心者にはどこがおすすめ？",
        'zh-hk': "家庭旅客及初學者應該去哪裡？",
        nl: "Waar kunnen gezinnen en beginners het beste heen?",
      },
      a: {
        en: "Australia has the gentlest access and biggest learner areas (Perisher, Falls Creek, Mt Buller). In New Zealand, Coronet Peak and Cardrona are the friendliest for learning, with Queenstown right there for everything off the snow. In the Andes, El Colorado and Cerro Catedral have the widest beginner terrain.",
        fr: "L'Australie offre l'accès le plus doux et les plus grands espaces débutants (Perisher, Falls Creek, Mt Buller). En Nouvelle-Zélande, Coronet Peak et Cardrona sont les plus accueillantes pour apprendre, avec Queenstown juste à côté pour tout le reste. Dans les Andes, El Colorado et Cerro Catedral ont les plus vastes zones débutants.",
        es: "Australia ofrece el acceso más sencillo y las mayores zonas de aprendizaje (Perisher, Falls Creek, Mt Buller). En Nueva Zelanda, Coronet Peak y Cardrona son las más acogedoras para aprender, con Queenstown al lado para todo lo demás. En los Andes, El Colorado y Cerro Catedral tienen las zonas de principiantes más amplias.",
        pt: "A Austrália oferece o acesso mais fácil e as maiores zonas de aprendizagem (Perisher, Falls Creek, Mt Buller). Na Nova Zelândia, Coronet Peak e Cardrona são as mais acolhedoras para aprender, com Queenstown ao lado para tudo o resto. Nos Andes, El Colorado e Cerro Catedral têm as zonas de principiantes mais amplas.",
        it: "L'Australia offre l'accesso più semplice e le aree per principianti più ampie (Perisher, Falls Creek, Mt Buller). In Nuova Zelanda, Coronet Peak e Cardrona sono le più accoglienti per imparare, con Queenstown a fianco per tutto il resto. Sulle Ande, El Colorado e Cerro Catedral hanno i campi scuola più estesi.",
        ja: "オーストラリアはアクセスが最も穏やかで、初心者エリアも最大級（Perisher、Falls Creek、Mt Buller）。ニュージーランドではCoronet PeakとCardronaが習得に最適で、ゲレンデ以外の楽しみもQueenstownですぐそこ。アンデスではEl ColoradoとCerro Catedralが最も広い初心者向けゲレンデを持つ。",
        'zh-hk': "澳洲交通最便捷，亦擁有最大型的初學者雪道（Perisher、Falls Creek、Mt Buller）。在紐西蘭，Coronet Peak及Cardrona最適合初學滑雪，加上Queenstown近在咫尺，滑雪以外的活動一應俱全。在安第斯山脈，El Colorado及Cerro Catedral則擁有最寬闊的初學者雪道。",
        nl: "Australië heeft de meest toegankelijke gebieden en de grootste oefenterreinen (Perisher, Falls Creek, Mt Buller). In Nieuw-Zeeland zijn Coronet Peak en Cardrona het fijnst om te leren skiën, met Queenstown vlakbij voor alles buiten de piste. In de Andes hebben El Colorado en Cerro Catedral het ruimste beginnersterrein.",
      },
    },
    {
      q: {
        en: "How far are the resorts from a major city or airport?",
        fr: "À quelle distance des grandes villes ou aéroports se trouvent les stations ?",
        es: "¿A qué distancia están las estaciones de una gran ciudad o aeropuerto?",
        pt: "A que distância estão as estâncias de uma grande cidade ou aeroporto?",
        it: "Quanto distano le località da una grande città o aeroporto?",
        ja: "スキー場は主要都市や空港からどれくらいの距離？",
        'zh-hk': "滑雪場距離主要城市或機場有多遠？",
        nl: "Hoe ver liggen de resorts van een grote stad of luchthaven?",
      },
      a: {
        en: "Chile: one to two hours from Santiago. Argentina: Bariloche and Mendoza have their own airports, with resorts 20 to 70 minutes on. New Zealand: Queenstown airport sits under an hour from four resorts. Australia: three to six hours from Sydney or Melbourne, so most people make a weekend or longer of it.",
        fr: "Chili : une à deux heures de Santiago. Argentine : Bariloche et Mendoza ont leurs aéroports, les stations sont à 20 à 70 minutes. Nouvelle-Zélande : l'aéroport de Queenstown est à moins d'une heure de quatre stations. Australie : trois à six heures de Sydney ou Melbourne, la plupart des gens y passent donc au moins un week-end.",
        es: "Chile: de una a dos horas desde Santiago. Argentina: Bariloche y Mendoza tienen aeropuerto, con las estaciones a 20 o 70 minutos. Nueva Zelanda: el aeropuerto de Queenstown está a menos de una hora de cuatro estaciones. Australia: de tres a seis horas desde Sídney o Melbourne, así que la mayoría se queda al menos un fin de semana.",
        pt: "Chile: uma a duas horas desde Santiago. Argentina: Bariloche e Mendoza têm aeroporto, com as estâncias a 20 ou 70 minutos. Nova Zelândia: o aeroporto de Queenstown fica a menos de uma hora de quatro estâncias. Austrália: três a seis horas desde Sydney ou Melbourne, pelo que a maioria fica pelo menos um fim de semana.",
        it: "Cile: una o due ore da Santiago. Argentina: Bariloche e Mendoza hanno un aeroporto, con le località a 20 o 70 minuti. Nuova Zelanda: l'aeroporto di Queenstown è a meno di un'ora da quattro località. Australia: da tre a sei ore da Sydney o Melbourne, quindi la maggior parte si ferma almeno un fine settimana.",
        ja: "チリ：Santiagoから1〜2時間。アルゼンチン：BarilocheとMendozaにはそれぞれ空港があり、そこからスキー場まで20〜70分。ニュージーランド：Queenstown空港から4つのスキー場まで1時間以内。オーストラリア：SydneyまたはMelbourneから3〜6時間かかるため、多くの人が週末以上の旅程を組む。",
        'zh-hk': "智利：距離Santiago車程一至兩小時。阿根廷：Bariloche及Mendoza均設有機場，距離滑雪場車程20至70分鐘。紐西蘭：Queenstown機場距離四個滑雪場車程不足一小時。澳洲：距離Sydney或Melbourne車程三至六小時，因此大部分旅客都會安排週末或更長的行程。",
        nl: "Chili: een tot twee uur van Santiago. Argentinië: Bariloche en Mendoza hebben een eigen luchthaven, met resorts op 20 tot 70 minuten. Nieuw-Zeeland: de luchthaven van Queenstown ligt op minder dan een uur van vier resorts. Australië: drie tot zes uur van Sydney of Melbourne, dus de meeste mensen maken er een weekend of langer van.",
      },
    },
  ] as { q: Record<Locale, string>; a: Record<Locale, string> }[],
  relatedTitle: {
    en: "Keep planning",
    fr: "Continuer à préparer",
    es: "Sigue planificando",
    pt: "Continue a planear",
    it: "Continua a pianificare",
    ja: "計画を続ける",
    'zh-hk': "繼續規劃行程",
    nl: "Blijf plannen",
  } as Record<Locale, string>,
  compareTitle: {
    en: "Head to head",
    fr: "Face à face",
    es: "Cara a cara",
    pt: "Frente a frente",
    it: "Testa a testa",
    ja: "一騎打ち",
    'zh-hk': "正面對決",
    nl: "Kop aan kop",
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
