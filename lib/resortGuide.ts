import type { Locale } from '@/app/[locale]/dictionaries'
import type { Destination } from './destinations'
import { destinations } from './destinations'
import { skiInSkiOutTier, isCarFree } from './skiInSkiOut'
import { isSouthernHemisphere } from './countries'
import { formatSeasonDate } from './dates'
import { getSkiAreaForResort } from './skiAreas'

/**
 * "Things to know before you go" guide content, generated 100% from each
 * resort's real data fields (altitude, snow score, season, piste mix, our
 * ski-in/ski-out classification, vibe tags). No prices, no specific dates, no
 * invented facts: every answer is something we can stand behind. Returns a set
 * of question/answer points (also emitted as FAQPage JSON-LD on the page).
 *
 * Coverage: every resort in the dataset gets a guide. Ordered by snow score so
 * the hub leads with the strongest names.
 */
export const GUIDE_SLUGS: string[] = [...destinations]
  .sort((a, b) => b.snowScore - a.snowScore)
  .map((d) => d.slug)

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
    ja: (d: Destination) => `${d.name}は積雪が安定していますか？`,
    nl: (d: Destination) => `Is de sneeuw betrouwbaar in ${d.name}?`,
  },
  access: {
    en: () => `Do you need a car, or can you ski in and out?`,
    fr: () => `Faut-il une voiture, ou peut-on skier au pied ?`,
    es: () => `¿Hace falta coche o se puede esquiar a pie de pista?`,
    pt: () => `É preciso carro ou pode esquiar à porta?`,
    it: () => `Serve l'auto o si scia ai piedi?`,
    ja: () => `車は必要ですか、それともゲレンデに直結していますか？`,
    nl: () => `Heb je een auto nodig, of kun je ski-in/ski-out?`,
  },
  mountain: {
    en: () => `How big is the ski area, and who is it for?`,
    fr: () => `Quelle est la taille du domaine, et pour qui ?`,
    es: () => `¿Cómo de grande es el dominio y para quién es?`,
    pt: () => `Qual o tamanho do domínio e para quem é?`,
    it: () => `Quanto è grande il comprensorio e per chi è?`,
    ja: () => `ゲレンデの規模は？どんな人向けですか？`,
    nl: () => `Hoe groot is het skigebied, en voor wie is het geschikt?`,
  },
  vibe: {
    en: () => `What is the resort like?`,
    fr: () => `Quelle est l'ambiance de la station ?`,
    es: () => `¿Cómo es el ambiente de la estación?`,
    pt: () => `Qual é o ambiente da estância?`,
    it: () => `Com'è l'atmosfera della località?`,
    ja: () => `リゾートの雰囲気は？`,
    nl: () => `Wat is de sfeer in het resort?`,
  },
  when: {
    en: () => `When is the best time to go?`,
    fr: () => `Quelle est la meilleure période pour y aller ?`,
    es: () => `¿Cuál es la mejor época para ir?`,
    pt: () => `Qual é a melhor altura para ir?`,
    it: () => `Qual è il periodo migliore per andare?`,
    ja: () => `訪れるのに最適な時期は？`,
    nl: () => `Wat is de beste periode om te gaan?`,
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
    ja: (d) => `はい。ベースは標高${km(d.altitudeBase)}m、山頂は${km(d.altitudeSummit)}mに達し、当サイトの指数でも積雪の安定性は最上位クラスです（スコア${d.snowScore}/100）。`,
    nl: (d) => `Ja. De basis ligt op ${km(d.altitudeBase)} m en de top reikt tot ${km(d.altitudeSummit)} m, waarmee de sneeuwzekerheid tot de beste van onze index behoort (score ${d.snowScore}/100).`,
  },
  reliable: {
    en: (d) => `Generally yes. From ${km(d.altitudeBase)} m at the base to ${km(d.altitudeSummit)} m up top, the profile holds snow well across a normal winter (score ${d.snowScore}/100).`,
    fr: (d) => `En général oui. De ${km(d.altitudeBase)} m en bas à ${km(d.altitudeSummit)} m en haut, le profil tient bien la neige sur un hiver normal (score ${d.snowScore}/100).`,
    es: (d) => `En general sí. De ${km(d.altitudeBase)} m en la base a ${km(d.altitudeSummit)} m arriba, el perfil aguanta bien la nieve en un invierno normal (puntuación ${d.snowScore}/100).`,
    pt: (d) => `Em geral sim. De ${km(d.altitudeBase)} m na base a ${km(d.altitudeSummit)} m no topo, o perfil segura bem a neve num inverno normal (pontuação ${d.snowScore}/100).`,
    it: (d) => `In genere sì. Da ${km(d.altitudeBase)} m alla base a ${km(d.altitudeSummit)} m in cima, il profilo tiene bene la neve in un inverno normale (punteggio ${d.snowScore}/100).`,
    ja: (d) => `基本的には安定しています。ベース${km(d.altitudeBase)}mから山頂${km(d.altitudeSummit)}mまで、通常のシーズンなら積雪はしっかり保たれます（スコア${d.snowScore}/100）。`,
    nl: (d) => `Over het algemeen wel. Van ${km(d.altitudeBase)} m bij de basis tot ${km(d.altitudeSummit)} m boven houdt dit profiel de sneeuw goed vast in een normale winter (score ${d.snowScore}/100).`,
  },
  decent: {
    en: (d) => `Usually, with help. From ${km(d.altitudeBase)} m to ${km(d.altitudeSummit)} m the resort leans on grooming and snowmaking in lean spells, so check the live report before booking early or late dates (score ${d.snowScore}/100).`,
    fr: (d) => `Le plus souvent, avec un coup de pouce. De ${km(d.altitudeBase)} m à ${km(d.altitudeSummit)} m, la station s'appuie sur le damage et la neige de culture lors des passages maigres ; vérifiez le bulletin en direct pour les dates de début ou fin de saison (score ${d.snowScore}/100).`,
    es: (d) => `Casi siempre, con ayuda. De ${km(d.altitudeBase)} m a ${km(d.altitudeSummit)} m la estación se apoya en el pisado y la nieve de cultivo en los tramos flojos; consulta el parte en directo para fechas tempranas o tardías (puntuación ${d.snowScore}/100).`,
    pt: (d) => `Quase sempre, com ajuda. De ${km(d.altitudeBase)} m a ${km(d.altitudeSummit)} m a estância apoia-se no pisão e na neve artificial nos períodos fracos; veja o boletim em direto para datas no início ou fim da época (pontuação ${d.snowScore}/100).`,
    it: (d) => `Quasi sempre, con un aiuto. Da ${km(d.altitudeBase)} m a ${km(d.altitudeSummit)} m la località si appoggia su battitura e neve programmata nei periodi magri; controlla il bollettino in tempo reale per date a inizio o fine stagione (punteggio ${d.snowScore}/100).`,
    ja: (d) => `ほぼ安定していますが、多少の手助けが必要です。${km(d.altitudeBase)}mから${km(d.altitudeSummit)}mの標高帯では、積雪が少ない時期は整備と人工降雪に頼ります。シーズン初めや終わりに訪れる場合は最新の積雪情報を確認してください（スコア${d.snowScore}/100）。`,
    nl: (d) => `Meestal wel, met een handje hulp. Van ${km(d.altitudeBase)} m tot ${km(d.altitudeSummit)} m leunt het resort in magere periodes op pistebewerking en sneeuwkanonnen; check het actuele sneeuwbericht voor data vroeg of laat in het seizoen (score ${d.snowScore}/100).`,
  },
  low: {
    en: (d) => `It depends on conditions. At ${km(d.altitudeBase)} m to ${km(d.altitudeSummit)} m this is a lower-altitude resort, so lean on the live snow report and stay flexible on dates (score ${d.snowScore}/100).`,
    fr: (d) => `Cela dépend des conditions. Entre ${km(d.altitudeBase)} m et ${km(d.altitudeSummit)} m, c'est une station de plus basse altitude : fiez-vous au bulletin neige en direct et gardez de la souplesse sur les dates (score ${d.snowScore}/100).`,
    es: (d) => `Depende de las condiciones. Entre ${km(d.altitudeBase)} m y ${km(d.altitudeSummit)} m es una estación de menor altitud: apóyate en el parte de nieve en directo y mantén flexibilidad en las fechas (puntuación ${d.snowScore}/100).`,
    pt: (d) => `Depende das condições. Entre ${km(d.altitudeBase)} m e ${km(d.altitudeSummit)} m é uma estância de menor altitude: confie no boletim de neve em direto e mantenha flexibilidade nas datas (pontuação ${d.snowScore}/100).`,
    it: (d) => `Dipende dalle condizioni. Tra ${km(d.altitudeBase)} m e ${km(d.altitudeSummit)} m è una località di quota più bassa: affidati al bollettino neve in tempo reale e resta flessibile sulle date (punteggio ${d.snowScore}/100).`,
    ja: (d) => `状況次第です。標高${km(d.altitudeBase)}mから${km(d.altitudeSummit)}mと比較的低いリゾートのため、最新の積雪情報を確認し、日程には余裕を持たせてください（スコア${d.snowScore}/100）。`,
    nl: (d) => `Dat hangt van de omstandigheden af. Met ${km(d.altitudeBase)} m tot ${km(d.altitudeSummit)} m is dit een resort op lagere hoogte, dus vertrouw op het actuele sneeuwbericht en blijf flexibel met je data (score ${d.snowScore}/100).`,
  },
}

