import type { Locale } from '@/app/[locale]/dictionaries'
import type { Destination } from './destinations'
import { destinations } from './destinations'
import { skiInSkiOutTier, isCarFree } from './skiInSkiOut'
import { isSouthernHemisphere } from './countries'
import { formatSeasonDate } from './dates'

/**
 * "Things to know before you go" guide content, generated 100% from each
 * resort's real data fields (altitude, snow score, season, piste mix, our
 * ski-in/ski-out classification, vibe tags). No prices, no specific dates, no
 * invented facts: every answer is something we can stand behind. Returns a set
 * of question/answer points (also emitted as FAQPage JSON-LD on the page).
 *
 * Pilot scope: the flagship resorts below. Adding a slug here publishes its
 * guide automatically (the resort must exist in destinations.json with hotels).
 */
export const GUIDE_SLUGS = [
  'val-thorens',
  'chamonix',
  'courchevel',
  'val-d-isere',
  'zermatt',
  'verbier',
  'st-moritz',
  'st-anton',
  'niseko',
  'whistler-blackcomb',
] as const

export interface GuidePoint {
  q: string
  a: string
}

/* ---- data bands (kept local so the guide is a pure function of the data) ---- */

const MONTH_NUM: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
}
function dayOfYear(s: string): number | null {
  const m = s.match(/^([A-Za-z]{3})\s+(\d{1,2})$/)
  if (!m) return null
  const month = MONTH_NUM[m[1]]
  if (!month) return null
  const cumulative = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  return cumulative[month - 1] + parseInt(m[2], 10)
}
function seasonWeeks(d: Destination): number | null {
  if (d.seasonStart === 'All year' || d.seasonEnd === 'All year') return null
  const start = dayOfYear(d.seasonStart)
  const end = dayOfYear(d.seasonEnd)
  if (start == null || end == null) return null
  const days = end >= start ? end - start : 365 - start + end
  return Math.max(1, Math.round(days / 7))
}

type Snow = 'elite' | 'reliable' | 'decent' | 'low'
function snowBand(d: Destination): Snow {
  if (d.snowScore >= 90) return 'elite'
  if (d.snowScore >= 80) return 'reliable'
  if (d.snowScore >= 65) return 'decent'
  return 'low'
}
type Size = 'huge' | 'big' | 'mid' | 'compact'
function sizeBand(d: Destination): Size {
  if (d.pistesKm >= 250) return 'huge'
  if (d.pistesKm >= 120) return 'big'
  if (d.pistesKm >= 50) return 'mid'
  return 'compact'
}
type Profile = 'beginner' | 'balanced' | 'expert'
function terrainProfile(d: Destination): Profile {
  const c = d.pisteCounts
  const total = c.green + c.blue + c.red + c.black
  if (total === 0) return 'balanced'
  if (c.black / total >= 0.38) return 'expert'
  if ((c.green + c.blue) / total >= 0.62) return 'beginner'
  return 'balanced'
}

// Altitudes (<=4 digits) and piste km read clearly with no thousands separator,
// which also avoids the "2,300" reading as a decimal in fr/es/pt/it.
const km = (n: number) => String(n)

/* ---- questions ---- */

const Q = {
  snow: {
    en: (d: Destination) => `Is the snow reliable in ${d.name}?`,
    fr: (d: Destination) => `L'enneigement est-il fiable à ${d.name} ?`,
    es: (d: Destination) => `¿La nieve es fiable en ${d.name}?`,
    pt: (d: Destination) => `A neve é fiável em ${d.name}?`,
    it: (d: Destination) => `La neve è affidabile a ${d.name}?`,
  },
  access: {
    en: () => `Do you need a car, or can you ski in and out?`,
    fr: () => `Faut-il une voiture, ou peut-on skier au pied ?`,
    es: () => `¿Hace falta coche o se puede esquiar a pie de pista?`,
    pt: () => `É preciso carro ou pode esquiar à porta?`,
    it: () => `Serve l'auto o si scia ai piedi?`,
  },
  mountain: {
    en: () => `How big is the ski area, and who is it for?`,
    fr: () => `Quelle est la taille du domaine, et pour qui ?`,
    es: () => `¿Cómo de grande es el dominio y para quién es?`,
    pt: () => `Qual o tamanho do domínio e para quem é?`,
    it: () => `Quanto è grande il comprensorio e per chi è?`,
  },
  vibe: {
    en: () => `What is the resort like?`,
    fr: () => `Quelle est l'ambiance de la station ?`,
    es: () => `¿Cómo es el ambiente de la estación?`,
    pt: () => `Qual é o ambiente da estância?`,
    it: () => `Com'è l'atmosfera della località?`,
  },
  when: {
    en: () => `When is the best time to go?`,
    fr: () => `Quelle est la meilleure période pour y aller ?`,
    es: () => `¿Cuál es la mejor época para ir?`,
    pt: () => `Qual é a melhor altura para ir?`,
    it: () => `Qual è il periodo migliore per andare?`,
  },
}

