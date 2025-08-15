import { useTranslation } from 'react-i18next';

export function TermsOfService() {
  const { t } = useTranslation();

  return (
    <div className="prose max-w-none">
      <h1>{t('legal.terms.title')}</h1>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.terms.acceptance.title')}</h2>
        <p>{t('legal.terms.acceptance.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.terms.useOfService.title')}</h2>
        <p>{t('legal.terms.useOfService.content')}</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>{t('legal.terms.useOfService.prohibited.0')}</li>
          <li>{t('legal.terms.useOfService.prohibited.1')}</li>
          <li>{t('legal.terms.useOfService.prohibited.2')}</li>
          <li>{t('legal.terms.useOfService.prohibited.3')}</li>
          <li>{t('legal.terms.useOfService.prohibited.4')}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.terms.intellectualProperty.title')}</h2>
        <p>{t('legal.terms.intellectualProperty.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.terms.termination.title')}</h2>
        <p>{t('legal.terms.termination.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.terms.disclaimer.title')}</h2>
        <p>{t('legal.terms.disclaimer.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.terms.limitationOfLiability.title')}</h2>
        <p>{t('legal.terms.limitationOfLiability.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.terms.governingLaw.title')}</h2>
        <p>{t('legal.terms.governingLaw.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.terms.changesToTerms.title')}</h2>
        <p>{t('legal.terms.changesToTerms.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.terms.contact.title')}</h2>
        <p>{t('legal.terms.contact.content')}</p>
        <p className="mt-2">
          <strong>{t('contact.office.email')}:</strong> legal@ipeace.co.zw
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-8">
        {t('legal.terms.lastUpdated')}: August 15, 2025
      </p>
    </div>
  );
}