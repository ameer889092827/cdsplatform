import React, { useState, useEffect } from 'react';
import { Stethoscope, History as HistoryIcon, Clock, ChevronRight, Trash2, Calendar, LayoutGrid } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={reset}>
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">CDS Platform</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Rahmatulla Daud • Medical AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setView('history')}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                   view === 'history' 
                   ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                   : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
               }`}
             >
               <HistoryIcon className="w-4 h-4" />
               <span className="hidden sm:inline">База Пациентов</span>
             </button>
             
             {view !== 'form' && (
                <button 
                  onClick={reset}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Новый случай
                </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        
        {view === 'form' && (
          <div className="animate-fade-in">
             <div className="text-center mb-12 max-w-3xl mx-auto">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Клинический Анализ</h2>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Используйте ИИ для построения диагностических карт, оценки рисков и поиска причинно-следственных связей. 
                  <span className="block mt-2 text-sm font-semibold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">
                    Поддерживает ввод анализов сплошным текстом
                  </span>
                </p>
             </div>
             {error && (
               <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 border border-red-200 text-center text-sm font-bold shadow-sm">
                 {error}
               </div>
             )}
             <InputForm onSubmit={handleAnalyze} isLoading={false} />
          </div>
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="mt-8 text-2xl font-bold text-slate-900">Синтез данных...</h3>
            <p className="text-slate-500 mt-2 font-medium">Построение цепочек патогенеза и дифференциальная диагностика</p>
          </div>
        )}

        {view === 'report' && reportData && (
          <DiagnosticMap data={reportData} onReset={reset} />
        )}

        {view === 'history' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
             <div className="flex items-center justify-between mb-10">
               <div>
                  <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <HistoryIcon className="w-8 h-8 text-blue-600" />
                    Архив Пациентов
                  </h2>
                  <p className="text-slate-500 mt-1 ml-11">Все сохраненные диагностические сессии</p>
               </div>
               
               {history.length > 0 && (
                 <button 
                   onClick={clearHistory}
                   className="text-slate-400 hover:text-red-600 text-sm font-semibold flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg transition-all"
                 >
                   <Trash2 className="w-4 h-4" /> Удалить все
                 </button>
               )}
             </div>

             {history.length === 0 ? (
               <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed">
                 <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                   <Clock className="w-10 h-10 text-slate-300" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900">История пуста</h3>
                 <p className="text-slate-500 mt-2 max-w-sm mx-auto mb-8">
                   Здесь будут отображаться карточки пациентов с полным диагностическим разбором.
                 </p>
                 <button onClick={reset} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                   Начать работу
                 </button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {history.map((item, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => loadFromHistory(item)}
                     className="bg-white p-0 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full"
                   >
                     {/* Card Header */}
                     <div className="p-6 pb-4 border-b border-slate-50 bg-gradient-to-r from-white to-slate-50/50">
                        <div className="flex justify-between items-start mb-3">
                            <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wide shadow-sm">
                                {item.patient_id}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                               <Calendar className="w-3 h-3" />
                               {new Date(item.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                        <p className="text-slate-900 font-bold leading-snug line-clamp-2 min-h-[2.5rem]">
                            {item.summary_ru.length > 90 ? item.summary_ru.substring(0, 90) + '...' : item.summary_ru}
                        </p>
                     </div>

                     {/* Card Stats */}
                     <div className="p-6 pt-4 flex-grow flex flex-col justify-end">
                        <div className="flex flex-wrap gap-2 mb-4">
                           {item.red_flags.length > 0 && (
                               <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100">
                                   🔴 {item.red_flags.length} Флага
                               </span>
                           )}
                           <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                               🔎 {item.differential.length} Гипотез
                           </span>
                        </div>

                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
                             <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                    item.overall_confidence === 'high' ? 'bg-emerald-500' :
                                    item.overall_confidence === 'medium' ? 'bg-blue-500' :
                                    'bg-amber-500'
                                }`}></span>
                                <span className="text-xs font-bold text-slate-500 uppercase">
                                    {item.overall_confidence === 'high' ? 'Высокая' : 'Средняя'} точность
                                </span>
                             </div>
                             
                             <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => deleteHistoryItem(e, idx)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <span className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </span>
                             </div>
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
      <footer className="border-t border-slate-200 bg-white mt-auto py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-400 mb-2 max-w-2xl mx-auto leading-relaxed">
            Medical Disclaimer: This AI tool is for educational and supportive purposes only. 
            It is not a medical device and does not replace professional clinical judgment.
          </p>
          <div className="mt-6 flex flex-col items-center gap-1">
             <p className="font-bold text-slate-700">Developed by Rahmatulla Daud</p>
             <p className="text-xs text-slate-400 tracking-wider uppercase">Advanced Clinical Decision Systems © {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;