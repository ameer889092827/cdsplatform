import React from 'react';
import { DiagnosticResponse } from '../types';
import { AlertTriangle, CheckCircle, HelpCircle, Activity, ArrowRight, ShieldAlert, BookOpen, TestTube, BrainCircuit, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DiagnosticMapProps {
  data: DiagnosticResponse;
  onReset: () => void;
}

export const DiagnosticMap: React.FC<DiagnosticMapProps> = ({ data, onReset }) => {
  const chartData = data.differential.map(d => ({
    name: d.diagnosis.length > 20 ? d.diagnosis.substring(0, 20) + '...' : d.diagnosis,
    full: d.diagnosis,
    prob: Math.round(d.probability * 100),
    confidence: d.confidence
  }));

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case 'high': return '#10b981'; // emerald-500
      case 'medium': return '#3b82f6'; // blue-500
      case 'low': return '#f59e0b'; // amber-500
      default: return '#94a3b8';
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in space-y-8">
      
      {/* 1. Dashboard Header & Summary */}
      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Клинический Отчет</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        data.overall_confidence === 'high' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        data.overall_confidence === 'medium' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                        Точность: {data.overall_confidence === 'high' ? 'Высокая' : data.overall_confidence === 'medium' ? 'Средняя' : 'Низкая'}
                    </span>
                </div>
                <p className="text-slate-400 text-sm mt-1 font-medium">ID Пациента: {data.patient_id} • {new Date().toLocaleDateString()}</p>
            </div>
            
            {/* Red Flags Alert Badge */}
            {data.red_flags.length > 0 && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 animate-pulse">
                    <ShieldAlert className="w-5 h-5" />
                    <span className="font-bold text-sm">Обнаружены красные флаги ({data.red_flags.length})</span>
                </div>
            )}
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Резюме
            </h3>
            <p className="text-slate-800 text-lg leading-relaxed font-medium">
                {data.summary_ru}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 2. Main Differential Diagnosis Column (Left - Wider) */}
        <div className="xl:col-span-2 space-y-8">
            
            {/* Differential Cards */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-indigo-600" />
                    Дифференциальный диагноз и Механизмы
                </h3>
                
                <div className="space-y-6">
                    {data.differential.map((diff, idx) => (
                        <div key={idx} className="group bg-white rounded-2xl p-0 shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                            {/* Card Header */}
                            <div className="p-6 border-b border-slate-50 flex justify-between items-start bg-gradient-to-r from-white to-slate-50/50">
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-1">{diff.diagnosis}</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {diff.evidence.map((ev, i) => (
                                            <span key={i} className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100/50">
                                                {ev}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-3xl font-black text-slate-900 leading-none">{Math.round(diff.probability * 100)}%</div>
                                    <span className="text-xs text-slate-400 font-bold uppercase mt-1">Вероятность</span>
                                </div>
                            </div>

                            {/* Mechanism & Why */}
                            <div className="p-6 grid md:grid-cols-2 gap-6 bg-white">
                                <div>
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Lightbulb className="w-3 h-3" /> Патогенез (Механизм)
                                    </h5>
                                    <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-amber-300 pl-3">
                                        "{diff.mechanism || diff.why}"
                                    </p>
                                </div>
                                <div>
                                     <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Клиническое обоснование</h5>
                                     <p className="text-sm text-slate-600 leading-relaxed">
                                        {diff.why}
                                     </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Probability Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Визуализация вероятностей</h4>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12, fontWeight: 500, fill: '#64748b'}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#1e293b', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{fill: '#f8fafc'}}
                            />
                            <Bar dataKey="prob" radius={[0, 6, 6, 0]} barSize={24}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getConfidenceColor(entry.confidence)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>

        {/* 3. Action Plan Column (Right - Narrower) */}
        <div className="space-y-6">
            
            {/* Red Flags Widget */}
            {data.red_flags.length > 0 && (
                <div className="bg-red-50 rounded-2xl p-5 border border-red-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-red-800 font-bold">
                        <AlertTriangle className="w-5 h-5" />
                        <h3>КРАСНЫЕ ФЛАГИ</h3>
                    </div>
                    <ul className="space-y-3">
                        {data.red_flags.map((flag, idx) => (
                            <li key={idx} className="bg-white p-3 rounded-xl border border-red-100 text-sm text-red-800 font-medium shadow-sm flex gap-3">
                                <div className="min-w-[4px] bg-red-500 rounded-full"></div>
                                {flag}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommended Tests */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                 <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                    <TestTube className="w-5 h-5 text-purple-600" />
                    <h3>Что проверить дальше?</h3>
                </div>
                <div className="space-y-3">
                    {data.recommended_tests.map((test, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                             <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-700 text-sm">{test.test}</span>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                    test.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
                                }`}>
                                    {test.priority === 'high' ? 'Важно' : 'План'}
                                </span>
                             </div>
                             <p className="text-xs text-slate-500 leading-tight">{test.rationale}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Immediate Actions */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 shadow-sm">
                 <div className="flex items-center gap-2 mb-4 text-emerald-900 font-bold">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <h3>План действий</h3>
                </div>
                <ul className="space-y-2">
                    {data.immediate_actions.map((action, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-emerald-900 bg-white/60 p-2 rounded-lg">
                            <span className="text-emerald-500 font-bold">•</span>
                            {action}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Questions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                 <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                    <h3>Спросить пациента</h3>
                </div>
                <ul className="space-y-2">
                    {data.clarifying_questions.map((q, idx) => (
                        <li key={idx} className="text-sm text-slate-600 italic border-l-2 border-blue-200 pl-3 py-1">
                            "{q}"
                        </li>
                    ))}
                </ul>
            </div>

        </div>
      </div>

      {/* Footer / Explanation */}
      <div className="bg-slate-900 text-slate-300 p-8 rounded-3xl mt-8 shadow-2xl">
        <div className="flex items-start gap-5">
            <div className="bg-white/10 p-3 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-white mb-2 text-lg">Врачебное заключение ИИ</h4>
                <p className="text-sm leading-relaxed mb-6 text-slate-300 border-l-2 border-slate-600 pl-4">
                    {data.explanatory_note}
                </p>
                {data.references.length > 0 && (
                    <div className="text-xs text-slate-500 bg-slate-800/50 p-4 rounded-xl">
                        <span className="font-bold text-slate-400 uppercase block mb-1">Релевантные источники: </span>
                        {data.references.map((ref, i) => (
                            <span key={i} className="mr-3 hover:text-white transition-colors cursor-default underline decoration-slate-700 underline-offset-2">
                                {ref}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-8">
        <button 
            onClick={onReset}
            className="group flex items-center gap-3 px-8 py-3 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
            Загрузить новый случай <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-blue-500" />
        </button>
      </div>

    </div>
  );
};