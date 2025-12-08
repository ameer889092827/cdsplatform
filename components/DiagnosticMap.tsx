import React from 'react';
import { DiagnosticResponse } from '../types';
import { AlertTriangle, CheckCircle, HelpCircle, FileText, Activity, ArrowRight, ShieldAlert, BookOpen, TestTube } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header Summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Диагностический синтез</h2>
                    <p className="text-xs text-slate-400">ID: {data.patient_id} • {new Date().toLocaleDateString()}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">Уверенность:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        data.overall_confidence === 'high' ? 'bg-emerald-100 text-emerald-700' :
                        data.overall_confidence === 'medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                    }`}>
                        {data.overall_confidence === 'high' ? 'Высокая' : data.overall_confidence === 'medium' ? 'Средняя' : 'Низкая'}
                    </span>
                </div>
            </div>
            <p className="text-slate-600 leading-relaxed border-l-4 border-blue-500 pl-4 py-1 bg-slate-50 rounded-r-lg">
                {data.summary_ru}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Red Flags & Actions */}
        <div className="space-y-6">
            {/* RED FLAGS */}
            {data.red_flags.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-red-700 font-bold">
                        <AlertTriangle className="w-5 h-5" />
                        <h3>КРАСНЫЕ ФЛАГИ</h3>
                    </div>
                    <ul className="space-y-3">
                        {data.red_flags.map((flag, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-red-800 bg-white/60 p-2 rounded border border-red-100">
                                <ShieldAlert className="w-4 h-4 min-w-[16px] mt-0.5" />
                                {flag}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* IMMEDIATE ACTIONS */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                 <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <h3>Неотложные действия</h3>
                </div>
                <ul className="space-y-2">
                    {data.immediate_actions.map((action, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-slate-700 p-2 hover:bg-slate-50 rounded transition-colors">
                            <span className="text-emerald-500 font-bold">•</span>
                            {action}
                        </li>
                    ))}
                </ul>
            </div>

            {/* QUESTIONS */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                 <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                    <HelpCircle className="w-5 h-5 text-indigo-500" />
                    <h3>Уточняющие вопросы</h3>
                </div>
                <ul className="space-y-2">
                    {data.clarifying_questions.map((q, idx) => (
                        <li key={idx} className="text-sm text-slate-600 italic border-l-2 border-indigo-200 pl-3 py-1">
                            "{q}"
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Center Col: Differential Diagnosis */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Карта дифференциального диагноза
                </h3>
                
                {/* Visual Chart */}
                <div className="h-64 mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{fill: '#f1f5f9'}}
                            />
                            <Bar dataKey="prob" name="Вероятность %" radius={[0, 4, 4, 0]} barSize={20}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getConfidenceColor(entry.confidence)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Detailed Cards */}
                <div className="space-y-4">
                    {data.differential.map((diff, idx) => (
                        <div key={idx} className="border border-slate-100 rounded-lg p-4 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800">{diff.diagnosis}</h4>
                                <span className="bg-white px-2 py-1 rounded border border-slate-200 text-xs font-mono font-bold">
                                    {Math.round(diff.probability * 100)}%
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{diff.why}</p>
                            
                            <div className="bg-white p-3 rounded border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Основание (Evidence)</span>
                                <div className="flex flex-wrap gap-2">
                                    {diff.evidence.map((ev, i) => (
                                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                            {ev}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommended Tests */}
             <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-purple-600" />
                    Рекомендованные исследования
                </h3>
                <div className="overflow-hidden rounded-lg border border-slate-100">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="p-3">Тест / Анализ</th>
                                <th className="p-3">Приоритет</th>
                                <th className="p-3">Обоснование</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.recommended_tests.map((test, idx) => (
                                <tr key={idx} className="bg-white hover:bg-slate-50">
                                    <td className="p-3 font-medium text-slate-700">{test.test}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            test.priority === 'high' ? 'bg-red-100 text-red-700' :
                                            test.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {test.priority === 'high' ? 'Высокий' : test.priority === 'medium' ? 'Средний' : 'Низкий'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-600">{test.rationale}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      {/* Footer / Disclaimer */}
      <div className="bg-slate-800 text-slate-300 p-6 rounded-xl mt-8">
        <div className="flex items-start gap-4">
            <BookOpen className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-white mb-2">Клиническое обоснование</h4>
                <p className="text-sm leading-relaxed mb-4 text-slate-300">{data.explanatory_note}</p>
                {data.references.length > 0 && (
                    <div className="text-xs text-slate-400">
                        <span className="font-bold text-slate-500 uppercase">Источники: </span>
                        {data.references.join('; ')}
                    </div>
                )}
            </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-6">
        <button 
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
        >
            Новый случай <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};