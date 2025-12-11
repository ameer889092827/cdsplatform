import { GoogleGenAI, Type } from "@google/genai";
import { PatientInput, DiagnosticResponse, Language } from "../types";

const SYSTEM_PROMPT = `
SYSTEM:
You are an Expert Clinical Diagnostic Board (Senior MD level). Your goal is to provide a comprehensive, deep, and highly detailed clinical analysis.

RULES FOR GENERATION:
1. **Breadth of Analysis**: You MUST generate at least 4-5 distinct Differential Diagnoses. Do not stop at the most obvious one. Consider rare but critical conditions.
2. **Depth of Mechanism**: In the 'mechanism' field, do not just repeat the disease name. Explain the *pathophysiology* specifically for this patient. (e.g., "Systemic vasodilation caused by sepsis leads to hypotension, while compensatory tachycardia attempts to maintain cardiac output...").
3. **Evidence-Based**: For every diagnosis, list specific lab values or symptoms from the input that support it.
4. **Clinical Logic**: Use the "Why" field to explain the reasoning like a professor teaching students.

OUTPUT STRUCTURE:
- **Summary**: A professional clinical synthesis (2-3 sentences).
- **Differential**: Sorted by probability. MUST include 4+ items.
- **Red Flags**: Immediate threats to life.

Handle unstructured text intelligently. If the user pastes raw lab text, extract every relevant parameter.
Format strictly JSON.
`;

export const analyzePatientData = async (data: PatientInput, language: Language): Promise<DiagnosticResponse> => {
  const ai = new GoogleGenAI({ apiKey: "AIzaSyAzPgLW8V0nLxAQLDZqTMYhF7ZPHBsvif0" });

  const prompt = `
  ${SYSTEM_PROMPT}

  USER:
  Analyze this patient case.
  
  LANGUAGE REQUIREMENT:
  Output the entire response in ${language === 'ru' ? 'RUSSIAN' : 'ENGLISH'}.
  - Diagnosis names must be standard medical terminology.
  - Explanations must be academic yet clear.
  
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
          type: Type.OBJECT,
          properties: {
            patient_id: { type: Type.STRING },
            timestamp: { type: Type.STRING },
            summary: { type: Type.STRING },
            differential: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  diagnosis: { type: Type.STRING },
                  probability: { type: Type.NUMBER, description: "Float between 0 and 1" },
                  confidence: { type: Type.STRING, enum: ["low", "medium", "high"] },
                  evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                  mechanism: { type: Type.STRING, description: "Detailed pathophysiological step-by-step chain" },
                  why: { type: Type.STRING, description: "Clinical reasoning: why this fits and others dont" }
                },
                required: ["diagnosis", "probability", "confidence", "evidence", "mechanism", "why"]
              }
            },
            recommended_tests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  test: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
                  rationale: { type: Type.STRING }
                },
                required: ["test", "priority", "rationale"]
              }
            },
            immediate_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            clarifying_questions: { type: Type.ARRAY, items: { type: Type.STRING } },
            red_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanatory_note: { type: Type.STRING },
            references: { type: Type.ARRAY, items: { type: Type.STRING } },
            overall_confidence: { type: Type.STRING, enum: ["low", "medium", "high"] }
          },
          required: [
            "patient_id", 
            "differential", 
            "recommended_tests", 
            "immediate_actions",
            "clarifying_questions",
            "red_flags", 
            "references",
            "overall_confidence", 
            "summary",
            "explanatory_note"
          ]
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