/* ---- answers ---- */

const SNOW_A: Record<Snow, Record<Locale, (d: Destination) => string>> = {
  elite: {
    en: (d) => `Yes. The base sits at ${km(d.altitudeBase)} m and the top reaches ${km(d.altitudeSummit)} m, which puts snow reliability among the very best on our index (score ${d.snowScore}/100).`,
    fr: (d) => `Oui. La base est à ${km(d.altitudeBase)} m et le sommet atteint ${km(d.altitudeSummit)} m, ce qui place la fiabilité de l'enneigement parmi les toutes meilleures de notre index (score ${d.snowScore}/100).`,
    es: (d) => `Sí. La base está a ${km(d.altitudeBase)} m y la cima llega a ${km(d.altitudeSummit)} m, lo que sitúa la fiabilidad de la nieve entre las mejores de nuestro índice (puntuación ${d.snowScore}/100).`,
    pt: (d) => `Sim. A base fica a ${km(d.altitudeBase)} m e o topo chega a ${km(d.altitudeSummit)} m, o que coloca a fiabilidade da neve entre as melhores do nosso índice (pontuação ${d.snowScore}/100).`,
    it: (d) => `Sì. La base è a ${km(d.altitudeBase)} m e la cima raggiunge ${km(d.altitudeSummit)} m, il che mette l'affidabilità della neve tra le migliori del nostro indice (punteggio ${d.snowScore}/100).`,
  },
  reliable: {
    en: (d) => `Generally yes. From ${km(d.altitudeBase)} m at the base to ${km(d.altitudeSummit)} m up top, the profile holds snow well across a normal winter (score ${d.snowScore}/100).`,
    fr: (d) => `En général oui. De ${km(d.altitudeBase)} m en bas à ${km(d.altitudeSummit)} m en haut, le profil tient bien la neige sur un hiver normal (score ${d.snowScore}/100).`,
    es: (d) => `En general sí. De ${km(d.altitudeBase)} m en la base a ${km(d.altitudeSummit)} m arriba, el perfil aguanta bien la nieve en un invierno normal (puntuación ${d.snowScore}/100).`,
    pt: (d) => `Em geral sim. De ${km(d.altitudeBase)} m na base a ${km(d.altitudeSummit)} m no topo, o perfil segura bem a neve num inverno normal (pontuação ${d.snowScore}/100).`,
    it: (d) => `In genere sì. Da ${km(d.altitudeBase)} m alla base a ${km(d.altitudeSummit)} m in cima, il profilo tiene bene la neve in un inverno normale (punteggio ${d.snowScore}/100).`,
  },
  decent: {
    en: (d) => `Usually, with help. From ${km(d.altitudeBase)} m to ${km(d.altitudeSummit)} m the resort leans on grooming and snowmaking in lean spells, so check the live report before booking early or late dates (score ${d.snowScore}/100).`,
    fr: (d) => `Le plus souvent, avec un coup de pouce. De ${km(d.altitudeBase)} m à ${km(d.altitudeSummit)} m, la station s'appuie sur le damage et la neige de culture lors des passages maigres ; vérifiez le bulletin en direct pour les dates de début ou fin de saison (score ${d.snowScore}/100).`,
    es: (d) => `Casi siempre, con ayuda. De ${km(d.altitudeBase)} m a ${km(d.altitudeSummit)} m la estación se apoya en el pisado y la nieve de cultivo en los tramos flojos; consulta el parte en directo para fechas tempranas o tardías (puntuación ${d.snowScore}/100).`,
    pt: (d) => `Quase sempre, com ajuda. De ${km(d.altitudeBase)} m a ${km(d.altitudeSummit)} m a estância apoia-se no pisão e na neve artificial nos períodos fracos; veja o boletim em direto para datas no início ou fim da época (pontuação ${d.snowScore}/100).`,
    it: (d) => `Quasi sempre, con un aiuto. Da ${km(d.altitudeBase)} m a ${km(d.altitudeSummit)} m la località si appoggia su battitura e neve programmata nei periodi magri; controlla il bollettino in tempo reale per date a inizio o fine stagione (punteggio ${d.snowScore}/100).`,
  },
  low: {
    en: (d) => `It depends on conditions. At ${km(d.altitudeBase)} m to ${km(d.altitudeSummit)} m this is a lower-altitude resort, so lean on the live snow report and stay flexible on dates (score ${d.snowScore}/100).`,
    fr: (d) => `Cela dépend des conditions. Entre ${km(d.altitudeBase)} m et ${km(d.altitudeSummit)} m, c'est une station de plus basse altitude : fiez-vous au bulletin neige en direct et gardez de la souplesse sur les dates (score ${d.snowScore}/100).`,
    es: (d) => `Depende de las condiciones. Entre ${km(d.altitudeBase)} m y ${km(d.altitudeSummit)} m es una estación de menor altitud: apóyate en el parte de nieve en directo y mantén flexibilidad en las fechas (puntuación ${d.snowScore}/100).`,
    pt: (d) => `Depende das condições. Entre ${km(d.altitudeBase)} m e ${km(d.altitudeSummit)} m é uma estância de menor altitude: confie no boletim de neve em direto e mantenha flexibilidade nas datas (pontuação ${d.snowScore}/100).`,
    it: (d) => `Dipende dalle condizioni. Tra ${km(d.altitudeBase)} m e ${km(d.altitudeSummit)} m è una località di quota più bassa: affidati al bollettino neve in tempo reale e resta flessibile sulle date (punteggio ${d.snowScore}/100).`,
  },
}

