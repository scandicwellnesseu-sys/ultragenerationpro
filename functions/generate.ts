
// This file represents a serverless function, e.g., on Vercel, Netlify, or Google Cloud Functions.
// It would be mapped to an endpoint like /api/generate.

import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { Language, Tone, Audience } from '../types';

// This is a mock of how a serverless function handler might look.
// The actual implementation depends on the deployment platform.
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
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

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      throw new Error("API key is not configured on the server.");
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });

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


// --- AI HANDLERS ---
async function handleGenerateDescription(ai: GoogleGenAI, payload: any) {
    const { imageFile, productTitle, keywords, brandVoice, language, tone, audience } = payload;
    const imagePart = { inlineData: { mimeType: imageFile.mimeType, data: imageFile.base64 } };
    const languageMap: Record<Language, string> = { en: 'English', sv: 'Swedish (Svenska)', es: 'Spanish (Español)', no: 'Norwegian (Norsk)', da: 'Danish (Dansk)', fi: 'Finnish (Suomi)' };
    const toneMap: Record<Tone, string> = { professional: 'Strictly professional and informative.', friendly: 'Warm, engaging, and approachable.', luxury: 'Elegant, sophisticated, and aspirational.', playful: 'Fun, witty, and humorous.', adventurous: 'Exciting, bold, and action-oriented.', witty: 'Clever, intelligent, and humorous.', inspirational: 'Uplifting, motivational, and positive.', technical: 'Precise, data-driven, and expert.', minimalist: 'Simple, clean, and direct.', urgent: 'Uses scarcity and urgency to drive action.' };
    const audienceMap: Record<Audience, string> = { 'gen-z': 'Gen Z (uses slang, emojis, and is very direct).', millennials: 'Millennials (relatable, authentic, and value-driven).', 'gen-x': 'Gen X (straightforward, practical, and no-nonsense).', boomers: 'Boomers (clear, trustworthy, and benefit-focused).', 'luxury-shoppers': 'Luxury Shoppers (emphasizes quality, exclusivity, and status).', parents: 'Parents (focuses on safety, convenience, and family benefits).', 'tech-enthusiasts': 'Tech Enthusiasts (loves specs, innovation, and cutting-edge features).', 'budget-shoppers': 'Budget Shoppers (focuses on value, deals, and affordability).', 'eco-conscious': 'Eco-conscious Consumers (highlights sustainability, materials, and impact).', 'fitness-enthusiasts': 'Fitness Enthusiasts (focuses on performance, results, and health benefits).', gamers: 'Gamers (uses gaming lingo, focuses on performance and aesthetics).' };
    const toneDescription = toneMap[tone as Tone] || tone;
    const audienceDescription = audienceMap[audience as Audience] || audience;
    const prompt = `
      You are an expert e-commerce copywriter and SEO specialist, strictly following Google's E-E-A-T guidelines. Your goal is to create helpful, reliable, people-first content that is structured for maximum SEO impact.
      ### ANALYSIS PROCESS:
      1.  **Image Analysis & OCR**: Meticulously analyze the product image. Perform Optical Character Recognition (OCR) to extract ANY and ALL text visible on the product, its packaging, or its label. This text is crucial context.
      2.  **Input Synthesis**: Synthesize information from the image, OCR text, the provided "Product Title", and "User Keywords".
      3.  **Style Adherence**: You MUST adhere to the specified style profile.
      ### STYLE PROFILE:
      - **Output Language**: You MUST generate the entire output in ${languageMap[language as Language]}.
      - **Tone**: ${toneDescription}
      - **Target Audience**: Write for ${audienceDescription}.
      - **Brand Voice**: In addition to the tone and audience, apply this overarching brand voice: "${brandVoice}"
      ### CONTENT REQUIREMENTS:
      Based on your analysis, generate the following content structure. The content must be helpful, informative, and avoid keyword stuffing.
      1.  **headline**: A catchy, attention-grabbing headline (max 10-12 words).
      2.  **body**: An engaging and descriptive body of text (2-3 paragraphs). It must highlight key features and benefits derived from your analysis, and conclude with a strong call to action.
      3.  **meta_description**: A concise, compelling summary of the product, under 160 characters, optimized for search engine result pages (SERPs).
      4.  **feature_bullets**: A list of 3-5 key features or benefits as short, impactful bullet points. This is for Google Merchant Center and Rich Snippets.
      5.  **seo_keywords**: A list of 5-7 semantically relevant SEO keywords in the target language. Include a mix of short-tail and long-tail keywords.
      ### OUTPUT FORMAT:
      You MUST return the response ONLY in a valid JSON object that conforms to the provided schema. Do not include markdown formatting (like \`\`\`json), explanations, or any other text outside of the JSON object itself.
    `;
    const textPart = { text: prompt };
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        body: { type: Type.STRING },
        meta_description: { type: Type.STRING },
        feature_bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        seo_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["headline", "body", "meta_description", "feature_bullets", "seo_keywords"],
    };
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { role: 'user', parts: [imagePart, textPart] },
      config: { responseMimeType: 'application/json', responseSchema: responseSchema, temperature: 0.75, topP: 0.95 },
    });
    return JSON.parse(response.text.trim());
}

