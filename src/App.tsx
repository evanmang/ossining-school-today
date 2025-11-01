import React, { useEffect, useRef } from 'react'
import './i18n'
import { useTranslation } from 'react-i18next'
import SetupForm from './components/SetupForm'
import ChildPage from './pages/ChildPage'

function getPath(): string{
  return location.pathname || '/'
}

export default function App() {
  const bmcRef = useRef<HTMLDivElement | null>(null)
  const { t, i18n } = useTranslation()

  function setLang(l: string){ i18n.changeLanguage(l); try{ localStorage.setItem('oss_lang', l) }catch{} }

  useEffect(()=>{
    // inject BuyMeACoffee script once
    if(!bmcRef.current) return
    const existing = document.getElementById('bmc-script') as HTMLScriptElement | null
    if(existing) return
    const s = document.createElement('script')
    s.id = 'bmc-script'
    s.type = 'text/javascript'
    s.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js'
    s.setAttribute('data-name','bmc-button')
    s.setAttribute('data-slug','evanmangiamele')
    s.setAttribute('data-color','#FFDD00')
    s.setAttribute('data-emoji','☕')
    s.setAttribute('data-font','Cookie')
    s.setAttribute('data-text','Buy me a coffee')
    s.setAttribute('data-outline-color','#000000')
    s.setAttribute('data-font-color','#000000')
    s.setAttribute('data-coffee-color','#ffffff')
    // Append to body so the script can run reliably
    document.body.appendChild(s)
  },[])
  return (
    <div className="app">
      <header className="site-header">
        <div className="logo-wrap">
          <svg className="logo" viewBox="0 0 100 100" aria-hidden="true">
            <rect x="8" y="8" width="84" height="84" rx="12" fill="#7B2D35" />
            <text x="50" y="62" textAnchor="middle" fontSize="54" fill="#fff" fontWeight="600" fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto">O</text>
          </svg>
          <h1>{t('header.title')}</h1>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          {getPath().startsWith('/child') && (
            <a href="/" style={{fontSize:'0.9em', color:'#2563eb', textDecoration:'none'}}>← {t('setup.heading')}</a>
          )}
          <div>
            <button onClick={()=>setLang('en')} style={{marginRight:6,opacity:i18n.language==='en'?1:0.6}}>EN</button>
            <button onClick={()=>setLang('es')} style={{opacity:i18n.language==='es'?1:0.6}}>ES</button>
          </div>
        </div>
      </header>

      <main>
        { getPath().startsWith('/child') ? (
          <ChildPage />
        ) : (
          <section>
            <h2>Setup</h2>
            <SetupForm />
          </section>
        ) }
      </main>

      <footer className="site-footer">
        <div>
          <small>{t('footer.copyright')}</small>
        </div>
        <div>
          <div ref={bmcRef} aria-hidden={false}></div>
          <a className="bmc-fallback" href="https://buymeacoffee.com/evanmangiamele" target="_blank" rel="noreferrer">{t('footer.buy')}</a>
          <noscript>
            <a href="https://buymeacoffee.com/evanmangiamele" target="_blank" rel="noreferrer">Buy me a coffee</a>
          </noscript>
        </div>
      </footer>
    </div>
  )
}
