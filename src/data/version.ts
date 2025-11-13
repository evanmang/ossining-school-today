/**
 * Version and Release Information
 * Update this file when releasing new features
 */

export const VERSION_INFO = {
  version: '2.1.0',
  releaseDate: '2025-11-12',
  codename: 'Offline-First',
  buildNumber: Date.now()
}

export interface ReleaseNote {
  version: string
  date: string
  codename?: string
  type: 'major' | 'minor' | 'patch'
  features: string[]
  improvements: string[]
  fixes: string[]
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '2.1.0',
    date: '2025-11-12',
    codename: 'Offline-First',
    type: 'minor',
    features: [
      'Smart offline widget support - widgets now show cached data instead of errors',
      'School calendar management system for individual closures',
      'Visual admin interface for managing school day offsets',
      'Bilingual offline indicators (English/Spanish)'
    ],
    improvements: [
      'Enhanced widget reliability with persistent caching',
      'Better error handling across all components',
      'Comprehensive documentation for calendar system'
    ],
    fixes: [
      'Fixed widget crashes on poor network connections',
      'Improved cache management for menu data'
    ]
  },
  {
    version: '2.0.0',
    date: '2025-11-11',
    codename: 'Multilingual',
    type: 'major',
    features: [
      'Complete Spanish language support',
      'Clickable meal headers linking to fdmealplanner',
      'Enhanced widget generation with custom colors',
      'State preservation between setup and child pages'
    ],
    improvements: [
      'Better widget preview with real menu data',
      'Improved navigation flow between pages',
      'Enhanced custom specials display'
    ],
    fixes: [
      'Fixed special subjects translation issues',
      'Corrected widget menu item limits',
      'Improved profile encoding/decoding'
    ]
  },
  {
    version: '1.0.0',
    date: '2025-10-15',
    codename: 'Foundation',
    type: 'major',
    features: [
      'Initial release of Ossining School Today',
      'Student profile creation and management',
      'iOS widget generation for daily schedules',
      'Real-time menu integration with fdmealplanner',
      'Support for all Ossining schools (Elementary through High School)'
    ],
    improvements: [],
    fixes: []
  }
]

/**
 * Get the latest release information
 */
export function getLatestRelease(): ReleaseNote {
  return RELEASE_NOTES[0]
}

/**
 * Get version string for display
 */
export function getVersionString(): string {
  const latest = getLatestRelease()
  return `v${latest.version}`
}

/**
 * Check if this is a new major version
 */
export function isMajorRelease(version: string): boolean {
  return version.endsWith('.0.0')
}

/**
 * Get formatted release date
 */
export function getFormattedReleaseDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}