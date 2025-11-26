import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Profile } from '../utils/profile'
import { SCHOOL_DAY_OFFSETS, SCHOOL_DATE_OVERRIDES } from '../data/school-calendar'

interface WidgetGeneratorProps {
  profile: Profile
  encodedConfig: string
}

type WidgetSize = 'small' | 'medium' | 'large'

export default function WidgetGenerator({ profile, encodedConfig }: WidgetGeneratorProps) {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [widgetSize, setWidgetSize] = useState<WidgetSize>('medium')
  const [gradientStart, setGradientStart] = useState('#7B2D35')
  const [gradientEnd, setGradientEnd] = useState('#4a1a20')
  const [textColor, setTextColor] = useState('#ffffff')
  const [copied, setCopied] = useState(false)
  const [previewMenus, setPreviewMenus] = useState<{breakfast?: string[], lunch?: string[]}>({})
  const [previewLoading, setPreviewLoading] = useState(false)

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

  function generateWidgetCode(): string {
    const apiUrl = `https://ossining-school-today.vercel.app/api/fdmenu`
    const childUrl = `https://ossining-school-today.vercel.app/child/${encodeURIComponent(profile.name)}?cfg=${encodedConfig}`
    
    return `// Ossining School Today Widget
// Created at: ossining-school-today.vercel.app
// Student: ${profile.name}
// School: ${profile.school}

const config = {
  studentName: "${profile.name}",
  school: "${profile.school}",
  meals: ${JSON.stringify(profile.meals)},
  specials: ${JSON.stringify(profile.specials)},
  gradientStart: "${gradientStart}",
  gradientEnd: "${gradientEnd}",
  textColor: "${textColor}",
  apiUrl: "${apiUrl}",
  childUrl: "${childUrl}",
  widgetSize: "${widgetSize}",
  language: "${i18n.language || 'en'}",
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
  schoolDayProxyUrl: "https://ossining-school-today.vercel.app/api/school-day"
}

// Widget code
const widget = await createWidget()

// Present widget
if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  // Preview in app based on selected size
  if (config.widgetSize === "small") {
    widget.presentSmall()
  } else if (config.widgetSize === "medium") {
    widget.presentMedium()
  } else {
    widget.presentLarge()
  }
}
Script.complete()

async function createWidget() {
  const w = new ListWidget()
  
  // Set gradient background
  const gradient = new LinearGradient()
  gradient.colors = [new Color(config.gradientStart), new Color(config.gradientEnd)]
  gradient.locations = [0, 1]
  w.backgroundGradient = gradient
  
  w.setPadding(12, 12, 12, 12)
  
  // Check for cached data in case of network issues
  const cacheKey = \`ossining_cache_\${config.studentName}_\${config.school}\`
  
  try {
    // Use current date
    const now = new Date()
    const displayDate = now
    const dayOfWeek = displayDate.getDay()
    
    // Determine font sizes based on widget size and meal count
    const widgetSize = config.widgetSize
    const hasBothMeals = config.meals.includes("breakfast") && config.meals.includes("lunch")
    const isLarge = widgetSize === "large"
    const isMedium = widgetSize === "medium"
    
    // Font size multipliers
    let titleSize = 16
    let daySize = 14
    let specialsSize = 13
    let mealLabelSize = 12
    let menuSize = 12
    
    if (isLarge) {
      titleSize = 22
      daySize = 19
      specialsSize = 18
      mealLabelSize = 17
      menuSize = 16
    } else if (isMedium && !hasBothMeals) {
      titleSize = 18
      daySize = 16
      specialsSize = 15
      mealLabelSize = 14
      menuSize = 14
    }
    
    // Determine menu item limit based on widget size and meals
    const isSmall = widgetSize === "small"
    
    let menuItemLimit
    if (isSmall) {
      // Small widget: 6 items total, split between meals if both enabled
      menuItemLimit = hasBothMeals ? 3 : 6
    } else if (isMedium) {
      // Medium widget: 12 items total, split between meals if both enabled
      menuItemLimit = hasBothMeals ? 6 : 12
    } else {
      // Large widget: 12 items per meal
      menuItemLimit = 12
    }
    
    // Try to fetch live data
    let dayText, specialsText, isSchoolDay
    let offlineMode = false
    
    try {
      // Fetch school day from API
      const schoolDayInfo = await getSchoolDay()
      dayText = schoolDayInfo.dayText
      specialsText = getSpecials(schoolDayInfo.dayKey)
      isSchoolDay = schoolDayInfo.dayKey !== null
    } catch (error) {
      // Use cached data if available
      console.log("Failed to fetch live data, checking cache...")
      const cachedData = await loadFromCache(cacheKey)
      if (cachedData) {
        dayText = cachedData.dayText
        specialsText = cachedData.specialsText
        isSchoolDay = cachedData.isSchoolDay
        offlineMode = true
      } else {
        // Ultimate fallback
        const generalLabels = config.generalTranslations[config.language] || config.generalTranslations.en
        dayText = generalLabels.noSchool
        specialsText = ""
        isSchoolDay = false
        offlineMode = true
      }
    }
    
    // Title (with offline indicator if needed)
    const titleText = offlineMode ? 
      \`\${config.studentName} • \${config.school} (\${config.generalTranslations[config.language]?.offline || "Offline"})\` :
      \`\${config.studentName} • \${config.school}\`
    const title = w.addText(titleText)
    title.textColor = new Color(config.textColor)
    title.font = Font.boldSystemFont(titleSize)
    
    w.addSpacer(4)
    
    if (isLarge) {
      // Large widget: separate lines
      const dayLabel = w.addText(dayText)
      dayLabel.textColor = new Color(config.textColor, 0.9)
      dayLabel.font = Font.systemFont(daySize)
      
      w.addSpacer(6)
      
      if (specialsText) {
        const specialsLabel = w.addText(specialsText)
        specialsLabel.textColor = new Color(config.textColor, 0.85)
        specialsLabel.font = Font.systemFont(specialsSize)
        w.addSpacer(4)
      }
    } else {
      // Small/Medium widget: same line
      const combinedText = specialsText ? \`\${dayText} • \${specialsText}\` : dayText
      const dayLabel = w.addText(combinedText)
      dayLabel.textColor = new Color(config.textColor, 0.9)
      dayLabel.font = Font.systemFont(daySize)
      w.addSpacer(6)
    }
    
    // Only fetch and display meals if it's a school day
    if (isSchoolDay) {
      // Fetch breakfast if enabled
      if (config.meals.includes("breakfast")) {
        w.addSpacer(2)
        const menuItems = offlineMode ? 
          await getCachedMenu(cacheKey, "breakfast") :
          await fetchMenuWithCache(displayDate, "breakfast", cacheKey)
        
        if (menuItems && menuItems.length > 0) {
          const mealLabels = config.mealTranslations[config.language] || config.mealTranslations.en
          const labelText = w.addText(mealLabels.breakfast)
          labelText.textColor = new Color(config.textColor, 0.9)
          labelText.font = Font.boldSystemFont(mealLabelSize)
          
          const menuText = w.addText(menuItems.slice(0, menuItemLimit).join(", "))
          menuText.textColor = new Color(config.textColor, 0.8)
          menuText.font = Font.systemFont(menuSize)
        }
      }
      
      // Fetch lunch if enabled
      if (config.meals.includes("lunch")) {
        w.addSpacer(2)
        const menuItems = offlineMode ? 
          await getCachedMenu(cacheKey, "lunch") :
          await fetchMenuWithCache(displayDate, "lunch", cacheKey)
        
        if (menuItems && menuItems.length > 0) {
          const mealLabels = config.mealTranslations[config.language] || config.mealTranslations.en
          const labelText = w.addText(mealLabels.lunch)
          labelText.textColor = new Color(config.textColor, 0.9)
          labelText.font = Font.boldSystemFont(mealLabelSize)
          
          const menuText = w.addText(menuItems.slice(0, menuItemLimit).join(", "))
          menuText.textColor = new Color(config.textColor, 0.8)
          menuText.font = Font.systemFont(menuSize)
        }
      }
    }
    
    // Save successful data to cache for offline use (only if not in offline mode)
    if (!offlineMode) {
      await saveToCache(cacheKey, {
        dayText: dayText,
        specialsText: specialsText,
        isSchoolDay: isSchoolDay,
        lastUpdate: new Date().toISOString()
      })
    }
    
  } catch (error) {
    // Ultimate fallback - show minimal error info
    const generalLabels = config.generalTranslations[config.language] || config.generalTranslations.en
    const errorText = w.addText(generalLabels.error + " " + error.message)
    errorText.textColor = new Color(config.textColor)
    errorText.font = Font.systemFont(9)
  }
  
  w.addSpacer()
  
  // Tap to open
  w.url = config.childUrl
  
  return w
}

async function getSchoolDay() {
  try {
    const req = new Request(config.schoolDayProxyUrl)
    const response = await req.loadJSON()
    
    if (response.status === "success") {
      const schoolData = response.schools[config.school]
      
      if (!schoolData) {
        throw new Error("School not found in response")
      }
      
      const generalLabels = config.generalTranslations[config.language] || config.generalTranslations.en
      
      // Check if school is closed
      if (schoolData.dayNumber === "closed") {
        return { dayText: generalLabels.noSchool, dayKey: null }
      }
      
      // Use the dayKey from the proxy
      const dayKey = schoolData.dayKey
      const dayNumber = schoolData.dayNumber
      
      // Format day text based on school type
      const school = config.school
      let dayText = ""
      
      if (school === "AMD" || school === "OHS") {
        // High school: A/B format
        dayText = \`\${generalLabels.day} \${dayKey}\`
      } else {
        // Elementary: Day 1-6 format
        dayText = \`\${generalLabels.day} \${dayKey}\`
      }
      
      return { dayText, dayKey }
    } else {
      // Fallback to weekend check
      const now = new Date()
      const dayOfWeek = now.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const generalLabels = config.generalTranslations[config.language] || config.generalTranslations.en
        return { dayText: generalLabels.noSchool, dayKey: null }
      }
      const generalLabels = config.generalTranslations[config.language] || config.generalTranslations.en
      return { dayText: generalLabels.noSchool, dayKey: null }
    }
  } catch (error) {
    console.error("Error fetching school day: " + error.message)
    // Fallback to weekend check
    const now = new Date()
    const dayOfWeek = now.getDay()
    const generalLabels = config.generalTranslations[config.language] || config.generalTranslations.en
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { dayText: generalLabels.noSchool, dayKey: null }
    }
    return { dayText: generalLabels.noSchool, dayKey: null }
  }
}

function getSpecials(dayKey) {
  if (!dayKey) return ""
  
  const specials = config.specials[dayKey] || []
  if (specials.length === 0) return ""
  
  // Add emojis for known specials only
  const emojiMap = {
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
  
  // Get translations for current language
  const translations = config.specialsTranslations[config.language] || config.specialsTranslations.en
  
  // Apply translations and emojis
  return specials.map(s => {
    const translatedName = translations[s] || s  // Use translation if available, otherwise use original
    const emoji = emojiMap[s] || ""
    return \`\${emoji}\${translatedName}\`
  }).join(" • ")
}

async function getCachedMenu(cacheKey, mealType) {
  const cachedData = await loadFromCache(cacheKey)
  if (cachedData && cachedData.menus && cachedData.menus[mealType]) {
    return cachedData.menus[mealType]
  }
  return []
}

async function fetchMenuWithCache(date, mealType, cacheKey) {
  try {
    const menuItems = await fetchMenu(date, mealType)
    
    // Update cache with successful fetch
    const existingCache = await loadFromCache(cacheKey) || {}
    existingCache.menus = existingCache.menus || {}
    existingCache.menus[mealType] = menuItems
    existingCache.lastMenuUpdate = new Date().toISOString()
    await saveToCache(cacheKey, existingCache)
    
    return menuItems
  } catch (error) {
    // Return cached menu data if available
    const cachedData = await loadFromCache(cacheKey)
    if (cachedData && cachedData.menus && cachedData.menus[mealType]) {
      console.log(\`Using cached \${mealType} menu due to network error\`)
      return cachedData.menus[mealType]
    }
    
    console.error("Error fetching menu and no cached data: " + error.message)
    return []
  }
}

async function saveToCache(key, data) {
  try {
    const fm = FileManager.local()
    const cachePath = fm.documentsDirectory() + "/" + key + ".json"
    fm.writeString(cachePath, JSON.stringify(data))
  } catch (error) {
    console.log("Failed to save to cache: " + error.message)
  }
}

async function loadFromCache(key) {
  try {
    const fm = FileManager.local()
    const cachePath = fm.documentsDirectory() + "/" + key + ".json"
    if (fm.fileExists(cachePath)) {
      const cachedString = fm.readString(cachePath)
      return JSON.parse(cachedString)
    }
  } catch (error) {
    console.log("Failed to load from cache: " + error.message)
  }
  return null
}

async function fetchMenu(date, mealType) {
  try {
    const school = config.school
    const schoolCodes = {
      "Park": { breakfast: "152/833/1", lunch: "152/833/2" },
      "Brookside": { breakfast: "152/832/1", lunch: "152/832/2" },
      "Claremont": { breakfast: "152/831/1", lunch: "152/831/2" },
      "Roosevelt": { breakfast: "152/834/1", lunch: "152/834/2" },
      "AMD": { breakfast: "152/830/1", lunch: "152/830/2" },
      "OHS": { breakfast: "152/829/1", lunch: "152/829/2" }
    }
    
    const codes = schoolCodes[school]
    if (!codes) {
      console.log("No account codes for school: " + school)
      return []
    }
    
    // Use the appropriate meal type code
    const accountId = codes[mealType] || codes.lunch
    
    // Format date for API
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateParam = \`&date=\${year}-\${month}-\${day}\`
    
    const url = \`\${config.apiUrl}?account=\${accountId}\${dateParam}&lang=\${config.language}\`
    
    const req = new Request(url)
    const response = await req.loadString()
    
    const data = JSON.parse(response)
    
    if (!data || !data.items || data.items.length === 0) {
      return []
    }
    
    // Return up to 12 menu items
    const items = data.items.slice(0, 12)
    return items
    
  } catch (error) {
    console.error("Error fetching menu: " + error.message)
    return []
  }
}
`
  }

  function copyCode() {
    const code = generateWidgetCode()
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadCode() {
    const code = generateWidgetCode()
    const blob = new Blob([code], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${profile.name.replace(/\s+/g, '_')}_widget.js`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} style={{padding:'8px 12px', borderRadius:'8px', border:0, background:'#2563eb', color:'#fff', fontWeight:600, cursor:'pointer'}}>
        📱 {t('widget.create')}
      </button>
    )
  }

  return (
    <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20}}>
      <div style={{background:'var(--bg)', border:'1px solid #3a3a3a', borderRadius:'12px', padding:'24px', maxWidth:'600px', maxHeight:'90vh', overflow:'auto', width:'100%'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <h2 style={{margin:0}}>{t('widget.title')}</h2>
          <button onClick={() => setIsOpen(false)} style={{background:'transparent', border:'none', fontSize:'24px', cursor:'pointer', color:'var(--fg)'}}>×</button>
        </div>

        <div style={{marginBottom:16}}>
          <p style={{fontSize:'14px', color:'var(--fg)', opacity:0.8}}>
            {t('widget.instructions')}
          </p>
          <ol style={{fontSize:'13px', color:'var(--fg)', opacity:0.8, paddingLeft:20}}>
            <li>
              {t('widget.step1')}
              <a href="https://apps.apple.com/us/app/scriptable/id1405459188" target="_blank" rel="noreferrer" style={{color:'#2563eb', fontWeight:600}}>
                {t('widget.step1Link')}
              </a>
              {t('widget.step1After')}
            </li>
            <li>{t('widget.step2')}</li>
            <li>{t('widget.step3')}</li>
            <li>
              {t('widget.step4')} (
              <a href="https://youtube.com/shorts/tP5I5vahSWg" target="_blank" rel="noreferrer" style={{color:'#2563eb', fontWeight:600}}>
                {t('widget.step4Video')}
              </a>
              )
            </li>
          </ol>
        </div>

        <div style={{marginBottom:16}}>
          <label style={{display:'block', fontSize:'13px', marginBottom:8}}>{t('widget.size')}</label>
          <select value={widgetSize} onChange={e => setWidgetSize(e.target.value as WidgetSize)} style={{padding:'8px', borderRadius:'8px', border:'1px solid #3a3a3a', background:'var(--bg)', color:'var(--fg)', width:'100%'}}>
            <option value="small">{t('widget.sizeSmall')}</option>
            <option value="medium">{t('widget.sizeMedium')}</option>
            <option value="large">{t('widget.sizeLarge')}</option>
          </select>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16}}>
          <div>
            <label style={{display:'block', fontSize:'13px', marginBottom:4}}>{t('widget.colorStart')}</label>
            <div style={{position:'relative', borderRadius:12, height:48, boxShadow:'0 2px 8px rgba(0,0,0,0.15)', overflow:'hidden', background:gradientStart}}>
              <input type="color" value={gradientStart} onChange={e => setGradientStart(e.target.value)} style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', cursor:'pointer', opacity:0}} />
            </div>
          </div>
          <div>
            <label style={{display:'block', fontSize:'13px', marginBottom:4}}>{t('widget.colorEnd')}</label>
            <div style={{position:'relative', borderRadius:12, height:48, boxShadow:'0 2px 8px rgba(0,0,0,0.15)', overflow:'hidden', background:gradientEnd}}>
              <input type="color" value={gradientEnd} onChange={e => setGradientEnd(e.target.value)} style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', cursor:'pointer', opacity:0}} />
            </div>
          </div>
          <div>
            <label style={{display:'block', fontSize:'13px', marginBottom:4}}>{t('widget.colorText')}</label>
            <div style={{position:'relative', borderRadius:12, height:48, boxShadow:'0 2px 8px rgba(0,0,0,0.15)', overflow:'hidden', background:textColor}}>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', cursor:'pointer', opacity:0}} />
            </div>
          </div>
        </div>

        {/* Widget Preview */}
        <div style={{marginBottom:16}}>
          <label style={{display:'block', fontSize:'13px', marginBottom:8}}>{t('widget.preview')} <span style={{fontSize:'12px', opacity:0.7, fontWeight:'normal'}}>{t('widget.previewNote')}</span></label>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '12px',
            border: '1px solid #e0e0e0'
          }}>
            {(() => {
              // Calculate font sizes based on widget size and meals
              const hasBothMeals = profile.meals.includes('breakfast') && profile.meals.includes('lunch')
              const isLarge = widgetSize === 'large'
              const isMedium = widgetSize === 'medium'
              
              let titleSize = 16
              let daySize = 14
              let specialsSize = 13
              let mealLabelSize = 12
              let menuSize = 12
              
              if (isLarge) {
                titleSize = 22
                daySize = 19
                specialsSize = 18
                mealLabelSize = 17
                menuSize = 16
              } else if (isMedium && !hasBothMeals) {
                titleSize = 18
                daySize = 16
                specialsSize = 15
                mealLabelSize = 14
                menuSize = 14
              }
              
              // Determine menu item limit for preview - same logic as widget
              const isSmall = widgetSize === 'small'
              
              let previewMenuLimit
              if (isSmall) {
                // Small widget: 6 items total, split between meals if both enabled
                previewMenuLimit = hasBothMeals ? 3 : 6
              } else if (isMedium) {
                // Medium widget: 12 items total, split between meals if both enabled
                previewMenuLimit = hasBothMeals ? 6 : 12
              } else {
                // Large widget: 12 items per meal
                previewMenuLimit = 12
              }
              
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
                  background: `linear-gradient(to bottom, ${gradientStart}, ${gradientEnd})`,
                  borderRadius: '22px',
                  padding: '12px',
                  width: widgetSize === 'small' ? '155px' : widgetSize === 'medium' ? '329px' : '345px',
                  height: widgetSize === 'small' ? '155px' : widgetSize === 'medium' ? '155px' : '345px',
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
                    {specialLabel && !isLarge && ` • ${specialLabel}`}
                  </div>
                  {specialLabel && isLarge && (
                    <div style={{color: textColor, opacity: 0.85, fontSize: `${specialsSize}px`, marginBottom: '4px'}}>
                      {specialLabel}
                    </div>
                  )}
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
          <button onClick={copyCode} style={{flex:1, padding:'10px', borderRadius:'8px', border:0, background:'#2563eb', color:'#fff', fontWeight:600, cursor:'pointer'}}>
            {copied ? '✓ ' + t('buttons.copied') : t('buttons.copy')}
          </button>
          <button onClick={downloadCode} style={{flex:1, padding:'10px', borderRadius:'8px', border:0, background:'#059669', color:'#fff', fontWeight:600, cursor:'pointer'}}>
            ⬇ {t('widget.download')}
          </button>
        </div>

        <div style={{padding:12, background:'#1a1a1a', borderRadius:8, fontSize:11, fontFamily:'monospace', maxHeight:200, overflow:'auto', color:'#e8e8e8'}}>
          <pre style={{margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word'}}>{generateWidgetCode()}</pre>
        </div>
      </div>
    </div>
  )
}
