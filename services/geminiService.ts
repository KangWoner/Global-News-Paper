import { GoogleGenAI, Type, GenerateContentResponse, GenerateImagesResponse } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_TEXT = 'gemini-2.5-flash';
const MODEL_IMAGE = 'imagen-4.0-generate-001';

/**
 * A utility function to automatically retry a failing API call with exponential backoff.
 * This makes the application more resilient to transient server-side errors (e.g., 500, 503).
 * @param apiCall The async function to call.
 * @param maxRetries The maximum number of retries.
 * @param initialDelay The initial delay in ms before the first retry.
 * @returns The result of the successful API call.
 */
const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        console.error(`API call failed after ${maxRetries} attempts.`, error);
        throw error;
      }
      console.warn(`API call failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Double the delay for the next attempt (exponential backoff)
    }
  }
  // This line should theoretically be unreachable
  throw new Error('Retry logic failed unexpectedly.');
};


const parseJsonFromMarkdown = <T,>(text: string): T | null => {
  if (typeof text !== 'string' || !text.trim()) {
    console.error("parseJsonFromMarkdown received invalid or empty input:", text);
    return null;
  }
  try {
    const jsonString = text.replace(/^```json\s*|```$/g, '');
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    console.error("Original text:", text);
    // Fallback for cases where the model doesn't use markdown
    try {
        return JSON.parse(text) as T;
    } catch (parseError) {
        console.error("Failed to parse raw text as JSON:", parseError);
        return null;
    }
  }
};

export const generateBannerImagePrompt = async (topic: string): Promise<string> => {
  const prompt = `
    You are an expert image prompt engineer. Your task is to create a safe, abstract, and visually compelling image prompt for a news banner. The prompt should symbolically represent the core themes of the user's news topic, avoiding direct depictions of specific people, controversial events, or logos. Focus on creating a high-quality, professional, and neutral image that is suitable for a global news report.

    The final prompt should be a detailed description for an image generation model.

    User's News Topic:
    ---
    ${topic}
    ---

    Generate an abstract and symbolic image prompt.
    IMPORTANT NOTE: Start directly with the output. Do not output any delimiters.
    Output:
  `;
  // FIX: Explicitly type the response from withRetry to ensure correct type inference.
  const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: MODEL_TEXT,
    contents: prompt,
  }));
  if (!response.text || response.text.trim() === '') {
    throw new Error("The AI failed to generate a banner image prompt. The response was empty.");
  }
  return response.text;
};

export const generateImage = async (prompt: string): Promise<string> => {
  // FIX: Explicitly type the response from withRetry to ensure correct type inference.
  const response = await withRetry<GenerateImagesResponse>(() => ai.models.generateImages({
    model: MODEL_IMAGE,
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '16:9',
    },
  }));
  
  if (!response.generatedImages || response.generatedImages.length === 0 || !response.generatedImages[0].image) {
    throw new Error("Failed to generate banner image. The request may have been blocked due to safety policies or other issues.");
  }
  
  return response.generatedImages[0].image.imageBytes;
};

export const generateFlagsForCountries = async (countries: string[]): Promise<string[]> => {
    const imagePromises = countries.map(country => {
        const prompt = `A photorealistic, high-resolution image of the national flag of ${country}.`;
        // FIX: Explicitly type the response from withRetry to ensure correct type inference.
        return withRetry<GenerateImagesResponse>(() => ai.models.generateImages({
            model: MODEL_IMAGE,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '4:3',
            },
        })).then(res => {
          if (!res.generatedImages || res.generatedImages.length === 0 || !res.generatedImages[0].image) {
            throw new Error(`Failed to generate flag image for ${country}. The request may have been blocked by safety policies.`);
          }
          return res.generatedImages[0].image.imageBytes;
        })
    });
    return Promise.all(imagePromises);
};

export const conductResearchForCountry = async (topic: string, country: string): Promise<{ report: string, sources: { uri: string, title: string }[] }> => {
    const prompt = `
    As an expert news researcher, perform an in-depth, web-powered investigation on the topic of "${topic}" specifically within ${country}. Find exactly 5 recent, relevant news articles. Synthesize the findings from these articles into a concise, detailed, and well-structured report.
    `;
    // FIX: Explicitly type the response from withRetry to ensure correct type inference.
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    }));
    if (!response.text || response.text.trim() === '') {
      throw new Error(`The AI failed to conduct research for ${country}. The response was empty.`);
    }

    const report = response.text;
    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    // Explicitly type the accumulator in reduce to prevent 'any' type issues
    const sources = rawSources.reduce((acc: { uri: string, title: string }[], chunk: any) => {
        if (chunk.web && chunk.web.uri && chunk.web.title) {
            acc.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
        return acc;
    }, []);

    return { report, sources };
};

export const translateResearch = async (report: string, languageName: string): Promise<string> => {
    const prompt = `
    Your task is to translate a comprehensive news report into ${languageName}, ensuring the output is the full, accurate translated text of the report.
    
    # Step by Step Instructions
    1. Read the provided Conduct Deep Research report carefully.
    2. Translate the entire Conduct Deep Research report into ${languageName}.
    3. Ensure the translation is accurate and fluent.
    
    Conduct Deep Research:
    ---
    ${report}
    ---
    
    IMPORTANT NOTE: Start directly with the output, do not output any delimiters.
    Output:
    `;
    // FIX: Explicitly type the response from withRetry to ensure correct type inference.
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
    }));
    if (!response.text || response.text.trim() === '') {
      throw new Error(`The AI failed to translate the report to ${languageName}. The response was empty.`);
    }
    return response.text;
};