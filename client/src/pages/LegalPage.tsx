import { useTranslation } from 'react-i18next'

function LegalPage() {
  const { t, i18n } = useTranslation()

  return (
    <div className="site-container py-16 min-h-[60vh] max-w-3xl">
      <p className="section-eyebrow mb-2">{t('nav.legal_privacy')}</p>
      <h1 className="text-3xl font-bold tracking-tight mb-4">{t('legal_page.title')}</h1>
      <p className="text-[12px] text-text-secondary mb-10">
        {t('legal_page.last_updated')}: {new Date().toLocaleDateString(i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US')}
      </p>
      <div className="space-y-4">
        <section className="rounded-2xl bg-white border border-black/5 p-6">
          <h2 className="font-semibold mb-3">{t('legal_page.privacy_title')}</h2>
          <p className="text-[13px] text-text-secondary leading-relaxed">{t('legal_page.privacy_body')}</p>
        </section>
        <section className="rounded-2xl bg-white border border-black/5 p-6">
          <h2 className="font-semibold mb-3">{t('legal_page.terms_title')}</h2>
          <p className="text-[13px] text-text-secondary leading-relaxed">{t('legal_page.terms_body')}</p>
        </section>
      </div>
    </div>
  )
}

export default LegalPage
