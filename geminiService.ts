
import { GoogleGenAI, Type } from "@google/genai";
import { ExhibitData, UserInput } from "./types";

export const generateExhibitData = async (input: UserInput): Promise<ExhibitData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    あなたは動物園のユニークな解説看板を書くプロの飼育員です。
    以下のユーザー情報から、ユーモア溢れる「動物解説看板」のデータを生成してください。
    
    入力情報:
    展示名（名前）: ${input.name}
    生態的特徴（趣味・特技）: ${input.hobby}
    最近の行動（悩み・近況）: ${input.worry}
    
    要件:
    - scientificName: ラテン語風の面白い学名（例: Homo sapiens tanaka）
    - dangerLevel: 星5満点の危険度（★の絵文字を使用）
    - classification: 面白い分類（例：夜型目 〆切科）
    - description: 飼育員視点での客観的かつユーモラスな解説。200文字程度。
    - funFact: 意外な豆知識。
    - stats: 0-100の数値（stamina, intelligence, laziness, charm）。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scientificName: { type: Type.STRING },
          dangerLevel: { type: Type.STRING },
          classification: { type: Type.STRING },
          description: { type: Type.STRING },
          funFact: { type: Type.STRING },
          stats: {
            type: Type.OBJECT,
            properties: {
              stamina: { type: Type.NUMBER },
              intelligence: { type: Type.NUMBER },
              laziness: { type: Type.NUMBER },
              charm: { type: Type.NUMBER }
            },
            required: ["stamina", "intelligence", "laziness", "charm"]
          }
        },
        required: ["scientificName", "dangerLevel", "classification", "description", "funFact", "stats"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("API returned an empty response.");
  
  return JSON.parse(text) as ExhibitData;
};