const SIZE_A: Record<Size, Record<Locale, (d: Destination) => string>> = {
  huge: {
    en: (d) => `It is one of the bigger domains on the site: ${km(d.pistesKm)} km of piste on ${d.lifts} lifts, enough to ski a different sector every day of the week.`,
    fr: (d) => `C'est l'un des grands domaines du site : ${km(d.pistesKm)} km de pistes sur ${d.lifts} remontées, de quoi changer de secteur chaque jour de la semaine.`,
    es: (d) => `Es uno de los dominios grandes del sitio: ${km(d.pistesKm)} km de pistas en ${d.lifts} remontes, suficiente para esquiar un sector distinto cada día.`,
    pt: (d) => `É um dos grandes domínios do site: ${km(d.pistesKm)} km de pistas em ${d.lifts} teleféricos, suficiente para esquiar um setor diferente por dia.`,
    it: (d) => `È uno dei grandi comprensori del sito: ${km(d.pistesKm)} km di piste su ${d.lifts} impianti, abbastanza per sciare un settore diverso ogni giorno.`,
    ja: (d) => `当サイトの中でも大規模なゲレンデのひとつです。コース総延長${km(d.pistesKm)}km、リフト${d.lifts}基を誇り、1週間毎日違うエリアを滑れるほどの広さです。`,
    nl: (d) => `Dit is een van de grotere skigebieden op de site: ${km(d.pistesKm)} km piste over ${d.lifts} liften, genoeg om elke dag van de week een ander deel te skiën.`,
  },
  big: {
    en: (d) => `At ${km(d.pistesKm)} km of piste on ${d.lifts} lifts, it is a substantial mountain that rewards a multi-day stay.`,
    fr: (d) => `Avec ${km(d.pistesKm)} km de pistes sur ${d.lifts} remontées, c'est une montagne consistante qui mérite un séjour de plusieurs jours.`,
    es: (d) => `Con ${km(d.pistesKm)} km de pistas en ${d.lifts} remontes, es una montaña de peso que justifica una estancia de varios días.`,
    pt: (d) => `Com ${km(d.pistesKm)} km de pistas em ${d.lifts} teleféricos, é uma montanha consistente que justifica uma estadia de vários dias.`,
    it: (d) => `Con ${km(d.pistesKm)} km di piste su ${d.lifts} impianti, è una montagna sostanziosa che merita un soggiorno di più giorni.`,
    ja: (d) => `コース総延長${km(d.pistesKm)}km、リフト${d.lifts}基を備えた見応えのあるゲレンデで、数日間の滞在に値します。`,
    nl: (d) => `Met ${km(d.pistesKm)} km piste over ${d.lifts} liften is dit een flinke berg die een verblijf van meerdere dagen beloont.`,
  },
  mid: {
    en: (d) => `With ${km(d.pistesKm)} km of piste on ${d.lifts} lifts, it is a mid-size area, easy to get to know over a long weekend.`,
    fr: (d) => `Avec ${km(d.pistesKm)} km de pistes sur ${d.lifts} remontées, c'est un domaine de taille moyenne, facile à apprivoiser sur un long week-end.`,
    es: (d) => `Con ${km(d.pistesKm)} km de pistas en ${d.lifts} remontes, es un dominio de tamaño medio, fácil de conocer en un fin de semana largo.`,
    pt: (d) => `Com ${km(d.pistesKm)} km de pistas em ${d.lifts} teleféricos, é um domínio de tamanho médio, fácil de conhecer num fim de semana prolongado.`,
    it: (d) => `Con ${km(d.pistesKm)} km di piste su ${d.lifts} impianti, è un comprensorio di media taglia, facile da conoscere in un weekend lungo.`,
    ja: (d) => `コース総延長${km(d.pistesKm)}km、リフト${d.lifts}基の中規模ゲレンデで、長めの週末で十分に把握できます。`,
    nl: (d) => `Met ${km(d.pistesKm)} km piste over ${d.lifts} liften is dit een middelgroot skigebied, gemakkelijk te leren kennen in een lang weekend.`,
  },
  compact: {
    en: (d) => `It is a compact area, ${km(d.pistesKm)} km of piste on ${d.lifts} lifts, best for a short break or a focused trip rather than a full week.`,
    fr: (d) => `C'est un petit domaine, ${km(d.pistesKm)} km de pistes sur ${d.lifts} remontées, idéal pour un court séjour ou un voyage ciblé plutôt qu'une semaine entière.`,
    es: (d) => `Es un dominio compacto, ${km(d.pistesKm)} km de pistas en ${d.lifts} remontes, mejor para una escapada corta o un viaje específico que para una semana entera.`,
    pt: (d) => `É um domínio compacto, ${km(d.pistesKm)} km de pistas em ${d.lifts} teleféricos, melhor para uma escapadela curta ou uma viagem focada do que para uma semana inteira.`,
    it: (d) => `È un comprensorio compatto, ${km(d.pistesKm)} km di piste su ${d.lifts} impianti, meglio per una breve fuga o un viaggio mirato che per una settimana intera.`,
    ja: (d) => `コース総延長${km(d.pistesKm)}km、リフト${d.lifts}基のコンパクトなゲレンデです。1週間の滞在よりも、短めの旅行や目的を絞った滞在に向いています。`,
    nl: (d) => `Dit is een compact skigebied, ${km(d.pistesKm)} km piste over ${d.lifts} liften, meer geschikt voor een korte break of een gerichte trip dan voor een hele week.`,
  },
}

