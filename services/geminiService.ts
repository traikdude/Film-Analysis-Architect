import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";
import { GENRE_DATA, SYSTEM_INSTRUCTION_BASE } from "../constants";
import { ERIK_TASTE_PROFILE } from "../data/erikMovieData";

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

${ERIK_TASTE_PROFILE}
`;
};

export const generateFilmAnalysis = async (state: AppState): Promise<string> => {
  const userApiKey = localStorage.getItem('user_gemini_api_key');
  const apiKey = userApiKey || process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing from environment variables and localStorage.");
    throw new Error("API Key not found. Please set your Gemini API Key in the Settings panel.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = getSystemInstruction(state);

  console.log("Generating analysis with model: gemini-2.5-flash");

  const userPrompt = `Generate exactly 10 film recommendations as strict XML output.

CRITICAL RULES:
- ONLY recommend REAL, EXISTING films that have already been released and are available to watch. NO fictional, AI-invented, or future/unreleased movies.
- Output ONLY the XML blocks — no introductory text, no explanations, no markdown code fences, no trend analysis prose.
- Each film MUST be wrapped in <film_analysis> ... </film_analysis> tags.
- Do NOT use any XML sub-tags inside <title_block>. Use plain text lines only:
  Title: [Film Name]
  Year: [Year]
  Director: [Director Name]
  Classification: [Mainstream/Independent | Genre]
  Runtime: [Minutes]
  Image: 
  Trailer: https://www.youtube.com/results?search_query=[Film+Title+Trailer]
- Fill in ALL other XML tags: <rank>, <critical_overview>, <synopsis>, <artistic_merit>, <genre_analysis>, <cultural_impact>, <key_themes>, <technical_elements>.
- Start your response immediately with <film_analysis> — no preamble.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    // Check for response.text
    const rawText = response?.text ?? '';
    console.log("=== RAW GEMINI RESPONSE (first 2000 chars) ===", rawText.substring(0, 2000));
    
    if (rawText && rawText.trim().length > 0) {
        return rawText;
    } else {
        console.warn("Response object received but text is missing/empty", response);
        throw new Error("The AI returned an empty response. Please try again.");
    }

  } catch (error: any) {
    console.error("Gemini API Error Full Details:", error);
    const errorMessage = error.message || error.toString();
    
    // Provide user-friendly, actionable advice for key/quota failures
    if (errorMessage.toLowerCase().includes("leaked")) {
       throw new Error("API Key Leaked: This key has been blocked by Google for security. Please open the Settings panel (gear icon) and enter a new, valid Gemini API Key from Google AI Studio.");
    }
    if (errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429")) {
       throw new Error("API Key Restricted or Quota Exceeded: Your API key has 0 limits or has exceeded its rate limit. Please open the Settings panel (gear icon) and input a new Gemini API Key.");
    }
    if (errorMessage.includes("404")) {
       throw new Error("Model not found. The selected Gemini model may not be available in your region or API key tier.");
    }
    throw new Error(`Failed to generate analysis: ${errorMessage}`);
  }
};