async function handleAnalyzeBrandVoice(ai: GoogleGenAI, payload: any) {
    const { textToAnalyze } = payload;
    const prompt = `Analyze the following text and describe its brand voice and tone in a concise, one-paragraph summary. This summary will be used as a system instruction for a copywriting AI. Focus on personality, style, and vocabulary. Text to analyze: "${textToAnalyze}"`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { role: 'user', parts: [{ text: prompt }] },
    });
    return { analyzedVoice: response.text };
}

async function handleGetSemanticKeywords(ai: GoogleGenAI, payload: any) {
    const { baseKeyword, language } = payload;
    const languageMap: Record<Language, string> = { en: 'English', sv: 'Swedish (Svenska)', es: 'Spanish (Español)', no: 'Norwegian (Norsk)', da: 'Danish (Dansk)', fi: 'Finnish (Suomi)' };
    const prompt = `You are an SEO expert. Based on the primary keyword "${baseKeyword}", generate a semantic cluster of 7-10 related long-tail and short-tail keywords in ${languageMap[language as Language]}. The keywords should be highly relevant for an e-commerce product page. Return ONLY a JSON array of strings.`;
    const responseSchema = { type: Type.ARRAY, items: { type: Type.STRING } };
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { role: 'user', parts: [{ text: prompt }] },
        config: { responseMimeType: 'application/json', responseSchema: responseSchema },
    });
    return JSON.parse(response.text.trim());
}

async function handleGenerateInfluencerContent(ai: GoogleGenAI, payload: any) {
    const { imageFile, postContext, language } = payload;
    const imagePart = { inlineData: { mimeType: imageFile.mimeType, data: imageFile.base64 } };
    const languageMap: Record<Language, string> = { en: 'English', sv: 'Swedish (Svenska)', es: 'Spanish (Español)', no: 'Norwegian (Norsk)', da: 'Danish (Dansk)', fi: 'Finnish (Suomi)' };
    const prompt = `
      You are a world-class social media growth expert and content strategist for influencers. Your goal is to create content that maximizes reach, engagement, and follower growth.
      ### ANALYSIS PROCESS:
      1.  **Image Analysis**: Analyze the provided image for its mood, setting, objects, colors, and overall aesthetic.
      2.  **Context Synthesis**: Combine the image analysis with the user-provided context: "${postContext}".
      ### CONTENT REQUIREMENTS:
      Based on your analysis, generate the following content in ${languageMap[language as Language]}:
      1.  **bio**: A short, impactful, and updated bio (max 150 characters) that reflects the theme of this post. It should be concise and include a call-to-action or a personal statement.
      2.  **caption**: An engaging caption for the post. It should start with a strong hook, tell a short story or ask a question related to the image and context, and end with a clear call-to-engagement (e.g., "Comment below...", "Tag a friend who...").
      3.  **hashtags**: A list of 15-20 highly optimized hashtags. This list MUST include a mix of:
          - Broad, high-volume hashtags (e.g., #travel, #ootd).
          - Niche-specific hashtags (e.g., #coffeelovers, #minimaliststyle).
          - Engagement-focused hashtags (e.g., #photooftheday, #discoverunder10k).
      ### OUTPUT FORMAT:
      You MUST return the response ONLY in a valid JSON object that conforms to the provided schema. Do not include markdown formatting or any other text.
    `;
    const textPart = { text: prompt };
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        bio: { type: Type.STRING },
        caption: { type: Type.STRING },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["bio", "caption", "hashtags"],
    };
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { role: 'user', parts: [imagePart, textPart] },
      config: { responseMimeType: 'application/json', responseSchema: responseSchema, temperature: 0.8, topP: 0.95 },
    });
    return JSON.parse(response.text.trim());
}
