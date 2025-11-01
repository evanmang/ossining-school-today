const fetch = global.fetch || require('node-fetch')
const { XMLParser } = require('fast-xml-parser')

// Parser functions inlined for serverless compatibility
function normalizeName(raw){
  if(!raw) return ''
  let s = String(raw)
  s = s.replace(/\s+/g,' ').trim()
  s = s.replace(/\bPre-?Made\b.*$/i, '')
  s = s.replace(/\b\d+\s*(Slices|Slice|ct)\b$/i, '')
  s = s.replace(/\s*,\s*$/,'')
  s = s.replace(/\s+-\s*$/, '')
  s = s.replace(/\s+\(.+\)$/, '')
  s = s.replace(/\s+\/+\s+/, ' / ')
  s = s.replace(/\s+/g,' ').trim()
  s = s.replace(/^(classic|traditional|fresh|hot|warm)\s+/i, '')
  s = s.replace(/^pizza\s+(.*)/i, '$1 Pizza')
  s = s.replace(/^(.*)\s+pizza$/i, (_, a) => `${a} Pizza`)
  s = s.split(' ').map(w=> w.length>0 ? (w[0].toUpperCase()+w.slice(1).toLowerCase()) : w).join(' ')
  return s
}

function parseFromXml(xml, locale){
  try{
    const parser = new XMLParser({ignoreAttributes:false})
    const parsed = parser.parse(xml)
    const rootKey = Object.keys(parsed)[0]
    const children = parsed[rootKey]
    const items = []
    const seen = new Set()
    if(Array.isArray(children)){
      for(const node of children){
        const isShow = node['@_IsShowOnMenu']
        let rawName = ''
        if(locale === 'es'){
          rawName = node['@_ComponentSpanishName'] || node['ComponentSpanishName'] || node['@_ComponentEnglishName'] || node['ComponentEnglishName'] || node['ComponentName'] || ''
        } else {
          rawName = node['@_ComponentEnglishName'] || node['ComponentEnglishName'] || node['ComponentName'] || ''
        }
        if(String(isShow) !== '1') continue
        const name = normalizeName(rawName)
        if(!name) continue
        const key = name.toLowerCase()
        if(seen.has(key)) continue
        seen.add(key)
        items.push(name)
      }
    } else if(typeof children === 'object'){
      const node = children
      const isShow = node['@_IsShowOnMenu'] || node['IsShowOnMenu']
      let rawName = ''
      if(locale === 'es'){
        rawName = node['@_ComponentSpanishName'] || node['ComponentSpanishName'] || node['@_ComponentEnglishName'] || node['ComponentEnglishName'] || node['ComponentName'] || ''
      } else {
        rawName = node['@_ComponentEnglishName'] || node['ComponentEnglishName'] || node['ComponentName'] || ''
      }
      if(String(isShow) === '1'){
        const name = normalizeName(rawName)
        if(name) items.push(name)
      }
    }
    return items
  }catch(e){
    return []
  }
}

function parseEntry(entry, locale){
  if(!entry) return []
  let items = []
  if(entry.xmlMenuRecipes){
    items = parseFromXml(entry.xmlMenuRecipes, locale)
  }
  if(items.length === 0 && Array.isArray(entry.allMenuRecipes)){
    const seen = new Set()
    for(const c of entry.allMenuRecipes){
      const isShow = c?.isShowOnMenu ?? c?.IsShowOnMenu ?? c?.isShowOnMenu
      if(String(isShow) !== '1') continue
      let rawName = ''
      if(locale === 'es'){
        rawName = c?.spanishAlternateName || c?.englishAlternateName || c?.componentName || c?.ComponentEnglishName || ''
      } else {
        rawName = c?.englishAlternateName || c?.componentName || c?.ComponentEnglishName || ''
      }
      const name = normalizeName(rawName)
      if(!name) continue
      const key = name.toLowerCase()
      if(seen.has(key)) continue
      seen.add(key)
      items.push(name)
    }
  }
  if(items.length === 0 && typeof entry.menuRecipes === 'string' && entry.menuRecipes.trim()){
    const rawItems = entry.menuRecipes.split(',').map(s=>normalizeName(s)).filter(Boolean)
    const seen = new Set()
    for(const it of rawItems){
      const key = it.toLowerCase()
      if(seen.has(key)) continue
      seen.add(key)
      items.push(it)
    }
  }
  return items
}

// Minimal serverless handler compatible with Vercel/Netlify functions
module.exports = async function handler(req, res){
  const account = req.query?.account || req.body?.account
  const dateStr = req.query?.date || req.body?.date
  const locale = req.query?.locale || req.query?.lang || req.body?.locale || 'en'
  if(!account) return res.status(400).json({ error: 'missing account parameter' })
  const parts = account.split('/')
  if(parts.length !== 3) return res.status(400).json({ error: 'account must be account/location/meal' })
  const [accountId, locationId, mealPeriodId] = parts
  
  // Use Eastern Time (UTC-5) for default date if none provided
  let date
  if(dateStr){
    date = new Date(dateStr)
  } else {
    // Get current time in Eastern Time (UTC-5, or UTC-4 during DST)
    const now = new Date()
    const utcOffset = now.getTimezoneOffset() * 60000
    const easternOffset = -5 * 3600000 // EST is UTC-5
    date = new Date(now.getTime() + utcOffset + easternOffset)
  }
  const formattedDate = `${date.getMonth()+1}%20${date.getDate()}%20${date.getFullYear()}`
  const month = date.getMonth()+1
  const url = `https://apiservicelocators.fdmealplanner.com/api/v1/data-locator-webapi/3/meals?accountId=${accountId}&endDate=${formattedDate}&isActive=true&isStandalone&locationId=${locationId}&mealPeriodId=${mealPeriodId}&menuId=0&monthId=${month}&selectedDate=${formattedDate}&startDate=${formattedDate}&tenantId=3&timeOffset=300&year=${date.getFullYear()}`
  try{
    const resp = await fetch(url, { headers: { accept: 'application/json', 'x-requested-with':'XMLHttpRequest' } })
    if(!resp.ok) return res.status(502).json({ error: 'upstream', status: resp.status })
    const json = await resp.json()
    const entry = json?.result?.[0] || {}
    const items = parseEntry(entry, locale)
    res.setHeader('Access-Control-Allow-Origin','*')
    return res.json({ items })
  }catch(err){
    return res.status(500).json({ error: String(err) })
  }
}
