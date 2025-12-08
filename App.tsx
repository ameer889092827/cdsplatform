import React, { useState } from 'react';
import { Stethoscope, Github } from 'lucide-react';
import { InputForm } from './components/InputForm';
import { DiagnosticMap } from './components/DiagnosticMap';
import { analyzePatientData } from './services/geminiService';
import { PatientInput, DiagnosticResponse } from './types';

function App() {
  const [view, setView] = useState<'form' | 'loading' | 'report'>('form');
  const [reportData, setReportData] = useState<DiagnosticResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (data: PatientInput) => {
    setView('loading');
    setError(null);
    try {
      const result = await analyzePatientData(data);
      setReportData(result);
      setView('report');
    } catch (err) {
      console.error(err);
      setError("Не удалось сгенерировать анализ. Пожалуйста, проверьте API ключ и попробуйте снова.");
      setView('form');
    }
  };

  const reset = () => {
    setReportData(null);
    setView('form');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">CDS Platform</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Поддержка принятия решений</p>
            </div>
          </div>
          {/* Removed Powered by Gemini text */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'form' && (
          <div className="animate-fade-in">
             <div className="text-center mb-10 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-800 mb-3">Анализ клинического случая</h2>
                <p className="text-slate-500">
                  Введите клинические симптомы, результаты анализов и витальные показатели для генерации диагностической карты и рекомендаций.
                </p>
             </div>
             {error && (
               <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 text-center text-sm font-medium">
                 {error}
               </div>
             )}
             <InputForm onSubmit={handleAnalyze} isLoading={false} />
          </div>
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-800">Анализ данных...</h3>
            <p className="text-slate-500 mt-2">Построение диагностической карты и оценка вероятностей</p>
          </div>
        )}

        {view === 'report' && reportData && (
          <DiagnosticMap data={reportData} onReset={reset} />
        )}

      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p className="mb-2">
            <strong>Дисклеймер:</strong> Этот инструмент предназначен только для образовательных и вспомогательных целей. 
            Он не является медицинским устройством и не заменяет профессиональное клиническое суждение врача.
          </p>
          <p className="font-medium text-slate-500 mt-4">Developed by Amir Pashayev</p>
          <p>© {new Date().getFullYear()} Clinical Decision Map Project.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;