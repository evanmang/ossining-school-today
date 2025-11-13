/**
 * School-specific day adjustments and calendar overrides
 * 
 * When a school has an individual closure (snow day, emergency, etc.),
 * their day count gets out of sync. This file helps manage those adjustments.
 */

export type SchoolCode = 'Park' | 'Brookside' | 'Claremont' | 'Roosevelt' | 'AMD' | 'OHS'

/**
 * Day offsets for each school relative to the district-wide day count
 * 
 * Example scenarios:
 * - Park has a snow day on day 15, but others don't: Park offset = -1
 * - AMD has an emergency closure on day 20: AMD offset = -1
 * - Roosevelt loses internet for 2 days: Roosevelt offset = -2
 * 
 * Update these values when individual school closures occur.
 */
export const SCHOOL_DAY_OFFSETS: Record<SchoolCode, number> = {
  'Park': 0,
  'Brookside': 0,
  'Claremont': 0,
  'Roosevelt': 0,
  'AMD': 0,
  'OHS': 0
}

/**
 * Date-specific overrides for schools
 * Format: 'YYYY-MM-DD'
 * 
 * Use this for:
 * - Planned individual school closures
 * - One-off schedule adjustments
 * - Testing specific scenarios
 */
export const SCHOOL_DATE_OVERRIDES: Record<SchoolCode, Record<string, 'closed' | string>> = {
  'Park': {
    // '2024-11-15': 'closed',  // Example: Snow day
    // '2024-11-18': 'day-3',   // Example: Manual override to day 3
  },
  'Brookside': {},
  'Claremont': {},
  'Roosevelt': {},
  'AMD': {},
  'OHS': {}
}

/**
 * Calculate the adjusted day number for a specific school
 */
export function getSchoolDay(baseDayNumber: number | string, school: SchoolCode, date?: Date): {
  dayNumber: number | 'closed'
  source: 'offset' | 'override' | 'base'
} {
  // Check for date-specific override first
  if (date) {
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
    const override = SCHOOL_DATE_OVERRIDES[school][dateStr]
    if (override) {
      if (override === 'closed') {
        return { dayNumber: 'closed', source: 'override' }
      }
      // Extract number from "day-X" format
      const dayMatch = override.match(/day-(\d+)/)
      if (dayMatch) {
        return { dayNumber: parseInt(dayMatch[1]), source: 'override' }
      }
    }
  }
  
  // Apply school-specific offset
  const baseNumber = typeof baseDayNumber === 'string' ? parseInt(baseDayNumber) : baseDayNumber
  if (isNaN(baseNumber)) {
    return { dayNumber: 'closed', source: 'base' }
  }
  
  const offset = SCHOOL_DAY_OFFSETS[school]
  if (offset === 0) {
    return { dayNumber: baseNumber, source: 'base' }
  }
  
  return { dayNumber: baseNumber + offset, source: 'offset' }
}

/**
 * Convert day number to cycle day key (A/B for high schools, 1-6 for elementary)
 */
export function getDayKey(dayNumber: number, school: SchoolCode): string {
  if (school === 'AMD' || school === 'OHS') {
    // High schools: A/B cycle
    return (dayNumber % 2 === 1) ? 'A' : 'B'
  } else {
    // Elementary: 1-6 cycle
    return String(((dayNumber - 1) % 6) + 1)
  }
}