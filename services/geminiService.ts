import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';
const TEXT_MODEL_NAME = 'gemini-2.5-flash';

export interface GenerationResult {
  image?: string; // Base64 data
  error?: string;
  optimizedPrompt?: string;
}

/**
 * Uses a text model to rewrite and optimize the user's prompt for better image generation results.
 * Especially useful for expanding short Chinese prompts into detailed descriptions.
 */
export const optimizePrompt = async (originalPrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: {
        parts: [{ 
          text: `You are an expert prompt engineer for AI image generation. 
          Your task is to rewrite the user's input into a highly detailed, creative, and descriptive prompt optimized for the Gemini image generation model. 
          
          Guidelines:
          1. Keep the language of the prompt in Chinese (Simplified).
          2. Focus on visual details: lighting, composition, artistic style, texture, and mood.
          3. Expansion: If the input is simple (e.g., "banana"), expand it into a full scene.
          4. Output ONLY the raw optimized prompt text, no explanations.

          User Input: "${originalPrompt}"` 
        }]
      }
    });

    return response.text?.trim() || originalPrompt;
  } catch (error) {
    console.error("Prompt Optimization Error:", error);
    return originalPrompt; // Fallback to original if optimization fails
  }
};

export const generateImageFromText = async (prompt: string): Promise<GenerationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // Image generation specific config can go here if needed in future
      }
    });

    return processResponse(response);
  } catch (error: any) {
    console.error("Text-to-Image Error:", error);
    return { error: error.message || "图片生成失败。" };
  }
};

export const generateImageFromImage = async (prompt: string, base64Image: string, mimeType: string = 'image/png'): Promise<GenerationResult> => {
  try {
    // Remove header if present (e.g., "data:image/png;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [
          {
            text: prompt
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          }
        ]
      }
    });

    return processResponse(response);
  } catch (error: any) {
    console.error("Image-to-Image Error:", error);
    return { error: error.message || "图片重绘失败。" };
  }
};

// Helper to extract image from response
const processResponse = (response: any): GenerationResult => {
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    return { error: "未返回任何候选结果。" };
  }

  const content = candidates[0].content;
  if (!content || !content.parts) {
    return { error: "未找到内容部分。" };
  }

  // Iterate parts to find the image
  for (const part of content.parts) {
    if (part.inlineData) {
      return { image: `data:image/png;base64,${part.inlineData.data}` };
    }
  }
  
  // If no image, check if there's text (error message from model)
  if (content.parts[0]?.text) {
     return { error: `生成失败: ${content.parts[0].text}` };
  }

  return { error: "响应中未找到图片数据。模型可能只返回了文本。" };
};