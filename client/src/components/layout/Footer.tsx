import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { NexusLogo } from '@/components/brand/NexusLogo'
import { PillButton } from '@/components/ui/PillButton'

const footerNavCol1 = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.inventory', path: '/vehicles' },
  { key: 'nav.trade_in', path: '/trade-in' },
  { key: 'nav.financing', path: '/financing' },
] as const

const footerNavCol2 = [
  { key: 'nav.about', path: '/about' },
  { key: 'nav.contact', path: '/contact' },
  { key: 'nav.news_blog', path: '/blog' },
] as const

function Footer() {
  const { t } = useTranslation()

  return (
    <footer data-site-footer className="bg-surface-base mt-auto overflow-hidden">
      {/* Pre-footer CTA block */}
      <div className="site-container pt-20 pb-12 border-t border-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div data-footer-reveal>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold tracking-tight leading-tight max-w-md">
              {t('footer.cta_title')}
            </h2>
            <p className="mt-4 text-[14px] text-text-secondary max-w-sm leading-relaxed">
              {t('footer.cta_subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PillButton to="/contact">{t('footer.contact_us')}</PillButton>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white transition-transform hover:scale-105 active:scale-95"
                aria-label="Location"
              >
                <MapPin className="h-5 w-5" strokeWidth={1.75} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 content-start" data-footer-pills>
            {[...footerNavCol1, ...footerNavCol2].map(({ key, path }) => (
              <Link
                key={path}
                to={path}
                className="rounded-full bg-surface-muted px-4 py-2.5 text-center text-[13px] font-medium text-black transition-colors hover:bg-neutral-200"
              >
                {t(key)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Massive wordmark — Framer style */}
      <div
        data-footer-wordmark-wrap
        className="site-container pb-4 pt-2 overflow-hidden"
      >
        <div
          data-footer-wordmark-line
          className="h-px w-full max-w-[120px] bg-black/15 mb-6 md:mb-10 origin-left"
          aria-hidden
        />
        <div data-footer-wordmark className="py-2 md:py-6">
          <NexusLogo variant="footer" asLink={false} />
        </div>

        {/* Address */}
        <div className="mt-6 pb-10 border-b border-black/5">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-black">Showroom Nexus Auto</p>
                <p className="mt-0.5 text-[13px] text-text-secondary leading-relaxed">
                  123 Nguyễn Đáng, Phường 1,<br />
                  Thành phố Trà Vinh, tỉnh Trà Vinh
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1 pl-11 text-[13px] text-text-secondary">
              <p>📞 <span className="text-black font-medium">0294 123 456</span></p>
              <p>✉️ <span className="text-black font-medium">info@nexusauto.vn</span></p>
              <p>🕐 <span className="text-black font-medium">Thứ 2 – Chủ nhật: 8:00 – 20:00</span></p>
            </div>
          </div>
        </div>
      </div>


      {/* Legal bar */}
      <div className="border-t border-black/5">
        <div className="site-container py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-text-secondary">
          <p data-footer-reveal>{t('footer.rights')}</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6" data-footer-reveal>
            <Link to="/legal" className="hover:text-black transition-colors">{t('footer.terms')}</Link>
            <span className="text-neutral-300">|</span>
            <Link to="/legal" className="hover:text-black transition-colors">{t('footer.privacy')}</Link>
            <span className="text-neutral-300">|</span>
            <Link to="/legal" className="hover:text-black transition-colors">{t('footer.cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
