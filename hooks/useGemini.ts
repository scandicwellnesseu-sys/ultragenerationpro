
import { useState, useCallback } from 'react';
import { GeneratedDescription, ImageFile, Language, GeneratedInfluencerContent } from '../types';
import { useAppContext } from '../context/AppContext';

// API endpoint for the serverless function
const API_URL = '/api/generate';

// Helper to make API calls to the serverless function
async function apiCall(action: string, payload: object) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'An unknown server error occurred.');
    }
    return data;
}


export const useGemini = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToHistory } = useAppContext();

  const generateDescription = useCallback(
    async (
      imageFile: ImageFile,
      productTitle: string,
      keywords: string,
      brandVoice: string,
      language: Language,
      tone: string,
      audience: string
    ): Promise<GeneratedDescription | null> => {
      setLoading(true);
      setError(null);

      try {
        const payload = { imageFile, productTitle, keywords, brandVoice, language, tone, audience };
        const data = await apiCall('generateDescription', payload);
        
        const parsedJson = data as GeneratedDescription;
        addToHistory({ productTitle, keywords, description: parsedJson, language, tone, audience });
        setLoading(false);
        return parsedJson;

      } catch (e: any) {
        console.error("API call failed:", e);
        const errorMessage = e.message || "An unknown error occurred while generating the description.";
        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    [addToHistory]
  );

  const analyzeBrandVoice = useCallback(async (textToAnalyze: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
        const data = await apiCall('analyzeBrandVoice', { textToAnalyze });
        setLoading(false);
        return data.analyzedVoice;
    } catch (e: any) {
        console.error("Brand voice analysis failed:", e);
        const errorMessage = e.message || "An unknown error occurred during analysis.";
        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
    }
  }, []);

  const getSemanticKeywords = useCallback(async (baseKeyword: string, language: Language): Promise<string[] | null> => {
    setLoading(true);
    setError(null);
    try {
        const data = await apiCall('getSemanticKeywords', { baseKeyword, language });
        setLoading(false);
        return data as string[];
    } catch (e: any) {
        console.error("Semantic keyword generation failed:", e);
        const errorMessage = e.message || "An unknown error occurred during keyword analysis.";
        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
    }
  }, []);

  const generateInfluencerContent = useCallback(async (imageFile: ImageFile, postContext: string, language: Language): Promise<GeneratedInfluencerContent | null> => {
    setLoading(true);
    setError(null);
    try {
        const payload = { imageFile, postContext, language };
        const data = await apiCall('generateInfluencerContent', payload);
        setLoading(false);
        return data as GeneratedInfluencerContent;
    } catch (e: any) {
        console.error("Influencer content generation failed:", e);
        const errorMessage = e.message || "An unknown error occurred during influencer content generation.";
        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
    }
  }, []);

  return { generateDescription, analyzeBrandVoice, getSemanticKeywords, generateInfluencerContent, loading, error };
};