const SIZE_A: Record<Size, Record<Locale, (d: Destination) => string>> = {
  huge: {
    en: (d) => `It is one of the bigger domains on the site: ${km(d.pistesKm)} km of piste on ${d.lifts} lifts, enough to ski a different sector every day of the week.`,
    fr: (d) => `C'est l'un des grands domaines du site : ${km(d.pistesKm)} km de pistes sur ${d.lifts} remontées, de quoi changer de secteur chaque jour de la semaine.`,
    es: (d) => `Es uno de los dominios grandes del sitio: ${km(d.pistesKm)} km de pistas en ${d.lifts} remontes, suficiente para esquiar un sector distinto cada día.`,
    pt: (d) => `É um dos grandes domínios do site: ${km(d.pistesKm)} km de pistas em ${d.lifts} teleféricos, suficiente para esquiar um setor diferente por dia.`,
    it: (d) => `È uno dei grandi comprensori del sito: ${km(d.pistesKm)} km di piste su ${d.lifts} impianti, abbastanza per sciare un settore diverso ogni giorno.`,
  },
  big: {
    en: (d) => `At ${km(d.pistesKm)} km of piste on ${d.lifts} lifts, it is a substantial mountain that rewards a multi-day stay.`,
    fr: (d) => `Avec ${km(d.pistesKm)} km de pistes sur ${d.lifts} remontées, c'est une montagne consistante qui mérite un séjour de plusieurs jours.`,
    es: (d) => `Con ${km(d.pistesKm)} km de pistas en ${d.lifts} remontes, es una montaña de peso que justifica una estancia de varios días.`,
    pt: (d) => `Com ${km(d.pistesKm)} km de pistas em ${d.lifts} teleféricos, é uma montanha consistente que justifica uma estadia de vários dias.`,
    it: (d) => `Con ${km(d.pistesKm)} km di piste su ${d.lifts} impianti, è una montagna sostanziosa che merita un soggiorno di più giorni.`,
  },
  mid: {
    en: (d) => `With ${km(d.pistesKm)} km of piste on ${d.lifts} lifts, it is a mid-size area, easy to get to know over a long weekend.`,
    fr: (d) => `Avec ${km(d.pistesKm)} km de pistes sur ${d.lifts} remontées, c'est un domaine de taille moyenne, facile à apprivoiser sur un long week-end.`,
    es: (d) => `Con ${km(d.pistesKm)} km de pistas en ${d.lifts} remontes, es un dominio de tamaño medio, fácil de conocer en un fin de semana largo.`,
    pt: (d) => `Com ${km(d.pistesKm)} km de pistas em ${d.lifts} teleféricos, é um domínio de tamanho médio, fácil de conhecer num fim de semana prolongado.`,
    it: (d) => `Con ${km(d.pistesKm)} km di piste su ${d.lifts} impianti, è un comprensorio di media taglia, facile da conoscere in un weekend lungo.`,
  },
  compact: {
    en: (d) => `It is a compact area, ${km(d.pistesKm)} km of piste on ${d.lifts} lifts, best for a short break or a focused trip rather than a full week.`,
    fr: (d) => `C'est un petit domaine, ${km(d.pistesKm)} km de pistes sur ${d.lifts} remontées, idéal pour un court séjour ou un voyage ciblé plutôt qu'une semaine entière.`,
    es: (d) => `Es un dominio compacto, ${km(d.pistesKm)} km de pistas en ${d.lifts} remontes, mejor para una escapada corta o un viaje específico que para una semana entera.`,
    pt: (d) => `É um domínio compacto, ${km(d.pistesKm)} km de pistas em ${d.lifts} teleféricos, melhor para uma escapadela curta ou uma viagem focada do que para uma semana inteira.`,
    it: (d) => `È un comprensorio compatto, ${km(d.pistesKm)} km di piste su ${d.lifts} impianti, meglio per una breve fuga o un viaggio mirato che per una settimana intera.`,
  },
}

