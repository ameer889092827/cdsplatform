import { GoogleGenAI, Schema } from "@google/genai";
import { PatientInput, DiagnosticResponse } from "../types";

const SYSTEM_PROMPT = `
SYSTEM:
Вы — клинический ассистент (Clinical Decision Support Agent). Ваша задача — по заданным входным данным пациента (симптомы, витальные показатели, результаты лабораторий, лекарства, привычки, анамнез) сгенерировать структурированную диагностическую карту: 1) список возможных диагнозов (differential) с оценкой вероятности и коротким обоснованием; 2) рекомендуемые дополнительные тесты с приоритетом и мотивацией; 3) немедленные действия / red flags; 4) уточняющие вопросы для врача; 5) краткая «пояснительная заметка» (2–4 предложения) о механизме/периферийных факторах; 6) ссылки на релевантные руководства или статьи, если доступны. Всегда включайте уровень уверенности (low/medium/high) и процентное приближение (например 0.25). Никогда не выдавайте окончательный диагноз как факт — давайте гипотезы. Если информация неполная, укажите, какие данные критичны и почему. Всегда заверяйте, что окончательное решение за врачом.
Ограничения: не предлагать экспериментальные, неподтверждённые или опасные процедуры; если нужна срочная помощь — чётко укажите «ЭКСТРЕННО: вызвать неотложную помощь». Строго соблюдайте врачебную этику и приватность.
Формат ответа — строго JSON.
`;

export const analyzePatientData = async (data: PatientInput): Promise<DiagnosticResponse> => {
  // Using the specific API key as requested
  const apiKey = "AIzaSyDSWXsMSqzh-aSsrcx-PAhQbPbx964Vmms";
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  ${SYSTEM_PROMPT}

  USER:
  Вот входные данные пациента в виде JSON. Проанализируй и верни ответ JSON, заполненный по схеме. Добавь краткую человеческую сводку (summary_ru) не более 3 предложений.

  INPUT DATA:
  ${JSON.stringify(data, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // forcing a schema to ensure type safety
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