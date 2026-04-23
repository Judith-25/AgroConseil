import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface AdviceRequest {
  type: 'disease_prevention' | 'planting' | 'harvest' | 'storage';
  crop: string;
  location: string;
  weather: any;
  language: string;
  userName?: string;
}

export async function getAgriculturalAdvice(req: AdviceRequest) {
  const model = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `Tu es un expert consultant agricole international spécialisé dans les terroirs de l'Afrique de l'Ouest. 
      L'utilisateur s'appelle ${req.userName || 'Agriculteur'}. Adresse-toi à lui par son prénom de manière chaleureuse.
      
      IMPORTANT: L'utilisateur se trouve actuellement aux coordonnées GPS : ${req.location}. 
      Utilise ta connaissance géographique pour identifier précisément le pays, la région et le climat local (ex: zone sahélienne, zone forestière tropicale, etc.) correspondant à ces coordonnées.
      
      Fournis des conseils spécifiques et fiables en ${req.language}. 
      Type de conseil demandé: ${req.type}. 
      Culture concernée: ${req.crop}.
      Contexte météorologique en temps réel: ${JSON.stringify(req.weather)}.
      
      Tes conseils doivent être adaptés au sol et aux pratiques agricoles réelles de cet emplacement géographique spécifique. 
      Inclus des conseils pour prévenir les maladies locales, optimiser la récolte et des méthodes de stockage durables pour que les produits restent frais plus longtemps.
      Utilise un langage simple, pédagogique et respectueux.`
    },
    contents: `Basé sur ma position actuelle (${req.location}), donne moi des conseils d'expert pour ma culture de ${req.crop} concernant : ${req.type}.`
  });

  return model.text;
}
