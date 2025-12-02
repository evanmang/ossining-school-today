/**
 * Version and Release Information
 * Update this file when releasing new features
 */

export const VERSION_INFO = {
  version: '2.2.0',
  releaseDate: '2025-11-16',
  codename: 'Universal Widgets',
  buildNumber: Date.now()
}

export interface ReleaseNote {
  version: string
  date: string
  codename?: string
  codenameEs?: string
  type: 'major' | 'minor' | 'patch'
  features: string[]
  featuresEs: string[]
  improvements: string[]
  improvementsEs: string[]
  fixes: string[]
  fixesEs: string[]
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '2.3.0',
    date: '2025-12-02',
    codename: 'Privacy & Compliance',
    codenameEs: 'Privacidad y Cumplimiento',
    type: 'minor',
    features: [
      'Added a dedicated Privacy Policy page, accessible in both English and Spanish',
      'Privacy policy link now appears in the footer and header, with full language switching support'
    ],
    featuresEs: [
      'Se agregó una página dedicada de Política de Privacidad, accesible en inglés y español',
      'El enlace a la política de privacidad ahora aparece en el pie de página y encabezado, con soporte completo de idioma'
    ],
    improvements: [
      'Navigation to the privacy policy page now works seamlessly in local development and production',
      'Language switching on the privacy policy page updates all content instantly'
    ],
    improvementsEs: [
      'La navegación a la página de política de privacidad ahora funciona perfectamente en desarrollo local y producción',
      'El cambio de idioma en la página de política de privacidad actualiza todo el contenido al instante'
    ],
    fixes: [],
    fixesEs: []
  },
  {
    version: '2.2.0',
    date: '2025-11-16',
    codename: 'Universal Widgets',
    codenameEs: 'Widgets Universales',
    type: 'minor',
    features: [
      'Android widget support with native Kotlin implementation',
      'Centralized school day proxy API for automatic updates',
      'Spanish language support for all release notes',
      'Dynamic day number calculation without widget code updates'
    ],
    featuresEs: [
      'Soporte de widgets de Android con implementación nativa en Kotlin',
      'API proxy centralizada de días escolares para actualizaciones automáticas',
      'Soporte del idioma español para todas las notas de la versión',
      'Cálculo dinámico del número de día sin actualizaciones de código de widget'
    ],
    improvements: [
      'Widgets now fetch day numbers from centralized API',
      'Manual school closure adjustments no longer require widget updates',
      'Bilingual release notes with automatic language detection',
      'Improved widget reliability across iOS and Android platforms',
      'Removed fdmealplanner.com links from lunch and breakfast headers on the child page to avoid confusion with client-side routing.'
    ],
    improvementsEs: [
      'Los widgets ahora obtienen números de día de API centralizada',
      'Los ajustes manuales de cierres escolares ya no requieren actualizaciones de widgets',
      'Notas de versión bilingües con detección automática de idioma',
      'Mejor confiabilidad de widgets en plataformas iOS y Android',
      'Se eliminaron los enlaces a fdmealplanner.com de los encabezados de almuerzo y desayuno en la página del niño para evitar confusión con el enrutamiento del lado del cliente.'
    ],
    fixes: [
      'Fixed day number synchronization issues across different schools',
      'Corrected widget behavior during individual school closures',
      'Improved error handling in day calculation logic'
    ],
    fixesEs: [
      'Corregidos problemas de sincronización de números de día entre diferentes escuelas',
      'Corregido el comportamiento del widget durante cierres escolares individuales',
      'Mejorado el manejo de errores en la lógica de cálculo de días'
    ]
  },
  {
    version: '2.1.0',
    date: '2025-11-12',
    codename: 'Offline-First',
    codenameEs: 'Sin Conexión',
    type: 'minor',
    features: [
      'Smart offline widget support - widgets now show cached data instead of errors',
      'School calendar management system for individual closures',
      'Visual admin interface for managing school day offsets',
      'Bilingual offline indicators (English/Spanish)'
    ],
    featuresEs: [
      'Soporte inteligente de widgets sin conexión - los widgets ahora muestran datos guardados en lugar de errores',
      'Sistema de gestión de calendario escolar para cierres individuales',
      'Interfaz de administración visual para gestionar ajustes de días escolares',
      'Indicadores bilingües sin conexión (inglés/español)'
    ],
    improvements: [
      'Enhanced widget reliability with persistent caching',
      'Better error handling across all components',
      'Comprehensive documentation for calendar system'
    ],
    improvementsEs: [
      'Mayor confiabilidad de widgets con almacenamiento en caché persistente',
      'Mejor manejo de errores en todos los componentes',
      'Documentación completa para el sistema de calendario'
    ],
    fixes: [
      'Fixed widget crashes on poor network connections',
      'Improved cache management for menu data'
    ],
    fixesEs: [
      'Corregidos los fallos de widgets con conexiones de red deficientes',
      'Mejorada la gestión de caché para datos de menú'
    ]
  },
  {
    version: '2.0.0',
    date: '2025-11-11',
    codename: 'Multilingual',
    codenameEs: 'Multilingüe',
    type: 'major',
    features: [
      'Complete Spanish language support',
      'Clickable meal headers linking to fdmealplanner',
      'Enhanced widget generation with custom colors',
      'State preservation between setup and child pages'
    ],
    featuresEs: [
      'Soporte completo del idioma español',
      'Encabezados de comida en los que se puede hacer clic vinculados a fdmealplanner',
      'Generación mejorada de widgets con colores personalizados',
      'Preservación del estado entre páginas de configuración e hijo'
    ],
    improvements: [
      'Better widget preview with real menu data',
      'Improved navigation flow between pages',
      'Enhanced custom specials display'
    ],
    improvementsEs: [
      'Mejor vista previa de widgets con datos de menú reales',
      'Flujo de navegación mejorado entre páginas',
      'Visualización mejorada de especialidades personalizadas'
    ],
    fixes: [
      'Fixed special subjects translation issues',
      'Corrected widget menu item limits',
      'Improved profile encoding/decoding'
    ],
    fixesEs: [
      'Corregidos problemas de traducción de materias especiales',
      'Corregidos límites de elementos del menú de widgets',
      'Mejorada la codificación/decodificación de perfiles'
    ]
  },
  {
    version: '1.0.0',
    date: '2025-10-15',
    codename: 'Foundation',
    codenameEs: 'Fundación',
    type: 'major',
    features: [
      'Initial release of Ossining School Today',
      'Student profile creation and management',
      'iOS widget generation for daily schedules',
      'Real-time menu integration with fdmealplanner',
      'Support for all Ossining schools (Elementary through High School)'
    ],
    featuresEs: [
      'Lanzamiento inicial de Ossining School Today',
      'Creación y gestión de perfiles de estudiantes',
      'Generación de widgets de iOS para horarios diarios',
      'Integración de menú en tiempo real con fdmealplanner',
      'Soporte para todas las escuelas de Ossining (desde Primaria hasta Secundaria)'
    ],
    improvements: [],
    improvementsEs: [],
    fixes: [],
    fixesEs: []
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