import { lazy, Suspense, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ChevronDown, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PillButton } from '../components/ui/PillButton'
import { useVehiclesHeroAnimation } from '../hooks/useVehiclesHeroAnimation'
import { apiFetch, API_BASE_URL } from '../lib/api'
import type { Vehicle, Brand, Category } from '../types'

const FordHero3D = lazy(() => import('../components/vehicles/FordHero3D'))

function formatVND(value: number | string) {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0
  return new Intl.NumberFormat('vi-VN').format(num) + ' ₫'
}

function getBrandName(brand: Brand | string | undefined | null): string {
  if (!brand) return ''
  if (typeof brand === 'string') return brand
  return brand.name || ''
}

function getVehicleImage(vehicle: Vehicle): string {
  if (vehicle.images && vehicle.images.length > 0) {
    const primary = vehicle.images.find(img => img.isPrimary) || vehicle.images[0]
    const url = primary.imageUrl
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
  }
  return '/images/car-1.jpg'
}

export default function VehiclesPage() {
  const { t } = useTranslation()
  const [isModelLoaded, setIsModelLoaded] = useState(false)

  // Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [selectedCondition, setSelectedCondition] = useState<string>('all')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useVehiclesHeroAnimation(isModelLoaded, [t])

  // Fetch filter metadata (brands & categories)
  useEffect(() => {
    async function loadMeta() {
      try {
        const [bRes, cRes] = await Promise.all([
          apiFetch<Brand[]>('/api/brands').catch(() => []),
          apiFetch<Category[]>('/api/categories').catch(() => [])
        ])
        setBrands(Array.isArray(bRes) ? bRes : [])
        setCategories(Array.isArray(cRes) ? cRes : [])
      } catch (err) {
        console.warn('Lỗi khi tải danh mục xe:', err)
      }
    }
    loadMeta()
  }, [])

  // Fetch vehicles with filters
  useEffect(() => {
    let isCancelled = false
    async function fetchVehicles() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (search.trim()) params.append('search', search.trim())
        if (selectedBrand !== 'all') params.append('brandId', selectedBrand)
        if (selectedCondition !== 'all') params.append('condition', selectedCondition)
        if (activeCategory !== 'all') params.append('categoryId', activeCategory)
        params.append('limit', '50')

        const res = await apiFetch<any>(`/api/vehicles?${params.toString()}`)
        if (!isCancelled) {
          const list = Array.isArray(res) ? res : (res?.data || [])
          setVehicles(list)
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'Không thể tải danh sách xe từ máy chủ')
        }
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchVehicles()
    }, 250)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [search, selectedBrand, selectedCondition, activeCategory])

  return (
    <div className="bg-[#f7f7f7] min-h-screen pb-20">
      {/* Hero — 3D interactive stage */}
      <section className="vehicles-hero-wrap">
        <div className="vehicles-hero">
          <div className="vehicles-hero__car-stage">
            <Suspense
              fallback={
                <div className="ford-hero-3d__loader" style={{ color: 'rgba(0,0,0,0.3)' }}>
                  {t('vehicles.model_loading', 'Đang tải mô hình xe 3D...')}
                </div>
              }
            >
              <FordHero3D onLoaded={() => setIsModelLoaded(true)} />
            </Suspense>
          </div>

          {/* Stats — bottom right */}
          <div className="vehicles-hero__stats">
            <div data-vehicles-stat className="vehicles-hero__stat opacity-0">
              <span className="vehicles-hero__stat-value">{brands.length || '6'}+</span>
              <span className="vehicles-hero__stat-label">{t('vehicles.stats_brands', 'Hãng xe')}</span>
            </div>
            <div data-vehicles-stat className="vehicles-hero__stat opacity-0">
              <span className="vehicles-hero__stat-value">{vehicles.length || '10'}+</span>
              <span className="vehicles-hero__stat-label">{t('vehicles.stats_stock', 'Xe sẵn sàng giao')}</span>
            </div>
          </div>

          <div className="vehicles-hero__content">
            <div className="vehicles-hero__copy">
              <h1 className="vehicles-hero__title">
                <span className="vehicles-hero__title-line" data-vehicles-title-line>
                  <span>{t('vehicles.hero_title_line1', 'BỘ SƯU TẬP XE')}</span>
                </span>
                <span className="vehicles-hero__title-line" data-vehicles-title-line>
                  <span>{t('vehicles.hero_title_line2', 'ĐẲNG CẤP & SANG TRỌNG')}</span>
                </span>
              </h1>

              <p
                data-vehicles-hero-subtitle
                className="vehicles-hero__subtitle opacity-0"
              >
                {t('vehicles.hero_subtitle', 'Trải nghiệm các dòng xe hàng đầu từ Mercedes, VinFast, Toyota, Ford với kiểm định 160 bước.')}
              </p>

              <div data-vehicles-hero-cta className="vehicles-hero__cta-row opacity-0">
                <PillButton to="#inventory">{t('vehicles.hero_btn', 'Khám phá ngay')}</PillButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="inventory" className="site-container-wide py-16 flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-[280px] flex-shrink-0">
          <div className="sticky top-24 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-black/5 shadow-xs">
            <h2 className="text-xl font-bold mb-6 text-black flex items-center justify-between">
              <span>{t('vehicles.filter_title', 'Bộ lọc tìm kiếm')}</span>
              {(search || selectedBrand !== 'all' || selectedCondition !== 'all' || activeCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSelectedBrand('all')
                    setSelectedCondition('all')
                    setActiveCategory('all')
                  }}
                  className="text-xs text-neutral-500 hover:text-black transition-colors"
                >
                  Đặt lại
                </button>
              )}
            </h2>
            
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('vehicles.search_placeholder', 'Tìm mẫu xe, số khung...')}
                className="w-full bg-white rounded-full pl-11 pr-4 py-3 text-sm border border-neutral-200 focus:border-black focus:outline-none shadow-xs transition-all"
              />
            </div>

            <div className="space-y-6">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  {t('vehicles.make_label', 'Hãng sản xuất')}
                </label>
                <div className="relative">
                  <select 
                    value={selectedBrand}
                    onChange={e => setSelectedBrand(e.target.value)}
                    className="w-full appearance-none bg-white rounded-xl px-4 py-3 text-sm border border-neutral-200 focus:border-black focus:outline-none shadow-xs text-black cursor-pointer"
                  >
                    <option value="all">Tất cả thương hiệu</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  {t('vehicles.condition_label', 'Tình trạng xe')}
                </label>
                <div className="relative">
                  <select 
                    value={selectedCondition}
                    onChange={e => setSelectedCondition(e.target.value)}
                    className="w-full appearance-none bg-white rounded-xl px-4 py-3 text-sm border border-neutral-200 focus:border-black focus:outline-none shadow-xs text-black cursor-pointer"
                  >
                    <option value="all">Tất cả tình trạng</option>
                    <option value="NEW">Xe mới 100%</option>
                    <option value="USED">Xe đã qua sử dụng (Lướt)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Info banner */}
              <div className="p-4 rounded-2xl bg-black/5 text-neutral-600 text-xs leading-relaxed space-y-1">
                <p className="font-semibold text-black flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Cam kết Nexus Auto:
                </p>
                <p>• Bảo hành chính hãng lên tới 5 năm</p>
                <p>• Hỗ trợ vay mua xe trả góp tới 80%</p>
                <p>• Đăng ký lái thử tận nhà miễn phí</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all shrink-0 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-black text-white shadow-md' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60'
              }`}
            >
              Tất cả phân khúc
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(String(cat.id))}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all shrink-0 cursor-pointer ${
                  activeCategory === String(cat.id)
                    ? 'bg-black text-white shadow-md' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-black/5 shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
              <p className="text-sm font-medium text-neutral-500">Đang tìm kiếm xe trong showroom...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-8 bg-red-50 text-red-700 rounded-3xl border border-red-200 flex flex-col items-center text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <p className="font-semibold text-base mb-1">Không thể tải danh sách xe</p>
              <p className="text-sm text-red-600 max-w-md">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && vehicles.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-black/5 shadow-xs px-6">
              <p className="text-lg font-bold text-black mb-2">Chưa tìm thấy mẫu xe phù hợp</p>
              <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
                Vui lòng thử chọn lại phân khúc hoặc tìm kiếm với từ khóa khác.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setSelectedBrand('all')
                  setSelectedCondition('all')
                  setActiveCategory('all')
                }}
                className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Xem tất cả xe
              </button>
            </div>
          )}

          {/* Vehicles Grid */}
          {!loading && !error && vehicles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((car) => {
                const brandName = getBrandName(car.brand)
                const title = `${brandName} ${car.model} ${car.trim || ''}`.trim()
                const imgSrc = getVehicleImage(car)

                return (
                  <Link 
                    key={car.id} 
                    to={`/vehicles/${car.id}`}
                    className="group bg-white rounded-3xl p-4 border border-black/5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Stage */}
                      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4 bg-neutral-100">
                        <img 
                          src={imgSrc} 
                          alt={title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/car-1.jpg'
                          }}
                        />
                        
                        {/* Status / Condition Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {car.condition === 'NEW' ? (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-black text-white">
                              Xe Mới
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-neutral-800 text-white">
                              Xe Lướt
                            </span>
                          )}
                          {car.featured && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500 text-white">
                              Nổi bật
                            </span>
                          )}
                        </div>

                        {/* Hover Arrow Icon */}
                        <div className="absolute bottom-3 right-3 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                      
                      {/* Vehicle Header */}
                      <div className="px-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                          {brandName || 'Showroom'} • {car.year}
                        </p>
                        <h3 className="text-lg font-bold text-black group-hover:text-neutral-700 transition-colors line-clamp-1 mb-2">
                          {title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Vehicle Footer Info & Price */}
                    <div className="px-2 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-neutral-400">Giá niêm yết</p>
                        <p className="text-lg font-extrabold text-black">
                          {formatVND(car.price)}
                        </p>
                      </div>
                      
                      <div className="text-right text-xs text-neutral-500">
                        <p className="font-medium text-black">
                          {car.fuelType === 'ELECTRIC' ? 'Thuần điện' : car.fuelType === 'HYBRID' ? 'Hybrid' : car.transmission === 'AUTOMATIC' ? 'Số tự động' : 'Số sàn'}
                        </p>
                        <p>{car.seats} chỗ ngồi</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
