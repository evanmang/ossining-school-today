export const SCHOOL_MEAL_CODES: Record<string, { breakfast: string; lunch: string }> = {
  Park: { breakfast: '152/833/1', lunch: '152/833/2' },
  Brookside: { breakfast: '152/832/1', lunch: '152/832/2' },
  Claremont: { breakfast: '152/831/1', lunch: '152/831/2' },
  Roosevelt: { breakfast: '152/834/1', lunch: '152/834/2' },
  AMD: { breakfast: '152/830/1', lunch: '152/830/2' },
  OHS: { breakfast: '152/829/1', lunch: '152/829/2' }
}

export function getAccountCode(school: string, meal: 'breakfast' | 'lunch'){
  const rec = (SCHOOL_MEAL_CODES as any)[school]
  return rec ? rec[meal] : undefined
}
