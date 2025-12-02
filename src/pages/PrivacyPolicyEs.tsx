
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyEs() {
  const { t } = useTranslation();
  const params = new URLSearchParams(location.search);
  const cfg = params.get('cfg');
  const mainHref = cfg ? `/?cfg=${cfg}` : '/';
  return (
    <div style={{maxWidth: 700, margin: '40px auto', padding: 24, background: 'var(--bg)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)'}}>
      <h1>{t('privacy.title')}</h1>
      <p>{t('privacy.updated', { date: '2 de diciembre de 2025' })}</p>
      <p>{t('privacy.intro')}</p>
      <h2>{t('privacy.nocollectTitle')}</h2>
      <ul>
        <li>{t('privacy.nocollect1')}</li>
        <li>{t('privacy.nocollect2')}</li>
        <li>{t('privacy.nocollect3')}</li>
        <li>{t('privacy.nocollect4')}</li>
      </ul>
      <h2>{t('privacy.usageTitle')}</h2>
      <p>{t('privacy.usage')}</p>
      <h2>{t('privacy.thirdpartyTitle')}</h2>
      <p>{t('privacy.thirdparty')}</p>
      <h2>{t('privacy.contactTitle')}</h2>
      <p>{t('privacy.contact', { email: 'evan.mangiamele@gmail.com' })}</p>
    </div>
  );
}
