import { GoogleGenAI } from "@google/genai";

// Safe initialization - if API key is missing, service functions will handle gracefully or mock
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateVideoDescription = async (title: string): Promise<string> => {
  if (!ai) return "Description générée automatiquement indisponible (Clé API manquante).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Génère une description courte, accrocheuse et optimisée pour le SEO (en français) pour une vidéo YouTube intitulée : "${title}". Inclus des hashtags pertinents à la fin.`,
    });
    return response.text || "Impossible de générer la description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erreur lors de la génération de la description.";
  }
};

export const generateVideoTags = async (title: string): Promise<string[]> => {
  if (!ai) return ["Vidéo", "NeoTube"];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Génère une liste de 5 tags séparés par des virgules pour une vidéo intitulée : "${title}". Ne donne que les mots clés.`,
    });
    const text = response.text || "";
    return text.split(',').map(t => t.trim());
  } catch (error) {
    return ["Erreur", "API"];
  }
};