const TERRAIN_A: Record<Profile, Record<Locale, (d: Destination) => string>> = {
  beginner: {
    en: (d) => `The piste mix leans gentle (${d.pisteCounts.green} green, ${d.pisteCounts.blue} blue, ${d.pisteCounts.red} red, ${d.pisteCounts.black} black), so beginners and early intermediates are well served.`,
    fr: (d) => `Le profil des pistes penche vers la douceur (${d.pisteCounts.green} vertes, ${d.pisteCounts.blue} bleues, ${d.pisteCounts.red} rouges, ${d.pisteCounts.black} noires) : débutants et premiers intermédiaires y sont à l'aise.`,
    es: (d) => `La mezcla de pistas tira hacia lo suave (${d.pisteCounts.green} verdes, ${d.pisteCounts.blue} azules, ${d.pisteCounts.red} rojas, ${d.pisteCounts.black} negras), así que principiantes e intermedios iniciales están bien servidos.`,
    pt: (d) => `A mistura de pistas pende para o suave (${d.pisteCounts.green} verdes, ${d.pisteCounts.blue} azuis, ${d.pisteCounts.red} vermelhas, ${d.pisteCounts.black} pretas), por isso principiantes e intermédios iniciais ficam bem servidos.`,
    it: (d) => `Il mix di piste pende verso il facile (${d.pisteCounts.green} verdi, ${d.pisteCounts.blue} blu, ${d.pisteCounts.red} rosse, ${d.pisteCounts.black} nere), quindi principianti e primi intermedi sono ben serviti.`,
    ja: (d) => `コース構成は易しいものが多く（緑${d.pisteCounts.green}本、青${d.pisteCounts.blue}本、赤${d.pisteCounts.red}本、黒${d.pisteCounts.black}本）、初心者や滑り始めの中級者にも向いています。`,
    nl: (d) => `De pistemix leunt naar gemakkelijk (${d.pisteCounts.green} groen, ${d.pisteCounts.blue} blauw, ${d.pisteCounts.red} rood, ${d.pisteCounts.black} zwart), dus beginners en beginnende gevorderden zijn hier goed bediend.`,
  },
  balanced: {
    en: (d) => `The terrain is balanced (${d.pisteCounts.green} green, ${d.pisteCounts.blue} blue, ${d.pisteCounts.red} red, ${d.pisteCounts.black} black), which suits a mixed-level group skiing together.`,
    fr: (d) => `Le terrain est équilibré (${d.pisteCounts.green} vertes, ${d.pisteCounts.blue} bleues, ${d.pisteCounts.red} rouges, ${d.pisteCounts.black} noires), idéal pour un groupe de niveaux variés.`,
    es: (d) => `El terreno está equilibrado (${d.pisteCounts.green} verdes, ${d.pisteCounts.blue} azules, ${d.pisteCounts.red} rojas, ${d.pisteCounts.black} negras), ideal para un grupo de niveles distintos.`,
    pt: (d) => `O terreno é equilibrado (${d.pisteCounts.green} verdes, ${d.pisteCounts.blue} azuis, ${d.pisteCounts.red} vermelhas, ${d.pisteCounts.black} pretas), perfeito para um grupo de níveis diferentes.`,
    it: (d) => `Il terreno è bilanciato (${d.pisteCounts.green} verdi, ${d.pisteCounts.blue} blu, ${d.pisteCounts.red} rosse, ${d.pisteCounts.black} nere), ideale per un gruppo di livelli diversi.`,
    ja: (d) => `コース構成はバランスが取れており（緑${d.pisteCounts.green}本、青${d.pisteCounts.blue}本、赤${d.pisteCounts.red}本、黒${d.pisteCounts.black}本）、レベルの異なるグループでの滑走に適しています。`,
    nl: (d) => `Het terrein is in balans (${d.pisteCounts.green} groen, ${d.pisteCounts.blue} blauw, ${d.pisteCounts.red} rood, ${d.pisteCounts.black} zwart), ideaal voor een groep met verschillende niveaus die samen skiet.`,
  },
  expert: {
    en: (d) => `It leans toward strong skiers (${d.pisteCounts.black} black and ${d.pisteCounts.red} red, with ${d.pisteCounts.green} green and ${d.pisteCounts.blue} blue to warm up), so confident skiers get the most from it.`,
    fr: (d) => `Il penche vers les bons skieurs (${d.pisteCounts.black} noires et ${d.pisteCounts.red} rouges, avec ${d.pisteCounts.green} vertes et ${d.pisteCounts.blue} bleues pour s'échauffer) : les skieurs confirmés en profitent le plus.`,
    es: (d) => `Tira hacia esquiadores fuertes (${d.pisteCounts.black} negras y ${d.pisteCounts.red} rojas, con ${d.pisteCounts.green} verdes y ${d.pisteCounts.blue} azules para calentar), así que los esquiadores seguros le sacan más partido.`,
    pt: (d) => `Pende para esquiadores fortes (${d.pisteCounts.black} pretas e ${d.pisteCounts.red} vermelhas, com ${d.pisteCounts.green} verdes e ${d.pisteCounts.blue} azuis para aquecer), por isso esquiadores confiantes aproveitam-no mais.`,
    it: (d) => `Pende verso sciatori forti (${d.pisteCounts.black} nere e ${d.pisteCounts.red} rosse, con ${d.pisteCounts.green} verdi e ${d.pisteCounts.blue} blu per scaldarsi), quindi gli sciatori sicuri ne traggono di più.`,
    ja: (d) => `上級者向けの傾向が強く（黒${d.pisteCounts.black}本、赤${d.pisteCounts.red}本に加え、ウォームアップ用に緑${d.pisteCounts.green}本、青${d.pisteCounts.blue}本）、実力のあるスキーヤーほど楽しめます。`,
    nl: (d) => `Het terrein leunt naar sterke skiërs (${d.pisteCounts.black} zwart en ${d.pisteCounts.red} rood, met ${d.pisteCounts.green} groen en ${d.pisteCounts.blue} blauw om op te warmen), dus zelfverzekerde skiërs halen hier het meeste uit.`,
  },
}

