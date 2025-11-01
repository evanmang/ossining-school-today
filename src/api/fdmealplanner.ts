export type MealItem = { name: string }

function buildFdUrl(accountId: string, locationId: string, mealPeriodId: string, date: Date): string {
  const formattedDate = `${(date.getMonth() + 1)}%20${date.getDate()}%20${date.getFullYear()}`
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return `https://apiservicelocators.fdmealplanner.com/api/v1/data-locator-webapi/3/meals?accountId=${accountId}&endDate=${formattedDate}&isActive=true&isStandalone&locationId=${locationId}&mealPeriodId=${mealPeriodId}&menuId=0&monthId=${month}&selectedDate=${formattedDate}&startDate=${formattedDate}&tenantId=3&timeOffset=300&year=${year}`
}

export async function fetchMenu(accountCode: string, date: Date): Promise<MealItem[]> {
  // accountCode format: "152/830/2"
  const [accountId, locationId, mealPeriodId] = accountCode.split('/')
  const url = buildFdUrl(accountId, locationId, mealPeriodId, date)

  // Note: fdmealplanner likely doesn't allow CORS. In that case you'll need to call a serverless proxy.
  const resp = await fetch(url, { headers: { 'accept': 'application/json', 'x-requested-with': 'XMLHttpRequest' } })
  const json = await resp.json()
  const xml = json?.result?.[0]?.xmlMenuRecipes
  if (!xml) return []
  // Parse XML string to extract ComponentEnglishName attributes
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')
  const items: MealItem[] = []
  const children = doc.children[0]?.children || []
  for (let i = 0; i < children.length && items.length < 7; i++) {
    const c = children[i]
    const isShow = c.getAttribute('IsShowOnMenu')
    if (isShow !== '1') continue
    const entree = c.getAttribute('ComponentEnglishName') || ''
    if (!entree) continue
    if (items.length === 0 || items[items.length - 1].name !== entree) {
      items.push({ name: entree.trim() })
    }
  }

  return items
}
