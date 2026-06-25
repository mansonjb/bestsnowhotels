import type { Locale } from '@/app/[locale]/dictionaries'
import type { Destination } from './destinations'

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

/**
 * Continent + hemisphere taxonomy keyed by ISO-2 countryCode. This is the
 * single source of truth: every place that classifies a destination by
 * continent (best-for lists, llms.txt) or by hemisphere (seasonal guides)
 * derives from this map.
 *
 * When a new country wave ships, add ONE row here and the seasonal guides,
 * best-for filters, and country predicates all stay consistent.
 */
export type Continent = 'europe' | 'asia' | 'north-america' | 'africa' | 'oceania' | 'south-america'
export type Hemisphere = 'north' | 'south'

export const COUNTRY_META: Record<string, { continent: Continent; hemisphere: Hemisphere }> = {
  // Europe
  FR: { continent: 'europe', hemisphere: 'north' },
  CH: { continent: 'europe', hemisphere: 'north' },
  IT: { continent: 'europe', hemisphere: 'north' },
  AT: { continent: 'europe', hemisphere: 'north' },
  ES: { continent: 'europe', hemisphere: 'north' },
  AD: { continent: 'europe', hemisphere: 'north' },
  DE: { continent: 'europe', hemisphere: 'north' },
  NO: { continent: 'europe', hemisphere: 'north' },
  SE: { continent: 'europe', hemisphere: 'north' },
  FI: { continent: 'europe', hemisphere: 'north' },
  BG: { continent: 'europe', hemisphere: 'north' },
  // Asia
  JP: { continent: 'asia', hemisphere: 'north' },
  KR: { continent: 'asia', hemisphere: 'north' },
  // North America
  US: { continent: 'north-america', hemisphere: 'north' },
  CA: { continent: 'north-america', hemisphere: 'north' },
  // Africa (LS + ZA sit south of the equator)
  MA: { continent: 'africa', hemisphere: 'north' },
  DZ: { continent: 'africa', hemisphere: 'north' },
  EG: { continent: 'africa', hemisphere: 'north' },
  LS: { continent: 'africa', hemisphere: 'south' },
  ZA: { continent: 'africa', hemisphere: 'south' },
  // Oceania
  AU: { continent: 'oceania', hemisphere: 'south' },
  NZ: { continent: 'oceania', hemisphere: 'south' },
  // South America
  CL: { continent: 'south-america', hemisphere: 'south' },
  AR: { continent: 'south-america', hemisphere: 'south' },
}

export const isInContinent = (d: Destination, c: Continent) => COUNTRY_META[d.countryCode]?.continent === c
export const isSouthernHemisphere = (d: Destination) => COUNTRY_META[d.countryCode]?.hemisphere === 'south'
export const isEurope = (d: Destination) => isInContinent(d, 'europe')
export const isJapan = (d: Destination) => d.countryCode === 'JP'
export const isUSA = (d: Destination) => d.countryCode === 'US'
export const isCanada = (d: Destination) => d.countryCode === 'CA'
export const isSouthKorea = (d: Destination) => d.countryCode === 'KR'
export const isAustralia = (d: Destination) => d.countryCode === 'AU'
export const isNewZealand = (d: Destination) => d.countryCode === 'NZ'
export const isChile = (d: Destination) => d.countryCode === 'CL'
export const isArgentina = (d: Destination) => d.countryCode === 'AR'
export const isBulgaria = (d: Destination) => d.countryCode === 'BG'
export const isAfrica = (d: Destination) => isInContinent(d, 'africa')

