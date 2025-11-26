import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { encodeProfile, decodeProfile, Profile, School, MealType } from '../utils/profile'
import WidgetGenerator from './WidgetGenerator'
import AndroidWidgetGenerator from './AndroidWidgetGenerator'

const SCHOOLS: School[] = ['Park','Brookside','Claremont','Roosevelt','AMD','OHS']
  const MEALS: MealType[] = ['breakfast','lunch']
const DAYS = ['1','2','3','4','5','6']
const AB_DAYS = ['A','B']

export default function SetupForm(){
  const { t } = useTranslation()
  const [name,setName] = useState('')
  const [school,setSchool] = useState<School>('Park')
  const [meals,setMeals] = useState<MealType[]>(['lunch'])
  const [specials,setSpecials] = useState<Record<string,string[]>>(() => {
    const m: Record<string,string[]> = {}
    for(const d of DAYS) m[d] = []
    for(const d of AB_DAYS) m[d] = []
    return m
  })
  const [custom, setCustom] = useState<Record<string,string>>({})
  const [resultUrl, setResultUrl] = useState('')
  const [savedProfiles, setSavedProfiles] = useState<Profile[]>(() => {
    try {
      const raw = localStorage.getItem('oss_profiles')
      return raw ? JSON.parse(raw) as Profile[] : []
    } catch { return [] }
  })

  function toggleMeal(meal: MealType){
    setMeals((prev: MealType[]) => prev.includes(meal) ? prev.filter((m: MealType) => m !== meal) : [...prev, meal])
  }

  function toggleSpecial(day: string, label: string){
    setSpecials((prev: Record<string,string[]>) => {
      const copy = {...prev}
      const arr = new Set(copy[day] || [])
      if(arr.has(label)) arr.delete(label)
      else arr.add(label)
      copy[day] = [...arr]
      return copy
    })
  }

  function setCustomSpecial(day: string, text: string){
    setCustom((prev: Record<string,string>) => ({...prev, [day]: text}))
    setSpecials((prev: Record<string,string[]>) => ({...prev, [day]: text ? Array.from(new Set([...(prev[day]||[]), 'Other'])) : (prev[day]||[]).filter((x: string)=>x!=='Other')}))
  }

  function buildProfileAndUrl(){
    // Replace any 'Other' in specials with the custom text when available
    const finalSpecials: Record<string,string[]> = {}
    for(const key of Object.keys(specials)){
      const arr = specials[key] || []
      finalSpecials[key] = arr.map(s => s === 'Other' ? (custom[key] || 'Other') : s)
    }

    const profile: Profile = { name: name || 'child', school, meals, specials: finalSpecials }
    const encoded = encodeProfile(profile)
    const url = `${location.origin}/child/${encodeURIComponent(name || 'child')}?cfg=${encoded}`
    setResultUrl(url)
    // copy to clipboard
    try { navigator.clipboard?.writeText(url) } catch {}
  }

  function saveProfile(){
    const finalSpecials: Record<string,string[]> = {}
    for(const key of Object.keys(specials)){
      const arr = specials[key] || []
      finalSpecials[key] = arr.map(s => s === 'Other' ? (custom[key] || 'Other') : s)
    }
    const profile: Profile = { name: name || `child-${Date.now()}`, school, meals, specials: finalSpecials }
    const next = [profile, ...savedProfiles].slice(0, 20)
    setSavedProfiles(next)
    try { localStorage.setItem('oss_profiles', JSON.stringify(next)) } catch {}
  }

  function loadProfile(p: Profile){
    setName(p.name)
    setSchool(p.school)
    setMeals(p.meals)
    setSpecials(p.specials)
  }

  function deleteProfile(index: number){
    const arr = [...savedProfiles]
    arr.splice(index,1)
    setSavedProfiles(arr)
    try { localStorage.setItem('oss_profiles', JSON.stringify(arr)) } catch {}
  }

  const [copied, setCopied] = React.useState(false)

  // Clear URL when form data changes
  useEffect(() => {
    if (resultUrl) {
      setResultUrl('')
    }
  }, [name, school, meals, specials, custom])

  // Load profile from URL parameter if present
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const cfg = params.get('cfg')
    if (cfg) {
      try {
        const profile = decodeProfile(cfg)
        if (profile) {
          setName(profile.name)
          setSchool(profile.school)
          setMeals(profile.meals)
          
          // Extract custom specials and restore both specials and custom state
          const restoredSpecials: Record<string,string[]> = {}
          const restoredCustom: Record<string,string> = {}
          const knownSpecials = ['PE', 'Art', 'Stream', 'STEM', 'AVID', 'Health', 'Music', 'Band', 'Orchestra', 'Chorus']
          
          for (const [day, specialsList] of Object.entries(profile.specials)) {
            restoredSpecials[day] = []
            for (const special of specialsList) {
              if (knownSpecials.includes(special)) {
                restoredSpecials[day].push(special)
              } else {
                // This is a custom special
                restoredSpecials[day].push('Other')
                restoredCustom[day] = special
              }
            }
          }
          
          setSpecials(restoredSpecials)
          setCustom(restoredCustom)
        }
        
        // Clear the URL parameter to avoid re-triggering
        const newUrl = new URL(location.href)
        newUrl.searchParams.delete('cfg')
        history.replaceState({}, '', newUrl.pathname + newUrl.search)
      } catch (error) {
        console.error('Error decoding profile from URL:', error)
      }
    }
  }, [])

  function copyResult(){
    if(!resultUrl) return
    try{ navigator.clipboard?.writeText(resultUrl); setCopied(true); setTimeout(()=>setCopied(false),1600) }catch{}
  }

  return (
    <div className="child-page-card">
      <div className="setup">
        <div>
          <label>{t('setup.name')}</label>
          <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder={t('setup.namePlaceholder')} />
        </div>

        <div>
          <label>{t('setup.school')}</label>
          <select value={school} onChange={e=>setSchool(e.target.value as School)}>
            {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label>{t('setup.meals')}</label>
          <div>
            {MEALS.map(m=> (
              <label key={m}><input type="checkbox" checked={meals.includes(m)} onChange={()=>toggleMeal(m)} /> {t(`meals.${m}`)}</label>
            ))}
          </div>
        </div>

        <div className="setup-heading">
          <h4>{t('schedule.title')}</h4>
          {/* days will render below as full-width boxes */}
        </div>

        { (school === 'AMD' || school === 'OHS') ? (
          AB_DAYS.map(d => (
            <div key={d} className="day-box">
              <strong>{t('schedule.day',{n:d})}</strong>
              <div>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('PE')} onChange={()=>toggleSpecial(d,'PE')} /> {t('specials.PE')}</label>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('Art')} onChange={()=>toggleSpecial(d,'Art')} /> {t('specials.Art')}</label>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('STEM')} onChange={()=>toggleSpecial(d,'STEM')} /> {t('specials.STEM')}</label>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('AVID')} onChange={()=>toggleSpecial(d,'AVID')} /> {t('specials.AVID')}</label>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('Health')} onChange={()=>toggleSpecial(d,'Health')} /> {t('specials.Health')}</label>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('Music')} onChange={()=>toggleSpecial(d,'Music')} /> {t('specials.Music')}</label>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('Band')} onChange={()=>toggleSpecial(d,'Band')} /> {t('specials.Band')}</label>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('Orchestra')} onChange={()=>toggleSpecial(d,'Orchestra')} /> {t('specials.Orchestra')}</label>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('Chorus')} onChange={()=>toggleSpecial(d,'Chorus')} /> {t('specials.Chorus')}</label>
              </div>
              <div style={{marginTop:8}}>
                <label>{t('schedule.other')}: <input type="text" value={custom[d]||''} onChange={e=>setCustomSpecial(d,e.target.value)} placeholder={t('setup.placeholderCustom')} /></label>
              </div>
            </div>
          ))
        ) : (
          DAYS.map(d => (
            <div key={d} className="day-box">
            <strong>{t('schedule.day',{n:d})}</strong>
              <div>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('PE')} onChange={()=>toggleSpecial(d,'PE')} /> {t('specials.PE')}</label>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('Art')} onChange={()=>toggleSpecial(d,'Art')} /> {t('specials.Art')}</label>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('Stream')} onChange={()=>toggleSpecial(d,'Stream')} /> {t('specials.Stream')}</label>
                <label><input type="checkbox" checked={(specials[d]||[]).includes('Music')} onChange={()=>toggleSpecial(d,'Music')} /> {t('specials.Music')}</label>
              </div>
              <div style={{marginTop:8}}>
                <label>{t('schedule.other')}: <input type="text" value={custom[d]||''} onChange={e=>setCustomSpecial(d,e.target.value)} placeholder={t('setup.placeholderCustom')} /></label>
              </div>
            </div>
          ))
        )}

        <div style={{gridColumn:'1 / -1', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          <button onClick={buildProfileAndUrl}>{t('setup.create')}</button>
          {resultUrl && (
            <>
              <div className="share-box">
                <input readOnly value={resultUrl} />
                <button onClick={copyResult}>{copied ? t('buttons.copied') : t('buttons.copy')}</button>
                <button onClick={() => window.open(resultUrl, '_blank')}>Open URL</button>
              </div>
              <WidgetGenerator 
                profile={{
                  name: name || 'child',
                  school,
                  meals,
                  specials: (() => {
                    const finalSpecials: Record<string,string[]> = {}
                    for(const key of Object.keys(specials)){
                      const arr = specials[key] || []
                      finalSpecials[key] = arr.map(s => s === 'Other' ? (custom[key] || 'Other') : s)
                    }
                    return finalSpecials
                  })()
                }}
                encodedConfig={encodeProfile({
                  name: name || 'child',
                  school,
                  meals,
                  specials: (() => {
                    const finalSpecials: Record<string,string[]> = {}
                    for(const key of Object.keys(specials)){
                      const arr = specials[key] || []
                      finalSpecials[key] = arr.map(s => s === 'Other' ? (custom[key] || 'Other') : s)
                    }
                    return finalSpecials
                  })()
                })}
              />
              <AndroidWidgetGenerator 
                profile={{
                  name: name || 'child',
                  school,
                  meals,
                  specials: (() => {
                    const finalSpecials: Record<string,string[]> = {}
                    for(const key of Object.keys(specials)){
                      const arr = specials[key] || []
                      finalSpecials[key] = arr.map(s => s === 'Other' ? (custom[key] || 'Other') : s)
                    }
                    return finalSpecials
                  })()
                }}
                encodedConfig={encodeProfile({
                  name: name || 'child',
                  school,
                  meals,
                  specials: (() => {
                    const finalSpecials: Record<string,string[]> = {}
                    for(const key of Object.keys(specials)){
                      const arr = specials[key] || []
                      finalSpecials[key] = arr.map(s => s === 'Other' ? (custom[key] || 'Other') : s)
                    }
                    return finalSpecials
                  })()
                })}
              />
            </>
          )}
        </div>

        {savedProfiles.length > 0 && (
          <div className="saved-profiles" style={{gridColumn:'1 / -1'}}>
            <h4>{t('setup.savedProfiles')}</h4>
            <ul>
              {savedProfiles.map((p, idx) => (
                <li key={idx} style={{marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <strong>{p.name}</strong>
                      <div style={{fontSize:13,color:'#666'}}>{p.school} — {p.meals.join(', ')}</div>
                    </div>
                    <div>
                      <button onClick={()=>loadProfile(p)} style={{marginLeft:8}}>{t('buttons.load') || 'Load'}</button>
                      <button onClick={()=>deleteProfile(idx)} style={{marginLeft:8}}>{t('buttons.delete') || 'Delete'}</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
