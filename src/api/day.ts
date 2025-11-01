export type DayResponse = { status: string; dayNumber?: string }

const DAY_API = 'https://script.google.com/macros/s/AKfycbyAHJSmnXM_-bPSuBJmS2xHSbsFN5lOZoZTECd0MHQmGUWDJsx90bKzoN0mF0f0cM7t/exec'

export async function fetchSchoolDay(): Promise<DayResponse> {
  const resp = await fetch(DAY_API)
  const json = await resp.json()
  return json as DayResponse
}
