# Ossining School Today

View today's lunch menu and school day schedule for Ossining schools, with bilingual support (English/Spanish).

## Features

- 📅 Daily school schedule and cycle day
- 🍽️ Lunch and breakfast menus from FoodDirector
- 🌐 Bilingual support (English/Spanish)
- 📱 Mobile-friendly design
- 🔗 Shareable URLs for family members
- 📱 iOS Widget generation for use with the Scriptable App
- 🔗 Clickable links to fdmealplanner for detailed menu information
- ↩️ Seamless navigation with state preservation between setup and child pages

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:5173

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Serverless functions (Vercel)
- **i18n**: react-i18next

## Credits & Attribution

Menu parsing functionality is based on [fdmealplanner](https://github.com/jdeath/fdmealplanner) by [@jdeath](https://github.com/jdeath). The original parser was adapted to add:
- Spanish menu item support via `ComponentSpanishName` 
- Serverless function compatibility
- Enhanced caching and error handling

## License

Copyright 2025 Evan Mangiamele

---

Built with ❤️ for Ossining families
