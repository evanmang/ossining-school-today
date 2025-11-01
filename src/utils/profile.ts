import LZString from 'lz-string'

export type School = 'Park' | 'Brookside' | 'Claremont' | 'Roosevelt' | 'AMD' | 'OHS'
export type MealType = 'breakfast' | 'lunch'

export type Profile = {
  name: string
  school: School
  meals: MealType[]
  specials: Record<string, string[]> // map day key -> list of specials, day keys: '1'..'6' or 'A'/'B'
}

export function encodeProfile(profile: Profile): string {
  const json = JSON.stringify(profile)
  const compressed = LZString.compressToEncodedURIComponent(json)
  return compressed
}

export function decodeProfile(encoded: string): Profile | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    return JSON.parse(json) as Profile
  } catch (e) {
    return null
  }
}
