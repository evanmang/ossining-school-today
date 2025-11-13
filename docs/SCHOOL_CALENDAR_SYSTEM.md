# School Calendar Management System

## Overview

This system handles situations where individual schools have different day counts due to closures, emergencies, or schedule adjustments.

## Problem Solved

**Scenario**: The district is on Day 15, but Park Elementary had a snow day on Day 8, so they're actually on Day 14. Their widgets and child pages would show the wrong specials schedule.

**Solution**: School-specific day offsets and calendar overrides.

## How It Works

### 1. **Day Offsets** (`SCHOOL_DAY_OFFSETS`)
Simple numeric adjustments applied to the district-wide day count:

```typescript
export const SCHOOL_DAY_OFFSETS: Record<SchoolCode, number> = {
  'Park': -1,        // One day behind due to snow day
  'Brookside': 0,    // In sync with district
  'Claremont': 0,    // In sync with district  
  'Roosevelt': 0,    // In sync with district
  'AMD': -2,         // Two days behind due to emergency closure
  'OHS': 0           // In sync with district
}
```

### 2. **Date Overrides** (`SCHOOL_DATE_OVERRIDES`)
Specific date-based rules for individual schools:

```typescript
export const SCHOOL_DATE_OVERRIDES: Record<SchoolCode, Record<string, 'closed' | string>> = {
  'Park': {
    '2024-11-15': 'closed',    // Snow day
    '2024-11-18': 'day-3',     // Force to Day 3 for testing
  },
  'AMD': {
    '2024-11-20': 'closed',    // Emergency building closure
  },
  // ... other schools
}
```

## Implementation Flow

1. **API Call**: Get district-wide day number from Google Apps Script
2. **Check Overrides**: Look for date-specific override for this school today
3. **Apply Offset**: If no override, apply the school's day offset  
4. **Calculate Cycle**: Convert to A/B (high schools) or 1-6 (elementary)
5. **Display**: Show correct day and specials on child page/widget

## Usage Examples

### Scenario 1: Snow Day
Park Elementary closes for snow, others stay open.

**Steps:**
1. Update `SCHOOL_DAY_OFFSETS`: Set `'Park': -1`
2. Commit and deploy
3. Park widgets/pages now show correct day

### Scenario 2: Emergency Closure  
AMD has a 2-day building emergency.

**Options:**
- **Offset**: Set `'AMD': -2`
- **Date Override**: Add specific closed dates

### Scenario 3: Testing
Want to test how Day 3 looks?

**Steps:**
1. Add date override: Today = `'day-3'`
2. Test widgets and pages
3. Remove override when done

## Admin Interface

Use `SchoolCalendarAdmin.tsx` component for easy management:

- ✅ Visual offset controls (+1/-1/Reset)
- ✅ Date-specific override creation  
- ✅ Generated config code copying
- ✅ Common scenario examples

## File Structure

```
src/data/
├── school-calendar.ts          # Main configuration
└── schools.ts                  # School codes and meal accounts

src/components/
├── SchoolCalendarAdmin.tsx     # Admin management UI
├── WidgetGenerator.tsx         # Uses calendar system
└── ...

src/pages/
├── ChildPage.tsx              # Uses calendar system  
└── ...
```

## API Changes Required

### Option A: Enhanced Google Apps Script
Modify the existing script to accept school parameter:

```javascript
function doGet(e) {
  const school = e.parameter.school || 'default'
  const baseDay = getCurrentSchoolDay()
  
  // Look up school-specific offset from a spreadsheet
  const offset = getSchoolOffset(school) 
  const adjustedDay = baseDay + offset
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    dayNumber: adjustedDay,
    school: school,
    baseDay: baseDay,
    offset: offset
  })).setMimeType(ContentService.MimeType.JSON)
}
```

### Option B: Keep Current API
Use client-side offset calculation (current implementation).

## Deployment Process

### When Individual Closure Happens:

1. **Immediate**: Update `school-calendar.ts` offsets
2. **Commit**: Push changes to repository  
3. **Deploy**: Vercel auto-deploys from main branch
4. **Verify**: Check affected school's widgets/pages

### Regular Maintenance:

- **Weekly**: Review offsets, reset when schools realign
- **Monthly**: Clean up old date overrides
- **Seasonally**: Prepare for snow day season

## Testing

```typescript
// Test different scenarios locally
import { getSchoolDay, getDayKey } from './school-calendar'

// Test Park with -1 offset
const parkDay = getSchoolDay(15, 'Park') 
// Returns: { dayNumber: 14, source: 'offset' }

// Test date override
const overrideDay = getSchoolDay(15, 'AMD', new Date('2024-11-20'))
// Returns: { dayNumber: 'closed', source: 'override' }
```

## Benefits

✅ **Accurate Schedules**: Each school shows correct specials  
✅ **Easy Management**: Simple offset adjustments  
✅ **Flexible Overrides**: Handle any scenario  
✅ **No API Changes**: Works with existing Google Script  
✅ **Real-time Updates**: Deploy changes immediately  
✅ **Testing Support**: Force specific days for testing

## Future Enhancements

- **Database Storage**: Move offsets to a database for easier management
- **Auto-Reset**: Automatically reset offsets when schools realign  
- **Notification System**: Alert when offsets are applied
- **Historical Tracking**: Log all offset changes for audit trails