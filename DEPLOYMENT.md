# ============================================
# 🚀 DEPLOYMENT GUIDE - UltragenerationPro
# ============================================

## 1. STRIPE SETUP (Betalningar)

### Skapa konto
1. Gå till https://dashboard.stripe.com/register
2. Verifiera din email och företagsinfo

### Skapa produkter i Stripe Dashboard
Gå till Products → Add product:

**Prenumerationer:**
| Produkt | Pris | Billing |
|---------|------|---------|
| Starter Plan | 299 kr/mån | Recurring |
| Pro Plan | 799 kr/mån | Recurring |
| Agency Plan | 1999 kr/mån | Recurring |

**Engångsköp (Krediter):**
| Produkt | Pris | Billing |
|---------|------|---------|
| 100 Krediter | 99 kr | One-time |
| 500 Krediter | 399 kr | One-time |
| 1000 Krediter | 699 kr | One-time |

### Kopiera Price IDs
Efter du skapat produkterna, kopiera `price_xxx` ID:n och uppdatera:
- `server/routes/billing.ts` - byt ut mock price IDs
- `functions/generate.ts` - byt ut mock price IDs

### Webhook
1. Gå till Developers → Webhooks → Add endpoint
2. URL: `https://din-backend.railway.app/api/billing/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`
4. Kopiera webhook secret till `.env`

---

## 2. GOOGLE GEMINI API (AI)

1. Gå till https://makersuite.google.com/app/apikey
2. Skapa API-nyckel
3. Lägg till i `.env`: `GEMINI_API_KEY=din-nyckel`

---

## 3. DATABASE (PostgreSQL på Railway)

### Option A: Railway PostgreSQL
1. Gå till https://railway.app
2. New Project → Add PostgreSQL
3. Kopiera `DATABASE_URL` från Variables

### Option B: Supabase (gratis tier)
1. Gå till https://supabase.com
2. Skapa projekt
3. Settings → Database → Connection string

---

## 4. DEPLOYMENT

### Backend (Railway)
```bash
# 1. Installera Railway CLI
npm install -g @railway/cli

# 2. Logga in
railway login

# 3. Skapa projekt
railway init

# 4. Lägg till PostgreSQL
railway add --plugin postgresql

# 5. Sätt miljövariabler
railway variables set JWT_SECRET="din-hemliga-nyckel-minst-32-tecken"
railway variables set GEMINI_API_KEY="din-gemini-nyckel"
railway variables set STRIPE_SECRET_KEY="sk_live_xxx"
railway variables set STRIPE_WEBHOOK_SECRET="whsec_xxx"
railway variables set FRONTEND_URL="https://din-app.vercel.app"

# 6. Deploya
railway up
```

### Frontend (Vercel)
```bash
# 1. Installera Vercel CLI
npm install -g vercel

# 2. Logga in
vercel login

# 3. Deploya
vercel

# 4. Sätt miljövariabler i Vercel Dashboard
# VITE_API_URL = https://din-backend.railway.app
```

---

## 5. DOMÄN (Valfritt)

### Köp domän
- Namecheap: ~100 kr/år för .com
- Cloudflare: Billigast för .com

### Koppla till Vercel
1. Vercel Dashboard → Settings → Domains
2. Lägg till din domän
3. Uppdatera DNS hos din registrar

---

## 6. EFTER LANSERING

### Monitoring
- [ ] Sätt upp Sentry för felrapportering
- [ ] Google Analytics för trafik
- [ ] Stripe Dashboard för intäkter

### Marknadsföring
- [ ] Lansera på ProductHunt
- [ ] LinkedIn-inlägg
- [ ] E-handelsforum (Ehandel.se, etc.)

---

## 💰 KOSTNADSUPPSKATTNING

| Tjänst | Gratis tier | Betald |
|--------|-------------|--------|
| Vercel | 100GB bandwidth | $20/mån |
| Railway | $5 credits | ~$10-20/mån |
| Gemini API | 60 req/min gratis | Pay-per-use |
| Stripe | 0 kr fast | 1.4% + 1.80 kr/transaktion |
| Domän | - | ~100 kr/år |

**Total startkostnad: ~0-500 kr/mån**
