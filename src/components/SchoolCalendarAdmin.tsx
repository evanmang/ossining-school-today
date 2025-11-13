import React, { useState } from 'react'
import { SCHOOL_DAY_OFFSETS, SCHOOL_DATE_OVERRIDES, SchoolCode } from '../data/school-calendar'

/**
 * Admin interface for managing school day offsets and calendar overrides
 * This component would typically be behind authentication in a production app
 */
export default function SchoolCalendarAdmin() {
  const [offsets, setOffsets] = useState(SCHOOL_DAY_OFFSETS)
  const [newOverride, setNewOverride] = useState({ school: 'Park' as SchoolCode, date: '', value: 'closed' })

  const schools: SchoolCode[] = ['Park', 'Brookside', 'Claremont', 'Roosevelt', 'AMD', 'OHS']

  const updateOffset = (school: SchoolCode, offset: number) => {
    setOffsets(prev => ({ ...prev, [school]: offset }))
  }

  const generateConfigCode = () => {
    const offsetsCode = Object.entries(offsets)
      .map(([school, offset]) => `  '${school}': ${offset}`)
      .join(',\n')

    return `// Copy this to school-calendar.ts
export const SCHOOL_DAY_OFFSETS: Record<SchoolCode, number> = {
${offsetsCode}
}`
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🏫 School Calendar Administration</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <h3>📊 Day Offsets</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
          Adjust when a school's day count is out of sync due to individual closures.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {schools.map(school => (
            <div key={school} style={{ 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              backgroundColor: offsets[school] !== 0 ? '#fff3cd' : '#f8f9fa'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                {school}
                {offsets[school] !== 0 && <span style={{ color: '#856404' }}> ({offsets[school] > 0 ? '+' : ''}{offsets[school]})</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={() => updateOffset(school, offsets[school] - 1)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                  disabled={offsets[school] <= -10}
                >
                  -1
                </button>
                <span style={{ minWidth: '30px', textAlign: 'center', fontFamily: 'monospace' }}>
                  {offsets[school]}
                </span>
                <button 
                  onClick={() => updateOffset(school, offsets[school] + 1)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                  disabled={offsets[school] >= 10}
                >
                  +1
                </button>
                <button 
                  onClick={() => updateOffset(school, 0)}
                  style={{ padding: '4px 8px', fontSize: '12px', marginLeft: '8px' }}
                  disabled={offsets[school] === 0}
                >
                  Reset
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3>📅 Date-Specific Overrides</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
          Set specific dates for individual school closures or schedule overrides.
        </p>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <select 
            value={newOverride.school} 
            onChange={e => setNewOverride(prev => ({ ...prev, school: e.target.value as SchoolCode }))}
            style={{ padding: '8px' }}
          >
            {schools.map(school => <option key={school} value={school}>{school}</option>)}
          </select>
          <input 
            type="date" 
            value={newOverride.date}
            onChange={e => setNewOverride(prev => ({ ...prev, date: e.target.value }))}
            style={{ padding: '8px' }}
          />
          <select 
            value={newOverride.value}
            onChange={e => setNewOverride(prev => ({ ...prev, value: e.target.value }))}
            style={{ padding: '8px' }}
          >
            <option value="closed">Closed</option>
            <option value="day-1">Force Day 1</option>
            <option value="day-2">Force Day 2</option>
            <option value="day-3">Force Day 3</option>
            <option value="day-4">Force Day 4</option>
            <option value="day-5">Force Day 5</option>
            <option value="day-6">Force Day 6</option>
          </select>
          <button 
            onClick={() => {
              // This would typically update the backend
              console.log('Add override:', newOverride)
            }}
            style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            disabled={!newOverride.date}
          >
            Add Override
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3>⚙️ Generated Configuration</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          Copy this code to update <code>src/data/school-calendar.ts</code>:
        </p>
        <pre style={{ 
          background: '#f8f9fa', 
          padding: '16px', 
          borderRadius: '8px', 
          fontSize: '12px',
          overflow: 'auto',
          border: '1px solid #ddd'
        }}>
          {generateConfigCode()}
        </pre>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3>📋 Common Scenarios</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>Snow Day Example:</strong><br />
            Park Elementary has a snow day on Day 15, but other schools stay open.
            → Set Park offset to <code>-1</code> until the district realigns
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Emergency Closure:</strong><br />
            AMD has a pipe burst and closes for 2 days.
            → Set AMD offset to <code>-2</code> or use date overrides
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Testing:</strong><br />
            Want to test how widgets look on Day 3?
            → Add date override: Today = <code>day-3</code>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Usage Instructions:
 * 
 * 1. When a school closure happens:
 *    - Open this admin page
 *    - Adjust the affected school's offset
 *    - Copy the generated config
 *    - Update school-calendar.ts
 *    - Commit and deploy
 * 
 * 2. For planned individual closures:
 *    - Use date-specific overrides
 *    - Set the date and "closed" status
 * 
 * 3. For testing:
 *    - Use date overrides to force specific days
 *    - Reset when testing is complete
 */