const TERRAIN_A: Record<Profile, Record<Locale, (d: Destination) => string>> = {
  beginner: {
    en: (d) => `The piste mix leans gentle (${d.pisteCounts.green} green, ${d.pisteCounts.blue} blue, ${d.pisteCounts.red} red, ${d.pisteCounts.black} black), so beginners and early intermediates are well served.`,
    fr: (d) => `Le profil des pistes penche vers la douceur (${d.pisteCounts.green} vertes, ${d.pisteCounts.blue} bleues, ${d.pisteCounts.red} rouges, ${d.pisteCounts.black} noires) : débutants et premiers intermédiaires y sont à l'aise.`,
    es: (d) => `La mezcla de pistas tira hacia lo suave (${d.pisteCounts.green} verdes, ${d.pisteCounts.blue} azules, ${d.pisteCounts.red} rojas, ${d.pisteCounts.black} negras), así que principiantes e intermedios iniciales están bien servidos.`,
    pt: (d) => `A mistura de pistas pende para o suave (${d.pisteCounts.green} verdes, ${d.pisteCounts.blue} azuis, ${d.pisteCounts.red} vermelhas, ${d.pisteCounts.black} pretas), por isso principiantes e intermédios iniciais ficam bem servidos.`,
    it: (d) => `Il mix di piste pende verso il facile (${d.pisteCounts.green} verdi, ${d.pisteCounts.blue} blu, ${d.pisteCounts.red} rosse, ${d.pisteCounts.black} nere), quindi principianti e primi intermedi sono ben serviti.`,
  },
  balanced: {
    en: (d) => `The terrain is balanced (${d.pisteCounts.green} green, ${d.pisteCounts.blue} blue, ${d.pisteCounts.red} red, ${d.pisteCounts.black} black), which suits a mixed-level group skiing together.`,
    fr: (d) => `Le terrain est équilibré (${d.pisteCounts.green} vertes, ${d.pisteCounts.blue} bleues, ${d.pisteCounts.red} rouges, ${d.pisteCounts.black} noires), idéal pour un groupe de niveaux variés.`,
    es: (d) => `El terreno está equilibrado (${d.pisteCounts.green} verdes, ${d.pisteCounts.blue} azules, ${d.pisteCounts.red} rojas, ${d.pisteCounts.black} negras), ideal para un grupo de niveles distintos.`,
    pt: (d) => `O terreno é equilibrado (${d.pisteCounts.green} verdes, ${d.pisteCounts.blue} azuis, ${d.pisteCounts.red} vermelhas, ${d.pisteCounts.black} pretas), perfeito para um grupo de níveis diferentes.`,
    it: (d) => `Il terreno è bilanciato (${d.pisteCounts.green} verdi, ${d.pisteCounts.blue} blu, ${d.pisteCounts.red} rosse, ${d.pisteCounts.black} nere), ideale per un gruppo di livelli diversi.`,
  },
  expert: {
    en: (d) => `It leans toward strong skiers (${d.pisteCounts.black} black and ${d.pisteCounts.red} red, with ${d.pisteCounts.green} green and ${d.pisteCounts.blue} blue to warm up), so confident skiers get the most from it.`,
    fr: (d) => `Il penche vers les bons skieurs (${d.pisteCounts.black} noires et ${d.pisteCounts.red} rouges, avec ${d.pisteCounts.green} vertes et ${d.pisteCounts.blue} bleues pour s'échauffer) : les skieurs confirmés en profitent le plus.`,
    es: (d) => `Tira hacia esquiadores fuertes (${d.pisteCounts.black} negras y ${d.pisteCounts.red} rojas, con ${d.pisteCounts.green} verdes y ${d.pisteCounts.blue} azules para calentar), así que los esquiadores seguros le sacan más partido.`,
    pt: (d) => `Pende para esquiadores fortes (${d.pisteCounts.black} pretas e ${d.pisteCounts.red} vermelhas, com ${d.pisteCounts.green} verdes e ${d.pisteCounts.blue} azuis para aquecer), por isso esquiadores confiantes aproveitam-no mais.`,
    it: (d) => `Pende verso sciatori forti (${d.pisteCounts.black} nere e ${d.pisteCounts.red} rosse, con ${d.pisteCounts.green} verdi e ${d.pisteCounts.blue} blu per scaldarsi), quindi gli sciatori sicuri ne traggono di più.`,
  },
}

