// AI Image Generation Service
// Supports: OpenAI DALL-E 3, Stable Diffusion, Replicate, Flux, Ideogram

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  revisedPrompt?: string;
}

export interface ImageGenerationOptions {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  quality?: 'standard' | 'hd';
  provider?: 'openai' | 'stability' | 'replicate' | 'flux' | 'ideogram';
}

// Aspect ratio to size mapping for DALL-E
const DALLE_SIZES: Record<string, string> = {
  '1:1': '1024x1024',
  '16:9': '1792x1024',
  '9:16': '1024x1792',
  '4:5': '1024x1024', // DALL-E doesn't support 4:5, use closest
  '2:3': '1024x1792', // Use portrait
};

// Style enhancers for better results
const STYLE_ENHANCERS: Record<string, string> = {
  'instagram': 'professional Instagram photography style, high quality, aesthetic, trending on Instagram',
  'story': 'vertical mobile format, Instagram story style, eye-catching, vibrant',
  'youtube': 'YouTube thumbnail style, bold, eye-catching, high contrast, professional',
  'tiktok': 'TikTok viral content style, trendy, Gen-Z aesthetic, engaging',
  'product': 'professional product photography, studio lighting, clean background, commercial quality',
  'lifestyle': 'lifestyle photography, natural lighting, authentic, aspirational',
  'flatlay': 'flat lay photography, top-down view, organized aesthetic, Instagram flat lay style',
  'portrait': 'professional portrait photography, beautiful lighting, shallow depth of field',
  'minimalist': 'minimalist style, clean, simple, lots of white space, modern',
  'vibrant': 'vibrant colors, bold, colorful, eye-catching, saturated',
  'dark': 'dark moody aesthetic, dramatic lighting, cinematic, atmospheric',
  'bright': 'bright and airy, light and fresh, soft pastel tones, clean aesthetic',
};

/**
 * Generate image using OpenAI DALL-E 3
 */
export async function generateWithDallE(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'OpenAI API-nyckel saknas. Lägg till VITE_OPENAI_API_KEY i .env' };
  }

  try {
    const styleEnhancer = options.style ? STYLE_ENHANCERS[options.style] || '' : '';
    const enhancedPrompt = `${options.prompt}. ${styleEnhancer}`.trim();
    const size = DALLE_SIZES[options.aspectRatio || '1:1'] || '1024x1024';

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: options.quality || 'standard',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.error?.message || 'Kunde inte generera bild med DALL-E' 
      };
    }

    const data = await response.json();
    return {
      success: true,
      imageUrl: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt,
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ett oväntat fel inträffade' 
    };
  }
}

/**
 * Generate image using Stability AI (Stable Diffusion)
 */
export async function generateWithStability(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Stability API-nyckel saknas. Lägg till VITE_STABILITY_API_KEY i .env' };
  }

  try {
    const styleEnhancer = options.style ? STYLE_ENHANCERS[options.style] || '' : '';
    const enhancedPrompt = `${options.prompt}. ${styleEnhancer}`.trim();

    // Map aspect ratio to width/height
    const dimensions = getStabilityDimensions(options.aspectRatio || '1:1');

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          { text: enhancedPrompt, weight: 1 },
          { text: 'blurry, bad quality, distorted, ugly, deformed', weight: -1 },
        ],
        cfg_scale: 7,
        width: dimensions.width,
        height: dimensions.height,
        steps: 30,
        samples: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.message || 'Kunde inte generera bild med Stable Diffusion' 
      };
    }

    const data = await response.json();
    const base64Image = data.artifacts[0].base64;
    
    return {
      success: true,
      imageUrl: `data:image/png;base64,${base64Image}`,
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ett oväntat fel inträffade' 
    };
  }
}

/**
 * Generate image using Replicate (multiple models available)
 */
