import React, { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { decodeProfile, Profile } from '../utils/profile'
import { getAccountCode } from '../data/schools'
import { CATEGORY_KEYS } from '../data/menu-translations'
import { getSchoolDay, getDayKey, SchoolCode } from '../data/school-calendar'

export default function ChildPage(){
  const { t, i18n } = useTranslation()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dayRaw, setDayRaw] = useState<string | null>(null) // raw value from API
  const [dayKey, setDayKey] = useState<string | null>(null) // mapped key used in specials ("1".."6" or "A"/"B")
  const [menus, setMenus] = useState<Record<string,any>>({})
  const [error, setError] = useState<string | null>(null)
  const [dayLoading, setDayLoading] = useState(false)
  const [menusLoading, setMenusLoading] = useState(false)

  useEffect(()=>{
    const params = new URLSearchParams(location.search)
    const cfg = params.get('cfg')
    if(!cfg) return
    const p = decodeProfile(cfg)
    setProfile(p)
  },[])

  const load = useCallback(async (p: Profile)=>{
    try{
        // fetch day info
      setDayLoading(true)
      const dayResp = await fetch('https://script.google.com/macros/s/AKfycbyAHJSmnXM_-bPSuBJmS2xHSbsFN5lOZoZTECd0MHQmGUWDJsx90bKzoN0mF0f0cM7t/exec')
      const dayJson = await dayResp.json()
      const raw = dayJson?.dayNumber ?? null
      setDayRaw(raw)
      setDayLoading(false)

      // determine dayKey used in specials
      let key: string | null = null
      if(raw === null || raw === 'No School Today'){
        key = null
      } else {
        // Use the new school calendar system for accurate day calculation
        const schoolDay = getSchoolDay(raw, p.school as SchoolCode, new Date())
        
        if (schoolDay.dayNumber === 'closed') {
          key = null
        } else {
          key = getDayKey(schoolDay.dayNumber, p.school as SchoolCode)
        }
      }
      setDayKey(key)

      // Only fetch menus if it's a school day
      if (key !== null) {
        // fetch menus via proxy for each meal
        setMenusLoading(true)
        const m: Record<string,string[]> = {}
        for(const meal of p.meals){
          const code = getAccountCode(p.school, meal as 'breakfast'|'lunch')
          if(!code) { m[meal] = []; continue }
    // if running locally, prefer the local proxy at port 4000
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    const proxyBase = isLocal ? 'http://localhost:4000' : '/api'
    const resp = await fetch(`${proxyBase}/fdmenu?account=${encodeURIComponent(code)}&lang=${encodeURIComponent(i18n.language || 'en')}`)
    if(!resp.ok){ m[meal] = [] ; continue }
          const j = await resp.json()
          // if proxy returns structured items (objects), keep them, otherwise treat as strings
          if(Array.isArray(j.items) && j.items.length > 0 && typeof j.items[0] === 'object'){
            m[meal] = j.items
          } else {
            m[meal] = (j.items || []).map(String)
          }
        }
        setMenus(m)
        setMenusLoading(false)
      } else {
        // No school today, clear menus
        setMenus({})
        setMenusLoading(false)
      }
    }catch(e){
      console.error(e)
      setError(String(e))
      setDayLoading(false)
      setMenusLoading(false)
    }
  },[i18n.language])

  useEffect(()=>{
    if(!profile) return
    load(profile)
  },[profile, load, i18n.language])

  if(!profile) return <div>{t('child.noProfile')}</div>

  const specialsForToday = dayKey ? (profile.specials?.[dayKey] || []) : []

  const specialEmojiMap: Record<string,string> = {
    PE: '🏃',
    Art: '🎨',
    Stream: '💻',
    STEM: '🔬',
    AVID: '📚',
    Health: '⚕️',
    Music: '🎵',
    Band: '🎺',
    Orchestra: '🎻',
    Chorus: '🎤',
    Other: '✨'
  }

  const categoryEmojiMap: Record<string,string> = {
    Entree: '🍽️',
    Side: '🥗',
    Beverage: '🥤',
    Fruit: '🍎',
    Other: '✨'
  }

  return (
    <div className="child-page-card">
      <div className="child-row" style={{justifyContent:'space-between'}}>
        <h2 style={{margin:0}}>{profile.name} — {profile.school}</h2>
        <div>
          <button onClick={()=>load(profile)}>{t('buttons.refresh') || 'Refresh'}</button>
        </div>
      </div>

      <div style={{marginTop:8, display:'flex', alignItems:'center', gap:12}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <strong>{t('child.today')}</strong>
          {dayLoading ? (
            <span>{t('child.loadingDay')}</span>
          ) : dayRaw === 'No School Today' ? (
            <span>{t('child.noSchool')}</span>
          ) : (
            <span style={{display:'inline-block', marginLeft:4, padding:'6px 12px', borderRadius:999, background:'#2563eb', color:'#fff', fontWeight:700}}>{ dayKey ?? (dayRaw ?? t('child.unknown')) }</span>
          )}
        </div>
      </div>

      {/* Specials shown directly under day when configured (no header) */}
      { specialsForToday.length > 0 && (
        <div style={{marginTop:6, padding:8, background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:6}}>
          <div style={{marginTop:6}}>
            {specialsForToday.map((s, i) => {
              // Check if this is a known special that has a translation key
              const knownSpecials = ['PE', 'Art', 'Stream', 'STEM', 'AVID', 'Health', 'Music', 'Band', 'Orchestra', 'Chorus', 'Other']
              const isKnownSpecial = knownSpecials.includes(s)
              const translatedName = isKnownSpecial ? t(`specials.${s}`) : s
              const emoji = specialEmojiMap[s] || ''
              const displayText = emoji ? `${emoji} ${translatedName}` : translatedName
              
              return (
                <span key={i} style={{marginRight:12, display:'inline-block'}}>{displayText}</span>
              )
            })}
          </div>
        </div>
      )}

      {menusLoading && <div style={{marginTop:8}}>{t('child.loadingMenus')}</div>}

      {error && (
        <div style={{marginTop:8, color:'crimson'}}>{t('child.errorLoading')} {error}</div>
      )}

      {dayKey !== null && profile.meals.map(m => {
        // Generate fdmealplanner URL for this meal
        const mealCode = getAccountCode(profile.school, m as 'breakfast' | 'lunch')
        const fdmealplannerUrl = mealCode ? `https://www.fdmealplanner.com/#menu/mealPlanner/${mealCode}` : null
        
        return (
        <div key={m} style={{marginTop:12}}>
          <h3 style={{marginBottom:6}}>{t(`meals.${m}`)}</h3>
          {menus[m] && menus[m].length > 0 ? (
            // if items are objects with category/componentName, group by category
            (typeof menus[m][0] === 'object') ? (
              Object.entries(menus[m].reduce((acc:any, it:any)=>{
                const cat = it.category || it.Category || 'Other'
                acc[cat] = acc[cat] || []
                const name = it.componentName || it.ComponentEnglishName || it.englishAlternateName || it.name || ''
                if(name && (acc[cat].length === 0 || acc[cat][acc[cat].length-1] !== name)) acc[cat].push(name)
                return acc
              }, {})).map(([cat, list])=> (
                <div key={cat} style={{marginBottom:6}}>
                  <strong>{categoryEmojiMap[cat] ? `${categoryEmojiMap[cat]} ${t(CATEGORY_KEYS[cat] || `category.${cat.toLowerCase()}`) || cat}` : t(CATEGORY_KEYS[cat] || `category.${cat.toLowerCase()}`) || cat}</strong>
                  <ul>{(list as string[]).map((it:string, idx:number)=> <li key={idx}>{it}</li>)}</ul>
                </div>
              ))
            ) : (
              <ul>{menus[m].map((it: string, idx: number)=> <li key={idx}>{it}</li>)}</ul>
            )
          ) : (
            <div>{t('child.noMenuFor',{meal:m})} { !menusLoading && <button onClick={()=>load(profile)}>{t('buttons.retry') || 'Retry'}</button> }</div>
          )}
        </div>
        )
      })}
    </div>
  )
}