const ACCESS_A: Record<'carfree' | 'strong' | 'partial' | 'limited', Record<Locale, (d: Destination) => string>> = {
  carfree: {
    en: (d) => `${d.name} is car-free. You park at the resort entrance and reach the village without a car; most lodging then opens straight onto the snow, so the car can stay put all week.`,
    fr: (d) => `${d.name} est sans voitures. On se gare à l'entrée de la station et on rejoint le village sans voiture ; la plupart des hébergements donnent ensuite directement sur la neige, la voiture peut rester au repos toute la semaine.`,
    es: (d) => `${d.name} es peatonal. Se aparca a la entrada de la estación y se llega al pueblo sin coche; la mayoría del alojamiento da directamente a la nieve, así que el coche puede quedarse aparcado toda la semana.`,
    pt: (d) => `${d.name} é sem carros. Estaciona-se à entrada da estância e chega-se à aldeia sem carro; a maioria do alojamento dá diretamente para a neve, por isso o carro pode ficar parado a semana toda.`,
    it: (d) => `${d.name} è senza auto. Si parcheggia all'ingresso della località e si raggiunge il paese senza auto; gran parte degli alloggi si apre poi direttamente sulla neve, quindi l'auto può restare ferma tutta la settimana.`,
  },
  strong: {
    en: () => `Most hotels sit right on the snow front, so this is genuine ski-in/ski-out: park once on arrival and ski from the door, with no daily driving or shuttle.`,
    fr: () => `La plupart des hôtels sont posés sur le front de neige : c'est du vrai ski au pied. On se gare en arrivant et on skie depuis la porte, sans voiture ni navette au quotidien.`,
    es: () => `La mayoría de los hoteles están sobre el frente de nieve: es ski-in/ski-out de verdad. Se aparca al llegar y se esquía desde la puerta, sin coche ni lanzadera a diario.`,
    pt: () => `A maioria dos hotéis fica sobre a frente de neve: é ski-in/ski-out a sério. Estaciona-se à chegada e esquia-se à porta, sem carro nem transfer diário.`,
    it: () => `La maggior parte degli hotel è proprio sul fronte neve: è vero ski-in/ski-out. Si parcheggia all'arrivo e si scia dalla porta, senza auto né navetta quotidiana.`,
  },
  partial: {
    en: () => `Ski-in/ski-out depends on the address here: some hotels are on the snow, others need a short walk or shuttle. Pick a slopeside address if skiing from the door matters to you.`,
    fr: () => `Le ski au pied dépend ici de l'adresse : certains hôtels sont sur la neige, d'autres demandent une courte marche ou une navette. Visez une adresse au pied des pistes si skier depuis la porte compte pour vous.`,
    es: () => `El ski-in/ski-out depende aquí de la dirección: algunos hoteles están sobre la nieve, otros requieren un paseo corto o lanzadera. Elige una dirección a pie de pista si esquiar desde la puerta te importa.`,
    pt: () => `O ski-in/ski-out depende aqui da morada: alguns hotéis ficam sobre a neve, outros exigem uma curta caminhada ou transfer. Escolha uma morada à beira da pista se esquiar à porta lhe importa.`,
    it: () => `Lo ski-in/ski-out qui dipende dall'indirizzo: alcuni hotel sono sulla neve, altri richiedono una breve camminata o navetta. Scegli un indirizzo sulle piste se sciare dalla porta è importante per te.`,
  },
  limited: {
    en: () => `This is more of a valley base than a slopeside village, so expect a lift, train or shuttle to the snow each morning. Staying central, near the main lift, saves the most time.`,
    fr: () => `C'est plutôt une base en vallée qu'un village au pied des pistes : prévoyez une remontée, un train ou une navette pour rejoindre la neige chaque matin. Loger au centre, près de la remontée principale, fait gagner le plus de temps.`,
    es: () => `Es más una base de valle que un pueblo a pie de pista, así que cuenta con un remonte, tren o lanzadera hasta la nieve cada mañana. Alojarse en el centro, cerca del remonte principal, ahorra más tiempo.`,
    pt: () => `É mais uma base de vale do que uma aldeia à beira da pista, por isso conte com um teleférico, comboio ou transfer até à neve cada manhã. Ficar no centro, perto do teleférico principal, poupa mais tempo.`,
    it: () => `È più una base a fondovalle che un paese sulle piste, quindi metti in conto un impianto, un treno o una navetta per la neve ogni mattina. Alloggiare in centro, vicino all'impianto principale, fa risparmiare più tempo.`,
  },
}

