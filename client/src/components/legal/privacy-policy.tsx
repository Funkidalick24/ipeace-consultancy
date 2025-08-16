import { useTranslation } from 'react-i18next';

export function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="prose max-w-none">
      <h1>{t('legal.privacy.title')}</h1>
      
      <section className="mb-6">
        <h2 className="text-lg md:text-xl font-semibold mt-6 mb-3">{t('legal.privacy.introduction.title')}</h2>
        <p>{t('legal.privacy.introduction.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.privacy.informationWeCollect.title')}</h2>
        <h3 className="text-base md:text-lg font-medium mt-4 mb-2">{t('legal.privacy.informationWeCollect.personal.title')}</h3>
        <p>{t('legal.privacy.informationWeCollect.personal.content')}</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>{t('legal.privacy.informationWeCollect.personal.examples.0')}</li>
          <li>{t('legal.privacy.informationWeCollect.personal.examples.1')}</li>
          <li>{t('legal.privacy.informationWeCollect.personal.examples.2')}</li>
          <li>{t('legal.privacy.informationWeCollect.personal.examples.3')}</li>
        </ul>

        <h3 className="text-base md:text-lg font-medium mt-4 mb-2">{t('legal.privacy.informationWeCollect.usage.title')}</h3>
        <p>{t('legal.privacy.informationWeCollect.usage.content')}</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>{t('legal.privacy.informationWeCollect.usage.examples.0')}</li>
          <li>{t('legal.privacy.informationWeCollect.usage.examples.1')}</li>
          <li>{t('legal.privacy.informationWeCollect.usage.examples.2')}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.privacy.howWeUseInformation.title')}</h2>
        <p>{t('legal.privacy.howWeUseInformation.content')}</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>{t('legal.privacy.howWeUseInformation.purposes.0')}</li>
          <li>{t('legal.privacy.howWeUseInformation.purposes.1')}</li>
          <li>{t('legal.privacy.howWeUseInformation.purposes.2')}</li>
          <li>{t('legal.privacy.howWeUseInformation.purposes.3')}</li>
          <li>{t('legal.privacy.howWeUseInformation.purposes.4')}</li>
          <li>{t('legal.privacy.howWeUseInformation.purposes.5')}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.privacy.dataProtection.title')}</h2>
        <p>{t('legal.privacy.dataProtection.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.privacy.sharingOfInformation.title')}</h2>
        <p>{t('legal.privacy.sharingOfInformation.content')}</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>{t('legal.privacy.sharingOfInformation.cases.0')}</li>
          <li>{t('legal.privacy.sharingOfInformation.cases.1')}</li>
          <li>{t('legal.privacy.sharingOfInformation.cases.2')}</li>
          <li>{t('legal.privacy.sharingOfInformation.cases.3')}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.privacy.yourRights.title')}</h2>
        <p>{t('legal.privacy.yourRights.content')}</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>{t('legal.privacy.yourRights.rights.0')}</li>
          <li>{t('legal.privacy.yourRights.rights.1')}</li>
          <li>{t('legal.privacy.yourRights.rights.2')}</li>
          <li>{t('legal.privacy.yourRights.rights.3')}</li>
          <li>{t('legal.privacy.yourRights.rights.4')}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.privacy.dataRetention.title')}</h2>
        <p>{t('legal.privacy.dataRetention.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.privacy.cookies.title')}</h2>
        <p>{t('legal.privacy.cookies.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.privacy.thirdPartyLinks.title')}</h2>
        <p>{t('legal.privacy.thirdPartyLinks.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.privacy.childrenPrivacy.title')}</h2>
        <p>{t('legal.privacy.childrenPrivacy.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.privacy.changesToPolicy.title')}</h2>
        <p>{t('legal.privacy.changesToPolicy.content')}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mt-6 mb-3">{t('legal.privacy.contact.title')}</h2>
        <p>{t('legal.privacy.contact.content')}</p>
        <p className="mt-2">
          <strong>{t('contact.office.email')}:</strong> privacy@ipeace.co.zw
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-8">
        {t('legal.privacy.lastUpdated')}: August 15, 2025
      </p>
    </div>
  );
}