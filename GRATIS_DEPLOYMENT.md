# 🆓 GRATIS DEPLOYMENT GUIDE
# Total kostnad: 0-100 kr/mån

## Option 1: Vercel + Railway (Rekommenderat)

### Kostnader:
| Tjänst | Kostnad |
|--------|---------|
| Vercel (frontend) | GRATIS |
| Railway (backend + DB) | GRATIS ($5 credits) |
| Gemini API | GRATIS (60 req/min) |
| Stripe | 0 kr fast, 1.4% + 1.80 kr per transaktion |
| **TOTAL** | **0 kr/mån** (tills du har kunder!) |

---

## STEG 1: Vercel (Frontend)

```bash
# 1. Gå till vercel.com och logga in med GitHub

# 2. Klicka "Import Project" och välj ditt repo

# 3. Settings:
#    - Framework: Vite
#    - Build Command: npm run build
#    - Output Directory: dist

# 4. Klicka Deploy - KLART!
```

---

## STEG 2: Railway (Backend + Database)

```bash
# 1. Gå till railway.app och logga in med GitHub

# 2. New Project → Deploy from GitHub repo

# 3. Add PostgreSQL:
#    - Klicka "+ New" → Database → PostgreSQL
#    - Kopiera DATABASE_URL från Variables

# 4. Lägg till miljövariabler i Railway Dashboard:
JWT_SECRET=minst-32-tecken-hemlig-nyckel-här
GEMINI_API_KEY=din-nyckel-från-google
STRIPE_SECRET_KEY=sk_test_xxx
FRONTEND_URL=https://din-app.vercel.app

# 5. Deploy sker automatiskt!
```

---

## STEG 3: Koppla ihop

I Vercel Dashboard → Settings → Environment Variables:
```
VITE_API_URL=https://din-app.up.railway.app
```

Uppdatera vercel.json med din Railway-URL.

---

## GRATIS API-NYCKLAR

### Google Gemini (AI)
1. Gå till: https://makersuite.google.com/app/apikey
2. Klicka "Create API Key"
3. Kopiera nyckeln → GRATIS 60 requests/minut

### Stripe (Test-läge)
1. Gå till: https://dashboard.stripe.com/test/apikeys
2. Kopiera "Secret key" (sk_test_xxx)
3. Test-läge = inga riktiga pengar

---

## DOMÄN (Valfritt ~80 kr/år)

### Gratis alternativ:
- din-app.vercel.app (ingår)
- din-app.up.railway.app (ingår)

### Billig domän:
- Cloudflare: .com från ~80 kr/år
- Porkbun: Billigast för .dev, .app

---

## NÄR DU FÅR KUNDER

När du börjar få betalande kunder:

| Intäkt/mån | Uppgradera till |
|------------|-----------------|
| 0-1000 kr | Stanna på gratis |
| 1000-5000 kr | Railway Hobby ($5/mån) |
| 5000+ kr | Railway Pro ($20/mån) |

Stripe tar bara betalt när du får betalningar!

---

## SNABBSTART (5 minuter)

1. Pusha till GitHub
2. Importera i Vercel → Deploy frontend
3. Importera i Railway → Deploy backend
4. Lägg till miljövariabler
5. Klart! 🎉