const ACCESS_A: Record<'carfree' | 'strong' | 'partial' | 'limited', Record<Locale, (d: Destination) => string>> = {
  carfree: {
    en: (d) => `${d.name} is car-free. You park at the resort entrance and reach the village without a car; most lodging then opens straight onto the snow, so the car can stay put all week.`,
    fr: (d) => `${d.name} est sans voitures. On se gare à l'entrée de la station et on rejoint le village sans voiture ; la plupart des hébergements donnent ensuite directement sur la neige, la voiture peut rester au repos toute la semaine.`,
    es: (d) => `${d.name} es peatonal. Se aparca a la entrada de la estación y se llega al pueblo sin coche; la mayoría del alojamiento da directamente a la nieve, así que el coche puede quedarse aparcado toda la semana.`,
    pt: (d) => `${d.name} é sem carros. Estaciona-se à entrada da estância e chega-se à aldeia sem carro; a maioria do alojamento dá diretamente para a neve, por isso o carro pode ficar parado a semana toda.`,
    it: (d) => `${d.name} è senza auto. Si parcheggia all'ingresso della località e si raggiunge il paese senza auto; gran parte degli alloggi si apre poi direttamente sulla neve, quindi l'auto può restare ferma tutta la settimana.`,
    ja: (d) => `${d.name}は車が不要なリゾートです。リゾート入口に駐車すれば村までは車なしで移動でき、宿泊施設の多くはゲレンデに直結しているため、滞在中ずっと車を動かさずに済みます。`,
    nl: (d) => `${d.name} is autovrij. Je parkeert bij de ingang van het resort en bereikt het dorp zonder auto; de meeste accommodaties openen daarna direct op de sneeuw, dus de auto kan de hele week blijven staan.`,
  },
  strong: {
    en: () => `Most hotels sit right on the snow front, so this is genuine ski-in/ski-out: park once on arrival and ski from the door, with no daily driving or shuttle.`,
    fr: () => `La plupart des hôtels sont posés sur le front de neige : c'est du vrai ski au pied. On se gare en arrivant et on skie depuis la porte, sans voiture ni navette au quotidien.`,
    es: () => `La mayoría de los hoteles están sobre el frente de nieve: es ski-in/ski-out de verdad. Se aparca al llegar y se esquía desde la puerta, sin coche ni lanzadera a diario.`,
    pt: () => `A maioria dos hotéis fica sobre a frente de neve: é ski-in/ski-out a sério. Estaciona-se à chegada e esquia-se à porta, sem carro nem transfer diário.`,
    it: () => `La maggior parte degli hotel è proprio sul fronte neve: è vero ski-in/ski-out. Si parcheggia all'arrivo e si scia dalla porta, senza auto né navetta quotidiana.`,
    ja: () => `ホテルの大半がゲレンデに面しており、正真正銘のski-in/ski-outです。到着時に一度駐車すればあとは玄関からそのまま滑走でき、毎日の車移動やシャトルは不要です。`,
    nl: () => `De meeste hotels liggen recht aan de piste, dit is dus echt ski-in/ski-out: je parkeert eenmalig bij aankomst en skiet vanaf de deur, zonder dagelijks rijden of pendelbus.`,
  },
  partial: {
    en: () => `Ski-in/ski-out depends on the address here: some hotels are on the snow, others need a short walk or shuttle. Pick a slopeside address if skiing from the door matters to you.`,
    fr: () => `Le ski au pied dépend ici de l'adresse : certains hôtels sont sur la neige, d'autres demandent une courte marche ou une navette. Visez une adresse au pied des pistes si skier depuis la porte compte pour vous.`,
    es: () => `El ski-in/ski-out depende aquí de la dirección: algunos hoteles están sobre la nieve, otros requieren un paseo corto o lanzadera. Elige una dirección a pie de pista si esquiar desde la puerta te importa.`,
    pt: () => `O ski-in/ski-out depende aqui da morada: alguns hotéis ficam sobre a neve, outros exigem uma curta caminhada ou transfer. Escolha uma morada à beira da pista se esquiar à porta lhe importa.`,
    it: () => `Lo ski-in/ski-out qui dipende dall'indirizzo: alcuni hotel sono sulla neve, altri richiedono una breve camminata o navetta. Scegli un indirizzo sulle piste se sciare dalla porta è importante per te.`,
    ja: () => `ここでのski-in/ski-outはホテルの立地次第です。ゲレンデに直結したホテルもあれば、少し歩くかシャトルが必要なホテルもあります。玄関からすぐ滑り出したいなら、ゲレンデ沿いの立地を選んでください。`,
    nl: () => `Ski-in/ski-out hangt hier af van het adres: sommige hotels liggen aan de sneeuw, andere vragen een kort stukje lopen of een pendelbus. Kies een adres aan de piste als skiën vanaf de deur belangrijk voor je is.`,
  },
  limited: {
    en: () => `This is more of a valley base than a slopeside village, so expect a lift, train or shuttle to the snow each morning. Staying central, near the main lift, saves the most time.`,
    fr: () => `C'est plutôt une base en vallée qu'un village au pied des pistes : prévoyez une remontée, un train ou une navette pour rejoindre la neige chaque matin. Loger au centre, près de la remontée principale, fait gagner le plus de temps.`,
    es: () => `Es más una base de valle que un pueblo a pie de pista, así que cuenta con un remonte, tren o lanzadera hasta la nieve cada mañana. Alojarse en el centro, cerca del remonte principal, ahorra más tiempo.`,
    pt: () => `É mais uma base de vale do que uma aldeia à beira da pista, por isso conte com um teleférico, comboio ou transfer até à neve cada manhã. Ficar no centro, perto do teleférico principal, poupa mais tempo.`,
    it: () => `È più una base a fondovalle che un paese sulle piste, quindi metti in conto un impianto, un treno o una navetta per la neve ogni mattina. Alloggiare in centro, vicino all'impianto principale, fa risparmiare più tempo.`,
    ja: () => `ここはゲレンデ沿いの村というより谷底の拠点に近く、毎朝リフトや電車、シャトルでゲレンデへ向かうことになります。中心部、主要リフトの近くに宿を取ると最も時間を節約できます。`,
    nl: () => `Dit is meer een basis in de vallei dan een dorp aan de piste, dus reken op een lift, trein of pendelbus naar de sneeuw elke ochtend. Centraal overnachten, dicht bij de hoofdlift, bespaart de meeste tijd.`,
  },
}

