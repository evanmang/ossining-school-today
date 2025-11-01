const assert = require('assert')
const { parseEntry, normalizeName } = require('./fdparser')

function run(){
  console.log('Running fdparser tests...')

  // test normalizeName
  assert.strictEqual(normalizeName('Pizza Cheese Pre-Made 8 Slices'), 'Cheese Pizza')
  assert.strictEqual(normalizeName(' Classic Cheese Pizza '), 'Cheese Pizza')
  assert.strictEqual(normalizeName('Watermelon Sliced'), 'Watermelon Sliced')

  // test parseEntry with menuRecipes string
  const entry1 = { menuRecipes: 'Pizza Cheese Pre-Made 8 Slices, Pizza Pepperoni Pre-Made 8 Slices, Zucchini Sauteed' }
  const items1 = parseEntry(entry1)
  assert(items1.includes('Cheese Pizza'))
  assert(items1.includes('Pepperoni Pizza'))
  assert(items1.includes('Zucchini Sauteed'))

  console.log('All fdparser tests passed')
}

if(require.main === module) run()
