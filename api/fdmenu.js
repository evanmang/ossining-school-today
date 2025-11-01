const fetch = global.fetch || require('node-fetch')
const { parseEntry } = require('../server/fdparser')

// Minimal serverless handler compatible with Vercel/Netlify functions
module.exports = async function handler(req, res){
  const account = req.query?.account || req.body?.account
  const dateStr = req.query?.date || req.body?.date || new Date().toISOString()
  const locale = req.query?.locale || req.body?.locale || 'en'
  if(!account) return res.status(400).json({ error: 'missing account parameter' })
  const parts = account.split('/')
  if(parts.length !== 3) return res.status(400).json({ error: 'account must be account/location/meal' })
  const [accountId, locationId, mealPeriodId] = parts
  const date = new Date(dateStr)
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