/* vibe fragments: short descriptive clauses, composed into one sentence */
const VIBE_FRAG: Partial<Record<string, Record<Locale, string>>> = {
  luxury: { en: 'a polished, high-end scene', fr: 'une ambiance chic et haut de gamme', es: 'un ambiente cuidado y de alta gama', pt: 'um ambiente requintado e de alta gama', it: "un'atmosfera curata e di alto livello", ja: '洗練されたハイエンドな雰囲気', nl: "een verzorgde, hoogwaardige sfeer" },
  party: { en: 'lively après-ski', fr: 'un après-ski animé', es: 'un après-ski animado', pt: 'um après-ski animado', it: 'un après-ski vivace', ja: '賑やかなアプレスキー', nl: 'levendige après-ski' },
  freeride: { en: 'serious off-piste and freeride terrain', fr: 'du hors-piste et du freeride sérieux', es: 'fuera de pista y freeride serios', pt: 'fora de pista e freeride a sério', it: 'fuoripista e freeride seri', ja: '本格的なオフピステとフリーライドの地形', nl: 'serieus off-piste en freerideterrein' },
  family: { en: 'a family-friendly setup', fr: 'un cadre adapté aux familles', es: 'un entorno apto para familias', pt: 'um ambiente adequado a famílias', it: 'un contesto adatto alle famiglie', ja: 'ファミリーに適した環境', nl: 'een gezinsvriendelijke opzet' },
  gastronomy: { en: 'a strong dining scene', fr: 'une belle scène gastronomique', es: 'una notable escena gastronómica', pt: 'uma forte cena gastronómica', it: 'una solida scena gastronomica', ja: '充実したグルメシーン', nl: 'een sterk culinair aanbod' },
  glacier: { en: 'glacier skiing up high', fr: 'du ski de glacier en altitude', es: 'esquí en glaciar en altura', pt: 'esqui em glaciar nas alturas', it: 'sci su ghiacciaio in quota', ja: '標高の高い氷河スキー', nl: 'gletsjerskiën op grote hoogte' },
  'high-altitude': { en: 'snow-sure high-altitude slopes', fr: "des pentes d'altitude à l'enneigement fiable", es: 'pistas de gran altitud con nieve segura', pt: 'pistas de grande altitude com neve fiável', it: "piste d'alta quota con neve sicura", ja: '積雪が安定した高地のゲレンデ', nl: "hooggelegen pistes met sneeuwzekerheid" },
  iconic: { en: 'a genuinely iconic name', fr: 'un nom véritablement iconique', es: 'un nombre realmente icónico', pt: 'um nome verdadeiramente icónico', it: 'un nome davvero iconico', ja: '名実ともに象徴的な名前', nl: 'een echt iconische naam' },
  japow: { en: 'the famous dry Japanese powder', fr: 'la fameuse poudreuse japonaise', es: 'la famosa nieve polvo japonesa', pt: 'a famosa neve pó japonesa', it: 'la famosa neve farinosa giapponese', ja: '名高い日本の乾いたパウダースノー', nl: 'de beroemde droge Japanse poeder' },
  mountaineering: { en: 'big-mountain and mountaineering terrain', fr: "un terrain de haute montagne et d'alpinisme", es: 'terreno de alta montaña y alpinismo', pt: 'terreno de alta montanha e alpinismo', it: "terreno d'alta montagna e alpinismo", ja: '高山と登山に適した地形', nl: "terrein voor hooggebergte en alpinisme" },
  racing: { en: 'a racing and competition pedigree', fr: 'une tradition de course et de compétition', es: 'una tradición de competición', pt: 'uma tradição de competição', it: 'una tradizione di gare e competizione', ja: 'レースと競技の伝統', nl: 'een traditie van wedstrijden en competitie' },
  'winter-sports': { en: 'a broad winter-sports offering beyond skiing', fr: "une offre de sports d'hiver large au-delà du ski", es: 'una amplia oferta de deportes de invierno más allá del esquí', pt: 'uma ampla oferta de desportos de inverno além do esqui', it: "un'ampia offerta di sport invernali oltre allo sci", ja: 'スキー以外にも幅広いウィンタースポーツ', nl: "een breed aanbod aan wintersporten naast skiën" },
  'big-domain': { en: 'a vast, multi-sector domain', fr: 'un domaine vaste à plusieurs secteurs', es: 'un dominio enorme de varios sectores', pt: 'um domínio vasto de vários setores', it: 'un comprensorio vasto a più settori', ja: '複数エリアにまたがる広大なゲレンデ', nl: 'een uitgestrekt skigebied met meerdere sectoren' },
  expert: { en: 'demanding terrain for strong skiers', fr: 'un terrain exigeant pour bons skieurs', es: 'terreno exigente para esquiadores fuertes', pt: 'terreno exigente para esquiadores fortes', it: 'terreno impegnativo per sciatori forti', ja: '実力者向けの難易度の高い地形', nl: 'veeleisend terrein voor sterke skiërs' },
}

