import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { PillButton } from '@/components/ui/PillButton'
import { NexusLogo } from '@/components/brand/NexusLogo'
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react'

const navItems = [
  { key: 'nav.inventory', path: '/vehicles' },
  { key: 'nav.trade_in', path: '/trade-in' },
  { key: 'nav.financing', path: '/financing' },
  { key: 'nav.about', path: '/about' },
  { key: 'nav.contact', path: '/contact' },
] as const

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentLang = (i18n.resolvedLanguage || i18n.language).startsWith('vi') ? 'vi' : 'en'

  const setLanguage = (lang: 'en' | 'vi') => {
    if (currentLang !== lang) i18n.changeLanguage(lang)
  }

  return (
    <header data-site-header className="sticky top-0 z-50 bg-surface-base/90 backdrop-blur-md border-b border-black/5">
      <div className="site-container flex h-[72px] items-center justify-between gap-4">
        <NexusLogo variant="nav" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full bg-surface-muted/80 px-1 py-1" aria-label="Main">
          {navItems.map(({ key, path }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'nav-pill',
                location.pathname === path && 'bg-white shadow-sm'
              )}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        {/* Actions & Language Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-0.5 rounded-full bg-surface-muted px-1 py-1 text-[12px] font-semibold">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={cn(
                'rounded-full px-2.5 py-1 transition-colors cursor-pointer',
                currentLang === 'en' ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('vi')}
              className={cn(
                'rounded-full px-2.5 py-1 transition-colors cursor-pointer',
                currentLang === 'vi' ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
              )}
            >
              VI
            </button>
          </div>

          <PillButton to="/contact" className="hidden md:inline-flex !text-[12px]">
            {t('nav.contact_sales')}
          </PillButton>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-neutral-800 hover:bg-neutral-100 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[72px] bg-white/95 backdrop-blur-xl border-b border-black/10 shadow-2xl lg:hidden z-40 transition-all duration-300">
          <div className="site-container py-6 px-4 space-y-4">
            <nav className="flex flex-col space-y-1">
              {navItems.map(({ key, path }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    )}
                  >
                    <span>{t(key)}</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-black/5 flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Ngôn ngữ / Language:</span>
              <div className="flex items-center gap-1 rounded-full bg-surface-muted p-1 text-[12px] font-semibold">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={cn(
                    'rounded-full px-3 py-1 transition-colors',
                    currentLang === 'en' ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
                  )}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('vi')}
                  className={cn(
                    'rounded-full px-3 py-1 transition-colors',
                    currentLang === 'vi' ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
                  )}
                >
                  VI
                </button>
              </div>
            </div>

            <div className="pt-2">
              <PillButton 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full justify-center !py-3 !text-sm"
              >
                {t('nav.contact_sales')}
              </PillButton>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
