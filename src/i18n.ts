import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en/common.json'
import es from './locales/es/common.json'

const resources = {
  en: { common: en },
  es: { common: es }
}

const defaultLang = (localStorage.getItem('oss_lang') || navigator.language?.split('-')[0] || 'en') as string

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLang,
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false }
  })

export default i18n
