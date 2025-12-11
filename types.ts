export interface PatientInput {
  patient_id: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  symptoms: string[];
  vitals: {
    bp?: string;
    hr?: string;
    temp?: string;
    spo2?: string;
    rr?: string;
  };
  lab_text: string; // Changed from array object to simple string block
  meds: string[];
  habits: {
    smoking?: boolean;
    alcohol?: boolean;
    diet?: string;
    other?: string;
  };
  history_notes: string;
}

export interface DifferentialDiagnosis {
  diagnosis: string;
  probability: number;
  confidence: 'low' | 'medium' | 'high';
  evidence: string[];
  mechanism: string; // Added to explain "Why it happens"
  why: string;
}

export interface RecommendedTest {
  test: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
}

export interface DiagnosticResponse {
  patient_id: string;
  timestamp: string;
  summary_ru: string;
  differential: DifferentialDiagnosis[];
  recommended_tests: RecommendedTest[];
  immediate_actions: string[];
  clarifying_questions: string[];
  red_flags: string[];
  explanatory_note: string;
  references: string[];
  overall_confidence: 'low' | 'medium' | 'high';
}