import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";
import { GENRE_DATA, SYSTEM_INSTRUCTION_BASE } from "../constants";

const getSystemInstruction = (state: AppState): string => {
  const selectedGenres = GENRE_DATA.filter(g => state.selectedGenres[g.id]);
  
  const genreDescriptions = selectedGenres.map(g => {
    const subs = state.selectedSubGenres[g.id];
    const subString = subs && subs.length > 0 ? ` including specifically: ${subs.join(', ')}` : '';
    return `${g.name}${subString}`;
  }).join('; ');

  return `${SYSTEM_INSTRUCTION_BASE}

## Specific Request Parameters
- **Time Period:** ${state.startYear} - ${state.endYear}
- **Target Genres:** ${genreDescriptions || "General Cinema"}
`;
};

export const generateFilmAnalysis = async (state: AppState): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing from environment variables.");
    throw new Error("API Key not found. Please ensure it is configured in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = getSystemInstruction(state);

  console.log("Generating analysis with model: gemini-3-flash-preview");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Please generate the film analysis based on the specified criteria and genres.",
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      }
    });
    
    // Check for response.text
    if (response && response.text) {
        return response.text;
    } else {
        console.warn("Response object received but text is missing/empty", response);
        throw new Error("The AI returned an empty response. Please try again.");
    }

  } catch (error: any) {
    console.error("Gemini API Error Full Details:", error);
    const errorMessage = error.message || error.toString();
    // Provide more user-friendly error messages for common issues
    if (errorMessage.includes("404")) {
       throw new Error("Model not found. The selected Gemini model may not be available in your region or API key tier.");
    }
    if (errorMessage.includes("429")) {
        throw new Error("Too many requests. Please wait a moment and try again.");
    }
    throw new Error(`Failed to generate analysis: ${errorMessage}`);
  }
};