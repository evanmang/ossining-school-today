/**
 * FoodDirector Menu Parser
 * 
 * Based on fdmealplanner by @jdeath: https://github.com/jdeath/fdmealplanner
 * Extended with Spanish menu support and serverless compatibility
 */

const { XMLParser } = require('fast-xml-parser')

function normalizeName(raw){
  if(!raw) return ''
  let s = String(raw)
  s = s.replace(/\s+/g,' ').trim()
  // remove vendor/size suffixes
  s = s.replace(/\bPre-?Made\b.*$/i, '')
  s = s.replace(/\b\d+\s*(Slices|Slice|ct)\b$/i, '')
  s = s.replace(/\s*,\s*$/,'')
  s = s.replace(/\s+-\s*$/, '')
  s = s.replace(/\s+\(.+\)$/, '')
  s = s.replace(/\s+\/+\s+/, ' / ')
  s = s.replace(/\s+/g,' ').trim()

  // strip leading adjectives that aren't useful
  s = s.replace(/^(classic|traditional|fresh|hot|warm)\s+/i, '')

  // normalize pizza phrasing: "Pizza Cheese" -> "Cheese Pizza"
  s = s.replace(/^pizza\s+(.*)/i, '$1 Pizza')
  s = s.replace(/^(.*)\s+pizza$/i, (_, a) => `${a} Pizza`)

  // Title case small words for nicer display
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
        // prefer localized component name when available
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
  // entry is expected to be result[0] from upstream JSON
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
      // prefer localized alternate name when available
      let rawName = ''
      if(locale === 'es'){
        rawName = c?.spanishAlternateName || c?.spanishAlternateName || c?.englishAlternateName || c?.componentName || c?.ComponentEnglishName || ''
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

module.exports = { normalizeName, parseEntry }