export async function generateWithReplicate(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_REPLICATE_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Replicate API-nyckel saknas. Lägg till VITE_REPLICATE_API_KEY i .env' };
  }

  try {
    const styleEnhancer = options.style ? STYLE_ENHANCERS[options.style] || '' : '';
    const enhancedPrompt = `${options.prompt}. ${styleEnhancer}`.trim();
    const dimensions = getStabilityDimensions(options.aspectRatio || '1:1');

    // Using SDXL model on Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version: 'da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf', // SDXL
        input: {
          prompt: enhancedPrompt,
          negative_prompt: 'blurry, bad quality, distorted, ugly, deformed',
          width: dimensions.width,
          height: dimensions.height,
          num_outputs: 1,
          scheduler: 'K_EULER',
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.detail || 'Kunde inte starta bildgenerering' 
      };
    }

    const prediction = await response.json();
    
    // Poll for completion
    const result = await pollReplicatePrediction(prediction.id, apiKey);
    return result;
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ett oväntat fel inträffade' 
    };
  }
}

async function pollReplicatePrediction(predictionId: string, apiKey: string): Promise<ImageGenerationResult> {
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { 'Authorization': `Token ${apiKey}` },
    });

    const prediction = await response.json();

    if (prediction.status === 'succeeded') {
      return {
        success: true,
        imageUrl: prediction.output[0],
      };
    } else if (prediction.status === 'failed') {
      return {
        success: false,
        error: prediction.error || 'Bildgenerering misslyckades',
      };
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  return { success: false, error: 'Timeout - bildgenerering tog för lång tid' };
}

function getStabilityDimensions(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case '1:1': return { width: 1024, height: 1024 };
    case '16:9': return { width: 1344, height: 768 };
    case '9:16': return { width: 768, height: 1344 };
    case '4:5': return { width: 896, height: 1152 };
    case '2:3': return { width: 832, height: 1216 };
    default: return { width: 1024, height: 1024 };
  }
}

/**
 * Main function to generate image with selected provider
 */
export async function generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const provider = options.provider || 'openai';

  switch (provider) {
    case 'openai':
      return generateWithDallE(options);
    case 'stability':
      return generateWithStability(options);
    case 'replicate':
      return generateWithReplicate(options);
    case 'flux':
      return generateWithFlux(options);
    case 'ideogram':
      return generateWithIdeogram(options);
    default:
      return { success: false, error: 'Okänd bildgenereringsprovider' };
  }
}

/**
 * Generate image using Flux (via Replicate) - Fastest & trending
 */
export async function generateWithFlux(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_REPLICATE_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Replicate API-nyckel saknas för Flux. Lägg till VITE_REPLICATE_API_KEY i .env' };
  }

  try {
    const styleEnhancer = options.style ? STYLE_ENHANCERS[options.style] || '' : '';
    const enhancedPrompt = `${options.prompt}. ${styleEnhancer}`.trim();
    
    // Map aspect ratio for Flux
    const aspectRatioMap: Record<string, string> = {
      '1:1': '1:1',
      '16:9': '16:9',
      '9:16': '9:16',
      '4:5': '4:5',
      '2:3': '2:3',
    };

    // Using Flux Schnell (fast) or Flux Pro
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version: 'f2ab8a5bfe79f02f0789a146cf5e73d2a4ff2684a98c2b303d1e1ff3814271db', // Flux Schnell
        input: {
          prompt: enhancedPrompt,
          aspect_ratio: aspectRatioMap[options.aspectRatio || '1:1'] || '1:1',
          num_outputs: 1,
          output_format: 'webp',
          output_quality: options.quality === 'hd' ? 100 : 80,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.detail || 'Kunde inte starta Flux bildgenerering' 
      };
    }

    const prediction = await response.json();
    const result = await pollReplicatePrediction(prediction.id, apiKey);
    return result;
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ett oväntat fel inträffade med Flux' 
    };
  }
}

/**
 * Generate image using Flux Pro (highest quality Flux)
 */
