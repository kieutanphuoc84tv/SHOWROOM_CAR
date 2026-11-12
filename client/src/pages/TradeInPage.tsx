import { useTranslation } from 'react-i18next'

function TradeInPage() {
  const { t } = useTranslation()

  return (
    <div className="site-container py-16 min-h-[60vh]">
      <p className="section-eyebrow mb-2">{t('nav.services')}</p>
      <h1 className="text-3xl font-bold tracking-tight mb-4">{t('trade_in_page.title')}</h1>
      <p className="text-[14px] text-text-secondary max-w-xl mb-10">{t('trade_in_page.subtitle')}</p>
      <div className="rounded-2xl bg-white border border-black/5 p-12">
        <p className="text-[13px] text-text-secondary text-center py-16">{t('trade_in_page.form_placeholder')}</p>
      </div>
    </div>
  )
}

export default TradeInPage
