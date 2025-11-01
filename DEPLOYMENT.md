# OssiningSchoolToday

View today's lunch menu and school day schedule for Ossining schools, with bilingual support (English/Spanish).

## Features

- 📅 Daily school schedule and cycle day
- 🍽️ Lunch and breakfast menus from FoodDirector
- 🌐 Bilingual support (English/Spanish)
- 📱 Mobile-friendly design
- 🔗 Shareable URLs for family members

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Serverless functions (Vercel-compatible)
- **Parser**: Custom FoodDirector menu parser with Spanish support
- **i18n**: react-i18next

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. (Optional) Start the local proxy for testing:
   ```bash
   npm run start:proxy
   ```

4. Open http://localhost:5173

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_URL)

### Manual Deployment

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click "Import Project" and select your repository

4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Click "Deploy" and you're done! 🎉

### Custom Domain (Optional)

After deploying, you can add a custom domain in Vercel:
- Go to your project → Settings → Domains
- Add your domain (e.g., ossingschooltoday.com)
- Vercel will provide DNS instructions

## Project Structure

```
ossining-school-site/
├── api/                    # Serverless API functions
│   ├── fdmenu.js          # Menu API endpoint (JS version)
│   └── fdmenu.ts          # Menu API endpoint (TS version)
├── server/                # Local development proxy
│   ├── proxy.js           # Express proxy with caching
│   └── fdparser.js        # FoodDirector menu parser
├── src/
│   ├── components/        # React components
│   ├── locales/           # i18n translations (en/es)
│   ├── pages/             # Page components
│   └── utils/             # Helper functions
└── vercel.json           # Vercel configuration

```

## Environment Variables

No environment variables needed! The app uses public APIs only.

## License

Copyright 2025 Evan Mangiamele

---

Built with ❤️ for Ossining families
