// This file represents a serverless function, e.g., on Vercel, Netlify, or Google Cloud Functions.
// It would be mapped to an endpoint like /api/generate.

import Stripe from 'stripe';
import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';
import { Language, Tone, Audience } from '../types';

// Stripe setup
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any }) : null;

// This is a mock of how a serverless function handler might look.
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    // Stripe webhook (raw body, no JSON)
    if (request.url.endsWith('/webhook')) {
      return await handleStripeWebhook(request);
    }

    const body = await request.json();
    const { action, payload } = body;

    // Auth actions do not require a Gemini API key
    if (action === 'registerUser' || action === 'loginUser' || action === 'forgotPassword') {
      let result;
      if (action === 'registerUser') {
        result = await handleRegisterUser(payload);
      } else if (action === 'loginUser') {
        result = await handleLoginUser(payload);
      } else {
        result = await handleForgotPassword(payload);
      }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stripe Billing
    if (action === 'createStripeCheckout') {
      const result = await handleCreateStripeCheckout(payload);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Product import
    if (action === 'importProducts') {
      const result = await handleImportProducts(payload);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // AI pricing suggestion
    if (action === 'suggestPrice') {
      const result = await handleSuggestPrice(payload);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // AI vs original report
    if (action === 'getAiVsOriginalReport') {
      const result = await handleAiVsOriginalReport(payload);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // E-commerce integrations
    if (action === 'connectShopify') {
      const result = await handleConnectShopify(payload);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'connectWooCommerce') {
      const result = await handleConnectWooCommerce(payload);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // AI-based actions require API key
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      throw new Error("API key is not configured on the server.");
    }
    const ai = new GoogleGenerativeAI(API_KEY);

    let result;

    if (action === 'generateDescription') {
      result = await handleGenerateDescription(ai, payload);
    } else if (action === 'analyzeBrandVoice') {
      result = await handleAnalyzeBrandVoice(ai, payload);
    } else if (action === 'getSemanticKeywords') {
      result = await handleGetSemanticKeywords(ai, payload);
    } else if (action === 'generateInfluencerContent') {
      result = await handleGenerateInfluencerContent(ai, payload);
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    console.error("API Function Error:", e);
    return new Response(JSON.stringify({ error: e.message || 'An internal server error occurred.' }), { status: 500 });
  }
}

// --- STRIPE WEBHOOK HANDLER ---
async function handleStripeWebhook(request: Request) {
  if (!stripe) throw new Error('Stripe is not configured.');
  const sig = request.headers.get('stripe-signature');
  const rawBody = await request.text();
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return new Response('Webhook Error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const email = session.customer_email;
    
    let credits = 0;
    if (session.metadata?.plan === 'starter') credits = 100;
    else if (session.metadata?.plan === 'pro') credits = 500;
    else if (session.metadata?.plan === 'agency') credits = 2000;
    else if (session.metadata?.credits === 'credits_100') credits = 100;
    else if (session.metadata?.credits === 'credits_500') credits = 500;
    else if (session.metadata?.credits === 'credits_1000') credits = 1000;
    
    if (email && credits > 0) {
      try {
        await grantCreditsToUser(email, credits);
        console.log(`Granted ${credits} credits to ${email}`);
      } catch (err) {
        console.error('Failed to grant credits:', err);
      }
    }
    console.log('Stripe payment completed:', session);
  }
  
  return new Response('Webhook received', { status: 200 });
}

// --- BILLING / STRIPE HANDLER ---
async function handleCreateStripeCheckout(payload: any) {
  if (!stripe) throw new Error('Stripe is not configured.');
  const { plan, credits, email } = payload;
  
  const priceMap: Record<string, string> = {
    starter: 'price_starter_id',
    pro: 'price_pro_id',
    agency: 'price_agency_id',
    credits_100: 'price_100_id',
    credits_500: 'price_500_id',
    credits_1000: 'price_1000_id',
  };
  
  const priceId = priceMap[plan] || priceMap[credits];
  if (!priceId) throw new Error('Invalid plan or credits.');
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    customer_email: email,
    success_url: 'https://ultragenerationpro.com/success',
    cancel_url: 'https://ultragenerationpro.com/cancel',
    metadata: { plan, credits },
  });
  
  return { checkoutUrl: session.url };
}

// --- PRODUCT IMPORT HANDLER ---
async function handleImportProducts(payload: any) {
  const { products } = payload;
  if (!products || !Array.isArray(products)) {
    throw new Error('Invalid products data');
  }
  
  console.log(`Importing ${products.length} products...`);
  
  // Mock implementation - in real app, save to database
  return {
    success: true,
    imported: products.length,
    message: `Successfully imported ${products.length} products`,
  };
}

// --- AI PRICING HANDLER ---
function calcDemandScore(sales_history: any[]) {
  if (!sales_history || sales_history.length === 0) return 0;
  const avg = sales_history.reduce((sum, s) => sum + (s.sold || 0), 0) / sales_history.length;
  return Math.min(avg / 10, 0.2);
}

function calcStockScore(stock: number) {
  if (typeof stock !== 'number') return 0;
  if (stock > 100) return 0.1;
  if (stock < 10) return -0.1;
  return 0;
}

function calcCompetitorScore(current: number, competitor: number | undefined) {
  if (!competitor) return 0;
  const diff = (competitor - current) / current;
  return Math.max(Math.min(diff, 0.1), -0.1);
}

function calcSeasonMultiplier(season: string | undefined) {
  if (!season) return 1;
  if (season === 'peak') return 1.05;
  if (season === 'off') return 0.95;
  return 1;
}

async function handleSuggestPrice(payload: any) {
  const { current_price, sales_history, stock, competitor_price, min_price, max_price, season } = payload;
  
  const demand_score = calcDemandScore(sales_history);
  const stock_score = calcStockScore(stock);
  const competitor_score = calcCompetitorScore(current_price, competitor_price);
  const season_multiplier = calcSeasonMultiplier(season);
  
  let optimal_price = current_price * (1 + demand_score - stock_score + competitor_score) * season_multiplier;
  
  if (min_price) optimal_price = Math.max(optimal_price, min_price);
  if (max_price) optimal_price = Math.min(optimal_price, max_price);
  
  const percent = ((optimal_price - current_price) / current_price) * 100;
  
  return {
    recommended_price: Math.round(optimal_price * 100) / 100,
    change_percent: Math.round(percent * 10) / 10,
    formula: `current_price * (1 + demand_score - stock_score + competitor_score) * season_multiplier`,
    details: { demand_score, stock_score, competitor_score, season_multiplier },
  };
}

// --- AI VS ORIGINAL REPORT HANDLER ---
async function handleAiVsOriginalReport(payload: any) {
  // Mock implementation
  return {
    totalProducts: 150,
    aiOptimized: 120,
    improvements: {
      avgConversionIncrease: 23.5,
      avgClickThroughIncrease: 18.2,
      avgRevenueIncrease: 31.0,
    },
  };
}

// --- SHOPIFY/WOOCOMMERCE HANDLERS ---
async function handleConnectShopify(payload: any) {
  const { shopUrl, accessToken } = payload;
  console.log(`Kopplar Shopify-butik: ${shopUrl} med token: ${accessToken}`);
  return { success: true, shopUrl };
}

async function handleConnectWooCommerce(payload: any) {
  const { storeUrl, consumerKey, consumerSecret } = payload;
  console.log(`Kopplar WooCommerce-butik: ${storeUrl} med key: ${consumerKey}`);
  return { success: true, storeUrl };
}

// --- AUTH HANDLERS ---
async function handleRegisterUser(payload: any) {
  const { name, email, password } = payload;
  if (!name || !email || !password) {
    throw new Error("Missing registration details.");
  }
  console.log(`Registering user ${name} with email ${email}`);
  console.log(`SIMULATING: Sending welcome email from support@ultragenerationpro.com to ${email}...`);
  return {
    user: { id: 'user_123', name, email },
    token: 'mock-jwt-token-for-' + email,
  };
}

async function handleLoginUser(payload: any) {
  const { email, password } = payload;
  if (!email || !password) {
    throw new Error("Missing login details.");
  }
  console.log(`Logging in user with email ${email}`);
  return {
    user: { id: 'user_123', name: 'Test User', email },
    token: 'mock-jwt-token-for-' + email,
  };
}

async function handleForgotPassword(payload: any) {
  const { email } = payload;
  if (!email) {
    throw new Error("Email is required.");
  }
  console.log(`Password reset requested for email ${email}. In a real app, an email would be sent.`);
  return { message: 'If an account with this email exists, a password reset link has been sent.' };
}

// --- CREDIT MANAGEMENT ---
async function grantCreditsToUser(email: string, credits: number) {
  console.log(`Granting ${credits} credits to user ${email}`);
  // In real app, update database
  return true;
}

// --- AI HANDLERS ---
async function handleGenerateDescription(ai: GoogleGenerativeAI, payload: any) {
  const { imageFile, productTitle, keywords, brandVoice, language, tone, audience } = payload;
  const imagePart = { inlineData: { mimeType: imageFile.mimeType, data: imageFile.base64 } };
  
  const languageMap: Record<string, string> = { en: 'English', sv: 'Swedish (Svenska)', es: 'Spanish (Español)' };
  const toneMap: Record<Tone, string> = {
    professional: 'Strictly professional and informative.',
    friendly: 'Warm, engaging, and approachable.',
    luxury: 'Elegant, sophisticated, and aspirational.',
    playful: 'Fun, witty, and humorous.',
    adventurous: 'Exciting, bold, and action-oriented.',
    witty: 'Clever, intelligent, and humorous.',
    inspirational: 'Uplifting, motivational, and positive.',
    technical: 'Precise, data-driven, and expert.',
    minimalist: 'Simple, clean, and direct.',
    urgent: 'Uses scarcity and urgency to drive action.'
  };
  const audienceMap: Record<Audience, string> = {
    'gen-z': 'Gen Z (uses slang, emojis, and is very direct).',
    millennials: 'Millennials (relatable, authentic, and value-driven).',
    'gen-x': 'Gen X (straightforward, practical, and no-nonsense).',
    boomers: 'Boomers (clear, trustworthy, and benefit-focused).',
    'luxury-shoppers': 'Luxury Shoppers (emphasizes quality, exclusivity, and status).',
    parents: 'Parents (focuses on safety, convenience, and family benefits).',
    'tech-enthusiasts': 'Tech Enthusiasts (loves specs, innovation, and cutting-edge features).',
    'budget-shoppers': 'Budget Shoppers (focuses on value, deals, and affordability).',
    'eco-conscious': 'Eco-conscious Consumers (highlights sustainability, materials, and impact).',
    'fitness-enthusiasts': 'Fitness Enthusiasts (focuses on performance, results, and health benefits).',
    gamers: 'Gamers (uses gaming lingo, focuses on performance and aesthetics).'
  };

  const toneDescription = toneMap[tone as Tone] || tone;
  const audienceDescription = audienceMap[audience as Audience] || audience;

  const prompt = `
    You are an expert e-commerce copywriter and SEO specialist, strictly following Google's E-E-A-T guidelines.
    
    ### STYLE PROFILE:
    - **Output Language**: You MUST generate the entire output in ${languageMap[language as Language]}.
    - **Tone**: ${toneDescription}
    - **Target Audience**: Write for ${audienceDescription}.
    - **Brand Voice**: "${brandVoice}"
    
    ### CONTENT REQUIREMENTS:
    1.  **headline**: A catchy headline (max 10-12 words).
    2.  **body**: An engaging body (2-3 paragraphs).
    3.  **meta_description**: Under 160 characters for SERPs.
    4.  **feature_bullets**: 3-5 key features as bullet points.
    5.  **seo_keywords**: 5-7 semantically relevant SEO keywords.
    
    ### OUTPUT FORMAT:
    Return ONLY a valid JSON object.
  `;

  const textPart = { text: prompt };

  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const response = await model.generateContent([imagePart, textPart]);
  const result = response.response;
  const text = result.text();

  return JSON.parse(text.trim());
}

async function handleAnalyzeBrandVoice(ai: GoogleGenerativeAI, payload: any) {
  const { textToAnalyze } = payload;
  const prompt = `Analyze the following text and describe its brand voice and tone in a concise, one-paragraph summary. Focus on personality, style, and vocabulary. Text to analyze: "${textToAnalyze}"`;
  
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const response = await model.generateContent(prompt);
  const result = response.response;
  
  return { analyzedVoice: result.text() };
}

async function handleGetSemanticKeywords(ai: GoogleGenerativeAI, payload: any) {
  const { baseKeyword, language } = payload;
  const languageMap: Record<string, string> = { en: 'English', sv: 'Swedish', es: 'Spanish' };
  
  const prompt = `You are an SEO expert. Based on the primary keyword "${baseKeyword}", generate a semantic cluster of 7-10 related keywords in ${languageMap[language as Language]}. Return ONLY a JSON array of strings.`;
  
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const response = await model.generateContent(prompt);
  const result = response.response;
  
  return JSON.parse(result.text().trim());
}

async function handleGenerateInfluencerContent(ai: GoogleGenerativeAI, payload: any) {
  const { imageFile, postContext, language } = payload;
  const imagePart = { inlineData: { mimeType: imageFile.mimeType, data: imageFile.base64 } };
  const languageMap: Record<string, string> = { en: 'English', sv: 'Swedish', es: 'Spanish' };

  const prompt = `
    You are a social media content strategist. Generate content in ${languageMap[language as Language]}:
    1. **bio**: A short bio (max 150 characters).
    2. **caption**: An engaging caption with a strong hook.
    3. **hashtags**: 15-20 optimized hashtags.
    
    Context: "${postContext}"
    
    Return ONLY a valid JSON object.
  `;

  const textPart = { text: prompt };

  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const response = await model.generateContent([imagePart, textPart]);
  const result = response.response;

  return JSON.parse(result.text().trim());
}
