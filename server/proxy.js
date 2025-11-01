#!/usr/bin/env node
const express = require('express')
let fetchImpl
try{
  fetchImpl = global.fetch || require('node-fetch')
}catch(e){
  fetchImpl = require('node-fetch')
}
const { parseEntry } = require('./fdparser')
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
    const maxAttempts = 3
    while(attempt < maxAttempts){
      attempt++
      try{
        // add a timeout to avoid hanging on slow upstream
        const controller = new AbortController()
        const timeout = setTimeout(()=> controller.abort(), 8000)
  // forward Accept-Language if provided by client; fallback to generic Accept header
  const headers = { accept: 'application/json', 'x-requested-with':'XMLHttpRequest' }
  if(lang) headers['Accept-Language'] = String(lang)
    console.log('[proxy] Forwarding headers to upstream:', headers)
  const resp = await fetchImpl(url, { headers, signal: controller.signal })
        clearTimeout(timeout)
        console.log(`[proxy] upstream responded: ${resp.status} ${resp.statusText} (attempt ${attempt})`)
        if(!resp.ok) {
          if(attempt >= maxAttempts) return res.status(502).json({error:'upstream', status: resp.status})
          // backoff before retrying
          await new Promise(r=>setTimeout(r, 250 * attempt))
          continue
        }
        json = await resp.json()
        console.log('[proxy] Received JSON from upstream')
        break
      }catch(fetchErr){
        console.warn(`[proxy] fetch attempt ${attempt} failed:`, String(fetchErr))
        if(attempt >= maxAttempts) throw fetchErr
        await new Promise(r=>setTimeout(r, 300 * attempt))
      }
    }

  const entry = json?.result?.[0] || {}
  const items = parseEntry(entry, lang || 'en')
    if(items.length === 0) console.log('[proxy] No menu items found; returning empty list')
    console.log(`[proxy] Returning ${items.length} items`)
    // cache result
    try{ CACHE[cacheKey] = { ts: Date.now(), items } }catch(_){ }
    res.json({ items })
  }catch(err){
    console.error('[proxy] fetch error', err)
    console.error(err)
    res.status(500).json({error:'internal', detail: String(err)})
  }
})

app.listen(PORT, ()=> console.log(`Local fdmealplanner proxy listening on ${PORT}`))
