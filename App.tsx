import React, { useState, useEffect } from 'react';
import { Stethoscope, Github, History as HistoryIcon, Clock, ChevronRight, Trash2, User, Calendar } from 'lucide-react';
import { InputForm } from './components/InputForm';
import { DiagnosticMap } from './components/DiagnosticMap';
import { analyzePatientData } from './services/geminiService';
import { PatientInput, DiagnosticResponse } from './types';

function App() {
  const [view, setView] = useState<'form' | 'loading' | 'report' | 'history'>('form');
  const [reportData, setReportData] = useState<DiagnosticResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DiagnosticResponse[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('cds_patient_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (data: DiagnosticResponse) => {
    // Avoid duplicates based on timestamp if needed, or just prepend
    const newHistory = [data, ...history];
    setHistory(newHistory);
    localStorage.setItem('cds_patient_history', JSON.stringify(newHistory));
  };

  const deleteHistoryItem = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem('cds_patient_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (window.confirm('Вы уверены, что хотите удалить всю историю пациентов?')) {
      setHistory([]);
      localStorage.removeItem('cds_patient_history');
    }
  };

  const handleAnalyze = async (data: PatientInput) => {
    setView('loading');
    setError(null);
    try {
      const result = await analyzePatientData(data);
      setReportData(result);
      setView('report');
      saveToHistory(result);
    } catch (err) {
      console.error(err);
      setError("Не удалось сгенерировать анализ. Пожалуйста, проверьте API ключ и попробуйте снова.");
      setView('form');
    }
  };

  const loadFromHistory = (data: DiagnosticResponse) => {
    setReportData(data);
    setView('report');
  };

  const reset = () => {
    setReportData(null);
    setView('form');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">CDS Platform</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Поддержка принятия решений</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setView('history')}
               className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'history' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
             >
               <HistoryIcon className="w-4 h-4" />
               <span className="hidden sm:inline">История пациентов</span>
             </button>
             {view !== 'form' && (
                <button 
                  onClick={reset}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow active:scale-95"
                >
                  Новый случай
                </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        
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
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
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

        {view === 'history' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                 <HistoryIcon className="w-6 h-6 text-slate-400" />
                 История пациентов
               </h2>
               {history.length > 0 && (
                 <button 
                   onClick={clearHistory}
                   className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 hover:underline"
                 >
                   <Trash2 className="w-4 h-4" /> Очистить историю
                 </button>
               )}
             </div>

             {history.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                 <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Clock className="w-8 h-8 text-slate-300" />
                 </div>
                 <h3 className="text-lg font-medium text-slate-900">История пуста</h3>
                 <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                   Здесь будут отображаться сохраненные результаты анализа клинических случаев.
                 </p>
                 <button onClick={reset} className="mt-6 text-blue-600 font-medium hover:text-blue-700">
                   Создать первый случай
                 </button>
               </div>
             ) : (
               <div className="space-y-4">
                 {history.map((item, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => loadFromHistory(item)}
                     className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                   >
                     <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                     
                     <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded text-xs font-bold font-mono">
                               {item.patient_id}
                             </span>
                             <span className="text-xs text-slate-400 flex items-center gap-1">
                               <Calendar className="w-3 h-3" />
                               {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </span>
                          </div>
                          <p className="text-slate-800 font-medium line-clamp-2 leading-relaxed">
                            {item.summary_ru}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${
                              item.overall_confidence === 'high' ? 'bg-emerald-100 text-emerald-700' :
                              item.overall_confidence === 'medium' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              Уверенность: {item.overall_confidence === 'high' ? 'Высокая' : item.overall_confidence === 'medium' ? 'Средняя' : 'Низкая'}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">Диагнозов: {item.differential.length}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                           <button 
                             onClick={(e) => deleteHistoryItem(e, idx)}
                             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                             title="Удалить из истории"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                           <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors mt-auto" />
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto py-8">
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