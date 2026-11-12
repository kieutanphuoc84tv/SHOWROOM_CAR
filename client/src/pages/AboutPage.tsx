import { useTranslation } from 'react-i18next'
import { Shield, Heart, Eye, Lightbulb, ArrowRight, Award, Users, Car, ThumbsUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const timeline = [
  { year: '2018', title: 'Thành lập', desc: 'Nexus Auto ra đời tại TP.HCM với sứ mệnh mang đến trải nghiệm mua xe đẳng cấp.' },
  { year: '2020', title: 'Mở rộng', desc: 'Khai trương showroom thứ 2 tại Hà Nội, đối tác 6 hãng xe hàng đầu.' },
  { year: '2022', title: 'Chuyển đổi số', desc: 'Ra mắt nền tảng 3D Car Experience, tiên phong công nghệ thực tế ảo.' },
  { year: '2024', title: 'Dẫn đầu', desc: 'Top 3 đại lý ô tô uy tín Việt Nam, phục vụ 5000+ khách hàng.' },
]

const values = [
  { icon: Shield, title: 'Uy tín', desc: 'Cam kết minh bạch 100% về nguồn gốc, giá cả và chất lượng xe.' },
  { icon: Heart, title: 'Tận tâm', desc: 'Đồng hành cùng khách hàng từ lúc tư vấn đến bảo dưỡng trọn đời.' },
  { icon: Eye, title: 'Minh bạch', desc: 'Không chi phí ẩn, rõ ràng trong mọi giao dịch và hợp đồng.' },
  { icon: Lightbulb, title: 'Đổi mới', desc: 'Ứng dụng công nghệ 3D, AI để nâng cao trải nghiệm mua sắm.' },
]

const team = [
  { name: 'Nguyễn Minh Đức', role: 'CEO & Sáng lập', img: '/images/team-1.jpg' },
  { name: 'Trần Thị Hương', role: 'Giám đốc Kinh doanh', img: '/images/team-2.jpg' },
  { name: 'Lê Hoàng Nam', role: 'Giám đốc Công nghệ', img: '/images/team-1.jpg' },
  { name: 'Phạm Thu Hà', role: 'Giám đốc Dịch vụ', img: '/images/team-2.jpg' },
]

const stats = [
  { icon: Car, value: '5,000+', label: 'Xe đã bán' },
  { icon: Users, value: '15+', label: 'Đối tác hãng xe' },
  { icon: Award, value: '6 năm', label: 'Kinh nghiệm' },
  { icon: ThumbsUp, value: '98%', label: 'Khách hàng hài lòng' },
]

function AboutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="bg-surface-base">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white py-28">
        <div className="site-container text-center">
          <p className="section-eyebrow text-amber-400 mb-3">{t('nav.about')}</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Tiên phong trong trải nghiệm<br />ô tô cao cấp
          </h1>
          <p className="text-neutral-300 max-w-2xl mx-auto text-[15px] leading-relaxed">
            Nexus Auto không chỉ là showroom — chúng tôi là cầu nối giữa đam mê tốc độ và phong cách sống đẳng cấp. Mỗi chiếc xe là một câu chuyện, mỗi khách hàng là một người bạn đồng hành.
          </p>
        </div>
      </section>

      {/* ── Câu chuyện — Timeline ── */}
      <section className="site-container py-20">
        <h2 className="text-2xl font-bold text-center mb-14">Câu chuyện Nexus Auto</h2>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-200 hidden md:block" />
          <div className="space-y-10">
            {timeline.map((item, i) => (
              <div key={item.year} className={`flex flex-col md:flex-row items-center gap-6 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${i % 2 === 1 ? 'md:text-left' : 'md:text-right'}`}>
                  <span className="text-amber-600 font-bold text-lg">{item.year}</span>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-[14px] text-text-secondary mt-1">{item.desc}</p>
                </div>
                <div className="w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-100 z-10 shrink-0" />
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Giá trị cốt lõi ── */}
      <section className="bg-neutral-50 py-20">
        <div className="site-container">
          <h2 className="text-2xl font-bold text-center mb-12">Giá trị cốt lõi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-black/5 p-6 text-center hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-[13px] text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Đội ngũ ── */}
      <section className="site-container py-20">
        <h2 className="text-2xl font-bold text-center mb-12">Đội ngũ lãnh đạo</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m) => (
            <div key={m.name} className="text-center group">
              <div className="aspect-square rounded-2xl bg-neutral-100 overflow-hidden mb-3 group-hover:shadow-lg transition">
                <img src={m.img} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <h3 className="font-semibold text-[15px]">{m.name}</h3>
              <p className="text-[13px] text-text-secondary">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Thành tựu ── */}
      <section className="bg-neutral-900 text-white py-20">
        <div className="site-container">
          <h2 className="text-2xl font-bold text-center mb-12">Thành tựu nổi bật</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <div className="text-3xl font-bold">{value}</div>
                <div className="text-[13px] text-neutral-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="site-container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Sẵn sàng tìm chiếc xe mơ ước?</h2>
        <p className="text-text-secondary mb-8 max-w-lg mx-auto text-[14px]">
          Liên hệ ngay với đội ngũ tư vấn chuyên nghiệp của Nexus Auto để được hỗ trợ tận tâm.
        </p>
        <button onClick={() => navigate('/contact')} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-full font-medium hover:bg-amber-700 transition">
          Liên hệ ngay <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  )
}

export default AboutPage
