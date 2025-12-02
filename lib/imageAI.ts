// Advanced AI Image Generation Service - Market's Best Image Generator
// Supports: OpenAI DALL-E 3, Flux, Ideogram 2.0, Stable Diffusion XL, Replicate
// Features: Image editing, upscaling, background removal, face restore, style transfer

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  revisedPrompt?: string;
  generationTime?: number;
  provider?: string;
  seed?: number;
}

export interface ImageGenerationOptions {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  quality?: 'standard' | 'hd';
  provider?: 'openai' | 'stability' | 'replicate' | 'flux' | 'ideogram';
  negativePrompt?: string;
  seed?: number;
  guidanceScale?: number;
  steps?: number;
}

export interface ImageEditOptions {
  imageUrl: string;
  prompt: string;
  maskUrl?: string;
  operation: 'inpaint' | 'outpaint' | 'upscale' | 'variation' | 'style-transfer' | 'background-remove' | 'face-restore';
}

// Aspect ratio to size mapping for DALL-E
const DALLE_SIZES: Record<string, string> = {
  '1:1': '1024x1024',
  '16:9': '1792x1024',
  '9:16': '1024x1792',
  '4:5': '1024x1024',
  '2:3': '1024x1792',
  '3:2': '1792x1024',
  '21:9': '1792x1024',
};

// Platform-specific aspect ratio mappings
const ASPECT_RATIO_MAP: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '9:16': { width: 576, height: 1024 },
  '16:9': { width: 1024, height: 576 },
  '4:5': { width: 819, height: 1024 },
  '2:3': { width: 683, height: 1024 },
  '3:2': { width: 1024, height: 683 },
  '21:9': { width: 1024, height: 439 },
};

// Professional style enhancers
const STYLE_ENHANCERS: Record<string, string> = {
  // Social Media Optimized
  'instagram': 'Instagram-worthy aesthetic, perfectly composed, lifestyle photography, soft natural lighting, clean background, high engagement potential, influencer quality, cohesive feed aesthetic',
  'story': 'Vertical mobile-optimized composition, bold colors, attention-grabbing, social media story format, dynamic and engaging, trending style, swipe-up worthy',
  'youtube': 'YouTube thumbnail style, bold vibrant colors, high contrast, attention-grabbing composition, expressive, clear focal point, click-worthy, professional content creator quality',
  'tiktok': 'TikTok viral aesthetic, Gen-Z trendy, dynamic energy, bold colors, fast-paced vibe, trending content style, scroll-stopping, authentic and relatable',
  
  // Product & Commercial
  'product': 'Premium product photography, professional studio lighting, clean white background, e-commerce ready, high-end commercial quality, sharp details, luxury presentation',
  
  // Lifestyle & Content
  'lifestyle': 'Authentic lifestyle photography, candid moment, warm natural lighting, aspirational but relatable, everyday luxury, curated aesthetic, storytelling composition',
  'flatlay': 'Professional flat lay composition, perfectly arranged objects, overhead shot, balanced spacing, cohesive color palette, styled props, magazine-worthy arrangement',
  
  // Portrait Styles
  'portrait': 'Professional portrait photography, soft flattering lighting, shallow depth of field, natural skin tones, editorial quality, confident expression, magazine cover worthy',
  
  // Artistic Styles
  'minimalist': 'Minimalist aesthetic, clean lines, negative space, simple elegance, less is more, sophisticated simplicity, Scandinavian design influence',
  'vibrant': 'Bold vibrant colors, high saturation, energetic composition, joyful atmosphere, color-blocked elements, playful yet professional, festival vibes',
  'dark': 'Moody dark aesthetic, dramatic lighting, rich shadows, cinematic atmosphere, mysterious ambiance, noir influence, premium feel',
  'bright': 'Bright airy aesthetic, high-key lighting, soft pastel tones, fresh and clean, optimistic mood, spring/summer vibes, light and breezy',
  
  // Cinematic & Artistic
  'cinematic': 'Cinematic composition, film-like quality, dramatic lighting, movie still aesthetic, 35mm film grain, anamorphic lens flare, director\'s vision',
  'anime': 'High-quality anime art style, detailed illustration, vibrant colors, dynamic pose, professional manga artist quality, trending on ArtStation',
  'watercolor': 'Delicate watercolor painting style, soft color bleeding, artistic texture, traditional art medium, gallery-worthy fine art',
  '3d': 'Professional 3D render, Octane render quality, volumetric lighting, ray tracing, hyperrealistic materials, Blender/Cinema4D aesthetic',
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
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const styleEnhancer = STYLE_ENHANCERS[style] || '';
  
  if (!apiKey) {
    // Fallback to basic enhancement
    return `${prompt}, ${styleEnhancer}, professional quality, high resolution, masterful composition`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert prompt engineer for AI image generation. Transform user descriptions into detailed, optimized prompts that produce stunning results.
            
Rules:
- Keep the original intent but add professional photography/art terminology
- Include lighting, composition, and atmosphere details
- Add relevant style keywords based on: ${style}
- Make it specific but not overly long (max 200 words)
- Never include text like "create an image of" - just describe the scene
- Output ONLY the enhanced prompt, nothing else`
          },
          {
            role: 'user',
            content: `Enhance this image prompt for ${style} style: "${prompt}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      return `${prompt}, ${styleEnhancer}, professional quality, high resolution`;
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch {
    return `${prompt}, ${styleEnhancer}, professional quality, high resolution`;
  }
}

// ============================================
// ADVANCED IMAGE EDITING FEATURES
// ============================================

/**
 * Remove background from image
 */
export async function removeBackground(imageUrl: string): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_REPLICATE_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Replicate API key required for background removal' };
  }

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`
      },
      body: JSON.stringify({
        version: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
        input: { image: imageUrl }
      })
    });

    if (!response.ok) {
      return { success: false, error: 'Background removal API error' };
    }

    const prediction = await response.json();
    const result = await pollReplicatePrediction(prediction.id, apiKey);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Background removal failed'
    };
  }
}

/**
 * Upscale image (4x) with AI enhancement
 */
export async function upscaleImage(imageUrl: string): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_REPLICATE_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Replicate API key required for upscaling' };
  }

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`
      },
      body: JSON.stringify({
        version: '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
        input: {
          image: imageUrl,
          scale: 4,
          face_enhance: true
        }
      })
    });

    if (!response.ok) {
      return { success: false, error: 'Upscale API error' };
    }

    const prediction = await response.json();
    const result = await pollReplicatePrediction(prediction.id, apiKey);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upscaling failed'
    };
  }
}

