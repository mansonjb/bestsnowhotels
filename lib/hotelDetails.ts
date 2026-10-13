import details from '@/data/hotelDetails.json'
import type { Locale } from '@/app/[locale]/dictionaries'

/** Google-derived enrichment for the best-hotels comparison resorts. */
export interface HotelDetail {
  stars: number | null
  amenities: string[]
}

const DB = details as Record<string, HotelDetail>

export function getHotelDetail(id: string): HotelDetail | undefined {
  return DB[id]
}

/** Display order: most decision-relevant amenities for a ski hotel first. */
export const AMENITY_PRIORITY = [
  'skiinout', 'skistorage', 'spa', 'pool', 'hottub', 'sauna', 'fitness', 'restaurant', 'bar',
  'shuttle', 'parking', 'wifi', 'breakfast', 'roomservice', 'family', 'pets', 'laundry', 'aircon', 'ev', 'accessible',
]

export const AMENITY: Record<string, { icon: string; label: Record<Locale, string> }> = {
  skiinout: { icon: '⛷️', label: { en: 'Ski-in/ski-out', fr: 'Ski aux pieds', es: 'Ski-in/ski-out', pt: 'Ski-in/ski-out', it: 'Ski-in/ski-out', nl: 'Ski-in/ski-out', ja: 'スキーイン・アウト', 'zh-hk': '雪道直達' } },
  skistorage: { icon: '🎿', label: { en: 'Ski storage', fr: 'Local à skis', es: 'Guardaesquís', pt: 'Guarda-esquis', it: 'Deposito sci', nl: 'Skiberging', ja: 'スキー保管', 'zh-hk': '雪具存放' } },
  spa: { icon: '💆', label: { en: 'Spa', fr: 'Spa', es: 'Spa', pt: 'Spa', it: 'Spa', nl: 'Spa', ja: 'スパ', 'zh-hk': '水療' } },
  pool: { icon: '🏊', label: { en: 'Pool', fr: 'Piscine', es: 'Piscina', pt: 'Piscina', it: 'Piscina', nl: 'Zwembad', ja: 'プール', 'zh-hk': '泳池' } },
  hottub: { icon: '♨️', label: { en: 'Hot tub', fr: 'Jacuzzi', es: 'Jacuzzi', pt: 'Jacuzzi', it: 'Idromassaggio', nl: 'Bubbelbad', ja: 'ジャグジー', 'zh-hk': '按摩池' } },
  sauna: { icon: '🧖', label: { en: 'Sauna', fr: 'Sauna', es: 'Sauna', pt: 'Sauna', it: 'Sauna', nl: 'Sauna', ja: 'サウナ', 'zh-hk': '桑拿' } },
  fitness: { icon: '🏋️', label: { en: 'Gym', fr: 'Salle de sport', es: 'Gimnasio', pt: 'Ginásio', it: 'Palestra', nl: 'Fitnessruimte', ja: 'ジム', 'zh-hk': '健身室' } },
  restaurant: { icon: '🍽️', label: { en: 'Restaurant', fr: 'Restaurant', es: 'Restaurante', pt: 'Restaurante', it: 'Ristorante', nl: 'Restaurant', ja: 'レストラン', 'zh-hk': '餐廳' } },
  bar: { icon: '🍸', label: { en: 'Bar', fr: 'Bar', es: 'Bar', pt: 'Bar', it: 'Bar', nl: 'Bar', ja: 'バー', 'zh-hk': '酒吧' } },
  shuttle: { icon: '🚐', label: { en: 'Shuttle', fr: 'Navette', es: 'Traslado', pt: 'Transfere', it: 'Navetta', nl: 'Shuttle', ja: '送迎', 'zh-hk': '接送服務' } },
  parking: { icon: '🅿️', label: { en: 'Parking', fr: 'Parking', es: 'Parking', pt: 'Estacionamento', it: 'Parcheggio', nl: 'Parkeren', ja: '駐車場', 'zh-hk': '停車場' } },
  wifi: { icon: '📶', label: { en: 'Free Wi-Fi', fr: 'Wi-Fi gratuit', es: 'Wi-Fi gratis', pt: 'Wi-Fi grátis', it: 'Wi-Fi gratis', nl: 'Gratis wifi', ja: '無料Wi-Fi', 'zh-hk': '免費Wi-Fi' } },
  breakfast: { icon: '🥐', label: { en: 'Breakfast', fr: 'Petit-déjeuner', es: 'Desayuno', pt: 'Pequeno-almoço', it: 'Colazione', nl: 'Ontbijt', ja: '朝食', 'zh-hk': '早餐' } },
  roomservice: { icon: '🛎️', label: { en: 'Room service', fr: 'Service en chambre', es: 'Servicio de habitaciones', pt: 'Serviço de quarto', it: 'Servizio in camera', nl: 'Roomservice', ja: 'ルームサービス', 'zh-hk': '客房服務' } },
  family: { icon: '👨‍👩‍👧', label: { en: 'Family-friendly', fr: 'Familles bienvenues', es: 'Ideal para familias', pt: 'Ideal para famílias', it: 'Per famiglie', nl: 'Gezinsvriendelijk', ja: 'ファミリー向け', 'zh-hk': '適合家庭' } },
  pets: { icon: '🐾', label: { en: 'Pet-friendly', fr: 'Animaux admis', es: 'Admite mascotas', pt: 'Aceita animais', it: 'Animali ammessi', nl: 'Huisdieren welkom', ja: 'ペット可', 'zh-hk': '寵物友善' } },
  laundry: { icon: '🧺', label: { en: 'Laundry', fr: 'Blanchisserie', es: 'Lavandería', pt: 'Lavandaria', it: 'Lavanderia', nl: 'Wasserij', ja: 'ランドリー', 'zh-hk': '洗衣服務' } },
  aircon: { icon: '❄️', label: { en: 'Air-con', fr: 'Climatisation', es: 'Aire acondicionado', pt: 'Ar condicionado', it: 'Aria condizionata', nl: 'Airco', ja: '空調', 'zh-hk': '冷氣' } },
  ev: { icon: '🔌', label: { en: 'EV charging', fr: 'Recharge VE', es: 'Carga para VE', pt: 'Carregamento VE', it: 'Ricarica auto elettriche', nl: 'EV-laden', ja: 'EV充電', 'zh-hk': '電動車充電' } },
  accessible: { icon: '♿', label: { en: 'Step-free access', fr: 'Accès sans marches', es: 'Acceso sin barreras', pt: 'Acesso sem degraus', it: 'Accesso senza gradini', nl: 'Drempelvrij', ja: 'バリアフリー', 'zh-hk': '無障礙通道' } },
}

/** The top amenities a hotel has, in display-priority order. */
export function amenityChips(amenities: string[] | undefined, max = 6): string[] {
  if (!amenities?.length) return []
  const set = new Set(amenities)
  return AMENITY_PRIORITY.filter((a) => set.has(a) && AMENITY[a]).slice(0, max)
}

export const hasSkiInOut = (amenities: string[] | undefined): boolean => !!amenities?.includes('skiinout')