/* vibe fragments: short descriptive clauses, composed into one sentence */
const VIBE_FRAG: Partial<Record<string, Record<Locale, string>>> = {
  luxury: { en: 'a polished, high-end scene', fr: 'une ambiance chic et haut de gamme', es: 'un ambiente cuidado y de alta gama', pt: 'um ambiente requintado e de alta gama', it: "un'atmosfera curata e di alto livello" },
  party: { en: 'lively après-ski', fr: 'un après-ski animé', es: 'un après-ski animado', pt: 'um après-ski animado', it: 'un après-ski vivace' },
  freeride: { en: 'serious off-piste and freeride terrain', fr: 'du hors-piste et du freeride sérieux', es: 'fuera de pista y freeride serios', pt: 'fora de pista e freeride a sério', it: 'fuoripista e freeride seri' },
  family: { en: 'a family-friendly setup', fr: 'un cadre adapté aux familles', es: 'un entorno apto para familias', pt: 'um ambiente adequado a famílias', it: 'un contesto adatto alle famiglie' },
  gastronomy: { en: 'a strong dining scene', fr: 'une belle scène gastronomique', es: 'una notable escena gastronómica', pt: 'uma forte cena gastronómica', it: 'una solida scena gastronomica' },
  glacier: { en: 'glacier skiing up high', fr: 'du ski de glacier en altitude', es: 'esquí en glaciar en altura', pt: 'esqui em glaciar nas alturas', it: 'sci su ghiacciaio in quota' },
  'high-altitude': { en: 'snow-sure high-altitude slopes', fr: "des pentes d'altitude à l'enneigement fiable", es: 'pistas de gran altitud con nieve segura', pt: 'pistas de grande altitude com neve fiável', it: "piste d'alta quota con neve sicura" },
  iconic: { en: 'a genuinely iconic name', fr: 'un nom véritablement iconique', es: 'un nombre realmente icónico', pt: 'um nome verdadeiramente icónico', it: 'un nome davvero iconico' },
  japow: { en: 'the famous dry Japanese powder', fr: 'la fameuse poudreuse japonaise', es: 'la famosa nieve polvo japonesa', pt: 'a famosa neve pó japonesa', it: 'la famosa neve farinosa giapponese' },
  mountaineering: { en: 'big-mountain and mountaineering terrain', fr: "un terrain de haute montagne et d'alpinisme", es: 'terreno de alta montaña y alpinismo', pt: 'terreno de alta montanha e alpinismo', it: "terreno d'alta montagna e alpinismo" },
  racing: { en: 'a racing and competition pedigree', fr: 'une tradition de course et de compétition', es: 'una tradición de competición', pt: 'uma tradição de competição', it: 'una tradizione di gare e competizione' },
  'winter-sports': { en: 'a broad winter-sports offering beyond skiing', fr: "une offre de sports d'hiver large au-delà du ski", es: 'una amplia oferta de deportes de invierno más allá del esquí', pt: 'uma ampla oferta de desportos de inverno além do esqui', it: "un'ampia offerta di sport invernali oltre allo sci" },
  'big-domain': { en: 'a vast, multi-sector domain', fr: 'un domaine vaste à plusieurs secteurs', es: 'un dominio enorme de varios sectores', pt: 'um domínio vasto de vários setores', it: 'un comprensorio vasto a più settori' },
  expert: { en: 'demanding terrain for strong skiers', fr: 'un terrain exigeant pour bons skieurs', es: 'terreno exigente para esquiadores fuertes', pt: 'terreno exigente para esquiadores fortes', it: 'terreno impegnativo per sciatori forti' },
}

