import { GoogleGenAI } from "@google/genai";
import { PatientInput, DiagnosticResponse, Language } from "../types";

const SYSTEM_PROMPT = `
SYSTEM:
You are an elite AI Medical Consultant (Clinical Decision Support). Your goal is deep clinical synthesis.
Input data includes unstructured lab text—you must interpret it correctly.

Your task is to generate a DIAGNOSTIC MAP. For each diagnosis, you must explain not just "why it fits", but the "MECHANISM" (pathophysiology: how exactly the symptoms and labs lead to this condition).

Analysis Structure:
1. **Differential**: List of hypotheses. 'mechanism' field must explain causality.
2. **Recommended Tests**: Only what will actually change tactics.
3. **Red Flags**: Critical conditions.
4. **Summary**: A concise summary for the doctor.

Format strictly JSON.
`;

export const analyzePatientData = async (data: PatientInput, language: Language): Promise<DiagnosticResponse> => {
  const apiKey = "AIzaSyDSWXsMSqzh-aSsrcx-PAhQbPbx964Vmms";
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  ${SYSTEM_PROMPT}

  USER:
  Analyze this patient. Lab data is passed as text—extract meaning from it.
  
  LANGUAGE REQUIREMENT:
  Output the entire response in ${language === 'ru' ? 'RUSSIAN' : 'ENGLISH'}.
  Translate all clinical terms, summaries, and explanations to ${language === 'ru' ? 'Russian' : 'English'}.
  
  INPUT DATA:
  ${JSON.stringify(data, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT" as any,
          properties: {
            patient_id: { type: "STRING" as any },
            timestamp: { type: "STRING" as any },
            summary: { type: "STRING" as any },
            differential: {
              type: "ARRAY" as any,
              items: {
                type: "OBJECT" as any,
                properties: {
                  diagnosis: { type: "STRING" as any },
                  probability: { type: "NUMBER" as any },
                  confidence: { type: "STRING" as any, enum: ["low", "medium", "high"] },
                  evidence: { type: "ARRAY" as any, items: { type: "STRING" as any } },
                  mechanism: { type: "STRING" as any, description: "Pathophysiological explanation of why this is happening" },
                  why: { type: "STRING" as any }
                }
              }
            },
            recommended_tests: {
              type: "ARRAY" as any,
              items: {
                type: "OBJECT" as any,
                properties: {
                  test: { type: "STRING" as any },
                  priority: { type: "STRING" as any, enum: ["high", "medium", "low"] },
                  rationale: { type: "STRING" as any }
                }
              }
            },
            immediate_actions: { type: "ARRAY" as any, items: { type: "STRING" as any } },
            clarifying_questions: { type: "ARRAY" as any, items: { type: "STRING" as any } },
            red_flags: { type: "ARRAY" as any, items: { type: "STRING" as any } },
            explanatory_note: { type: "STRING" as any },
            references: { type: "ARRAY" as any, items: { type: "STRING" as any } },
            overall_confidence: { type: "STRING" as any, enum: ["low", "medium", "high"] }
          },
          required: ["patient_id", "differential", "recommended_tests", "red_flags", "overall_confidence", "summary"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(response.text) as DiagnosticResponse;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};