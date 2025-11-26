import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Profile } from '../utils/profile'
import { SCHOOL_DAY_OFFSETS, SCHOOL_DATE_OVERRIDES } from '../data/school-calendar'

interface AndroidWidgetGeneratorProps {
  profile: Profile
  encodedConfig: string
}

export default function AndroidWidgetGenerator({ profile, encodedConfig }: AndroidWidgetGeneratorProps) {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [gradientStart, setGradientStart] = useState('#7B2D35')
  const [gradientEnd, setGradientEnd] = useState('#4a1a20')
  const [textColor, setTextColor] = useState('#ffffff')
  const [copied, setCopied] = useState(false)
  const [previewMenus, setPreviewMenus] = useState<{breakfast?: string[], lunch?: string[]}>({})
  const [previewLoading, setPreviewLoading] = useState(false)
  const showComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    window.alert(t('androidWidget.comingSoon'));
  }

  // Fetch preview menu data
  useEffect(() => {
    if (!isOpen) return
    
    const fetchPreviewMenus = async () => {
      setPreviewLoading(true)
      const menus: {breakfast?: string[], lunch?: string[]} = {}
      
      const schoolCodes: Record<string, {breakfast: string, lunch: string}> = {
        "Park": { breakfast: "152/833/1", lunch: "152/833/2" },
        "Brookside": { breakfast: "152/832/1", lunch: "152/832/2" },
        "Claremont": { breakfast: "152/831/1", lunch: "152/831/2" },
        "Roosevelt": { breakfast: "152/834/1", lunch: "152/834/2" },
        "AMD": { breakfast: "152/830/1", lunch: "152/830/2" },
        "OHS": { breakfast: "152/829/1", lunch: "152/829/2" }
      }
      
      const codes = schoolCodes[profile.school]
      if (!codes) {
        setPreviewLoading(false)
        return
      }
      
      const proxyBase = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://ossining-school-today.vercel.app/api'
      const lang = i18n.language || 'en'
      
      // Use current date
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const date = `${year}-${month}-${day}`
      
      try {
        if (profile.meals.includes('breakfast')) {
          const resp = await fetch(`${proxyBase}/fdmenu?account=${encodeURIComponent(codes.breakfast)}&date=${date}&lang=${encodeURIComponent(lang)}`)
          if (resp.ok) {
            const data = await resp.json()
            if (data.items && data.items.length > 0) {
              menus.breakfast = data.items.slice(0, 12)
            }
          }
        }
        
        if (profile.meals.includes('lunch')) {
          const resp = await fetch(`${proxyBase}/fdmenu?account=${encodeURIComponent(codes.lunch)}&date=${date}&lang=${encodeURIComponent(lang)}`)
          if (resp.ok) {
            const data = await resp.json()
            if (data.items && data.items.length > 0) {
              menus.lunch = data.items.slice(0, 12)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching preview menus:', error)
      }
      
      setPreviewMenus(menus)
      setPreviewLoading(false)
    }
    
    fetchPreviewMenus()
  }, [isOpen, i18n.language, profile.school, profile.meals])

  function generateWidgetConfig(): string {
    const apiUrl = `https://ossining-school-today.vercel.app/api/fdmenu`
    const childUrl = `https://ossining-school-today.vercel.app/child/${encodeURIComponent(profile.name)}?cfg=${encodedConfig}`
    
    const schoolCodes: Record<string, {breakfast: string, lunch: string}> = {
      "Park": { breakfast: "152/833/1", lunch: "152/833/2" },
      "Brookside": { breakfast: "152/832/1", lunch: "152/832/2" },
      "Claremont": { breakfast: "152/831/1", lunch: "152/831/2" },
      "Roosevelt": { breakfast: "152/834/1", lunch: "152/834/2" },
      "AMD": { breakfast: "152/830/1", lunch: "152/830/2" },
      "OHS": { breakfast: "152/829/1", lunch: "152/829/2" }
    }

    const codes = schoolCodes[profile.school]

    // Emoji map for specials
    const emojiMap: Record<string, string> = {
      "PE": "🏃",
      "Art": "🎨",
      "Stream": "💻",
      "STEM": "🔬",
      "AVID": "📚",
      "Health": "⚕️",
      "Music": "🎵",
      "Band": "🎺",
      "Orchestra": "🎻",
      "Chorus": "🎤"
    }

    const config = {
      studentName: profile.name,
      school: profile.school,
      meals: profile.meals,
      specials: profile.specials,
      gradientStart: gradientStart,
      gradientEnd: gradientEnd,
      textColor: textColor,
      originalUrl: childUrl,
      apiUrl: apiUrl,
      schoolCodes: codes,
      language: i18n.language || 'en',
      specialsEmojis: emojiMap,
      specialsTranslations: {
        en: {
          "PE": "PE",
          "Art": "Art",
          "Stream": "Stream",
          "STEM": "STEM",
          "AVID": "AVID",
          "Health": "Health",
          "Music": "Music",
          "Band": "Band",
          "Orchestra": "Orchestra",
          "Chorus": "Chorus"
        },
        es: {
          "PE": "Educación Física",
          "Art": "Arte",
          "Stream": "STREAM",
          "STEM": "STEM",
          "AVID": "AVID",
          "Health": "Salud",
          "Music": "Música",
          "Band": "Banda",
          "Orchestra": "Orquesta",
          "Chorus": "Coro"
        }
      },
      mealTranslations: {
        en: {
          "breakfast": "Breakfast:",
          "lunch": "Lunch:"
        },
        es: {
          "breakfast": "Desayuno:",
          "lunch": "Almuerzo:"
        }
      },
      generalTranslations: {
        en: {
          "noSchool": "No school today",
          "day": "Day",
          "error": "Error:",
          "offline": "Offline"
        },
        es: {
          "noSchool": "No hay clases hoy",
          "day": "Día",
          "error": "Error:",
          "offline": "Sin conexión"
        }
      },
      schoolDayApiUrl: "https://ossining-school-today.vercel.app/api/school-day"
    }

    return JSON.stringify(config, null, 2)
  }

  function copyConfig() {
    const config = generateWidgetConfig()
    navigator.clipboard?.writeText(config)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadConfig() {
    const config = generateWidgetConfig()
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${profile.name.replace(/\s+/g, '_')}_android_widget_config.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} style={{padding:'8px 12px', borderRadius:'8px', border:0, background:'#34A853', color:'#fff', fontWeight:600, cursor:'pointer'}}>
        🤖 {t('androidWidget.create')}
      </button>
    )
  }

  return (
    <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20}}>
      <div style={{background:'var(--bg)', border:'1px solid #3a3a3a', borderRadius:'12px', padding:'24px', maxWidth:'600px', maxHeight:'90vh', overflow:'auto', width:'100%'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <h2 style={{margin:0}}>🤖 {t('androidWidget.title')}</h2>
          <button onClick={() => setIsOpen(false)} style={{background:'transparent', border:'none', fontSize:'24px', cursor:'pointer', color:'var(--fg)'}}>×</button>
        </div>

        <div style={{marginBottom:16}}>
          <p style={{fontSize:'14px', color:'var(--fg)', opacity:0.8}}>
            {t('androidWidget.instructions')}
          </p>
          <ol style={{fontSize:'13px', color:'var(--fg)', opacity:0.8, paddingLeft:20}}>
            <li>
              {t('androidWidget.step1')}
              <a href="#" onClick={showComingSoon} style={{color:'#34A853', fontWeight:600}}>
                {t('androidWidget.step1Link')}
              </a>
              {t('androidWidget.step1After')}
            </li>
            <li>{t('androidWidget.step2')}</li>
            <li>{t('androidWidget.step3')}</li>
            <li>
              {t('androidWidget.step4')} (
              <a href="#" onClick={showComingSoon} style={{color:'#34A853', fontWeight:600}}>
                {t('androidWidget.step4Video')}
              </a>
              )
            </li>
          </ol>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16}}>
          <div>
            <label style={{display:'block', fontSize:'13px', marginBottom:4}}>{t('androidWidget.widgetColor')}</label>
            <div style={{position:'relative', borderRadius:12, height:48, boxShadow:'0 2px 8px rgba(0,0,0,0.15)', overflow:'hidden', background:gradientStart}}>
              <input type="color" value={gradientStart} onChange={e => setGradientStart(e.target.value)} style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', cursor:'pointer', opacity:0}} />
            </div>
          </div>
          <div>
            <label style={{display:'block', fontSize:'13px', marginBottom:4}}>{t('androidWidget.colorText')}</label>
            <div style={{position:'relative', borderRadius:12, height:48, boxShadow:'0 2px 8px rgba(0,0,0,0.15)', overflow:'hidden', background:textColor}}>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', cursor:'pointer', opacity:0}} />
            </div>
          </div>
        </div>

        {/* Widget Preview */}
        <div style={{marginBottom:16}}>
          <label style={{display:'block', fontSize:'13px', marginBottom:8}}>{t('androidWidget.preview')} <span style={{fontSize:'12px', opacity:0.7, fontWeight:'normal'}}>{t('androidWidget.previewNote')}</span></label>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '12px',
            border: '1px solid #e0e0e0'
          }}>
            {(() => {
              // Calculate font sizes for medium widget
              const hasBothMeals = profile.meals.includes('breakfast') && profile.meals.includes('lunch')
              
              let titleSize = 16
              let daySize = 14
              let specialsSize = 13
              let mealLabelSize = 12
              let menuSize = 12
              
              if (!hasBothMeals) {
                titleSize = 18
                daySize = 16
                specialsSize = 15
                mealLabelSize = 14
                menuSize = 14
              }
              
              // Medium widget: 12 items total, split between meals if both enabled
              const previewMenuLimit = hasBothMeals ? 6 : 12
              
              // Use fetched menu data or fallback samples
              const breakfastLabel = t('meals.breakfast')
              const lunchLabel = t('meals.lunch')
              const breakfastItems = (previewMenus.breakfast?.slice(0, previewMenuLimit) || ["Pancakes", "Turkey Sausage", "Fresh Fruit Cup", "Orange Juice", "Milk"]).join(', ')
              const lunchItems = (previewMenus.lunch?.slice(0, previewMenuLimit) || ["Beef Burger", "Cheeseburger", "Veggie Burger On Bun", "Sweet Potato Fries", "Lettuce", "Sliced Tomatoes"]).join(', ')
              
              // Translate day and specials
              const isAMDOrOHS = profile.school === 'AMD' || profile.school === 'OHS'
              const dayKey = isAMDOrOHS ? 'A' : '1'
              const dayLabel = isAMDOrOHS 
                ? t('schedule.day', { n: 'A' }) 
                : t('schedule.day', { n: '1' })
              
              // Get specials for the current day only and translate them
              const daySpecials = profile.specials && profile.specials[dayKey] ? profile.specials[dayKey] : []
              const emojiMap: Record<string, string> = {
                "PE": "🏃",
                "Art": "🎨",
                "Stream": "💻",
                "STEM": "🔬",
                "AVID": "📚",
                "Health": "⚕️",
                "Music": "🎵",
                "Band": "🎺",
                "Orchestra": "🎻",
                "Chorus": "🎤"
              }
              const knownSpecials = ['PE', 'Art', 'Stream', 'STEM', 'AVID', 'Health', 'Music', 'Band', 'Orchestra', 'Chorus', 'Other']
              const specialLabel = daySpecials.length > 0 
                ? daySpecials.map(s => {
                    const isKnownSpecial = knownSpecials.includes(s)
                    const translatedName = isKnownSpecial ? t(`specials.${s}`) : s
                    const emoji = emojiMap[s] || ""
                    return `${emoji}${translatedName}`
                  }).join(" • ")
                : null
              
              return (
                <div style={{
                  background: gradientStart,
                  borderRadius: '22px',
                  padding: '12px',
                  width: '329px',
                  height: '155px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{color: textColor, fontWeight: 'bold', fontSize: `${titleSize}px`, marginBottom: '4px'}}>
                    {profile.name} • {profile.school}
                  </div>
                  <div style={{color: textColor, opacity: 0.9, fontSize: `${daySize}px`, marginBottom: '6px'}}>
                    {dayLabel}
                    {specialLabel && ` • ${specialLabel}`}
                  </div>
                  {profile.meals.includes('breakfast') && (
                    <div style={{marginTop: '2px'}}>
                      <div style={{color: textColor, opacity: 0.9, fontWeight: 'bold', fontSize: `${mealLabelSize}px`}}>
                        {breakfastLabel}:
                      </div>
                      <div style={{color: textColor, opacity: 0.8, fontSize: `${menuSize}px`, lineHeight: '1.3'}}>
                        {previewLoading ? '...' : breakfastItems}
                      </div>
                    </div>
                  )}
                  {profile.meals.includes('lunch') && (
                    <div style={{marginTop: '2px'}}>
                      <div style={{color: textColor, opacity: 0.9, fontWeight: 'bold', fontSize: `${mealLabelSize}px`}}>
                        {lunchLabel}:
                      </div>
                      <div style={{color: textColor, opacity: 0.8, fontSize: `${menuSize}px`, lineHeight: '1.3'}}>
                        {previewLoading ? '...' : lunchItems}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>

        <div style={{display:'flex', gap:8, marginBottom:16}}>
          <button onClick={copyConfig} style={{flex:1, padding:'10px', borderRadius:'8px', border:0, background:'#34A853', color:'#fff', fontWeight:600, cursor:'pointer'}}>
            {copied ? '✓ ' + t('buttons.copied') : t('buttons.copy') + ' JSON'}
          </button>
          <button onClick={downloadConfig} style={{flex:1, padding:'10px', borderRadius:'8px', border:0, background:'#059669', color:'#fff', fontWeight:600, cursor:'pointer'}}>
            ⬇ {t('androidWidget.download')} JSON
          </button>
        </div>

        <div style={{padding:12, background:'#1a1a1a', borderRadius:8, fontSize:11, fontFamily:'monospace', maxHeight:200, overflow:'auto', color:'#e8e8e8'}}>
          <pre style={{margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word'}}>{generateWidgetConfig()}</pre>
        </div>
      </div>
    </div>
  )
}