const AND: Record<Locale, string> = { en: 'and', fr: 'et', es: 'y', pt: 'e', it: 'e' }
function joinList(items: string[], locale: Locale): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} ${AND[locale]} ${items[items.length - 1]}`
}
const VIBE_LEAD: Record<Locale, (name: string, list: string) => string> = {
  en: (n, l) => `${n} stands out for ${l}.`,
  fr: (n, l) => `${n} se distingue par ${l}.`,
  es: (n, l) => `${n} destaca por ${l}.`,
  pt: (n, l) => `${n} destaca-se por ${l}.`,
  it: (n, l) => `${n} si distingue per ${l}.`,
}
function vibeAnswer(d: Destination, locale: Locale): string {
  const frags = d.vibes.map((v) => VIBE_FRAG[v]?.[locale]).filter((x): x is string => Boolean(x)).slice(0, 3)
  if (frags.length === 0) return ''
  return VIBE_LEAD[locale](d.name, joinList(frags, locale))
}

function whenAnswer(d: Destination, locale: Locale): string {
  const weeks = seasonWeeks(d)
  if (weeks == null) {
    const yr: Record<Locale, string> = {
      en: `Snow lies year-round here, so it skis well beyond the usual winter window, including summer glacier laps.`,
      fr: `La neige tient toute l'année ici : on peut skier bien au-delà de la fenêtre hivernale habituelle, glacier d'été compris.`,
      es: `Aquí la nieve aguanta todo el año, así que se esquía mucho más allá de la ventana invernal habitual, incluido el glaciar en verano.`,
      pt: `Aqui a neve mantém-se todo o ano, por isso esquia-se muito além da janela de inverno habitual, incluindo o glaciar no verão.`,
      it: `Qui la neve resiste tutto l'anno, quindi si scia ben oltre la solita finestra invernale, ghiacciaio estivo compreso.`,
    }
    return yr[locale]
  }
  const high = d.altitudeBase >= 1800 || d.vibes.includes('glacier') || d.vibes.includes('high-altitude')
  const start = formatSeasonDate(d.seasonStart, locale)
  const end = formatSeasonDate(d.seasonEnd, locale)
  if (isSouthernHemisphere(d)) {
    const t: Record<Locale, string> = {
      en: `In the Southern Hemisphere the season runs roughly ${start} to ${end} (the local winter), with July and August the most reliable.`,
      fr: `Dans l'hémisphère sud, la saison va à peu près de ${start} à ${end} (l'hiver local), juillet et août étant les plus sûrs.`,
      es: `En el hemisferio sur la temporada va de ${start} a ${end} aproximadamente (el invierno local), siendo julio y agosto los más fiables.`,
      pt: `No hemisfério sul a época vai sensivelmente de ${start} a ${end} (o inverno local), sendo julho e agosto os mais fiáveis.`,
      it: `Nell'emisfero sud la stagione va all'incirca da ${start} a ${end} (l'inverno locale), con luglio e agosto i più affidabili.`,
    }
    return t[locale]
  }
  const tail: Record<Locale, string> = high
    ? { en: ` The altitude also holds spring snow, so late-season skiing stays good well into spring.`, fr: ` L'altitude tient aussi la neige de printemps : le ski de fin de saison reste bon tard au printemps.`, es: ` La altitud también aguanta la nieve de primavera, así que el final de temporada se mantiene bueno entrada la primavera.`, pt: ` A altitude também segura a neve de primavera, por isso o fim de época mantém-se bom já dentro da primavera.`, it: ` La quota tiene anche la neve di primavera, quindi il fine stagione resta buono fino a primavera inoltrata.` }
    : { en: ` Conditions soften as spring arrives, so earlier in the window is the safer call.`, fr: ` Les conditions s'adoucissent à l'approche du printemps : viser le début de la fenêtre est plus sûr.`, es: ` Las condiciones se ablandan al llegar la primavera, así que el principio de la ventana es más seguro.`, pt: ` As condições amolecem com a chegada da primavera, por isso o início da janela é mais seguro.`, it: ` Le condizioni si ammorbidiscono con l'arrivo della primavera, quindi l'inizio della finestra è la scelta più sicura.` }
  const base: Record<Locale, string> = {
    en: `The season usually runs ${start} to ${end} (about ${weeks} weeks). For the most dependable cover, the deep-winter window of January to February is the safe bet.`,
    fr: `La saison va en général de ${start} à ${end} (environ ${weeks} semaines). Pour l'enneigement le plus sûr, la fenêtre de plein hiver de janvier à février est la valeur sûre.`,
    es: `La temporada suele ir de ${start} a ${end} (unas ${weeks} semanas). Para la nieve más fiable, la ventana de pleno invierno de enero a febrero es la apuesta segura.`,
    pt: `A época vai normalmente de ${start} a ${end} (cerca de ${weeks} semanas). Para a neve mais fiável, a janela de pleno inverno de janeiro a fevereiro é a aposta segura.`,
    it: `La stagione va di solito da ${start} a ${end} (circa ${weeks} settimane). Per l'innevamento più affidabile, la finestra di pieno inverno tra gennaio e febbraio è la scelta sicura.`,
  }
  return base[locale] + tail[locale]
}

