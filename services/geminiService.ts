import { GoogleGenAI } from "@google/genai";
import { PatientInput, DiagnosticResponse } from "../types";

const SYSTEM_PROMPT = `
SYSTEM:
Вы — элитный медицинский ИИ-консультант (Clinical Decision Support). Ваша цель — глубокий клинический синтез.
Входные данные могут содержать анализы в свободном текстовом формате (копипаст) — ты должен их корректно интерпретировать.

Твоя задача сгенерировать ДИАГНОСТИЧЕСКУЮ КАРТУ. Для каждого диагноза ты должен объяснить не только "почему это подходит", но и "МЕХАНИЗМ" (патофизиология: как именно симптомы и анализы ведут к этому состоянию).

Структура анализа:
1. **Differential**: Список гипотез. Поле 'mechanism' должно объяснять причинно-следственную связь (causality).
2. **Recommended Tests**: Только то, что реально изменит тактику.
3. **Red Flags**: Критические состояния.
4. **Summary**: Краткая выжимка ситуации врача.

Формат строго JSON.
`;

export const analyzePatientData = async (data: PatientInput): Promise<DiagnosticResponse> => {
  const apiKey = "AIzaSyDSWXsMSqzh-aSsrcx-PAhQbPbx964Vmms";
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  ${SYSTEM_PROMPT}

  USER:
  Проанализируй этого пациента. Лабораторные данные переданы текстом — извлеки из них смысл.
  
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
            summary_ru: { type: "STRING" as any },
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
          required: ["patient_id", "differential", "recommended_tests", "red_flags", "overall_confidence"]
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