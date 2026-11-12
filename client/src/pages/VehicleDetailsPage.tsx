import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Check, ArrowLeft, Calendar, Gauge, Fuel, Shield, 
  Settings2, Palette, AlertCircle, Loader2, Sparkles, PhoneCall
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PillButton } from '@/components/ui/PillButton'
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

export default function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    async function loadVehicle() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await apiFetch<Vehicle>(`/api/vehicles/${id}`)
        setVehicle(data)
      } catch (err: any) {
        setError(err?.message || 'Không tìm thấy thông tin xe này hoặc xe đã ngừng kinh doanh')
      } finally {
        setLoading(false)
      }
    }
    loadVehicle()
  }, [id])

  if (loading) {
    return (
      <div className="site-container py-24 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
        <p className="text-sm font-medium text-neutral-500">Đang tải thông số kỹ thuật xe...</p>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="site-container py-24 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-black mb-2">Không tìm thấy thông tin xe</h2>
        <p className="text-sm text-neutral-500 mb-6">{error || 'Xe bạn tìm kiếm hiện không có trong hệ thống.'}</p>
        <Link 
          to="/vehicles" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại bộ sưu tập xe
        </Link>
      </div>
    )
  }

  const brandName = getBrandName(vehicle.brand)
  const fullTitle = `${brandName} ${vehicle.model} ${vehicle.trim || ''}`.trim()
  
  // Images list
  const images = (vehicle.images && vehicle.images.length > 0)
    ? vehicle.images.map(img => {
        const u = img.imageUrl
        return u.startsWith('http') ? u : `${API_BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`
      })
    : ['/images/car-1.jpg']

  const activeImage = images[activeImageIndex] || images[0]

  return (
    <div className="site-container py-8 pb-20">
      {/* Back button & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          to="/vehicles" 
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách xe
        </Link>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
            vehicle.status === 'AVAILABLE' 
              ? 'bg-emerald-100 text-emerald-800' 
              : vehicle.status === 'RESERVED' 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-neutral-100 text-neutral-800'
          }`}>
            {vehicle.status === 'AVAILABLE' ? 'Sẵn sàng giao ngay' : vehicle.status === 'RESERVED' ? 'Đã có khách cọc' : 'Đã bán'}
          </span>
          {vehicle.condition === 'NEW' ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-black text-white">
              Xe Mới 100%
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-neutral-200 text-neutral-800">
              Xe Lướt
            </span>
          )}
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative overflow-hidden rounded-[32px] aspect-[16/9] md:aspect-[21/9] min-h-[340px] mb-4 bg-neutral-900 shadow-md">
        <img 
          src={activeImage} 
          alt={fullTitle}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/car-1.jpg'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-10 text-white">
          <p className="text-xs uppercase font-bold tracking-widest text-white/70 mb-2">
            {brandName} • Năm {vehicle.year}
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
            {fullTitle}
          </h1>
          <p className="text-white/80 text-sm max-w-2xl font-light">
            {vehicle.description || 'Dòng xe cao cấp được bảo chứng chất lượng với hơn 160 hạng mục kỹ thuật chuẩn chính hãng tại Nexus Auto.'}
          </p>
        </div>
      </div>

      {/* Image Thumbnails Gallery */}
      {images.length > 1 && (
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={`relative rounded-xl overflow-hidden w-24 h-16 shrink-0 border-2 transition-all cursor-pointer ${
                activeImageIndex === idx ? 'border-black scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Two Column Layout: Specs & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
        {/* Left Column: Specifications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Key Quick Specs */}
          <div>
            <h3 className="text-lg font-bold text-black mb-4">Thông số nổi bật</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white border border-black/5 p-4 shadow-xs">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Fuel className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Nhiên liệu</span>
                </div>
                <p className="font-bold text-sm text-black">
                  {vehicle.fuelType === 'ELECTRIC' ? 'Thuần điện (EV)' : vehicle.fuelType === 'HYBRID' ? 'Hybrid' : vehicle.fuelType === 'DIESEL' ? 'Dầu Diesel' : 'Xăng'}
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-black/5 p-4 shadow-xs">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Settings2 className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Hộp số</span>
                </div>
                <p className="font-bold text-sm text-black">
                  {vehicle.transmission === 'AUTOMATIC' ? 'Tự động' : 'Số sàn'}
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-black/5 p-4 shadow-xs">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Gauge className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Số ODO</span>
                </div>
                <p className="font-bold text-sm text-black">
                  {vehicle.mileage > 0 ? `${vehicle.mileage.toLocaleString()} km` : '0 km (Mới)'}
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-black/5 p-4 shadow-xs">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Đời xe</span>
                </div>
                <p className="font-bold text-sm text-black">{vehicle.year}</p>
              </div>
            </div>
          </div>

          {/* Detailed Spec Table */}
          <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-xs">
            <h3 className="text-lg font-bold text-black mb-4">Chi tiết trang bị & kỹ thuật</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Mẫu xe & Phiên bản</span>
                <span className="font-semibold text-black">{vehicle.model} {vehicle.trim || ''}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Động cơ</span>
                <span className="font-semibold text-black">{vehicle.engine || 'Tiêu chuẩn'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Hệ dẫn động</span>
                <span className="font-semibold text-black">
                  {vehicle.drivetrain === 'AWD' ? '4 bánh toàn thời gian (AWD)' : vehicle.drivetrain === 'FOUR_WD' ? '2 cầu (4x4)' : vehicle.drivetrain === 'RWD' ? 'Cầu sau (RWD)' : 'Cầu trước (FWD)'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Số chỗ ngồi</span>
                <span className="font-semibold text-black">{vehicle.seats} chỗ</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Màu ngoại thất</span>
                <span className="font-semibold text-black">{vehicle.color || 'Trắng'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Màu nội thất</span>
                <span className="font-semibold text-black">{vehicle.interiorColor || 'Tiêu chuẩn'}</span>
              </div>
              {vehicle.vin && (
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Mã số khung (VIN)</span>
                  <span className="font-mono text-xs font-semibold text-black">{vehicle.vin}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Chính sách bảo hành</span>
                <span className="font-semibold text-emerald-600">{vehicle.warrantyInfo || '3 năm chính hãng'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Booking Card */}
        <div>
          <div className="rounded-3xl bg-white border border-black/5 p-6 shadow-sm sticky top-24 space-y-6">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-neutral-400 mb-1">Giá bán niêm yết</p>
              <p className="text-3xl font-black text-black tracking-tight">{formatVND(vehicle.price)}</p>
              <p className="text-xs text-neutral-500 mt-1">Đã bao gồm VAT & kiểm định an toàn</p>
            </div>

            <div className="space-y-3 border-t border-b border-neutral-100 py-4 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kiểm tra 160 bước tiêu chuẩn kỹ thuật</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hỗ trợ thủ tục đăng ký, đăng kiểm trọn gói</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Vay ngân hàng đến 80% giá trị xe, lãi suất ưu đãi</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Giao xe tận nhà hoặc nhận tại showroom</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to={`/contact?vehicleId=${vehicle.id}&service=test_drive`}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-black text-white font-bold text-sm hover:bg-neutral-800 transition-transform active:scale-98 shadow-md"
              >
                <Sparkles className="w-4 h-4" /> Đặt lịch lái thử xe này
              </Link>

              <Link
                to={`/financing?vehicleId=${vehicle.id}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-neutral-100 text-black font-semibold text-sm hover:bg-neutral-200 transition-colors"
              >
                Ước tính bảng tính trả góp
              </Link>

              <a
                href="tel:0294123456"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 text-neutral-500 hover:text-black text-xs font-semibold transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Hotline tư vấn: 0294 123 456
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
