import { useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'

function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="site-container py-16">
      <p className="section-eyebrow mb-2">{t('nav.company')}</p>
      <h1 className="text-3xl font-bold tracking-tight mb-8">{t('nav.about')}</h1>
      <div className="rounded-2xl bg-white border border-black/5 p-12 text-center">
        <Building2 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-[14px] text-text-secondary">{t('about.placeholder')}</p>
      </div>
    </div>
  )
}

export default AboutPage
