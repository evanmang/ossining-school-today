export const CATEGORY_KEYS: Record<string,string> = {
  Entree: 'category.entree',
  Side: 'category.side',
  Beverage: 'category.beverage',
  Fruit: 'category.fruit',
  Other: 'category.other'
}

// Common menu item translations keyed by normalized English phrase
export const MENU_TRANSLATIONS_EN_TO_ES: Record<string,string> = {
  'Pizza Cheese': 'Pizza de Queso',
  'Pizza Pepperoni': 'Pizza de Pepperoni',
  'Zucchini Sauteed': 'Calabacín Salteado',
  'Chicken Nuggets': 'Nuggets de Pollo',
  'Hamburger': 'Hamburguesa',
  'Turkey Sandwich': 'Sándwich de Pavo',
  'Garden Salad': 'Ensalada',
  'Milk': 'Leche',
  'Apple': 'Manzana'
}

export function translateMenuItemTo(locale: string, text: string){
  if(!text) return text
  if(locale === 'es'){
    // Normalize text: strip descriptors like "Pre-Made", sizes, etc., and match keys
    const key = normalize(text)
    return MENU_TRANSLATIONS_EN_TO_ES[key] || text
  }
  return text
}

function normalize(s: string){
  // Basic normalization: remove extra words, punctuation, and size descriptors
  return s.replace(/\b(pre-made|pre made|pre-made|fresh|warm|hot|slice|slices|oz|ounces|\d+|\(|\))/ig, '')
    .replace(/[^a-zA-Z0-9 ]/g,'')
    .replace(/\s+/g,' ')
    .trim()
}
