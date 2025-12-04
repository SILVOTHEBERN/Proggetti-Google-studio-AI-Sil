import { GoogleGenAI, Type } from "@google/genai";
import { MappingConfig } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const autoDetectMapping = async (
  refHeaders: string[],
  targetHeaders: string[]
): Promise<Partial<MappingConfig>> => {
  try {
    const prompt = `
      I have two lists of headers from Excel files. 
      Reference File Headers: ${JSON.stringify(refHeaders)}
      Target File Headers: ${JSON.stringify(targetHeaders)}

      I need to match users between these files to find emails.
      1. Identify the 'Reference Match Column' (likely Name, Full Name, Cognome Nome, or similar unique ID) from the Reference headers.
      2. Identify the 'Reference Email Column' (contains Email, E-mail, mail) from the Reference headers.
      3. Identify the 'Target Match Column' (likely Name, Full Name, User) from the Target headers that corresponds to the Reference Match Column.

      Return null for any field you are not 80% confident about.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refMatchColumn: { type: Type.STRING, nullable: true },
            refEmailColumn: { type: Type.STRING, nullable: true },
            targetMatchColumn: { type: Type.STRING, nullable: true },
          },
        },
      },
    });

    if (response.text) {
        return JSON.parse(response.text) as Partial<MappingConfig>;
    }
    return {};
    
  } catch (error) {
    console.error("Gemini detection failed:", error);
    return {};
  }
};