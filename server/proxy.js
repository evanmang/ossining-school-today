#!/usr/bin/env node
const express = require('express')
let fetchImpl
try{
  fetchImpl = global.fetch || require('node-fetch')
}catch(e){
  fetchImpl = require('node-fetch')
}
const { parseEntry } = require('./fdparser')
const path = require('path')
const fs = require('fs')
// Load manual menu fallback JSON
let MANUAL_MENU = {}
try {
  const manualPath = path.join(__dirname, 'manual-menu.json')
  MANUAL_MENU = JSON.parse(fs.readFileSync(manualPath, 'utf8'))
  console.log('[proxy] Loaded manual menu fallback data')
} catch (e) {
  console.warn('[proxy] Could not load manual menu fallback:', e)
}
const app = express()
const PORT = process.env.PORT || 4000

console.log(`Starting local fdmealplanner proxy on port ${PORT}...`)

// simple in-memory cache: { key: { ts: number, items: [...] } }
const CACHE = {}
const CACHE_TTL = 1000 * 60 * 2 // 2 minutes

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

function buildFdUrl(accountId, locationId, mealPeriodId, date){
  const formattedDate = `${date.getMonth()+1}%20${date.getDate()}%20${date.getFullYear()}`
  const year = date.getFullYear()
  const month = date.getMonth()+1
  return `https://apiservicelocators.fdmealplanner.com/api/v1/data-locator-webapi/3/meals?accountId=${accountId}&endDate=${formattedDate}&isActive=true&isStandalone&locationId=${locationId}&mealPeriodId=${mealPeriodId}&menuId=0&monthId=${month}&selectedDate=${formattedDate}&startDate=${formattedDate}&tenantId=3&timeOffset=300&year=${year}`
}

app.get('/fdmenu', async (req, res) => {
  const account = req.query.account
  const lang = req.query.lang || req.query.locale
  const dateStr = req.query.date || new Date().toISOString()
  console.log(`[proxy] /fdmenu called with account=${account} date=${dateStr} lang=${lang || 'unset'}`)
  if(!account) return res.status(400).json({error:'missing account parameter'})
  const parts = account.split('/')
  if(parts.length !== 3) return res.status(400).json({error:'account must be in format account/location/meal'})

  const [accountId, locationId, mealPeriodId] = parts
  const date = new Date(dateStr)
  // include an optional language hint as a query param (some upstreams honor this) - harmless if ignored
  const url = buildFdUrl(accountId, locationId, mealPeriodId, date) + (lang ? `&language=${encodeURIComponent(lang)}` : '')
  console.log(`[proxy] Built fdmealplanner URL: ${url}`)

  try{
    const cacheKey = `${account}/${date.toISOString().slice(0,10)}/${lang || 'en'}`
    const now = Date.now()
    if(CACHE[cacheKey] && (now - CACHE[cacheKey].ts) < CACHE_TTL){
      console.log('[proxy] Returning cached result')
      return res.json({ items: CACHE[cacheKey].items })
    }

    console.log('[proxy] Fetching fdmealplanner...')
    // retry/backoff
    let attempt = 0
    let json = null
    let resp = null
    const maxAttempts = 3
    let upstreamOk = false
    while(attempt < maxAttempts){
      attempt++
      try{
        // add a timeout to avoid hanging on slow upstream
        const controller = new AbortController()
        const timeout = setTimeout(()=> controller.abort(), 8000)
        const headers = { accept: 'application/json', 'x-requested-with':'XMLHttpRequest' }
        if(lang) headers['Accept-Language'] = String(lang)
        console.log('[proxy] Forwarding headers to upstream:', headers)
        resp = await fetchImpl(url, { headers, signal: controller.signal })
        clearTimeout(timeout)
        console.log(`[proxy] upstream responded: ${resp.status} ${resp.statusText} (attempt ${attempt})`)
        if(resp.ok) {
          json = await resp.json()
          upstreamOk = true
          break
        } else {
          if(attempt >= maxAttempts) break
          await new Promise(r=>setTimeout(r, 250 * attempt))
        }
      }catch(fetchErr){
        console.warn(`[proxy] fetch attempt ${attempt} failed:`, String(fetchErr))
        if(attempt >= maxAttempts) break
        await new Promise(r=>setTimeout(r, 300 * attempt))
      }
    }

    let items = []
    if(upstreamOk && json){
      const entry = json?.result?.[0] || {}
      items = parseEntry(entry, lang || 'en')
      if(items.length > 0){
        console.log(`[proxy] Returning ${items.length} items from upstream`)
        try{ CACHE[cacheKey] = { ts: Date.now(), items } }catch(_){ }
        return res.json({ items })
      }
      console.log('[proxy] No menu items found from upstream, will try manual fallback')
    } else {
      console.log('[proxy] Upstream not OK, will try manual fallback')
    }

    // Manual fallback
    const dateKey = date.toISOString().slice(0,10)
    // Infer school and meal from account code if not provided
    let school = req.query.school || ''
    let meal = req.query.meal || ''
    if ((!school || !meal) && parts.length === 3) {
      const SCHOOL_MEAL_CODES = {
        '152/833/1': { school: 'Park', meal: 'breakfast' },
        '152/833/2': { school: 'Park', meal: 'lunch' },
        '152/832/1': { school: 'Brookside', meal: 'breakfast' },
        '152/832/2': { school: 'Brookside', meal: 'lunch' },
        '152/831/1': { school: 'Claremont', meal: 'breakfast' },
        '152/831/2': { school: 'Claremont', meal: 'lunch' },
        '152/834/1': { school: 'Roosevelt', meal: 'breakfast' },
        '152/834/2': { school: 'Roosevelt', meal: 'lunch' },
        '152/830/1': { school: 'AMD', meal: 'breakfast' },
        '152/830/2': { school: 'AMD', meal: 'lunch' },
        '152/829/1': { school: 'OHS', meal: 'breakfast' },
        '152/829/2': { school: 'OHS', meal: 'lunch' }
      }
      const code = `${parts[0]}/${parts[1]}/${parts[2]}`
      if (SCHOOL_MEAL_CODES[code]) {
        school = SCHOOL_MEAL_CODES[code].school
        meal = SCHOOL_MEAL_CODES[code].meal
      }
    }
    // Try to match by date, school, meal, lang
    let fallbackItems = []
    if(MANUAL_MENU[dateKey] && MANUAL_MENU[dateKey][school] && MANUAL_MENU[dateKey][school][meal] && MANUAL_MENU[dateKey][school][meal][lang]){
      fallbackItems = MANUAL_MENU[dateKey][school][meal][lang]
    } else if(MANUAL_MENU[dateKey] && MANUAL_MENU[dateKey][school] && MANUAL_MENU[dateKey][school][meal] && MANUAL_MENU[dateKey][school][meal]['en']){
      fallbackItems = MANUAL_MENU[dateKey][school][meal]['en']
    }
    if(fallbackItems.length > 0){
      console.log(`[proxy] Returning ${fallbackItems.length} items from manual fallback for ${school} ${meal} ${dateKey}`)
      return res.json({ items: fallbackItems })
    }
    // If no fallback, return empty
    console.log('[proxy] No menu items found in manual fallback either')
    return res.json({ items: [] })
  }catch(err){
    console.error('[proxy] fetch error', err)
    res.status(500).json({error:'internal', detail: String(err)})
  }
})

app.listen(PORT, ()=> console.log(`Local fdmealplanner proxy listening on ${PORT}`))