/**
 * Face restoration / enhancement
 */
export async function restoreFace(imageUrl: string): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_REPLICATE_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Replicate API key required for face restoration' };
  }

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`
      },
      body: JSON.stringify({
        version: '9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3',
        input: {
          img: imageUrl,
          version: 'v1.4',
          scale: 2
        }
      })
    });

    if (!response.ok) {
      return { success: false, error: 'Face restoration API error' };
    }

    const prediction = await response.json();
    const result = await pollReplicatePrediction(prediction.id, apiKey);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Face restoration failed'
    };
  }
}

/**
 * Generate image variation based on existing image
 */
export async function generateVariation(imageUrl: string, prompt: string): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_REPLICATE_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Replicate API key required for variations' };
  }

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`
      },
      body: JSON.stringify({
        version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        input: {
          image: imageUrl,
          prompt: prompt,
          strength: 0.7,
          num_outputs: 1
        }
      })
    });

    if (!response.ok) {
      return { success: false, error: 'Variation API error' };
    }

    const prediction = await response.json();
    const result = await pollReplicatePrediction(prediction.id, apiKey);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Variation generation failed'
    };
  }
}

/**
 * Style transfer - apply artistic style to image
 */
export async function styleTransfer(contentImage: string, stylePrompt: string): Promise<ImageGenerationResult> {
  const apiKey = import.meta.env.VITE_REPLICATE_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Replicate API key required for style transfer' };
  }

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`
      },
      body: JSON.stringify({
        version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        input: {
          image: contentImage,
          prompt: stylePrompt,
          strength: 0.85,
          guidance_scale: 7.5
        }
      })
    });

    if (!response.ok) {
      return { success: false, error: 'Style transfer API error' };
    }

    const prediction = await response.json();
    const result = await pollReplicatePrediction(prediction.id, apiKey);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Style transfer failed'
    };
  }
}

// Export all editing utilities
export const imageUtils = {
  enhancePromptWithAI,
  removeBackground,
  upscaleImage,
  restoreFace,
  generateVariation,
  styleTransfer,
};

export default {
  generateImage,
  ...imageUtils
};
