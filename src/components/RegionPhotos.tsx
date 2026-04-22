import { useState, useCallback } from 'react'
import { MapPin, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

const REGIONS = [
  {
    key: 'taipei',
    label: '台北',
    city: '台北市',
    area: '北部',
    population: '250萬人',
    description: '科技與時尚首都，命定對象密度最高',
    seed: 'taipei',
    photoCount: 9,
  },
  {
    key: 'newtaipei',
    label: '新北',
    city: '新北市',
    area: '北部',
    population: '400萬人',
    description: '多元文化熔爐，機會之城',
    seed: 'newtaipei',
    photoCount: 9,
  },
  {
    key: 'taoyuan',
    label: '桃園',
    city: '桃園市',
    area: '北部',
    population: '230萬人',
    description: '國際航空都會，年輕活力',
    seed: 'taoyuan',
    photoCount: 6,
  },
  {
    key: 'hsinchu',
    label: '新竹',
    city: '新竹縣市',
    area: '北部',
    population: '100萬人',
    description: '科技新貴搖籃，智慧之城',
    seed: 'hsinchu',
    photoCount: 6,
  },
  {
    key: 'taichung',
    label: '台中',
    city: '台中市',
    area: '中部',
    population: '280萬人',
    description: '宜居都會，山海兼具',
    seed: 'taichung',
    photoCount: 9,
  },
  {
    key: 'changhua',
    label: '彰化',
    city: '彰化縣',
    area: '中部',
    population: '128萬人',
    description: '風格小鎮，人情味濃',
    seed: 'changhua',
    photoCount: 6,
  },
  {
    key: 'tainan',
    label: '台南',
    city: '台南市',
    area: '南部',
    population: '188萬人',
    description: '古都底蘊，美食之都',
    seed: 'tainan',
    photoCount: 9,
  },
  {
    key: 'kaohsiung',
    label: '高雄',
    city: '高雄市',
    area: '南部',
    population: '275萬人',
    description: '港都氣魄，熱情開朗',
    seed: 'kaohsiung',
    photoCount: 9,
  },
  {
    key: 'pingtung',
    label: '屏東',
    city: '屏東縣',
    area: '南部',
    population: '82萬人',
    description: '熱帶風情，陽光海岸',
    seed: 'pingtung',
    photoCount: 6,
  },
  {
    key: 'hualien',
    label: '花蓮',
    city: '花蓮縣',
    area: '東部',
    population: '33萬人',
    description: '山水天堂，慢活秘境',
    seed: 'hualien',
    photoCount: 9,
  },
  {
    key: 'taitung',
    label: '台東',
    city: '台東縣',
    area: '東部',
    population: '22萬人',
    description: '偏遠純淨，自然純樸',
    seed: 'taitung',
    photoCount: 6,
  },
  {
    key: 'penghu',
    label: '澎湖',
    city: '澎湖縣',
    area: '離島',
    population: '10萬人',
    description: '海島風情，浪漫漁村',
    seed: 'penghu',
    photoCount: 6,
  },
  {
    key: 'kinmen',
    label: '金門',
    city: '金門縣',
    area: '離島',
    population: '14萬人',
    description: '戰地風情，小島風情',
    seed: 'kinmen',
    photoCount: 6,
  },
]

const AREA_ORDER = ['北部', '中部', '南部', '東部', '離島']

function getPhotoUrl(seed: string, index: number, size = 400): string {
  return `https://picsum.photos/seed/${seed}${index}/${size}/${size}`
}

interface PhotoItem {
  index: number
  seed: string
  loaded: boolean
}

interface Props {
  onClose?: () => void
}

export default function RegionPhotos({ onClose }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<string>('taipei')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [imgLoadedMap, setImgLoadedMap] = useState<Record<string, boolean>>({})

  const region = REGIONS.find(r => r.key === selectedRegion) || REGIONS[0]

  function selectRegion(key: string) {
    setSelectedRegion(key)
    setLightboxIndex(null)
    setImgLoadedMap({})
    // Generate photo list for new region
    const reg = REGIONS.find(r => r.key === key) || REGIONS[0]
    const newPhotos: PhotoItem[] = Array.from({ length: reg.photoCount }, (_, i) => ({
      index: i,
      seed: `${reg.seed}${i}`,
      loaded: false,
    }))
    setPhotos(newPhotos)
  }

  // Initialize photos when region first selected (if empty)
  if (photos.length === 0 && selectedRegion) {
    const newPhotos: PhotoItem[] = Array.from({ length: region.photoCount }, (_, i) => ({
      index: i,
      seed: `${region.seed}${i}`,
      loaded: false,
    }))
    setPhotos(newPhotos)
  }

  const handleImgLoad = useCallback((key: string) => {
    setImgLoadedMap(prev => ({ ...prev, [key]: true }))
  }, [])

  function openLightbox(index: number) {
    setLightboxIndex(index)
  }

  function closeLightbox() {
    setLightboxIndex(null)
  }

  function prevPhoto() {
    setLightboxIndex(i => (i !== null && i > 0 ? i - 1 : photos.length - 1))
  }

  function nextPhoto() {
    setLightboxIndex(i => (i !== null && i < photos.length - 1 ? i + 1 : 0))
  }

  // Group regions by area
  const grouped = AREA_ORDER.map(area => ({
    area,
    regions: REGIONS.filter(r => r.area === area),
  })).filter(g => g.regions.length > 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-yellow-300" />
          <h2 className="text-lg font-bold text-purple-200">地區照片牆</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-purple-200 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Region Chips by Area */}
      <div className="space-y-3">
        {grouped.map(({ area, regions }) => (
          <div key={area}>
            <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 ml-1">
              {area}
            </div>
            <div className="flex flex-wrap gap-2">
              {regions.map(r => (
                <button
                  key={r.key}
                  onClick={() => selectRegion(r.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    selectedRegion === r.key
                      ? 'bg-purple-600 text-white border-purple-400 shadow shadow-purple-500/30'
                      : 'bg-purple-950/60 text-purple-300 border-purple-800/50 hover:border-purple-500/40'
                  }`}
                >
                  <MapPin size={10} />
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Region Info Card */}
      <div className="bg-gradient-to-r from-purple-900/80 to-pink-900/60 rounded-xl p-4 border border-purple-400/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black text-white">{region.label}</span>
              <span className="text-purple-400 text-sm">{region.city}</span>
            </div>
            <p className="text-purple-300 text-sm mb-1">命定 "{region.label}" 的 ta</p>
            <p className="text-purple-500 text-xs">{region.description}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <div className="text-pink-400 font-black text-lg">{region.population}</div>
            <div className="text-purple-600 text-xs">居民</div>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map(({ index, seed }) => {
          const loaded = imgLoadedMap[`${seed}`]
          return (
            <button
              key={seed}
              onClick={() => openLightbox(index)}
              className="relative aspect-square rounded-xl overflow-hidden bg-purple-950/40 border border-purple-800/30 hover:border-pink-500/40 transition-all group"
            >
              {!loaded && (
                <div className="absolute inset-0 bg-purple-900/30 animate-pulse" />
              )}
              <img
                src={getPhotoUrl(seed, index)}
                alt={`${region.label} 照片 ${index + 1}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => handleImgLoad(`${seed}`)}
                onError={() => handleImgLoad(`${seed}`)}
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-white text-xs font-medium">命定 #{index + 1}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Controls */}
          <button
            onClick={e => { e.stopPropagation(); closeLightbox() }}
            className="absolute top-4 right-4 text-purple-300 hover:text-white transition-colors z-10"
          >
            <X size={24} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); prevPhoto() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors z-10 bg-purple-900/50 rounded-full p-2"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); nextPhoto() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors z-10 bg-purple-900/50 rounded-full p-2"
          >
            <ChevronRight size={28} />
          </button>

          {/* Image */}
          <img
            src={getPhotoUrl(`${region.seed}${lightboxIndex}`, lightboxIndex, 800)}
            alt={`${region.label} 照片 ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Caption */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-purple-900/80 rounded-full px-4 py-2 border border-purple-500/30">
            <span className="text-purple-200 text-sm font-medium">
              {region.label} · 命定 #{lightboxIndex + 1} / {photos.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