export async function generateWithFluxPro(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_REPLICATE_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Replicate API-nyckel saknas för Flux Pro. Lägg till VITE_REPLICATE_API_KEY i .env' };
  }

  try {
    const styleEnhancer = options.style ? STYLE_ENHANCERS[options.style] || '' : '';
    const enhancedPrompt = `${options.prompt}. ${styleEnhancer}`.trim();

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version: 'a]057fbc935c96e56e8d9eca507e3bdc1e0c41c94c7c8e0cd8e5a5f5e2e1c5d4a3', // Flux 1.1 Pro
        input: {
          prompt: enhancedPrompt,
          aspect_ratio: options.aspectRatio || '1:1',
          output_format: 'webp',
          output_quality: 100,
          safety_tolerance: 2,
          prompt_upsampling: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.detail || 'Kunde inte starta Flux Pro bildgenerering' 
      };
    }

    const prediction = await response.json();
    const result = await pollReplicatePrediction(prediction.id, apiKey);
    return result;
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ett oväntat fel inträffade med Flux Pro' 
    };
  }
}

/**
 * Generate image using Ideogram - Best for text in images
 */
export async function generateWithIdeogram(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_IDEOGRAM_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Ideogram API-nyckel saknas. Lägg till VITE_IDEOGRAM_API_KEY i .env' };
  }

  try {
    const styleEnhancer = options.style ? STYLE_ENHANCERS[options.style] || '' : '';
    const enhancedPrompt = `${options.prompt}. ${styleEnhancer}`.trim();
    
    // Map aspect ratio for Ideogram
    const aspectRatioMap: Record<string, string> = {
      '1:1': 'ASPECT_1_1',
      '16:9': 'ASPECT_16_9',
      '9:16': 'ASPECT_9_16',
      '4:5': 'ASPECT_4_5',
      '2:3': 'ASPECT_2_3',
    };

    const response = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify({
        image_request: {
          prompt: enhancedPrompt,
          aspect_ratio: aspectRatioMap[options.aspectRatio || '1:1'] || 'ASPECT_1_1',
          model: 'V_2', // Ideogram 2.0
          magic_prompt_option: 'AUTO', // Let Ideogram enhance the prompt
          style_type: getIdeogramStyle(options.style),
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.message || 'Kunde inte generera bild med Ideogram' 
      };
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return {
        success: true,
        imageUrl: data.data[0].url,
        revisedPrompt: data.data[0].prompt,
      };
    }
    
    return { success: false, error: 'Ingen bild returnerades från Ideogram' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ett oväntat fel inträffade med Ideogram' 
    };
  }
}

/**
 * Map our styles to Ideogram style types
 */
function getIdeogramStyle(style?: string): string {
  const styleMap: Record<string, string> = {
    'instagram': 'REALISTIC',
    'story': 'REALISTIC',
    'youtube': 'REALISTIC',
    'tiktok': 'REALISTIC',
    'product': 'REALISTIC',
    'lifestyle': 'REALISTIC',
    'flatlay': 'REALISTIC',
    'portrait': 'REALISTIC',
    'minimalist': 'DESIGN',
    'vibrant': 'REALISTIC',
    'dark': 'REALISTIC',
    'bright': 'REALISTIC',
  };
  return styleMap[style || ''] || 'AUTO';
}

/**
 * Enhance prompt using AI for better image results
 */
export async function enhancePromptWithAI(prompt: string, style: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    // Return original prompt if no API key
    return prompt;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Du är en expert på att skriva prompts för AI-bildgenerering. Förbättra följande prompt för att skapa en fantastisk ${style}-bild. Behåll användarens intention men lägg till detaljer om belysning, komposition och stil. Svara ENDAST med den förbättrade prompten, inget annat.

Originalp prompt: "${prompt}"

Förbättrad prompt:`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      }),
    });

    if (!response.ok) {
      return prompt;
    }

    const data = await response.json();
    const enhancedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    return enhancedPrompt || prompt;
  } catch {
    return prompt;
  }
}
