# UltragenerationPro 🚀

AI-driven prissättning och produktbeskrivningar för e-handel.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)

## ✨ Funktioner

- 🤖 **AI-Prissättning** - Intelligenta prisförslag baserade på marknadsdata
- 📝 **Produktbeskrivningar** - Generera SEO-optimerade beskrivningar med AI
- 🛒 **E-handelsintegrationer** - Shopify, WooCommerce, Magento, Wix, Squarespace
- 📊 **Analytics Dashboard** - Insikter om trafik, konvertering och intäkter
- 👥 **Användarhantering** - Roller och behörigheter
- 🔑 **API-åtkomst** - REST API med nyckelgenerering
- 🌍 **Flerspråkigt** - Svenska, Engelska, Spanska, Tyska, Franska, Finska
- 📱 **PWA-stöd** - Installera som app på mobil/desktop
- 💳 **Stripe-betalningar** - Krediter och prenumerationer

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Routing:** React Router v6
- **Backend:** Node.js, Prisma ORM
- **Databas:** PostgreSQL
- **Betalningar:** Stripe
- **E-post:** SendGrid
- **AI:** Google Gemini
- **Bundler:** Vite
- **Tester:** Jest, React Testing Library

## 📦 Installation

### Förutsättningar

- Node.js 18+ 
- PostgreSQL 14+
- npm eller yarn

### Steg 1: Klona projektet

```bash
git clone https://github.com/your-repo/ultragenerationpro.git
cd ultragenerationpro
```

### Steg 2: Installera beroenden

```bash
npm install
```

### Steg 3: Konfigurera miljövariabler

```bash
cp .env.example .env
# Redigera .env med dina värden
```

### Steg 4: Initiera databasen

```bash
npm run db:generate
npm run db:push
```

### Steg 5: Starta utvecklingsserver

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## 🧪 Tester

```bash
# Kör alla tester
npm test

# Kör tester i watch-läge
npm test -- --watch

# Kör tester med coverage
npm test -- --coverage
```

## 📁 Projektstruktur

```
ultragenerationpro/
├── components/          # React-komponenter
│   ├── AdminPanel.tsx
│   ├── Analytics.tsx
│   ├── ApiDocs.tsx
│   ├── Dashboard.tsx
│   └── ...
├── context/             # React Context
│   └── AppContext.tsx
├── functions/           # Serverless-funktioner
│   ├── generate.ts
│   └── sendEmail.ts
├── hooks/               # Custom React hooks
│   └── useGemini.ts
├── lib/                 # Utilities
│   ├── api.ts          # API-klient
│   ├── i18n.ts         # Översättningar
│   └── utils.ts
├── prisma/              # Databasschema
│   └── schema.prisma
├── public/              # Statiska filer
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   └── index.css       # Tailwind CSS
├── __tests__/           # Tester
├── App.tsx             # Huvudkomponent
├── index.tsx           # Entry point
└── vite.config.ts      # Vite-konfiguration
```

## 🔧 Scripts

| Script | Beskrivning |
|--------|-------------|
| `npm run dev` | Starta utvecklingsserver |
| `npm run build` | Bygg för produktion |
| `npm run preview` | Förhandsgranska produktionsbygge |
| `npm test` | Kör tester |
| `npm run db:generate` | Generera Prisma-klient |
| `npm run db:push` | Synka databas med schema |
| `npm run db:studio` | Öppna Prisma Studio |

## 🌍 Språkstöd

Appen stödjer följande språk:

- 🇬🇧 Engelska (en)
- 🇸🇪 Svenska (sv)
- 🇪🇸 Spanska (es)
- 🇩🇪 Tyska (de)
- 🇫🇷 Franska (fr)
- 🇫🇮 Finska (fi)

## 🔌 API-dokumentation

### Autentisering

Alla API-anrop kräver en Bearer-token i Authorization-headern:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.yourapp.com/products
```

### Endpoints

| Metod | Endpoint | Beskrivning |
|-------|----------|-------------|
| GET | `/api/products` | Lista produkter |
| POST | `/api/products/:id/price` | Uppdatera pris |
| POST | `/api/ai/price-suggestion` | Generera prisförslag |
| GET | `/api/analytics` | Hämta analytics |

Se fullständig dokumentation i appen under API-dokumentation.

## 💳 Prisplaner

| Plan | Krediter | Pris |
|------|----------|------|
| Free | 10 | Gratis |
| Starter | 100 | 99 kr/mån |
| Pro | 500 | 299 kr/mån |
| Enterprise | Obegränsat | Kontakta oss |

## 🚀 Deploy

### Vercel

```bash
npm i -g vercel
vercel
```

### Docker

```bash
docker build -t ultragenerationpro .
docker run -p 3000:3000 ultragenerationpro
```

## 🤝 Bidra

1. Forka projektet
2. Skapa en feature-branch (`git checkout -b feature/amazing-feature`)
3. Commita dina ändringar (`git commit -m 'Add amazing feature'`)
4. Pusha till branchen (`git push origin feature/amazing-feature`)
5. Öppna en Pull Request

## 📄 Licens

MIT License - se [LICENSE](LICENSE) för detaljer.

## 📧 Kontakt

- **E-post:** support@ultragenerationpro.com
- **Hemsida:** [ultragenerationpro.com](https://ultragenerationpro.com)

---

Made with ❤️ in Sweden 🇸🇪
