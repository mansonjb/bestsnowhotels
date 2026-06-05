import type { Locale } from '@/app/[locale]/dictionaries'

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
]

export function getCountry(slug: string): Country | undefined {
  return COUNTRIES.find((c) => c.slug === slug)
}