export const COUNTRIES: Country[] = [
  {
    slug: 'france',
    name: 'France',
    countryCode: 'FR',
    flag: '🇫🇷',
    intro: {
      en: 'Nowhere else links so much skiable terrain under one lift pass. Les 3 Vallées, Paradiski and the Espace Killy turn whole valleys into single playgrounds, and the high French resorts hold their snow long after the rest of the Alps have given up.',
      fr: 'Nulle part ailleurs autant de pistes ne se relient sous un même forfait. Les 3 Vallées, Paradiski et l\'Espace Killy transforment des vallées entières en un seul terrain de jeu, et les stations françaises d\'altitude gardent la neige bien après que le reste des Alpes a baissé les bras.',
      es: 'En ningún otro sitio se enlaza tanto terreno esquiable bajo un mismo forfait. Les 3 Vallées, Paradiski y el Espace Killy convierten valles enteros en un solo patio de juego, y las estaciones francesas de altitud conservan la nieve mucho después de que el resto de los Alpes haya tirado la toalla.',
      pt: 'Em mais lado nenhum se liga tanto terreno esquiável sob o mesmo forfait. As 3 Vallées, o Paradiski e o Espace Killy transformam vales inteiros num só recreio, e as estâncias francesas de altitude guardam a neve muito depois de o resto dos Alpes ter desistido.',
      it: 'In nessun altro posto si collegano così tante piste con un solo skipass. Les 3 Vallées, Paradiski e l\'Espace Killy trasformano intere vallate in un unico terreno di gioco, e le località francesi d\'alta quota tengono la neve molto dopo che il resto delle Alpi ha alzato bandiera bianca.',
    },
  },
  {
    slug: 'switzerland',
    name: 'Switzerland',
    countryCode: 'CH',
    flag: '🇨🇭',
    intro: {
      en: 'The postcard version of the Alps: the Matterhorn over Zermatt, car-free villages, grooming you could land a plane on. You pay for it, of course, but nothing else in the range feels quite this polished.',
      fr: 'La version carte postale des Alpes : le Cervin au-dessus de Zermatt, des villages sans voitures, un damage à faire atterrir un avion. Ça se paie, évidemment, mais rien dans le massif n\'a ce niveau de finition.',
      es: 'La versión de postal de los Alpes: el Matterhorn sobre Zermatt, pueblos sin coches, un pisado donde podrías aterrizar un avión. Se paga, claro, pero nada en la cordillera tiene este nivel de acabado.',
      pt: 'A versão de postal dos Alpes: o Matterhorn sobre Zermatt, aldeias sem carros, um pisa-neves onde se poderia aterrar um avião. Paga-se, claro, mas nada na cordilheira tem este nível de acabamento.',
      it: 'La versione cartolina delle Alpi: il Cervino sopra Zermatt, borghi senza auto, una battitura da farci atterrare un aereo. Si paga, certo, ma niente nel massiccio raggiunge questo livello di rifinitura.',
    },
  },
  {
    slug: 'austria',
    name: 'Austria',
    countryCode: 'AT',
    flag: '🇦🇹',
    intro: {
      en: 'This is where alpine skiing was more or less invented, and it still feels that way. Snug villages where you ski back to the door, the Arlberg technique, and an après-ski scene that starts at three in the afternoon and does not ask permission.',
      fr: 'C\'est ici que le ski alpin a plus ou moins été inventé, et ça se sent encore. Des villages douillets où l\'on rentre skis aux pieds, la technique de l\'Arlberg, et un après-ski qui démarre à trois heures de l\'après-midi sans demander la permission.',
      es: 'Aquí es donde se inventó, más o menos, el esquí alpino, y todavía se nota. Pueblos acogedores a los que vuelves esquiando hasta la puerta, la técnica del Arlberg y un après-ski que arranca a las tres de la tarde sin pedir permiso.',
      pt: 'Foi aqui que o esqui alpino mais ou menos nasceu, e ainda se sente. Aldeias acolhedoras a que se regressa de esquis nos pés, a técnica de Arlberg, e um après-ski que começa às três da tarde sem pedir licença.',
      it: 'È qui che lo sci alpino è più o meno nato, e si sente ancora. Borghi accoglienti dove si rientra sci ai piedi, la tecnica dell\'Arlberg, e un après-ski che parte alle tre del pomeriggio senza chiedere permesso.',
    },
  },
  {
    slug: 'italy',
    name: 'Italy',
    countryCode: 'IT',
    flag: '🇮🇹',
    intro: {
      en: 'Skiing the Italian way means a long lunch is non-negotiable. The Dolomiti Superski puts 1,200 km on one pass, Cortina hosts the 2026 Olympics, and the Dolomites turn every chairlift ride into a postcard, all of it cheaper than you would expect.',
      fr: 'Skier à l\'italienne, c\'est admettre qu\'un long déjeuner ne se négocie pas. Le Dolomiti Superski offre 1 200 km sur un seul forfait, Cortina accueille les Jeux 2026, et les Dolomites font de chaque télésiège une carte postale, le tout moins cher qu\'on ne l\'imagine.',
      es: 'Esquiar a la italiana significa que una comida larga no se negocia. El Dolomiti Superski ofrece 1.200 km con un solo forfait, Cortina acoge los Juegos de 2026 y los Dolomitas convierten cada telesilla en una postal, y todo más barato de lo que esperas.',
      pt: 'Esquiar à italiana significa que um almoço demorado não se negoceia. O Dolomiti Superski oferece 1.200 km num só forfait, Cortina acolhe os Jogos de 2026, e as Dolomitas transformam cada teleassento num postal, tudo isto mais barato do que se espera.',
      it: 'Sciare all\'italiana vuol dire che un lungo pranzo non si tratta. Il Dolomiti Superski mette in fila 1.200 km su un solo skipass, Cortina ospita i Giochi 2026 e le Dolomiti trasformano ogni seggiovia in una cartolina, il tutto a prezzi inferiori a quanto ci si aspetta.',
    },
  },
  {
    slug: 'spain',
    name: 'Spain',
    countryCode: 'ES',
    flag: '🇪🇸',
    intro: {
      en: 'The Spanish side of the Pyrenees gets the sun the French side misses, and Spain skis like it: late lunches, later nights. Baqueira-Beret is where the royal family goes; Formigal is where everyone else goes to dance in ski boots.',
      fr: 'Le versant espagnol des Pyrénées récupère le soleil que le versant français rate, et l\'Espagne skie en conséquence : déjeuners tardifs, soirées plus tardives encore. Baqueira-Beret, c\'est là que va la famille royale ; Formigal, là où tous les autres dansent en chaussures de ski.',
      es: 'La vertiente española de los Pirineos se queda con el sol que la francesa pierde, y España esquía en consecuencia: comidas tardías, noches aún más tardías. A Baqueira-Beret va la familia real; a Formigal va todo el mundo a bailar con las botas puestas.',
      pt: 'A vertente espanhola dos Pirenéus fica com o sol que a francesa perde, e a Espanha esquia em conformidade: almoços tardios, noites ainda mais tardias. A Baqueira-Beret vai a família real; a Formigal vai toda a gente dançar de botas de esqui calçadas.',
      it: 'Il versante spagnolo dei Pirenei si prende il sole che quello francese si perde, e la Spagna scia di conseguenza: pranzi tardivi, serate ancora più tardive. A Baqueira-Beret va la famiglia reale; a Formigal va tutti gli altri a ballare con gli scarponi ai piedi.',
    },
  },
  {
    slug: 'andorra',
    name: 'Andorra',
    countryCode: 'AD',
    flag: '🇦🇩',
    intro: {
      en: 'A tiny country that punches far above its size: Grandvalira is the biggest ski domain in the Pyrenees, and the duty-free prices mean you can kit out the whole family and still come home under budget. The easiest place in Europe to learn.',
      fr: 'Un petit pays qui joue très au-dessus de sa taille : Grandvalira est le plus grand domaine des Pyrénées, et les prix détaxés permettent d\'équiper toute la famille en rentrant sous le budget. L\'endroit le plus facile d\'Europe pour apprendre.',
      es: 'Un país diminuto que juega muy por encima de su tamaño: Grandvalira es el mayor dominio de los Pirineos, y los precios libres de impuestos permiten equipar a toda la familia y volver a casa sin pasarse del presupuesto. El sitio más fácil de Europa para aprender.',
      pt: 'Um país minúsculo que joga muito acima do seu tamanho: Grandvalira é o maior domínio dos Pirenéus, e os preços isentos de impostos permitem equipar a família toda e voltar a casa dentro do orçamento. O sítio mais fácil da Europa para aprender.',
      it: 'Un paese minuscolo che gioca molto sopra la sua taglia: Grandvalira è il comprensorio più grande dei Pirenei, e i prezzi duty-free permettono di equipaggiare tutta la famiglia rientrando dentro il budget. Il posto più facile d\'Europa per imparare.',
    },
  },
  {
    slug: 'germany',
    name: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    intro: {
      en: 'Germany packs all its serious skiing into the Bavarian Alps along the Austrian border: Garmisch-Partenkirchen under the Zugspitze, Oberstdorf in the Allgäu, Berchtesgaden over the Königssee. Smaller piste maps than the Tarentaise, but proper alpine terrain, World Cup pedigree and the most beautiful fresco-painted villages in the range.',
      fr: 'L\'Allemagne concentre tout son ski sérieux dans les Alpes bavaroises, le long de la frontière autrichienne : Garmisch-Partenkirchen sous la Zugspitze, Oberstdorf dans l\'Allgäu, Berchtesgaden au-dessus du Königssee. Plans de pistes plus modestes qu\'en Tarentaise, mais du vrai terrain alpin, un palmarès de Coupe du Monde et les plus beaux villages à fresques du massif.',
      es: 'Alemania concentra todo su esquí serio en los Alpes bávaros, a lo largo de la frontera austriaca: Garmisch-Partenkirchen bajo la Zugspitze, Oberstdorf en el Allgäu, Berchtesgaden sobre el Königssee. Mapas de pistas más modestos que los de la Tarentaise, pero terreno alpino de verdad, palmarés de Copa del Mundo y los pueblos pintados con frescos más bellos de la cordillera.',
      pt: 'A Alemanha concentra todo o seu esqui a sério nos Alpes Bávaros, ao longo da fronteira austríaca: Garmisch-Partenkirchen sob a Zugspitze, Oberstdorf no Allgäu, Berchtesgaden sobre o Königssee. Mapas de pistas mais modestos do que os da Tarentaise, mas terreno alpino a sério, um palmarés de Taça do Mundo e as aldeias pintadas a fresco mais bonitas da cordilheira.',
      it: 'La Germania concentra tutto lo sci serio nelle Alpi bavaresi, lungo il confine austriaco: Garmisch-Partenkirchen sotto la Zugspitze, Oberstdorf nell\'Allgäu, Berchtesgaden sopra il Königssee. Mappe piste più modeste di quelle della Tarentaise, ma terreno alpino vero, un palmarès di Coppa del Mondo e i borghi affrescati più belli della catena.',
    },
  },
  {
    slug: 'norway',
    name: 'Norway',
    countryCode: 'NO',
    flag: '🇳🇴',
    intro: {
      en: 'Norway is the snow-sure heart of European skiing: low base altitudes but a Scandinavian climate that delivers November-to-May seasons, family-tested groomers and big-mountain freeride from Trysil to Røldal. Add fjord views from the Voss and Stryn slopes, Northern Lights from the Narvik gondola, and an outdoor culture that treats kids on skis as the norm.',
      fr: "La Norvège est le cœur fiable en neige du ski européen : des altitudes basses, mais un climat scandinave qui garantit des saisons de novembre à mai, des pistes damées à toute épreuve pour les familles et du grand freeride de Trysil à Røldal. Ajoutez la vue sur les fjords depuis Voss et Stryn, les aurores boréales depuis le téléphérique de Narvik et une culture qui considère les enfants à ski comme la norme.",
      es: "Noruega es el corazón fiable en nieve del esquí europeo: altitudes bajas pero un clima escandinavo que asegura temporadas de noviembre a mayo, pistas pisadas para familias y freeride de gran montaña de Trysil a Røldal. Añade vistas a los fiordos desde Voss y Stryn, auroras boreales desde el teleférico de Narvik y una cultura al aire libre que da por hecho que los niños esquían.",
      pt: "A Noruega é o coração fiável em neve do esqui europeu: altitudes baixas mas um clima escandinavo que garante épocas de novembro a maio, pistas pisadas para famílias e freeride de grande montanha de Trysil a Røldal. Junte vistas para os fiordes a partir de Voss e Stryn, auroras boreais desde o teleférico de Narvik e uma cultura ao ar livre que dá como certo que as crianças esquiam.",
      it: "La Norvegia è il cuore sicuro sulla neve dello sci europeo: quote di base basse ma un clima scandinavo che garantisce stagioni da novembre a maggio, piste battute a prova di famiglia e vero freeride di grande montagna da Trysil a Røldal. Aggiungi viste sui fiordi da Voss e Stryn, aurora boreale dalla funivia di Narvik e una cultura all'aria aperta che dà per scontato che i bambini sciino.",
    },
  },
  {
    slug: 'sweden',
    name: 'Sweden',
    countryCode: 'SE',
    flag: '🇸🇪',
    intro: {
      en: 'Sweden is where the Nordic family-ski tradition runs deepest: rounded fjäll instead of jagged peaks, huge linked low-altitude domains like Sälen and Funäsfjällen, a sleeper train to Åre and Riksgränsen above the Arctic Circle for late-spring midnight-sun skiing. Cosy hytte culture, well-organised ski schools and after-ski that knows when to stop.',
      fr: "La Suède, c'est là où la tradition nordique du ski en famille est la plus profonde : des fjäll arrondis plutôt que des pics déchiquetés, d'immenses domaines reliés d'altitude basse comme Sälen et Funäsfjällen, un train de nuit pour Åre et Riksgränsen au-dessus du cercle polaire pour skier sous le soleil de minuit au printemps. Culture des hytte, écoles de ski rodées, et un après-ski qui sait quand s'arrêter.",
      es: "Suecia es donde la tradición nórdica del esquí en familia está más enraizada: fjäll redondeados en vez de picos dentados, enormes dominios enlazados de baja altitud como Sälen y Funäsfjällen, un tren-cama a Åre y Riksgränsen sobre el Círculo Polar Ártico para esquiar bajo el sol de medianoche en primavera. Cultura de las hytte, escuelas de esquí muy rodadas y un après-ski que sabe parar.",
      pt: "A Suécia é onde a tradição nórdica do esqui em família está mais enraizada: fjäll arredondados em vez de picos dentados, enormes domínios ligados de baixa altitude como Sälen e Funäsfjällen, um comboio-cama para Åre e Riksgränsen acima do Círculo Polar Ártico para esquiar sob o sol da meia-noite na primavera. Cultura das hytte, escolas de esqui bem rodadas e um après-ski que sabe parar.",
      it: "La Svezia è dove la tradizione nordica dello sci in famiglia è più radicata: fjäll arrotondati invece di vette frastagliate, enormi comprensori collegati a bassa quota come Sälen e Funäsfjällen, un treno notte per Åre e Riksgränsen sopra il Circolo Polare Artico per sciare sotto il sole di mezzanotte in primavera. Cultura delle hytte, scuole sci collaudate e un après-ski che sa fermarsi.",
    },
  },
  {
    slug: 'finland',
    name: 'Finland',
    countryCode: 'FI',
    flag: '🇫🇮',
    intro: {
      en: 'Finnish Lapland is where you go for the Arctic experience as much as the skiing: log-cabin villages at the foot of low rounded tunturi (fjäll), reindeer herds in the trails, Northern Lights from October to April and an October-to-May ski season at Ruka and Levi. The skiing is gentle and family-shaped; the Lapland brand around it is one of the strongest in winter tourism.',
      fr: "La Laponie finlandaise, c'est autant pour l'expérience arctique que pour le ski : villages de chalets en bois au pied des tunturi (fjäll) arrondis, troupeaux de rennes sur les pistes, aurores boréales d'octobre à avril et une saison d'octobre à mai à Ruka et Levi. Le ski est doux et familial ; la marque Laponie autour, l'une des plus fortes du tourisme d'hiver.",
      es: "La Laponia finlandesa es tanto por la experiencia ártica como por el esquí: pueblos de cabañas de madera al pie de tunturi (fjäll) redondeados, manadas de renos en las pistas, auroras boreales de octubre a abril y una temporada de octubre a mayo en Ruka y Levi. El esquí es suave y familiar; la marca Laponia alrededor, una de las más fuertes del turismo de invierno.",
      pt: "A Lapónia finlandesa é tanto pela experiência ártica como pelo esqui: aldeias de cabanas de madeira ao pé dos tunturi (fjäll) arredondados, manadas de renas nas pistas, auroras boreais de outubro a abril e uma época de outubro a maio em Ruka e Levi. O esqui é suave e familiar; a marca Lapónia à volta, uma das mais fortes do turismo de inverno.",
      it: "La Lapponia finlandese vale tanto per l'esperienza artica quanto per lo sci: borghi di baite di legno ai piedi di tunturi (fjäll) arrotondati, mandrie di renne sulle piste, aurora boreale da ottobre ad aprile e una stagione da ottobre a maggio a Ruka e Levi. Lo sci è dolce e familiare; il marchio Lapponia attorno, uno dei più forti del turismo invernale.",
    },
  },
  {
    slug: 'japan',
    name: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    intro: {
      en: "Japan is the powder skiing capital of the world: a Siberian airmass crossing the Sea of Japan dumps the world's driest, deepest snow on Hokkaido and the Japanese Alps from December through March. Add tree skiing through Hokkaido birches, soak-in-the-snow onsen culture, ryokan ski-towns, and a service standard the Alps cannot match. Niseko leads the international scene, but Nagano, Niigata and Yamagata hide some of the season's most rewarding mountains.",
      fr: "Le Japon est la capitale mondiale du ski de poudreuse : une masse d'air sibérienne qui traverse la mer du Japon dépose la neige la plus sèche et la plus profonde de la planète sur Hokkaido et les Alpes japonaises de décembre à mars. Ajoutez le ski en forêt entre les bouleaux d'Hokkaido, la culture des onsen au milieu de la neige, les ryokan de villages de ski et un niveau de service que les Alpes ne savent pas atteindre. Niseko mène la scène internationale, mais Nagano, Niigata et Yamagata cachent quelques-unes des plus belles montagnes de la saison.",
      es: "Japón es la capital mundial del esquí en polvo: una masa de aire siberiano que cruza el Mar de Japón deja la nieve más seca y profunda del planeta sobre Hokkaido y los Alpes japoneses de diciembre a marzo. Súmale el esquí entre los abedules de Hokkaido, la cultura de los onsen dentro de la nieve, los ryokan de pueblos esquiables y un nivel de servicio que los Alpes no logran igualar. Niseko lidera la escena internacional, pero Nagano, Niigata y Yamagata esconden algunas de las montañas más memorables de la temporada.",
      pt: "O Japão é a capital mundial do esqui em neve fresca: uma massa de ar siberiana que atravessa o Mar do Japão deixa a neve mais seca e profunda do planeta sobre Hokkaido e os Alpes japoneses de dezembro a março. Junte o esqui entre os bétulas de Hokkaido, a cultura dos onsen no meio da neve, os ryokan de aldeias de esqui e um nível de serviço que os Alpes não conseguem igualar. Niseko lidera a cena internacional, mas Nagano, Niigata e Yamagata escondem algumas das montanhas mais marcantes da época.",
      it: "Il Giappone è la capitale mondiale dello sci in polvere: una massa d'aria siberiana che attraversa il Mar del Giappone scarica la neve più asciutta e profonda del pianeta su Hokkaido e sulle Alpi giapponesi da dicembre a marzo. Aggiungi lo sci tra le betulle di Hokkaido, la cultura degli onsen in mezzo alla neve, i ryokan dei villaggi sciistici e uno standard di servizio che le Alpi non sanno eguagliare. Niseko guida la scena internazionale, ma Nagano, Niigata e Yamagata nascondono alcune delle montagne più memorabili della stagione.",
    },
  },
  {
    slug: 'morocco',
    name: 'Morocco',
    countryCode: 'MA',
    flag: '🇲🇦',
    intro: {
      en: 'Morocco runs the largest concentration of African skiing, all in the High Atlas and Middle Atlas south of Marrakech and around Ifrane. Oukaïmeden is the headline act at 2620 m with 7 lifts and Mt Toubkal as a backdrop; Mischliffen, Jbel Habri and Jbel Bou Iblane add Middle Atlas cedar-forest skiing in winter, when snow cooperates. Short seasons, modest pistes, but the only African range that brings together altitude, lift service and a credible base culture.',
      fr: "Le Maroc concentre l'essentiel du ski africain, dans le Haut Atlas et le Moyen Atlas au sud de Marrakech et autour d'Ifrane. Oukaïmeden tient la tête d'affiche à 2620 m avec 7 remontées et le Toubkal en toile de fond ; Mischliffen, Jbel Habri et Jbel Bou Iblane ajoutent le ski dans les forêts de cèdres du Moyen Atlas, quand la neige veut bien. Saisons courtes, pistes modestes, mais la seule chaîne d'Afrique qui réunit altitude, télésièges et culture de station crédible.",
      es: "Marruecos concentra la mayor parte del esquí africano, en el Alto Atlas y el Atlas Medio al sur de Marrakech y alrededor de Ifrane. Oukaïmeden es la cabeza de cartel a 2620 m con 7 remontes y el Toubkal de fondo; Mischliffen, Jbel Habri y Jbel Bou Iblane suman esquí en los cedrales del Atlas Medio, cuando la nieve quiere. Temporadas cortas, pistas modestas, pero la única cordillera de África que junta altitud, telesillas y una cultura de estación creíble.",
      pt: "Marrocos concentra a maior parte do esqui africano, no Alto Atlas e no Atlas Médio a sul de Marraquexe e em redor de Ifrane. Oukaïmeden é o cabeça de cartaz a 2620 m com 7 teleféricos e o Toubkal como cenário; Mischliffen, Jbel Habri e Jbel Bou Iblane somam esqui nos cedrais do Atlas Médio, quando a neve coopera. Épocas curtas, pistas modestas, mas a única cordilheira de África que junta altitude, teleféricos e uma cultura de estância credível.",
      it: "Il Marocco concentra la maggior parte dello sci africano, nell'Alto Atlante e nell'Atlante Medio a sud di Marrakech e attorno a Ifrane. Oukaïmeden è la testa di cartellone a 2620 m con 7 impianti e il Toubkal sullo sfondo; Mischliffen, Jbel Habri e Jbel Bou Iblane aggiungono lo sci tra i cedri dell'Atlante Medio, quando la neve collabora. Stagioni brevi, piste modeste, ma la sola catena africana che mette insieme quota, impianti e una cultura di località credibile.",
    },
  },
  {
    slug: 'algeria',
    name: 'Algeria',
    countryCode: 'DZ',
    flag: '🇩🇿',
    intro: {
      en: 'Algeria runs three modest ski areas across the Atlas Tellien and the Djurdjura National Park, all within driving distance of Algiers. Chréa above Blida is the closest to the capital at 1500 m; Tikjda and Tala-Guilef sit inside the Djurdjura limestone massif of Kabylia. Low altitudes and unreliable seasons keep crowds rare, but the Mediterranean-meets-cedar-forest combination is unlike anywhere else.',
      fr: "L'Algérie compte trois petits domaines skiables dans l'Atlas Tellien et le Parc national du Djurdjura, tous accessibles depuis Alger. Chréa au-dessus de Blida est le plus proche de la capitale à 1500 m ; Tikjda et Tala-Guilef se nichent dans le massif calcaire du Djurdjura, en Kabylie. Faibles altitudes et saisons aléatoires, mais le mélange Méditerranée + cèdraies est unique.",
      es: "Argelia tiene tres pequeñas zonas esquiables en el Atlas Tellien y el Parque Nacional del Djurdjura, todas a poca distancia de Argel. Chréa sobre Blida es la más cercana a la capital a 1500 m; Tikjda y Tala-Guilef se esconden en el macizo calcáreo del Djurdjura, en Cabilia. Altitudes bajas y temporadas inciertas, pero la mezcla Mediterráneo + cedrales es única.",
      pt: "A Argélia tem três pequenos domínios esquiáveis no Atlas Tellien e no Parque Nacional do Djurdjura, todos a curta distância de Argel. Chréa acima de Blida é a mais próxima da capital a 1500 m; Tikjda e Tala-Guilef escondem-se no maciço calcário do Djurdjura, na Cabília. Altitudes baixas e épocas incertas, mas a mistura Mediterrâneo + cedrais é única.",
      it: "L'Algeria conta tre piccoli comprensori sciistici nell'Atlante Telliano e nel Parco Nazionale del Djurdjura, tutti a poca distanza da Algeri. Chréa sopra Blida è la più vicina alla capitale, a 1500 m; Tikjda e Tala-Guilef si annidano nel massiccio calcareo del Djurdjura, in Cabilia. Quote basse e stagioni aleatorie, ma la miscela Mediterraneo + cedrate è unica.",
    },
  },
  {
    slug: 'lesotho',
    name: 'Lesotho',
    countryCode: 'LS',
    flag: '🇱🇸',
    intro: {
      en: 'Lesotho is where southern African skiing lives. Afriski Mountain Resort in the Maluti Mountains has the highest ski base in Africa at 3050 m, snow guns + grooming, a chairlift and a surface lift on a single mile of piste, plus a proper lodge. Southern hemisphere season runs June to August, with mountain biking taking over in the southern summer. The drive in over the Moteng Pass is half the experience.',
      fr: "Le Lesotho, c'est là où le ski d'Afrique australe se joue. Afriski Mountain Resort, dans les Maluti, affiche la base la plus haute d'Afrique à 3050 m, des canons à neige et un damage soignés, un télésiège + un téléski sur un seul kilomètre de piste, et un vrai lodge. Saison de l'hémisphère sud, de juin à août ; en été austral, le VTT prend la relève. La route d'accès par le col de Moteng vaut le détour.",
      es: "Lesoto es donde vive el esquí del África austral. Afriski Mountain Resort, en las Maluti, presume la base más alta de África a 3050 m, cañones de nieve y pisado serios, una silla y un arrastre sobre un solo kilómetro de pista, más un lodge en condiciones. Temporada del hemisferio sur de junio a agosto; en verano austral, manda la bici de montaña. La subida por el paso de Moteng es media experiencia.",
      pt: "O Lesoto é onde o esqui da África austral acontece. O Afriski Mountain Resort, nos Maluti, ostenta a base mais alta de África a 3050 m, canhões de neve e pisão a sério, uma cadeira e um arrasto sobre um único quilómetro de pista, mais um lodge a condizer. Época do hemisfério sul de junho a agosto; no verão austral, manda a BTT. A subida pelo passo de Moteng vale metade da experiência.",
      it: "Il Lesotho è dove lo sci del Sud Africa esiste davvero. Afriski Mountain Resort, sui Monti Maluti, vanta la base più alta d'Africa a 3050 m, cannoni da neve e battitura curati, una seggiovia e uno skilift su un solo chilometro di pista, più un vero lodge. Stagione dell'emisfero sud da giugno ad agosto; in estate australe, comanda la mountain bike. La salita per il passo di Moteng vale metà del viaggio.",
    },
  },
  {
    slug: 'south-africa',
    name: 'South Africa',
    countryCode: 'ZA',
    flag: '🇿🇦',
    intro: {
      en: "South Africa's one operational ski resort, Tiffindell, sits in the Eastern Cape Drakensberg at 2510 m base and a 2782 m summit. A single chairlift, six trails, snow guns to top up reluctant clouds. Closed for several seasons between 2017 and 2022, recently re-opened, with a season that runs June to August. The reward: skiing within reach of Johannesburg and Cape Town, on the only proper South African mountain.",
      fr: "La seule station opérationnelle d'Afrique du Sud, Tiffindell, se niche dans le Drakensberg du Cap-Oriental, base à 2510 m, sommet à 2782 m. Un télésiège, six pistes, des canons à neige pour compléter les nuages paresseux. Fermée plusieurs saisons entre 2017 et 2022, récemment rouverte, saison juin-août. La récompense : skier à portée de Johannesburg et du Cap, sur la seule vraie montagne sud-africaine.",
      es: "La única estación operativa de Sudáfrica, Tiffindell, se asienta en el Drakensberg del Cabo Oriental, con base a 2510 m y cima a 2782 m. Una silla, seis pistas, cañones para completar nubes perezosas. Cerrada varias temporadas entre 2017 y 2022, reabrió hace poco, temporada de junio a agosto. La recompensa: esquiar al alcance de Johannesburgo y Ciudad del Cabo, en la única montaña sudafricana de verdad.",
      pt: "A única estância operacional da África do Sul, Tiffindell, fica no Drakensberg do Cabo Oriental, base a 2510 m e cume a 2782 m. Uma cadeira, seis pistas, canhões para completar nuvens preguiçosas. Fechada várias épocas entre 2017 e 2022, reabriu há pouco, época de junho a agosto. A recompensa: esquiar ao alcance de Joanesburgo e da Cidade do Cabo, na única verdadeira montanha sul-africana.",
      it: "L'unica località operativa del Sudafrica, Tiffindell, si trova sui Drakensberg del Capo Orientale, base a 2510 m e vetta a 2782 m. Una seggiovia, sei piste, cannoni a completare nuvole pigre. Chiusa per diverse stagioni tra 2017 e 2022, riaperta di recente, stagione da giugno ad agosto. Il premio: sciare a portata di Johannesburg e Città del Capo, sulla sola vera montagna sudafricana.",
    },
  },
  {
    slug: 'egypt',
    name: 'Egypt',
    countryCode: 'EG',
    flag: '🇪🇬',
    intro: {
      en: "Egypt's one ski destination sits inside Mall of Egypt in Cairo: Ski Egypt, the only indoor snow slope in Africa. 100 m run, beginner-friendly, snow guns + grooming, penguin encounters, year-round operation at -4 °C. A curiosity for the global ski traveller and the only way to ski in Egypt, with the pyramids 35 km away.",
      fr: "L'unique destination ski d'Égypte se trouve dans le Mall of Egypt au Caire : Ski Egypt, la seule piste indoor d'Afrique. 100 m de pente, débutants en tête, canons et damage, rencontre avec des manchots, ouvert toute l'année à -4 °C. Une curiosité pour le voyageur ski globe-trotter, la seule façon de skier en Égypte, avec les pyramides à 35 km.",
      es: "El único destino de esquí de Egipto está dentro del Mall of Egypt en El Cairo: Ski Egypt, la única pista indoor de África. 100 m de bajada, ideal para principiantes, cañones y pisado, encuentros con pingüinos, abierto todo el año a -4 °C. Una curiosidad para el viajero global del esquí, la única forma de esquiar en Egipto, con las pirámides a 35 km.",
      pt: "O único destino de esqui do Egito está dentro do Mall of Egypt no Cairo: Ski Egypt, a única pista indoor de África. 100 m de pendente, ideal para principiantes, canhões e pisão, encontro com pinguins, aberto todo o ano a -4 °C. Uma curiosidade para o viajante de esqui global, a única forma de esquiar no Egito, com as pirâmides a 35 km.",
      it: "L'unica destinazione di sci dell'Egitto sta dentro il Mall of Egypt al Cairo: Ski Egypt, l'unica pista indoor d'Africa. 100 m di discesa, perfetta per chi inizia, cannoni e battitura, incontro con pinguini, aperta tutto l'anno a -4 °C. Una curiosità per il viaggiatore globale dello sci, la sola via per sciare in Egitto, con le piramidi a 35 km.",
    },
  },
  {
    slug: 'chile',
    name: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱',
    intro: {
      en: "Chile runs the Southern Hemisphere's biggest commercial ski day from the Andes around Santiago. Valle Nevado in the Three Valleys at 3025 m is the highest base in the country, with Tres Valles interconnect to El Colorado and La Parva. Portillo, two hours north, has hosted only Alpine World Championships in the Southern Hemisphere (1966) and trains US + European national teams every August on the cliffs above Laguna del Inca. Southern Hemisphere season runs June to October. The Andes do the work; Santiago is the gateway 1 to 3 hours below.",
      fr: "Le Chili abrite la plus grosse journée de ski commerciale de l'hémisphère sud, dans les Andes autour de Santiago. Valle Nevado, dans les Tres Valles à 3025 m, a la base la plus haute du pays, avec l'interconnexion vers El Colorado et La Parva. Portillo, deux heures plus au nord, a accueilli les seuls Championnats du monde alpins jamais organisés dans l'hémisphère sud (1966) et entraîne chaque août les équipes nationales américaines et européennes sur les falaises au-dessus de la Laguna del Inca. Saison de juin à octobre. Les Andes font le travail ; Santiago est la porte 1 à 3 heures plus bas.",
      es: "Chile aloja el mayor día de esquí comercial del hemisferio sur, en los Andes alrededor de Santiago. Valle Nevado, en los Tres Valles a 3025 m, es la base más alta del país, con interconexión Tres Valles hacia El Colorado y La Parva. Portillo, dos horas más al norte, acogió el único Campeonato Mundial Alpino jamás celebrado en el hemisferio sur (1966) y entrena cada agosto a los equipos nacionales de EE. UU. y Europa sobre los acantilados de la Laguna del Inca. Temporada de junio a octubre. Los Andes ponen el trabajo; Santiago es la puerta a 1 a 3 horas abajo.",
      pt: "O Chile aloja o maior dia de esqui comercial do hemisfério sul, nos Andes em torno de Santiago. Valle Nevado, nos Tres Valles a 3025 m, é a base mais alta do país, com interligação Tres Valles para El Colorado e La Parva. Portillo, duas horas mais a norte, acolheu o único Campeonato Mundial Alpino alguma vez realizado no hemisfério sul (1966) e treina todos os agostos as equipas nacionais dos EUA e da Europa sobre as falésias da Laguna del Inca. Época de junho a outubro. Os Andes fazem o trabalho; Santiago é a porta a 1 a 3 horas abaixo.",
      it: "Il Cile ospita la più grande giornata di sci commerciale dell'emisfero sud, sulle Ande attorno a Santiago. Valle Nevado, nei Tres Valles a 3025 m, è la base più alta del paese, con il collegamento Tres Valles verso El Colorado e La Parva. Portillo, due ore più a nord, ha ospitato gli unici Mondiali di sci alpino mai disputati nell'emisfero sud (1966) e ad agosto allena ogni anno le squadre nazionali di Stati Uniti ed Europa sulle pareti sopra la Laguna del Inca. Stagione da giugno a ottobre. Le Ande fanno il lavoro; Santiago è la porta 1 a 3 ore più in basso.",
    },
  },
  {
    slug: 'bulgaria',
    name: 'Bulgaria',
    countryCode: 'BG',
    flag: '🇧🇬',
    intro: {
      en: "Bulgaria is Europe's best value for skiing: three resorts in three mountain ranges, at a fraction of Alpine prices. Bansko, in the Pirin Mountains, is the biggest and most modern, with a long gondola from a historic town and lively nightlife. Borovets, the country's oldest resort, sits below Musala in the Rila Mountains, an easy trip from Sofia. Pamporovo, the sunniest and most southerly major resort in Europe, has gentle pine-lined runs ideal for beginners. The season runs roughly December to April.",
      fr: "La Bulgarie offre le meilleur rapport qualité-prix du ski en Europe : trois stations dans trois massifs, à une fraction des tarifs alpins. Bansko, dans le Pirin, est la plus grande et la plus moderne, avec une longue télécabine au départ d'une vieille ville et une vie nocturne animée. Borovets, la plus ancienne station du pays, se niche sous le Musala dans le Rila, tout près de Sofia. Pamporovo, la station majeure la plus ensoleillée et la plus méridionale d'Europe, déroule des pistes douces entre les pins, idéales pour débuter. Saison de décembre à avril environ.",
      es: "Bulgaria ofrece la mejor relación calidad-precio para esquiar en Europa: tres estaciones en tres macizos, a una fracción de los precios alpinos. Bansko, en los montes Pirin, es la más grande y moderna, con una larga telecabina desde un casco antiguo y vida nocturna animada. Borovets, la estación más antigua del país, se asienta bajo el Musala en los montes Rila, muy cerca de Sofía. Pamporovo, la estación importante más soleada y meridional de Europa, ofrece pistas suaves entre pinos, ideales para principiantes. La temporada va de diciembre a abril aproximadamente.",
      pt: "A Bulgária oferece a melhor relação qualidade-preço para esquiar na Europa: três estâncias em três maciços, por uma fração dos preços alpinos. Bansko, nos montes Pirin, é a maior e mais moderna, com um longo teleférico a partir de uma cidade histórica e vida noturna animada. Borovets, a estância mais antiga do país, fica sob o Musala nos montes Rila, muito perto de Sófia. Pamporovo, a maior estância mais soalheira e meridional da Europa, tem pistas suaves entre pinheiros, ideais para principiantes. A época vai sensivelmente de dezembro a abril.",
      it: "La Bulgaria offre il miglior rapporto qualità-prezzo per sciare in Europa: tre località in tre catene montuose, a una frazione dei prezzi alpini. Bansko, nei monti Pirin, è la più grande e moderna, con una lunga cabinovia da una città storica e una vivace vita notturna. Borovets, la località più antica del paese, sorge sotto il Musala nei monti Rila, a due passi da Sofia. Pamporovo, la principale località più soleggiata e meridionale d'Europa, offre piste dolci tra i pini, ideali per principianti. La stagione va all'incirca da dicembre ad aprile.",
    },
  },
  {
    slug: 'argentina',
    name: 'Argentina',
    countryCode: 'AR',
    flag: '🇦🇷',
    intro: {
      en: "Argentina's ski resorts run down the Andes from Mendoza to the far south of Patagonia. Cerro Catedral, above Bariloche and Lago Nahuel Huapi, is the largest ski area in South America, while Las Leñas in Mendoza is the continent's reference for steep, high-altitude off-piste. Far to the south, Cerro Castor near Ushuaia is the southernmost ski resort on earth, with one of the longest seasons going. The Southern Hemisphere season runs roughly June to October.",
      fr: "Les stations argentines descendent les Andes, de Mendoza jusqu'au grand sud de la Patagonie. Cerro Catedral, au-dessus de Bariloche et du Lago Nahuel Huapi, est le plus grand domaine d'Amérique du Sud, tandis que Las Leñas, à Mendoza, est la référence du continent pour le hors-piste raide et d'altitude. Tout au sud, Cerro Castor, près d'Ushuaia, est la station la plus australe du monde, avec l'une des plus longues saisons qui soient. La saison de l'hémisphère sud va environ de juin à octobre.",
      es: "Las estaciones argentinas bajan por los Andes, de Mendoza hasta el extremo sur de la Patagonia. Cerro Catedral, sobre Bariloche y el Lago Nahuel Huapi, es el mayor dominio esquiable de Sudamérica, mientras que Las Leñas, en Mendoza, es la referencia del continente para el fuera de pista empinado y de altura. En el extremo sur, Cerro Castor, cerca de Ushuaia, es la estación más austral del mundo, con una de las temporadas más largas que existen. La temporada del hemisferio sur va aproximadamente de junio a octubre.",
      pt: "As estâncias argentinas descem os Andes, de Mendoza até ao extremo sul da Patagónia. O Cerro Catedral, acima de Bariloche e do Lago Nahuel Huapi, é o maior domínio esquiável da América do Sul, enquanto Las Leñas, em Mendoza, é a referência do continente para o fora de pista íngreme e de altitude. Bem a sul, o Cerro Castor, perto de Ushuaia, é a estância mais austral do mundo, com uma das épocas mais longas que há. A época do hemisfério sul vai sensivelmente de junho a outubro.",
      it: "Le località argentine scendono lungo le Ande, da Mendoza fino all'estremo sud della Patagonia. Il Cerro Catedral, sopra Bariloche e il Lago Nahuel Huapi, è il più grande comprensorio del Sud America, mentre Las Leñas, a Mendoza, è il riferimento del continente per il fuoripista ripido e d'alta quota. Nell'estremo sud, il Cerro Castor, vicino a Ushuaia, è la località più australe del mondo, con una delle stagioni più lunghe in assoluto. La stagione dell'emisfero sud va all'incirca da giugno a ottobre.",
    },
  },
  {
    slug: 'australia',
    name: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    intro: {
      en: "Australian skiing lives in two ranges: the Snowy Mountains of New South Wales (Perisher, Thredbo) and the Victorian Alps (Falls Creek, Mt Hotham, Mt Buller). Modest altitudes (the tops are 1700-2050 m), heavy snowmaking, and snow gum eucalyptus forests that give the runs an identity unlike anywhere in the Northern Hemisphere. Southern hemisphere season runs Jun to Sep, often well into the September school holidays. Plus the largest lift count in the Southern Hemisphere (Perisher's 47).",
      fr: "Le ski australien tient sur deux chaînes : les Snowy Mountains en Nouvelle-Galles du Sud (Perisher, Thredbo) et les Alpes victoriennes (Falls Creek, Mt Hotham, Mt Buller). Des altitudes modestes (les sommets entre 1700 et 2050 m), une forte production de neige et des forêts de snow gum (eucalyptus) qui donnent aux pistes une identité unique au monde. Saison de l'hémisphère sud de juin à septembre, souvent jusque dans les vacances scolaires de septembre. Plus grand parc de remontées de l'hémisphère sud (47 à Perisher).",
      es: "El esquí australiano vive en dos cordilleras: las Snowy Mountains de Nueva Gales del Sur (Perisher, Thredbo) y los Alpes victorianos (Falls Creek, Mt Hotham, Mt Buller). Altitudes modestas (las cimas entre 1700 y 2050 m), gran producción de nieve, y bosques de snow gum (eucaliptos alpinos) que dan a las pistas una identidad única en el mundo. Temporada del hemisferio sur de junio a septiembre, a menudo hasta las vacaciones escolares de septiembre. La mayor flota de remontes del hemisferio sur (47 en Perisher).",
      pt: "O esqui australiano vive em duas cordilheiras: as Snowy Mountains de Nova Gales do Sul (Perisher, Thredbo) e os Alpes Victorianos (Falls Creek, Mt Hotham, Mt Buller). Altitudes modestas (os cumes entre 1700 e 2050 m), forte produção de neve, e florestas de snow gum (eucaliptos alpinos) que dão às pistas uma identidade única no mundo. Época do hemisfério sul de junho a setembro, muitas vezes até às férias escolares de setembro. A maior frota de teleféricos do hemisfério sul (47 em Perisher).",
      it: "Lo sci australiano vive su due catene: le Snowy Mountains del Nuovo Galles del Sud (Perisher, Thredbo) e le Alpi Victoriane (Falls Creek, Mt Hotham, Mt Buller). Quote modeste (le cime tra 1700 e 2050 m), forte innevamento artificiale, e foreste di snow gum (eucalipti alpini) che danno alle piste un'identità unica al mondo. Stagione dell'emisfero sud da giugno a settembre, spesso fino alle vacanze scolastiche di settembre. Il maggior numero di impianti dell'emisfero sud (47 a Perisher).",
    },
  },
  {
    slug: 'new-zealand',
    name: 'New Zealand',
    countryCode: 'NZ',
    flag: '🇳🇿',
    intro: {
      en: "New Zealand skis from June into October across the Southern Alps. Around Wanaka, Cardrona and Treble Cone trade family freestyle against expert freeride; around Queenstown, Coronet Peak runs the casino-and-night-ski circuit while The Remarkables names itself for the jagged peaks above Lake Wakatipu. Further north on the South Island, Mt Hutt above Methven runs the longest season in the country. Almost none of these resorts have ski-in/ski-out lodging: you stay in the lakeside towns and commute up daily.",
      fr: "La Nouvelle-Zélande skie de juin à octobre dans les Alpes du Sud. Autour de Wanaka, Cardrona et Treble Cone partagent le freestyle familial et le freeride expert ; autour de Queenstown, Coronet Peak tient le circuit du casino et du ski de nuit, et les Remarkables se nomment d'après les pics dentelés au-dessus du lac Wakatipu. Plus au nord sur l'île du Sud, Mt Hutt au-dessus de Methven tient la saison la plus longue du pays. Quasiment aucune station n'offre de ski-in/ski-out : on dort dans les villes au bord du lac et on monte chaque jour.",
      es: "Nueva Zelanda esquía de junio a octubre en los Alpes del Sur. Cerca de Wanaka, Cardrona y Treble Cone se reparten el freestyle familiar y el freeride experto; cerca de Queenstown, Coronet Peak tiene el circuito de casino y esquí nocturno, y los Remarkables toman su nombre de las cimas dentadas sobre el lago Wakatipu. Más al norte en la Isla Sur, Mt Hutt sobre Methven tiene la temporada más larga del país. Casi ninguna estación ofrece ski-in/ski-out: se duerme en los pueblos junto al lago y se sube cada día.",
      pt: "A Nova Zelândia esquia de junho a outubro nos Alpes do Sul. Perto de Wanaka, Cardrona e Treble Cone repartem o freestyle familiar e o freeride para experts; perto de Queenstown, Coronet Peak tem o circuito do casino e do esqui noturno, e os Remarkables ganham o nome dos picos serrilhados sobre o lago Wakatipu. Mais a norte na Ilha do Sul, Mt Hutt acima de Methven tem a época mais longa do país. Quase nenhuma estância oferece ski-in/ski-out: dorme-se nas vilas à beira-lago e sobe-se todos os dias.",
      it: "La Nuova Zelanda scia da giugno a ottobre sulle Alpi del Sud. Intorno a Wanaka, Cardrona e Treble Cone si dividono il freestyle familiare e il freeride da esperti; intorno a Queenstown, Coronet Peak tiene il circuito del casinò e dello sci notturno, e i Remarkables prendono il nome dalle vette frastagliate sopra il lago Wakatipu. Più a nord sull'Isola del Sud, Mt Hutt sopra Methven tiene la stagione più lunga del paese. Quasi nessuna località offre ski-in/ski-out: si dorme nei paesi sul lago e si sale ogni giorno.",
    },
  },
  {
    slug: 'south-korea',
    name: 'South Korea',
    countryCode: 'KR',
    flag: '🇰🇷',
    intro: {
      en: "South Korean skiing is short, social, and surprisingly efficient. The PyeongChang region in Gangwon hosted the 2018 Winter Olympics and runs the headline acts: Yongpyong (alpine venue), Phoenix Pyeongchang (freestyle), Alpensia (ski jump) and High1 down in Jeongseon. Closer to Seoul, Vivaldi Park, Konjiam and Oak Valley pack day-trippers in for night skiing under stadium lights. Further south, Muju Deogyusan offers Korea's highest skiable peak at 1614 m. Heavy snowmaking, lifts running into the small hours, KTX trains to the door.",
      fr: "Le ski sud-coréen est court, social et étonnamment bien rodé. La région de PyeongChang, dans le Gangwon, a accueilli les Jeux d'hiver 2018 et abrite les têtes d'affiche : Yongpyong (alpin), Phoenix Pyeongchang (freestyle), Alpensia (saut à ski) et High1 plus bas à Jeongseon. Plus près de Séoul, Vivaldi Park, Konjiam et Oak Valley accueillent les excursionnistes pour le ski de nuit sous des projecteurs de stade. Plus au sud, Muju Deogyusan offre le plus haut sommet skiable de Corée à 1614 m. Forte production de neige de culture, remontées qui tournent tard, train rapide KTX jusqu'à la porte.",
      es: "El esquí surcoreano es corto, social y sorprendentemente eficiente. La región de PyeongChang en Gangwon acogió los Juegos de Invierno 2018 y reúne a las cabezas de cartel: Yongpyong (alpino), Phoenix Pyeongchang (freestyle), Alpensia (saltos) y High1 más abajo en Jeongseon. Más cerca de Seúl, Vivaldi Park, Konjiam y Oak Valley llenan de visitantes de día para esquí nocturno bajo focos de estadio. Más al sur, Muju Deogyusan ofrece la cima esquiable más alta de Corea a 1614 m. Producción de nieve intensa, remontes hasta tarde, KTX a la puerta.",
      pt: "O esqui sul-coreano é curto, social e surpreendentemente eficiente. A região de PyeongChang em Gangwon acolheu os Jogos de Inverno de 2018 e reúne os cabeças de cartaz: Yongpyong (alpino), Phoenix Pyeongchang (freestyle), Alpensia (saltos) e High1 mais abaixo em Jeongseon. Mais perto de Seul, Vivaldi Park, Konjiam e Oak Valley enchem-se de visitantes de dia para esqui noturno sob holofotes de estádio. Mais a sul, Muju Deogyusan oferece o pico esquiável mais alto da Coreia a 1614 m. Forte produção de neve artificial, teleféricos a funcionar até tarde, comboios KTX à porta.",
      it: "Lo sci sudcoreano è breve, sociale e sorprendentemente efficiente. La regione di PyeongChang nel Gangwon ha ospitato i Giochi invernali 2018 e raccoglie le teste di cartellone: Yongpyong (alpino), Phoenix Pyeongchang (freestyle), Alpensia (salti) e High1 più in basso a Jeongseon. Più vicino a Seoul, Vivaldi Park, Konjiam e Oak Valley si riempiono di visitatori giornalieri per lo sci notturno sotto luci da stadio. Più a sud, Muju Deogyusan offre la cima sciabile più alta di Corea a 1614 m. Forte innevamento artificiale, impianti fino a tardi, treni KTX alla porta.",
    },
  },
  {
    slug: 'canada',
    name: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    intro: {
      en: "Canada runs two utterly different ski countries on one passport. The West is big-mountain skiing in its purest form: Whistler Blackcomb on the Pacific Coast, the Banff Park trio of Sunshine + Lake Louise + Marmot, the steep alpine of Kicking Horse and Revelstoke, the snowy interior of Big White and Sun Peaks. The East runs colder, smaller, and tougher: Tremblant's pedestrian village and Mont-Sainte-Anne's St-Lawrence views in the Laurentides. Long seasons either side, often into May.",
      fr: "Le Canada fait tenir deux pays de ski radicalement différents sur un seul passeport. L'Ouest, c'est le ski de grande montagne dans sa version la plus pure : Whistler Blackcomb sur la côte Pacifique, le trio du parc de Banff (Sunshine + Lake Louise + Marmot), l'alpin raide de Kicking Horse et Revelstoke, l'intérieur enneigé de Big White et Sun Peaks. L'Est est plus froid, plus petit, plus rude : le village piéton de Tremblant et les vues sur le Saint-Laurent du Mont-Sainte-Anne dans les Laurentides. Saisons longues des deux côtés, souvent jusqu'en mai.",
      es: "Canadá hace caber dos países de esquí radicalmente distintos en un solo pasaporte. El Oeste es esquí de gran montaña en estado puro: Whistler Blackcomb en la costa del Pacífico, el trío del parque de Banff (Sunshine + Lake Louise + Marmot), el alpino empinado de Kicking Horse y Revelstoke, el interior nevado de Big White y Sun Peaks. El Este corre más frío, más pequeño, más duro: el pueblo peatonal de Tremblant y las vistas al San Lorenzo de Mont-Sainte-Anne en las Laurentides. Temporadas largas en ambos lados, a menudo hasta mayo.",
      pt: "O Canadá faz caber dois países de esqui radicalmente diferentes num só passaporte. O Oeste é esqui de grande montanha em estado puro: Whistler Blackcomb na costa do Pacífico, o trio do parque de Banff (Sunshine + Lake Louise + Marmot), o alpino íngreme de Kicking Horse e Revelstoke, o interior nevado de Big White e Sun Peaks. O Leste corre mais frio, mais pequeno, mais duro: a vila pedonal de Tremblant e as vistas para o São Lourenço do Mont-Sainte-Anne nas Laurentides. Épocas longas dos dois lados, frequentemente até maio.",
      it: "Il Canada fa stare due paesi sciistici radicalmente diversi in un solo passaporto. L'Ovest è sci di grande montagna allo stato puro: Whistler Blackcomb sulla costa del Pacifico, il trio del parco di Banff (Sunshine + Lake Louise + Marmot), l'alpino ripido di Kicking Horse e Revelstoke, l'interno innevato di Big White e Sun Peaks. L'Est corre più freddo, più piccolo, più ruvido: il villaggio pedonale di Tremblant e le viste sul San Lorenzo del Mont-Sainte-Anne nelle Laurentides. Stagioni lunghe da entrambe le parti, spesso fino a maggio.",
    },
  },
  {
    slug: 'united-states',
    name: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    intro: {
      en: "The United States runs the world's biggest ski market, and the variety is the point: Colorado's high-altitude Rockies cluster (Vail, Aspen, Breckenridge, Telluride), Utah's powder-hammered Wasatch (Snowbird, Alta, Park City), California's Sierra Nevada (Mammoth, Palisades Tahoe, Heavenly), the wild expert terrain of Jackson Hole and Big Sky, and the rugged charm of Vermont's Green Mountains. Add Sun Valley's vintage, Taos' desert powder and Whitefish's value, and the picture spans nine months of season, six time zones and twenty distinct ski cultures.",
      fr: "Les États-Unis pilotent le plus grand marché de ski au monde, et c'est la diversité qui fait tout : le cluster d'altitude des Rocheuses du Colorado (Vail, Aspen, Breckenridge, Telluride), le Wasatch tapissé de poudreuse de l'Utah (Snowbird, Alta, Park City), la Sierra Nevada californienne (Mammoth, Palisades Tahoe, Heavenly), le terrain sauvage de Jackson Hole et de Big Sky, et le charme rugueux des Green Mountains du Vermont. Ajoutez le millésime de Sun Valley, la neige du désert à Taos et le rapport qualité-prix de Whitefish, et vous obtenez neuf mois de saison, six fuseaux horaires et vingt cultures de ski distinctes.",
      es: "Estados Unidos lidera el mayor mercado de esquí del mundo, y la variedad es el punto: el clúster de altura de las Rocosas de Colorado (Vail, Aspen, Breckenridge, Telluride), el Wasatch de Utah martilleado por la nieve polvo (Snowbird, Alta, Park City), la Sierra Nevada californiana (Mammoth, Palisades Tahoe, Heavenly), el terreno salvaje y experto de Jackson Hole y Big Sky, y el encanto rudo de las Green Mountains de Vermont. Súmale el vintage de Sun Valley, la nieve de desierto de Taos y la relación calidad-precio de Whitefish, y el panorama abarca nueve meses de temporada, seis husos horarios y veinte culturas de esquí distintas.",
      pt: "Os Estados Unidos lideram o maior mercado de esqui do mundo, e a variedade é o ponto: o agrupamento de altitude das Rochosas do Colorado (Vail, Aspen, Breckenridge, Telluride), o Wasatch do Utah martelado pela neve em pó (Snowbird, Alta, Park City), a Sierra Nevada californiana (Mammoth, Palisades Tahoe, Heavenly), o terreno selvagem de Jackson Hole e Big Sky, e o charme rude das Green Mountains do Vermont. Junte o vintage de Sun Valley, a neve do deserto em Taos e a relação qualidade-preço de Whitefish, e o panorama abrange nove meses de época, seis fusos horários e vinte culturas de esqui distintas.",
      it: "Gli Stati Uniti guidano il più grande mercato sciistico al mondo, e la varietà è il punto: il cluster d'alta quota delle Rocciose del Colorado (Vail, Aspen, Breckenridge, Telluride), il Wasatch dello Utah martellato dalla polvere (Snowbird, Alta, Park City), la Sierra Nevada californiana (Mammoth, Palisades Tahoe, Heavenly), il terreno selvaggio di Jackson Hole e Big Sky, e il fascino ruvido delle Green Mountains del Vermont. Aggiungi il vintage di Sun Valley, la polvere del deserto di Taos e il rapporto qualità-prezzo di Whitefish, e il quadro copre nove mesi di stagione, sei fusi orari e venti culture sciistiche distinte.",
    },
  },
]

export function getCountry(slug: string): Country | undefined {
  return COUNTRIES.find((c) => c.slug === slug)
}
