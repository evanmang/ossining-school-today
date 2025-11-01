import { VercelRequest, VercelResponse } from https://apiservicelocators.fdmealplanner.com/api/v1/data-locator-webapi/3/meals?accountId=152&locationId=830&mealPeriodId=2&menuId=0&monthId=10&selectedDate=10%2031%202025&startDate=10%2031%202025&endDate=10%2031%202025&tenantId=3&timeOffset=300&year=2025&isActive=true&isStandalone

function buildFdUrl(accountId: string, locationId: string, mealPeriodId: string, date: Date): string {
  const formattedDate = `${(date.getMonth() + 1)}%20${date.getDate()}%20${date.getFullYear()}`
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return `https://apiservicelocators.fdmealplanner.com/api/v1/data-locator-webapi/3/meals?accountId=${accountId}&endDate=${formattedDate}&isActive=true&isStandalone&locationId=${locationId}&mealPeriodId=${mealPeriodId}&menuId=0&monthId=${month}&selectedDate=${formattedDate}&startDate=${formattedDate}&tenantId=3&timeOffset=300&year=${year}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for browser clients
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const account = (req.query.account as string) || '' // expected format: 152/830/2
  const dateStr = (req.query.date as string) || new Date().toISOString()
  if (!account) {
    res.status(400).json({ error: 'missing account query param' })
    return
  }

  const parts = account.split('/')
  if (parts.length !== 3) {
    res.status(400).json({ error: 'account must be in form accountId/locationId/mealPeriodId' })
    return
  }

  try {
    const [accountId, locationId, mealPeriodId] = parts
    const date = new Date(dateStr)
    const url = buildFdUrl(accountId, locationId, mealPeriodId, date)

    const locale = (req.query.locale as string) || (req.query.lang as string) || 'en'
    const headers: Record<string,string> = {
      accept: 'application/json',
      pragma: 'no-cache',
      'x-jsonresponsecase': 'camel',
      'x-requested-with': 'XMLHttpRequest',
      'user-agent': 'ossining-school-site/1.0'
    }
    if(locale) headers['Accept-Language'] = locale

    const resp = await fetch(url, { headers })
    if (!resp.ok) {
      res.status(502).json({ error: 'upstream error', status: resp.status })
      return
    }

    const data = await resp.json();
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json({ raw: data });
  } catch (err: any) {
    console.error('proxy error', err)
    res.status(500).json({ error: 'internal', detail: err?.message })
  }
}
