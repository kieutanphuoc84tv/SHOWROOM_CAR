import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, ChevronDown, Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { apiFetch } from '../lib/api'

// Simple Accordion Component for FAQs
function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-black/10 py-5">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left focus:outline-none cursor-pointer"
      >
        <h3 className="text-base font-semibold text-black">{question}</h3>
        <ChevronDown 
          className={`h-5 w-5 text-black transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 mt-4' : 'max-h-0'}`}
      >
        <p className="text-sm text-text-secondary leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export default function ContactPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const vehicleIdParam = searchParams.get('vehicleId') || ''
  const serviceParam = searchParams.get('service') || ''

  // Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [service, setService] = useState<'TEST_DRIVE' | 'INQUIRY' | 'FINANCE'>('TEST_DRIVE')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (serviceParam === 'test_drive') {
      setService('TEST_DRIVE')
    } else if (serviceParam === 'finance') {
      setService('FINANCE')
    }
  }, [serviceParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setStatus({ type: 'error', text: 'Vui lòng nhập Họ tên và Số điện thoại liên hệ.' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      await apiFetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          guestName: name.trim(),
          guestPhone: phone.trim(),
          guestEmail: email.trim() || null,
          type: service,
          vehicleId: vehicleIdParam || null,
          notes: message.trim() || null,
        }),
      })

      setStatus({
        type: 'success',
        text: 'Cảm ơn quý khách! Chuyên viên tư vấn Nexus Auto sẽ liên hệ lại trong vòng 15 phút.',
      })
      setName('')
      setPhone('')
      setEmail('')
      setMessage('')
    } catch (err: any) {
      setStatus({
        type: 'error',
        text: err?.message || 'Không thể gửi yêu cầu lúc này. Vui lòng gọi trực tiếp hotline.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-20">
      {/* 1. HERO SECTION */}
      <section className="site-container pt-12 lg:pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column: Heading & Info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.05] tracking-tight mb-8">
              {t('contact_page.hero_title_1', 'KẾT NỐI VỚI')}<br />
              {t('contact_page.hero_title_2', 'CHUYÊN VIÊN')}<br />
              {t('contact_page.hero_title_3', 'NEXUS AUTO')}
            </h1>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="font-bold text-lg">5.0</span>
                <div className="flex text-amber-500 ml-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
              </div>
            </div>
            <p className="text-sm text-text-secondary font-medium mb-12">
              Hơn 1.200+ khách hàng tin tưởng và đánh giá dịch vụ hoàn hảo
            </p>

            <p className="text-sm text-text-secondary leading-relaxed max-w-md mb-8">
              Chúng tôi luôn sẵn sàng hỗ trợ lái thử tại nhà, tính toán phương án trả góp tối ưu nhất và giao xe trong ngày.
            </p>

            <div>
              <a
                href="#showroom"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white transition-transform hover:scale-105 active:scale-95 shadow-md"
                aria-label="Location"
              >
                <MapPin className="h-5 w-5" strokeWidth={1.75} />
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-[32px] border border-black/5 shadow-sm flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-black mb-2">Đăng ký tư vấn & Lái thử</h3>
            <p className="text-xs text-neutral-500 mb-6">Điền thông tin bên dưới để được chuyên viên hỗ trợ nhanh nhất</p>

            {status && (
              <div className={`p-4 rounded-2xl mb-6 text-sm flex items-start gap-3 ${
                status.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{status.text}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-black block">Họ và tên *</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nguyễn Văn A" 
                    className="w-full bg-neutral-50 rounded-xl px-4 py-3 text-sm border border-neutral-200 focus:border-black focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-black block">Nhu cầu hỗ trợ</label>
                  <div className="relative">
                    <select 
                      value={service}
                      onChange={e => setService(e.target.value as any)}
                      className="w-full appearance-none bg-neutral-50 rounded-xl px-4 py-3 text-sm border border-neutral-200 focus:border-black focus:bg-white focus:outline-none text-black cursor-pointer transition-all"
                    >
                      <option value="TEST_DRIVE">Đăng ký lái thử xe</option>
                      <option value="INQUIRY">Báo giá lăn bánh & Khuyến mãi</option>
                      <option value="FINANCE">Tư vấn gói vay trả góp ngân hàng</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-black block">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0912 345 678" 
                    className="w-full bg-neutral-50 rounded-xl px-4 py-3 text-sm border border-neutral-200 focus:border-black focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-black block">Email (nếu có)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com" 
                    className="w-full bg-neutral-50 rounded-xl px-4 py-3 text-sm border border-neutral-200 focus:border-black focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-black block">Ghi chú thêm</label>
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Ví dụ: Tôi muốn lái thử mẫu C 300 AMG vào sáng thứ 7 tại nhà..." 
                  rows={4}
                  className="w-full bg-neutral-50 rounded-xl px-4 py-3 text-sm border border-neutral-200 focus:border-black focus:bg-white focus:outline-none resize-none transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-bold rounded-xl py-4 transition-all hover:bg-neutral-800 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang gửi thông tin...</span>
                  </>
                ) : (
                  <span>Gửi yêu cầu tư vấn</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. SHOWROOM SECTION */}
      <section id="showroom" className="site-container py-16 lg:py-24 border-t border-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Map */}
          <div className="rounded-3xl overflow-hidden shadow-sm border border-black/5 h-[350px] lg:h-[450px] bg-neutral-200 relative">
             <iframe
                title="Showroom Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62850.28787234316!2d106.30893!3d9.934706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a07ac16b3d5b8b%3A0x7ea1e55f4e7ce23a!2zVHLDoCBWaW5o!5e0!3m2!1svi!2svn!4v1697000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
          </div>

          {/* Showroom Info */}
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-text-secondary mb-3">HỆ THỐNG TRỰC TIẾP</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-tight mb-6">
              Showroom Trưng Bày Đẳng Cấp
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md mb-12">
              Không gian trải nghiệm xe 3D thực tế và khu vực giao xe VIP chuẩn 5 sao với đầy đủ các dịch vụ bảo dưỡng, phụ kiện chính hãng.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-black/5">
                <h4 className="text-[12px] font-semibold text-text-secondary mb-1">Email hỗ trợ</h4>
                <p className="text-[14px] font-medium text-black">info@nexusauto.vn</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-black/5">
                <h4 className="text-[12px] font-semibold text-text-secondary mb-1">Hotline tư vấn</h4>
                <p className="text-[14px] font-medium text-black">0294 123 456</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-black/5">
                <h4 className="text-[12px] font-semibold text-text-secondary mb-1">Địa chỉ</h4>
                <p className="text-[14px] font-medium text-black">123 Nguyễn Đáng, Phường 1, Trà Vinh</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-black/5">
                <h4 className="text-[12px] font-semibold text-text-secondary mb-1">Giờ mở cửa</h4>
                <p className="text-[14px] font-medium text-black">Thứ 2 – Chủ nhật, 8:00 – 20:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section className="site-container py-16 lg:py-24 border-t border-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-bold tracking-widest uppercase text-text-secondary mb-3">HỖ TRỢ KHÁCH HÀNG</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-tight mb-6 max-w-sm">
              Câu hỏi thường gặp
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
              Những thắc mắc phổ biến nhất khi mua xe mới, xe lướt và quy trình đặt cọc giữ chỗ tại Nexus Auto.
            </p>
          </div>

          <div className="lg:col-span-7 pt-4">
            <div className="flex flex-col">
              <FAQItem 
                question="Tôi có thể đăng ký lái thử tại nhà riêng không?" 
                answer="Có. Nexus Auto hỗ trợ mang xe tới tận nhà riêng hoặc cơ quan của quý khách trong bán kính 30km để lái thử miễn phí."
              />
              <FAQItem 
                question="Quy trình đặt cọc giữ xe diễn ra như thế nào?" 
                answer="Quý khách có thể đặt cọc online hoặc tại showroom. Hợp đồng đặt cọc có hiệu lực trong 7-14 ngày để quý khách chuẩn bị tài chính."
              />
              <FAQItem 
                question="Showroom có hỗ trợ mua xe trả góp không?" 
                answer="Chúng tôi liên kết với 12 ngân hàng lớn hỗ trợ vay tối đa 80% giá trị xe với thời hạn lên tới 8 năm, duyệt hồ sơ nhanh trong ngày."
              />
              <FAQItem 
                question="Chính sách bảo hành xe lướt tại Nexus Auto như thế nào?" 
                answer="Mọi xe đã qua sử dụng tại showroom đều có cam kết không đâm đụng, không ngập nước, bảo hành kỹ thuật 1 năm hoặc 20.000 km."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