function accessKey(d: Destination): 'carfree' | 'strong' | 'partial' | 'limited' {
  if (isCarFree(d)) return 'carfree'
  return skiInSkiOutTier(d.slug)
}

/** The 5 question/answer "things to know", all derived from the resort data. */
export function resortGuide(d: Destination, locale: Locale): GuidePoint[] {
  return [
    { q: Q.snow[locale](d), a: SNOW_A[snowBand(d)][locale](d) },
    { q: Q.access[locale](), a: ACCESS_A[accessKey(d)][locale](d) },
    { q: Q.mountain[locale](), a: `${SIZE_A[sizeBand(d)][locale](d)} ${TERRAIN_A[terrainProfile(d)][locale](d)}` },
    { q: Q.vibe[locale](), a: vibeAnswer(d, locale) },
    { q: Q.when[locale](), a: whenAnswer(d, locale) },
  ].filter((p) => p.a.length > 0)
}

const GUIDE_SET = new Set<string>(GUIDE_SLUGS)
export const isGuide = (slug: string): boolean => GUIDE_SET.has(slug)

/** Pilot resorts, in the order declared above (used for the hub + static params). */
export function getGuideDestinations(): Destination[] {
  return GUIDE_SLUGS.map((s) => destinations.find((d) => d.slug === s)).filter(
    (d): d is Destination => Boolean(d),
  )
}
