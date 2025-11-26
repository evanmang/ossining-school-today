/**
 * School Day Number Proxy API
 * 
 * This endpoint provides the current day number for each school,
 * taking into account individual school closures and offsets.
 * 
 * Widgets can call this endpoint instead of calculating locally,
 * which allows manual overrides without requiring widget updates.
 */

const fetch = global.fetch || require('node-fetch')

// School-specific day adjustments
const SCHOOL_DAY_OFFSETS = {
  'Park': 0,
  'Brookside': 0,
  'Claremont': 0,
  'Roosevelt': 0,
  'AMD': 0,
  'OHS': 0
}

// Date-specific overrides for schools
// Format: 'YYYY-MM-DD'
const SCHOOL_DATE_OVERRIDES = {
  'Park': {},
  'Brookside': {},
  'Claremont': {},
  'Roosevelt': {},
  'AMD': {},
  'OHS': {}
}

// Google Apps Script API for base day number
const DAY_API = 'https://script.google.com/macros/s/AKfycbyAHJSmnXM_-bPSuBJmS2xHSbsFN5lOZoZTECd0MHQmGUWDJsx90bKzoN0mF0f0cM7t/exec'

/**
 * Calculate adjusted day number for a specific school
 */
function getSchoolDay(baseDayNumber, school, dateStr) {
  // Check for date-specific override first
  if (dateStr && SCHOOL_DATE_OVERRIDES[school][dateStr]) {
    const override = SCHOOL_DATE_OVERRIDES[school][dateStr]
    if (override === 'closed') {
      return { dayNumber: 'closed', dayKey: null, source: 'override' }
    }
    // Extract number from "day-X" format
    const dayMatch = override.match(/day-(\d+)/)
    if (dayMatch) {
      const dayNum = parseInt(dayMatch[1])
      return { 
        dayNumber: dayNum, 
        dayKey: getDayKey(dayNum, school),
        source: 'override' 
      }
    }
  }
  
  // Apply school-specific offset
  const baseNumber = typeof baseDayNumber === 'string' ? parseInt(baseDayNumber) : baseDayNumber
  if (isNaN(baseNumber)) {
    return { dayNumber: 'closed', dayKey: null, source: 'base' }
  }
  
  const offset = SCHOOL_DAY_OFFSETS[school]
  const adjustedDay = baseNumber + offset
  
  return { 
    dayNumber: adjustedDay, 
    dayKey: getDayKey(adjustedDay, school),
    source: offset === 0 ? 'base' : 'offset' 
  }
}

/**
 * Convert day number to cycle day key
 */
function getDayKey(dayNumber, school) {
  if (school === 'AMD' || school === 'OHS') {
    // High schools: A/B cycle
    return (dayNumber % 2 === 1) ? 'A' : 'B'
  } else {
    // Elementary: 1-6 cycle
    return String(((dayNumber - 1) % 6) + 1)
  }
}

/**
 * Main handler
 */
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Fetch base day number from Google Apps Script
    const response = await fetch(DAY_API)
    const data = await response.json()
    
    const baseDayNumber = data.dayNumber
    const dateStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    // Special case: No school today
    if (baseDayNumber === "No School Today") {
      return res.status(200).json({
        status: 'success',
        date: dateStr,
        baseDay: baseDayNumber,
        schools: {
          'Park': { dayNumber: 'closed', dayKey: null, source: 'base' },
          'Brookside': { dayNumber: 'closed', dayKey: null, source: 'base' },
          'Claremont': { dayNumber: 'closed', dayKey: null, source: 'base' },
          'Roosevelt': { dayNumber: 'closed', dayKey: null, source: 'base' },
          'AMD': { dayNumber: 'closed', dayKey: null, source: 'base' },
          'OHS': { dayNumber: 'closed', dayKey: null, source: 'base' }
        }
      })
    }
    
    // Calculate day for each school
    const schools = {}
    for (const school of ['Park', 'Brookside', 'Claremont', 'Roosevelt', 'AMD', 'OHS']) {
      schools[school] = getSchoolDay(baseDayNumber, school, dateStr)
    }
    
    return res.status(200).json({
      status: 'success',
      date: dateStr,
      baseDay: parseInt(baseDayNumber),
      schools
    })
    
  } catch (error) {
    console.error('Error fetching school day:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch school day information',
      error: error.message
    })
  }
}