const AND: Record<Locale, string> = { en: 'and', fr: 'et', es: 'y', pt: 'e', it: 'e', ja: 'と', nl: 'en' }
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
  ja: (n, l) => `${n}の魅力は${l}です。`,
  nl: (n, l) => `${n} onderscheidt zich door ${l}.`,
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
      ja: `ここでは一年中雪が残るため、通常の冬季シーズンを大きく超えて滑走でき、夏の氷河スキーも楽しめます。`,
      nl: `Hier ligt het hele jaar sneeuw, dus je kunt hier ver buiten het gebruikelijke winterseizoen skiën, inclusief zomerse gletsjerrondjes.`,
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
      ja: `南半球ではシーズンはおおよそ${start}から${end}まで（現地の冬）で、7月と8月が最も安定しています。`,
      nl: `Op het zuidelijk halfrond loopt het seizoen ruwweg van ${start} tot ${end} (de lokale winter), met juli en augustus als de meest betrouwbare maanden.`,
    }
    return t[locale]
  }
  const tail: Record<Locale, string> = high
    ? { en: ` The altitude also holds spring snow, so late-season skiing stays good well into spring.`, fr: ` L'altitude tient aussi la neige de printemps : le ski de fin de saison reste bon tard au printemps.`, es: ` La altitud también aguanta la nieve de primavera, así que el final de temporada se mantiene bueno entrada la primavera.`, pt: ` A altitude também segura a neve de primavera, por isso o fim de época mantém-se bom já dentro da primavera.`, it: ` La quota tiene anche la neve di primavera, quindi il fine stagione resta buono fino a primavera inoltrata.`, ja: ` 標高の高さが春の雪も保つため、シーズン終盤まで春遅くまで良好なコンディションが続きます。`, nl: ` De hoogte houdt ook de lentesneeuw vast, dus blijft skiën laat in het seizoen goed tot ver in de lente.` }
    : { en: ` Conditions soften as spring arrives, so earlier in the window is the safer call.`, fr: ` Les conditions s'adoucissent à l'approche du printemps : viser le début de la fenêtre est plus sûr.`, es: ` Las condiciones se ablandan al llegar la primavera, así que el principio de la ventana es más seguro.`, pt: ` As condições amolecem com a chegada da primavera, por isso o início da janela é mais seguro.`, it: ` Le condizioni si ammorbidiscono con l'arrivo della primavera, quindi l'inizio della finestra è la scelta più sicura.`, ja: ` 春が近づくとコンディションが緩むため、シーズン序盤の早い時期を狙うのが安全です。`, nl: ` De omstandigheden worden zachter zodra de lente aanbreekt, dus vroeg in het seizoen is de veiligere keuze.` }
  const base: Record<Locale, string> = {
    en: `The season usually runs ${start} to ${end} (about ${weeks} weeks). For the most dependable cover, the deep-winter window of January to February is the safe bet.`,
    fr: `La saison va en général de ${start} à ${end} (environ ${weeks} semaines). Pour l'enneigement le plus sûr, la fenêtre de plein hiver de janvier à février est la valeur sûre.`,
    es: `La temporada suele ir de ${start} a ${end} (unas ${weeks} semanas). Para la nieve más fiable, la ventana de pleno invierno de enero a febrero es la apuesta segura.`,
    pt: `A época vai normalmente de ${start} a ${end} (cerca de ${weeks} semanas). Para a neve mais fiável, a janela de pleno inverno de janeiro a fevereiro é a aposta segura.`,
    it: `La stagione va di solito da ${start} a ${end} (circa ${weeks} settimane). Per l'innevamento più affidabile, la finestra di pieno inverno tra gennaio e febbraio è la scelta sicura.`,
    ja: `シーズンは通常${start}から${end}まで（約${weeks}週間）です。最も雪質が安定するのは1月から2月にかけての真冬シーズンで、これが最も確実な選択です。`,
    nl: `Het seizoen loopt meestal van ${start} tot ${end} (ongeveer ${weeks} weken). Voor de betrouwbaarste sneeuw is het hart van de winter, van januari tot februari, de veilige keuze.`,
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

/** All resorts, snow score first (used for the hub + static params). */
export function getGuideDestinations(): Destination[] {
  return [...destinations].sort((a, b) => b.snowScore - a.snowScore)
}

/* ---- extra FAQ: distinct angles from the 5 points (vertical, linked domain,
 *      beginners, glacier) so the page adds new information, not repetition. ---- */

const FAQ_Q = {
  vertical: {
    en: (d: Destination) => `How much vertical drop does ${d.name} have?`,
    fr: (d: Destination) => `Quel est le dénivelé de ${d.name} ?`,
    es: (d: Destination) => `¿Cuánto desnivel tiene ${d.name}?`,
    pt: (d: Destination) => `Qual é o desnível de ${d.name}?`,
    it: (d: Destination) => `Qual è il dislivello di ${d.name}?`,
    ja: (d: Destination) => `${d.name}の標高差はどのくらいですか？`,
    nl: (d: Destination) => `Hoeveel hoogteverschil heeft ${d.name}?`,
  } as Record<Locale, (d: Destination) => string>,
  domain: {
    en: (d: Destination) => `Is ${d.name} part of a larger ski area?`,
    fr: (d: Destination) => `${d.name} fait-elle partie d'un grand domaine ?`,
    es: (d: Destination) => `¿${d.name} forma parte de un dominio mayor?`,
    pt: (d: Destination) => `${d.name} faz parte de um domínio maior?`,
    it: (d: Destination) => `${d.name} fa parte di un comprensorio più ampio?`,
    ja: (d: Destination) => `${d.name}はより大きなスキーエリアの一部ですか？`,
    nl: (d: Destination) => `Maakt ${d.name} deel uit van een groter skigebied?`,
  } as Record<Locale, (d: Destination) => string>,
  beginners: {
    en: (d: Destination) => `Is ${d.name} good for beginners?`,
    fr: (d: Destination) => `${d.name} est-elle adaptée aux débutants ?`,
    es: (d: Destination) => `¿${d.name} es buena para principiantes?`,
    pt: (d: Destination) => `${d.name} é boa para principiantes?`,
    it: (d: Destination) => `${d.name} è adatta ai principianti?`,
    ja: (d: Destination) => `${d.name}は初心者に向いていますか？`,
    nl: (d: Destination) => `Is ${d.name} geschikt voor beginners?`,
  } as Record<Locale, (d: Destination) => string>,
  glacier: {
    en: () => `Can you ski on a glacier here?`,
    fr: () => `Peut-on skier sur un glacier ici ?`,
    es: () => `¿Se puede esquiar en glaciar aquí?`,
    pt: () => `Pode esquiar-se num glaciar aqui?`,
    it: () => `Si può sciare su un ghiacciaio qui?`,
    ja: () => `ここでは氷河でスキーができますか？`,
    nl: () => `Kun je hier op een gletsjer skiën?`,
  } as Record<Locale, () => string>,
}

function verticalAnswer(d: Destination, locale: Locale): string {
  const v = d.altitudeSummit - d.altitudeBase
  const t: Record<Locale, string> = {
    en: `About ${v} m of vertical, from a ${d.altitudeBase} m base to ${d.altitudeSummit} m at the top.`,
    fr: `Environ ${v} m de dénivelé, d'une base à ${d.altitudeBase} m jusqu'à ${d.altitudeSummit} m au sommet.`,
    es: `Unos ${v} m de desnivel, de una base a ${d.altitudeBase} m hasta ${d.altitudeSummit} m en lo alto.`,
    pt: `Cerca de ${v} m de desnível, de uma base a ${d.altitudeBase} m até ${d.altitudeSummit} m no topo.`,
    it: `Circa ${v} m di dislivello, da una base di ${d.altitudeBase} m fino a ${d.altitudeSummit} m in cima.`,
    ja: `標高差は約${v}m、ベース標高${d.altitudeBase}mから山頂${d.altitudeSummit}mまでです。`,
    nl: `Ongeveer ${v} m hoogteverschil, van een basis op ${d.altitudeBase} m tot ${d.altitudeSummit} m boven.`,
  }
  return t[locale]
}

function domainAnswer(d: Destination, locale: Locale): string {
  const area = getSkiAreaForResort(d.slug)
  if (area) {
    const t: Record<Locale, string> = {
      en: `Yes. ${d.name} is part of the ${area.name} ski area, one of the big linked domains, so a single lift pass opens the whole thing.`,
      fr: `Oui. ${d.name} fait partie du domaine ${area.name}, l'un des grands domaines reliés : un seul forfait ouvre tout l'ensemble.`,
      es: `Sí. ${d.name} forma parte del dominio ${area.name}, uno de los grandes dominios conectados, así que un solo forfait abre todo el conjunto.`,
      pt: `Sim. ${d.name} faz parte do domínio ${area.name}, um dos grandes domínios ligados, por isso um único passe abre todo o conjunto.`,
      it: `Sì. ${d.name} fa parte del comprensorio ${area.name}, uno dei grandi comprensori collegati: un solo skipass apre l'intero comprensorio.`,
      ja: `はい。${d.name}は${area.name}エリアの一部で、大規模な連結ゲレンデのひとつです。1枚のスキーパスでエリア全体を滑走できます。`,
      nl: `Ja. ${d.name} maakt deel uit van het skigebied ${area.name}, een van de grote gekoppelde gebieden, dus met één liftpas heb je toegang tot het geheel.`,
    }
    return t[locale]
  }
  const t: Record<Locale, string> = {
    en: `No, it is a self-contained resort with its own ${d.pistesKm} km of piste rather than part of a linked domain.`,
    fr: `Non, c'est une station autonome avec ses ${d.pistesKm} km de pistes, pas un domaine relié.`,
    es: `No, es una estación independiente con sus ${d.pistesKm} km de pistas, no parte de un dominio conectado.`,
    pt: `Não, é uma estância autónoma com os seus ${d.pistesKm} km de pistas, não parte de um domínio ligado.`,
    it: `No, è una località a sé con i suoi ${d.pistesKm} km di piste, non parte di un comprensorio collegato.`,
    ja: `いいえ、ここは単独のリゾートで、コース総延長${d.pistesKm}kmを自前で有しており、連結ゲレンデの一部ではありません。`,
    nl: `Nee, dit is een op zichzelf staand resort met eigen ${d.pistesKm} km piste, geen onderdeel van een gekoppeld skigebied.`,
  }
  return t[locale]
}

function beginnersAnswer(d: Destination, locale: Locale): string {
  const c = d.pisteCounts
  const total = c.green + c.blue + c.red + c.black || 1
  const share = (c.green + c.blue) / total
  const tier: 'good' | 'ok' | 'limited' =
    share >= 0.55 || c.green >= 8 ? 'good' : share >= 0.4 ? 'ok' : 'limited'
  const A: Record<typeof tier, Record<Locale, string>> = {
    good: {
      en: `Yes. With ${c.green} green and ${c.blue} blue runs, there is plenty of gentle terrain to learn on.`,
      fr: `Oui. Avec ${c.green} pistes vertes et ${c.blue} bleues, le terrain doux ne manque pas pour apprendre.`,
      es: `Sí. Con ${c.green} pistas verdes y ${c.blue} azules, hay terreno suave de sobra para aprender.`,
      pt: `Sim. Com ${c.green} pistas verdes e ${c.blue} azuis, há terreno suave de sobra para aprender.`,
      it: `Sì. Con ${c.green} piste verdi e ${c.blue} blu, c'è terreno facile in abbondanza per imparare.`,
      ja: `はい。緑${c.green}本、青${c.blue}本と初心者向けのやさしいコースが充実しています。`,
      nl: `Ja. Met ${c.green} groene en ${c.blue} blauwe pistes is er volop rustig terrein om op te leren.`,
    },
    ok: {
      en: `It can work: ${c.green} green and ${c.blue} blue runs are enough to start, though the area rewards skiers who can already link turns.`,
      fr: `Cela peut convenir : ${c.green} vertes et ${c.blue} bleues suffisent pour débuter, même si le domaine récompense ceux qui enchaînent déjà les virages.`,
      es: `Puede funcionar: ${c.green} verdes y ${c.blue} azules bastan para empezar, aunque el dominio premia a quienes ya encadenan giros.`,
      pt: `Pode funcionar: ${c.green} verdes e ${c.blue} azuis chegam para começar, embora o domínio recompense quem já encadeia curvas.`,
      it: `Può andare: ${c.green} verdi e ${c.blue} blu bastano per iniziare, anche se il comprensorio premia chi sa già collegare le curve.`,
      ja: `十分滑走できます。緑${c.green}本、青${c.blue}本があれば始めるには十分ですが、すでにターンをつなげられるレベルの人ほど楽しめるゲレンデです。`,
      nl: `Het kan lukken: ${c.green} groene en ${c.blue} blauwe pistes zijn genoeg om te beginnen, al beloont het gebied skiërs die al bochten kunnen koppelen.`,
    },
    limited: {
      en: `Less so: the terrain leans intermediate and advanced (${c.green} green, ${c.blue} blue), so committed beginners are better off starting elsewhere.`,
      fr: `Moins : le terrain penche vers l'intermédiaire et l'expert (${c.green} vertes, ${c.blue} bleues), les vrais débutants ont intérêt à commencer ailleurs.`,
      es: `Menos: el terreno tira a intermedio y avanzado (${c.green} verdes, ${c.blue} azules), así que los principiantes puros harán mejor en empezar en otro sitio.`,
      pt: `Menos: o terreno pende para intermédio e avançado (${c.green} verdes, ${c.blue} azuis), por isso principiantes a sério é melhor começarem noutro lado.`,
      it: `Meno: il terreno pende verso intermedio e avanzato (${c.green} verdi, ${c.blue} blu), quindi i veri principianti fanno meglio a iniziare altrove.`,
      ja: `あまり向きません。地形は中級・上級寄り（緑${c.green}本、青${c.blue}本）のため、本格的な初心者は他のゲレンデから始める方がよいでしょう。`,
      nl: `Minder: het terrein leunt naar gevorderd en ervaren (${c.green} groen, ${c.blue} blauw), dus serieuze beginners kunnen beter elders starten.`,
    },
  }
  return A[tier][locale]
}

function glacierAnswer(locale: Locale): string {
  const t: Record<Locale, string> = {
    en: `Yes, there is glacier skiing up high, which stretches the season and helps in lean snow years.`,
    fr: `Oui, il y a du ski de glacier en altitude, ce qui allonge la saison et aide les années peu enneigées.`,
    es: `Sí, hay esquí en glaciar en altura, lo que alarga la temporada y ayuda en años de poca nieve.`,
    pt: `Sim, há esqui em glaciar nas alturas, o que prolonga a época e ajuda em anos de pouca neve.`,
    it: `Sì, c'è sci su ghiacciaio in quota, il che allunga la stagione e aiuta nelle annate con poca neve.`,
    ja: `はい、標高の高い場所で氷河スキーができ、シーズンが延びるほか積雪が少ない年にも役立ちます。`,
    nl: `Ja, er is gletsjerskiën op grote hoogte, wat het seizoen verlengt en helpt in jaren met weinig sneeuw.`,
  }
  return t[locale]
}

/** 3 to 4 extra FAQ entries, all derived from data and distinct from the 5 points. */
export function resortFaq(d: Destination, locale: Locale): GuidePoint[] {
  const c = d.pisteCounts
  const hasPisteData = c.green + c.blue + c.red + c.black > 0
  const out: GuidePoint[] = []
  if (d.altitudeSummit > d.altitudeBase) {
    out.push({ q: FAQ_Q.vertical[locale](d), a: verticalAnswer(d, locale) })
  }
  out.push({ q: FAQ_Q.domain[locale](d), a: domainAnswer(d, locale) })
  if (hasPisteData) {
    out.push({ q: FAQ_Q.beginners[locale](d), a: beginnersAnswer(d, locale) })
  }
  if (d.vibes.includes('glacier')) {
    out.push({ q: FAQ_Q.glacier[locale](), a: glacierAnswer(locale) })
  }
  return out
}
