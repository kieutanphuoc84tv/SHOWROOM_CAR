import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PillButton } from '@/components/ui/PillButton'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="site-container min-h-[60vh] flex items-center justify-center py-16">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-neutral-200 mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-2">{t('not_found.title')}</h2>
        <p className="text-[14px] text-text-secondary mb-8 max-w-sm mx-auto">{t('not_found.description')}</p>
        <PillButton to="/">{t('nav.home')}</PillButton>
      </div>
    </div>
  )
}

export default NotFoundPage
