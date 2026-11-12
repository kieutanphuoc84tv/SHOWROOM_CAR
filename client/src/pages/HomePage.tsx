import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PillButton } from '@/components/ui/PillButton'
import { useGsapScrollAnimations } from '@/hooks/useGsapScrollAnimations'
import { SearchPill, StatFloatCard } from '@/components/ui/PillButton'
import { BrandWheel } from '@/components/brand/BrandWheel'
import { ArrowUpRight, Car, ChevronDown, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiFetch, API_BASE_URL } from '@/lib/api'
import type { Vehicle, Brand } from '@/types'

function formatVND(value: number | string | undefined | null) {
  if (!value) return 'Liên hệ'
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

const featuredCars = [
  {
    id: 1,
    name: 'Toyota Camry 2024',
    year: '2024',
    price: '$35,000',
    tag: 'home.featured.tag_hybrid',
    image: '/images/car-1.jpg?v=2',
  },
  {
    id: 2,
    name: 'Ford Everest Titanium',
    year: '2023',
    price: '$59,000',
    tag: 'home.featured.tag_suv',
    image: '/images/car-2.jpg?v=2',
  },
  {
    id: 3,
    name: 'VinFast VF 8',
    year: '2024',
    price: '$46,000',
    tag: 'home.featured.tag_ev',
    image: '/images/car-3.jpg?v=2',
  },
]

const serviceCards = [
  { key: 'inspection', image: '/images/service-inspection.png', tall: true },
  { key: 'history', image: '', tall: false, dark: true },
  { key: 'detailing', image: '/images/service-detailing.png', tall: false },
  { key: 'warranty', image: '/images/service-warranty.png', tall: false },
  { key: 'financing', image: '/images/service-financing.png', tall: false },
]

const blogCards = [
  {
    id: 1,
    dateKey: 'home.blog.post1_date',
    titleKey: 'home.blog.post1_title',
    image: '/images/blog-1.png',
  },
  {
    id: 2,
    dateKey: 'home.blog.post2_date',
    titleKey: 'home.blog.post2_title',
    image: '/images/blog-2.png',
  },
]

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5'] as const

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-black/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-[14px] font-medium text-black"
      >
        {question}
        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <div className={cn('grid transition-all duration-300', open ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <p className="overflow-hidden text-[13px] leading-relaxed text-text-secondary">{answer}</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  const [cars, setCars] = useState<Vehicle[]>([])

  useEffect(() => {
    apiFetch<any>('/api/vehicles?limit=6')
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.data || [])
        setCars(list)
      })
      .catch(err => {
        console.warn('Lỗi tải xe trang chủ:', err)
      })
  }, [])

  useGsapScrollAnimations([t])

  return (
    <div className="pb-4">

      {/* Hero — cinematic banner */}
      <section className="site-container pt-6 pb-4" data-hero-section>
        <div className="hero-cinematic relative overflow-hidden rounded-[28px] min-h-[560px] md:min-h-[640px] lg:min-h-[680px]">
          {/* Background media with parallax + Ken Burns */}
          <div className="absolute inset-0 overflow-hidden" data-hero-parallax>
            <img
              data-hero-image
              src="/images/hero.jpg"
              alt=""
              className="hero-cinematic__image"
            />
          </div>

          {/* Cinematic overlays */}
          <div className="hero-cinematic__vignette" aria-hidden />
          <div className="hero-cinematic__gradient" aria-hidden />
          <div className="hero-cinematic__grain" aria-hidden />
          <div className="hero-cinematic__scanline" aria-hidden />

          {/* Content grid */}
          <div className="relative z-10 grid min-h-[560px] md:min-h-[640px] lg:min-h-[680px] grid-rows-[auto_1fr_auto] p-6 md:p-10 lg:p-12">
            {/* Top bar: eyebrow + search */}
            <div className="flex items-start justify-between gap-6">
              <span data-hero-eyebrow className="hero-eyebrow">
                {t('home.hero.showroom_label')}
              </span>
              <div data-hero-search className="shrink-0">
                <SearchPill placeholder={t('home.hero.search_placeholder')} />
              </div>
            </div>

            {/* Bottom: title block + stats */}
            <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-8">
              <div className="max-w-2xl">
                <h1 className="hero-cinematic__title">
                  <span className="hero-cinematic__title-line" data-hero-title-line>
                    <span className="hero-cinematic__title-accent">{t('home.hero.premier_title_line1')}</span>
                  </span>
                  <span className="hero-cinematic__title-line" data-hero-title-line>
                    <span>{t('home.hero.premier_title_line2')}</span>
                  </span>
                  <span className="hero-cinematic__title-line" data-hero-title-line>
                    <span>{t('home.hero.premier_title_line3')}</span>
                  </span>
                </h1>
                <p data-hero-subtitle className="hero-cinematic__subtitle mt-5 md:mt-6">
                  {t('home.hero.premier_subtitle')}
                </p>
                <div data-hero-cta className="mt-7 md:mt-8">
                  <PillButton to="/vehicles">{t('home.hero.cta_inventory')}</PillButton>
                </div>
              </div>

              <div data-hero-stats className="flex flex-col gap-3 md:items-end md:pb-1">
                <StatFloatCard
                  icon={Car}
                  value={t('home.hero.stat_cars_value')}
                  label={t('home.hero.stat_cars_label')}
                  className="hero-stat-card"
                  noFloat
                />
                <StatFloatCard
                  icon={DollarSign}
                  value={t('home.hero.stat_sales_value')}
                  label={t('home.hero.stat_sales_label')}
                  className="hero-stat-card"
                  noFloat
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="site-container py-16 md:py-24" data-reveal>
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-eyebrow mb-3">{t('home.featured.eyebrow')}</p>
            <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-tight leading-none">
              {t('home.hero.title_line1')} {t('home.hero.title_line2')}
            </h2>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end lg:max-w-xs">
            <PillButton to="/vehicles">{t('home.hero.cta_inventory')}</PillButton>
            <p className="text-[13px] leading-relaxed text-text-secondary lg:text-right">{t('home.featured.framer_desc')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3" data-stagger>
          {cars.map((car) => {
            const brandName = getBrandName(car.brand)
            const title = `${brandName} ${car.model} ${car.trim || ''}`.trim()
            const img = getVehicleImage(car)

            return (
              <Link key={car.id} to={`/vehicles/${car.id}`} className="car-card group" data-stagger-item>
                <div className="car-card-image aspect-[4/3]">
                  <img 
                    src={img} 
                    alt={title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/car-1.jpg'
                    }}
                  />
                  <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-md">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  {car.condition === 'NEW' && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black text-white">
                      Xe mới
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-black truncate">{title}</h3>
                    <p className="text-[12px] text-text-secondary">{car.year} • {car.fuelType === 'ELECTRIC' ? 'Thuần điện' : car.transmission === 'AUTOMATIC' ? 'Tự động' : 'Số sàn'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-bold text-black tabular-nums">{formatVND(car.price)}</p>
                    <p className="text-[11px] text-text-tertiary">{car.status === 'AVAILABLE' ? 'Sẵn sàng giao' : 'Đã cọc'}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Services */}
      <section className="site-container py-16 md:py-24" data-reveal>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="section-eyebrow mb-3">{t('home.services.eyebrow')}</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-tight leading-tight max-w-md">{t('home.services.title')}</h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-text-secondary">{t('home.services.subtitle')}</p>
            <div className="mt-8"><PillButton to="/vehicles">{t('home.hero.cta_inventory')}</PillButton></div>
          </div>
          <div className="grid grid-cols-2 gap-3 auto-rows-[minmax(140px,auto)]" data-stagger>
            {serviceCards.map((card) => (
              <div key={card.key} data-stagger-item className={`service-card ${card.tall ? 'row-span-2 min-h-[300px]' : 'min-h-[160px]'} ${card.dark ? 'bg-black' : ''}`}>
                {!card.dark && card.image && <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                {card.dark ? (
                  <div className="relative flex h-full flex-col justify-end p-5 overflow-hidden">
                    <BrandWheel />
                    <div className="relative z-10 mt-auto">
                      <p className="text-[14px] font-semibold text-white leading-snug max-w-[11rem]">
                        {t(`home.services.${card.key}`)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="service-card-overlay" />
                    <p className="absolute bottom-4 left-4 right-4 z-10 text-[14px] font-semibold text-white leading-snug">{t(`home.services.${card.key}`)}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Blog */}
      <section className="site-container py-16 md:py-24" data-reveal>
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-eyebrow mb-3">{t('home.blog.eyebrow')}</p>
            <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-tight leading-none">{t('home.blog.title')}</h2>
            <p className="mt-4 text-[14px] text-text-secondary max-w-md">{t('home.blog.subtitle')}</p>
          </div>
          <PillButton to="/blog">{t('home.blog.view_all')}</PillButton>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2" data-stagger>
          {blogCards.map((post) => (
            <Link key={post.id} to="/blog" className="car-card group block" data-stagger-item>
              <div className="car-card-image aspect-video">
                <img src={post.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <div className="p-5">
                <p className="text-[11px] text-text-tertiary mb-2">{t(post.dateKey)}</p>
                <h3 className="text-[15px] font-semibold leading-snug group-hover:text-neutral-600 transition-colors">{t(post.titleKey)}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Drive CTA banner */}
      <section className="site-container py-8 md:py-12" data-fade-in>
        <div className="relative overflow-hidden rounded-[28px] min-h-[420px] flex items-center justify-center text-center px-6 py-16">
          <img src="/images/cta-banner.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-white tracking-tight leading-tight mb-4">{t('home.drive_cta.title')}</h2>
            <p className="text-[14px] text-white/80 leading-relaxed mb-8 max-w-lg mx-auto">{t('home.drive_cta.subtitle')}</p>
            <PillButton to="/contact">{t('home.drive_cta.button')}</PillButton>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="site-container py-16 md:py-24" data-reveal>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <p className="section-eyebrow mb-3">{t('home.faq.eyebrow')}</p>
            <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-tight leading-tight mb-4">{t('home.faq.title')}</h2>
            <p className="text-[14px] text-text-secondary leading-relaxed max-w-md">{t('home.faq.subtitle')}</p>
          </div>
          <div>
            {faqKeys.map((key) => (
              <FaqItem key={key} question={t(`home.faq.${key}`)} answer={t(`home.faq.a${key.slice(1)}`)} />
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
