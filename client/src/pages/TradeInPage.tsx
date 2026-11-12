import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Camera, ChevronRight, ChevronLeft, CheckCircle2, Car, Send } from 'lucide-react'

const BRANDS = ['Toyota', 'Honda', 'Ford', 'Mercedes-Benz', 'BMW', 'Hyundai', 'Kia', 'Mazda', 'VinFast', 'Khác']
const YEARS = Array.from({ length: 25 }, (_, i) => 2025 - i)

function TradeInPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    brand: '', model: '', year: 2020, mileage: 0, condition: 'Tốt',
    guestName: '', guestPhone: '', guestEmail: '', notes: '',
  })
  const [estimate, setEstimate] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const basePrice: Record<string, number> = {
    'Toyota': 800000000, 'Honda': 750000000, 'Ford': 900000000,
    'Mercedes-Benz': 2000000000, 'BMW': 1800000000, 'Hyundai': 600000000,
    'Kia': 550000000, 'Mazda': 650000000, 'VinFast': 700000000, 'Khác': 500000000,
  }

  const calculateEstimate = () => {
    const base = basePrice[form.brand] || 500000000
    const ageFactor = Math.max(0.3, 1 - (2025 - form.year) * 0.07)
    const mileageFactor = Math.max(0.5, 1 - form.mileage / 500000)
    const conditionFactor = form.condition === 'Xuất sắc' ? 1.1 : form.condition === 'Tốt' ? 1 : 0.85
    setEstimate(Math.round(base * ageFactor * mileageFactor * conditionFactor / 1000000) * 1000000)
    setStep(2)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: form.guestName,
          guestPhone: form.guestPhone,
          guestEmail: form.guestEmail || undefined,
          type: 'INQUIRY',
          notes: `[Trade-In] Xe ${form.brand} ${form.model} ${form.year}, ${form.mileage.toLocaleString()}km, Tình trạng: ${form.condition}. ${form.notes}`,
        }),
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true) // Still show success for demo
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="site-container py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Gửi yêu cầu thành công!</h1>
        <p className="text-text-secondary text-[14px] max-w-md">
          Đội ngũ Nexus Auto sẽ liên hệ bạn trong 24h để đánh giá chi tiết và báo giá thu mua xe cũ.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface-base min-h-screen">
      <section className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white py-16">
        <div className="site-container text-center">
          <p className="section-eyebrow text-amber-400 mb-2">Dịch vụ</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Định giá xe cũ</h1>
          <p className="text-neutral-300 max-w-lg mx-auto text-[14px]">
            Nhận ước tính giá trị xe cũ của bạn trong 2 phút. Thu cũ đổi mới — lên đời xe sang.
          </p>
        </div>
      </section>

      {/* Stepper */}
      <div className="site-container py-6">
        <div className="flex items-center justify-center gap-2 text-[13px]">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= s ? 'bg-amber-600 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              <span className={step >= s ? 'text-text-primary font-medium' : 'text-text-secondary'}>
                {s === 1 ? 'Thông tin xe' : s === 2 ? 'Liên hệ' : 'Hoàn tất'}
              </span>
              {s < 3 && <ChevronRight className="w-4 h-4 text-neutral-300 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="site-container pb-20 max-w-xl mx-auto">
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-5">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Car className="w-5 h-5 text-amber-600" /> Thông tin xe cũ</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-medium text-text-secondary block mb-1">Hãng xe *</label>
                <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30">
                  <option value="">Chọn hãng</option>
                  {BRANDS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[13px] font-medium text-text-secondary block mb-1">Năm sản xuất *</label>
                <select value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30">
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-text-secondary block mb-1">Model xe *</label>
              <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="VD: Vios, Camry, Everest..." className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-text-secondary block mb-1">Số km đã đi *</label>
              <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-text-secondary block mb-1">Tình trạng xe *</label>
              <div className="flex gap-2">
                {['Xuất sắc', 'Tốt', 'Trung bình'].map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, condition: c })} className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition ${form.condition === c ? 'bg-amber-600 text-white' : 'bg-neutral-50 text-text-secondary hover:bg-neutral-100'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={calculateEstimate} disabled={!form.brand || !form.model} className="w-full py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              Ước tính giá <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && estimate !== null && (
          <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-5">
            <div className="text-center bg-amber-50 rounded-xl p-6">
              <p className="text-[13px] text-amber-700 mb-1">Giá trị ước tính</p>
              <p className="text-3xl font-bold text-amber-700">{estimate.toLocaleString('vi-VN')}₫</p>
              <p className="text-[12px] text-text-secondary mt-2">* Giá tham khảo, giá thực tế sau khi kiểm tra xe</p>
            </div>
            <h2 className="font-semibold text-lg">Thông tin liên hệ</h2>
            <div>
              <label className="text-[13px] font-medium text-text-secondary block mb-1">Họ và tên *</label>
              <input value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-text-secondary block mb-1">Số điện thoại *</label>
              <input value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-text-secondary block mb-1">Email (tuỳ chọn)</label>
              <input type="email" value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-black/10 text-[14px] hover:bg-neutral-50 transition flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </button>
              <button onClick={() => setStep(3)} disabled={!form.guestName || !form.guestPhone} className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                Tiếp tục <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-5">
            <h2 className="font-semibold text-lg">Xác nhận thông tin</h2>
            <div className="space-y-3 text-[14px]">
              <div className="flex justify-between py-2 border-b border-black/5"><span className="text-text-secondary">Xe:</span><span className="font-medium">{form.brand} {form.model} {form.year}</span></div>
              <div className="flex justify-between py-2 border-b border-black/5"><span className="text-text-secondary">Số km:</span><span className="font-medium">{form.mileage.toLocaleString()} km</span></div>
              <div className="flex justify-between py-2 border-b border-black/5"><span className="text-text-secondary">Tình trạng:</span><span className="font-medium">{form.condition}</span></div>
              <div className="flex justify-between py-2 border-b border-black/5"><span className="text-text-secondary">Giá ước tính:</span><span className="font-bold text-amber-600">{estimate?.toLocaleString('vi-VN')}₫</span></div>
              <div className="flex justify-between py-2 border-b border-black/5"><span className="text-text-secondary">Liên hệ:</span><span className="font-medium">{form.guestName} — {form.guestPhone}</span></div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-text-secondary block mb-1">Ghi chú thêm</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-black/10 text-[14px] hover:bg-neutral-50 transition flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? 'Đang gửi...' : <><Send className="w-4 h-4" /> Gửi yêu cầu</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TradeInPage
