import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Calculator, TrendingDown, Building2, Send, CheckCircle2 } from 'lucide-react'

const BANKS = [
  { name: 'Vietcombank', color: '#006838' },
  { name: 'Techcombank', color: '#E31837' },
  { name: 'BIDV', color: '#004B8D' },
  { name: 'VPBank', color: '#008751' },
  { name: 'TPBank', color: '#9C1D8E' },
  { name: 'MB Bank', color: '#003366' },
]

function calculatePMT(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12
  if (r === 0) return principal / months
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function FinancePage() {
  const { t } = useTranslation()
  const [price, setPrice] = useState(1000000000)
  const [loanRatio, setLoanRatio] = useState(70)
  const [months, setMonths] = useState(60)
  const [rate, setRate] = useState(8.5)
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', notes: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loanAmount = price * (loanRatio / 100)
  const downPayment = price - loanAmount
  const monthlyPayment = calculatePMT(loanAmount, rate, months)
  const totalPayment = monthlyPayment * months
  const totalInterest = totalPayment - loanAmount

  const fmt = (n: number) => Math.round(n).toLocaleString('vi-VN')

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/finance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: '00000000-0000-0000-0000-000000000000',
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerEmail: form.customerEmail || undefined,
          loanAmount, loanTermMonths: months, interestRate: rate, downPayment,
          notes: form.notes,
        }),
      })
    } catch { /* ignore */ }
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="site-container py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Đăng ký thành công!</h1>
        <p className="text-text-secondary text-[14px]">Chuyên viên tài chính sẽ liên hệ bạn trong 24h.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-base min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white py-16">
        <div className="site-container text-center">
          <p className="section-eyebrow text-amber-400 mb-2">Tài chính</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Tính toán trả góp</h1>
          <p className="text-neutral-300 max-w-lg mx-auto text-[14px]">
            Lập kế hoạch tài chính thông minh — sở hữu xe mơ ước với khoản trả góp phù hợp túi tiền.
          </p>
        </div>
      </section>

      <div className="site-container py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Calculator ── */}
        <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-5">
          <h2 className="font-semibold text-lg flex items-center gap-2"><Calculator className="w-5 h-5 text-amber-600" /> Công cụ tính toán</h2>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[13px] font-medium text-text-secondary">Giá xe</label>
              <span className="text-[13px] font-bold text-amber-600">{fmt(price)}₫</span>
            </div>
            <input type="range" min={300000000} max={5000000000} step={50000000} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full accent-amber-600" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[13px] font-medium text-text-secondary">Tỷ lệ vay</label>
              <span className="text-[13px] font-bold">{loanRatio}%</span>
            </div>
            <input type="range" min={30} max={80} step={5} value={loanRatio} onChange={(e) => setLoanRatio(Number(e.target.value))} className="w-full accent-amber-600" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[13px] font-medium text-text-secondary">Thời hạn</label>
              <span className="text-[13px] font-bold">{months} tháng ({(months / 12).toFixed(1)} năm)</span>
            </div>
            <input type="range" min={12} max={84} step={12} value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full accent-amber-600" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[13px] font-medium text-text-secondary">Lãi suất / năm</label>
              <span className="text-[13px] font-bold">{rate}%</span>
            </div>
            <input type="range" min={5} max={15} step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-amber-600" />
          </div>
        </div>

        {/* ── Result ── */}
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-2xl p-6">
            <p className="text-[13px] text-amber-100 mb-1">Trả góp mỗi tháng</p>
            <p className="text-4xl font-bold">{fmt(monthlyPayment)}₫</p>
            <p className="text-[12px] text-amber-200 mt-2">Gốc + Lãi (phương thức dư nợ giảm dần)</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-black/5 p-4">
              <p className="text-[12px] text-text-secondary">Trả trước</p>
              <p className="text-lg font-bold">{fmt(downPayment)}₫</p>
            </div>
            <div className="bg-white rounded-xl border border-black/5 p-4">
              <p className="text-[12px] text-text-secondary">Số tiền vay</p>
              <p className="text-lg font-bold">{fmt(loanAmount)}₫</p>
            </div>
            <div className="bg-white rounded-xl border border-black/5 p-4">
              <p className="text-[12px] text-text-secondary">Tổng trả</p>
              <p className="text-lg font-bold">{fmt(totalPayment + downPayment)}₫</p>
            </div>
            <div className="bg-white rounded-xl border border-black/5 p-4">
              <p className="text-[12px] text-text-secondary flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5" /> Tổng lãi</p>
              <p className="text-lg font-bold text-red-500">{fmt(totalInterest)}₫</p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
            <table className="w-full text-[13px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left p-3 font-medium">Thời hạn</th>
                  <th className="text-right p-3 font-medium">Trả/tháng</th>
                  <th className="text-right p-3 font-medium">Tổng lãi</th>
                </tr>
              </thead>
              <tbody>
                {[36, 60, 84].map((m) => {
                  const mp = calculatePMT(loanAmount, rate, m)
                  return (
                    <tr key={m} className={`border-t border-black/5 ${m === months ? 'bg-amber-50' : ''}`}>
                      <td className="p-3">{m} tháng ({(m / 12).toFixed(1)} năm)</td>
                      <td className="p-3 text-right font-medium">{fmt(mp)}₫</td>
                      <td className="p-3 text-right text-red-500">{fmt(mp * m - loanAmount)}₫</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Registration Form ── */}
      <div className="site-container pb-10 max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-5">
          <h2 className="font-semibold text-lg flex items-center gap-2"><Send className="w-5 h-5 text-amber-600" /> Đăng ký tư vấn trả góp</h2>
          <input placeholder="Họ và tên *" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30" />
          <input placeholder="Số điện thoại *" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30" />
          <input type="email" placeholder="Email (tuỳ chọn)" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30" />
          <textarea placeholder="Ghi chú..." rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:ring-2 focus:ring-amber-500/30 resize-none" />
          <button onClick={handleSubmit} disabled={submitting || !form.customerName || !form.customerPhone} className="w-full py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition disabled:opacity-50">
            {submitting ? 'Đang gửi...' : 'Đăng ký tư vấn ngay'}
          </button>
        </div>
      </div>

      {/* ── Banks ── */}
      <div className="site-container pb-16">
        <h2 className="text-center font-semibold text-lg mb-6 flex items-center justify-center gap-2"><Building2 className="w-5 h-5" /> Ngân hàng liên kết</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {BANKS.map((b) => (
            <div key={b.name} className="bg-white rounded-xl border border-black/5 p-4 text-center hover:shadow-md transition">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-[11px]" style={{ background: b.color }}>
                {b.name.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-[12px] font-medium">{b.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FinancePage
