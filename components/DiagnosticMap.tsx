import React from 'react';
import { DiagnosticResponse } from '../types';
import { AlertTriangle, CheckCircle, HelpCircle, Activity, ArrowRight, ShieldAlert, BookOpen, TestTube, BrainCircuit, Lightbulb, GitMerge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DiagnosticMapProps {
  data: DiagnosticResponse;
  onReset: () => void;
  t: any;
}

export const DiagnosticMap: React.FC<DiagnosticMapProps> = ({ data, onReset, t }) => {
  const chartData = (data.differential || []).map(d => ({
    name: d.diagnosis?.length > 15 ? d.diagnosis.substring(0, 15) + '...' : d.diagnosis || 'Unknown',
    full: d.diagnosis,
    prob: Math.round((d.probability || 0) * 100),
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

  const getConfidenceText = (conf: string) => {
      switch (conf) {
          case 'high': return t.high;
          case 'medium': return t.medium;
          case 'low': return t.low;
          default: return conf;
      }
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in space-y-8">
      
      {/* 1. Dashboard Header & Summary */}
      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.reportTitle}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        data.overall_confidence === 'high' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        data.overall_confidence === 'medium' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                        {t.accuracy}: {getConfidenceText(data.overall_confidence)}
                    </span>
                </div>
                <p className="text-slate-400 text-sm mt-1 font-medium">{t.patientID}: {data.patient_id} • {new Date().toLocaleDateString()}</p>
            </div>
            
            {/* Red Flags Alert Badge */}
            {data.red_flags && data.red_flags.length > 0 && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 animate-pulse">
                    <ShieldAlert className="w-5 h-5" />
                    <span className="font-bold text-sm">{t.flagDetected} ({data.red_flags.length})</span>
                </div>
            )}
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> {t.summary}
            </h3>
            <p className="text-slate-800 text-lg leading-relaxed font-medium">
                {data.summary}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 2. Main Differential Diagnosis Column (Left - Wider) */}
        <div className="xl:col-span-2 space-y-8 min-w-0">
            
            {/* Probability Chart - FIXED RECHARTS ERROR by enforcing height and checking data */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">{t.vizProb}</h4>
                <div style={{ width: '100%', height: 300 }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={140} 
                                    tick={{fontSize: 12, fontWeight: 500, fill: '#64748b'}} 
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-slate-800 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
                                            <p className="font-bold mb-1 text-sm">{data.full}</p>
                                            <p className="text-slate-300">Probability: {data.prob}%</p>
                                            </div>
                                        );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="prob" radius={[0, 6, 6, 0]} barSize={32} background={{ fill: '#f1f5f9', radius: [0, 6, 6, 0] }}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getConfidenceColor(entry.confidence)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            No chart data available
                        </div>
                    )}
                </div>
            </div>

            {/* Differential Cards - ENHANCED UI for "Quality Info" */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-indigo-600" />
                    {t.diffDiag}
                </h3>
                
                <div className="space-y-6">
                    {(data.differential || []).map((diff, idx) => (
                        <div key={idx} className="group bg-white rounded-3xl p-0 shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
                            {/* Card Header */}
                            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-white via-slate-50/30 to-slate-50/80 gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/30">
                                            {idx + 1}
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900">{diff.diagnosis}</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3 ml-11">
                                        {(diff.evidence || []).map((ev, i) => (
                                            <span key={i} className="text-[11px] font-bold bg-white text-slate-600 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                                {ev}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 ml-11 sm:ml-0 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.prob}</span>
                                        <div className="text-2xl font-black text-slate-800 leading-none">{Math.round((diff.probability || 0) * 100)}%</div>
                                    </div>
                                    <div className="h-8 w-8 rounded-full border-4 border-slate-100 flex items-center justify-center" style={{ borderColor: getConfidenceColor(diff.confidence) + '30' }}>
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getConfidenceColor(diff.confidence) }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Content - Schema Style */}
                            <div className="p-6 grid md:grid-cols-12 gap-6 bg-white relative">
                                
                                {/* Vertical connecting line visually */}
                                <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-px bg-slate-100 -translate-x-1/2"></div>

                                {/* Mechanism (Pathogenesis) */}
                                <div className="md:col-span-6 flex flex-col h-full">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <GitMerge className="w-4 h-4 text-indigo-500" /> 
                                        {t.mech}
                                    </h5>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex-grow relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium font-mono text-justify">
                                            {diff.mechanism || "No mechanism data provided."}
                                        </p>
                                    </div>
                                </div>

                                {/* Clinical Reasoning */}
                                <div className="md:col-span-6 flex flex-col h-full">
                                     <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-amber-500" />
                                        {t.rationale}
                                     </h5>
                                     <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 flex-grow">
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {diff.why || "No reasoning provided."}
                                        </p>
                                     </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        {/* 3. Action Plan Column (Right - Narrower) */}
        <div className="space-y-6">
            
            {/* Red Flags Widget */}
            {data.red_flags && data.red_flags.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-red-100 shadow-lg shadow-red-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                    <div className="flex items-center gap-2 mb-5 text-red-900 font-bold">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3>{t.redFlags}</h3>
                    </div>
                    <ul className="space-y-3">
                        {data.red_flags.map((flag, idx) => (
                            <li key={idx} className="bg-red-50 p-3 rounded-xl border border-red-100 text-sm text-red-800 font-semibold shadow-sm flex items-start gap-3">
                                <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span className="leading-tight">{flag}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommended Tests */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                 <div className="flex items-center gap-2 mb-5 text-slate-800 font-bold">
                    <TestTube className="w-5 h-5 text-purple-600" />
                    <h3>{t.tests}</h3>
                </div>
                <div className="space-y-3">
                    {(data.recommended_tests || []).map((test, idx) => (
                        <div key={idx} className="group bg-slate-50 hover:bg-white p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all">
                             <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-slate-800 text-sm">{test.test}</span>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                    test.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
                                }`}>
                                    {test.priority === 'high' ? t.important : t.plan}
                                </span>
                             </div>
                             <p className="text-xs text-slate-500 leading-snug">{test.rationale}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Immediate Actions */}
            <div className="bg-gradient-to-b from-emerald-50 to-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
                 <div className="flex items-center gap-2 mb-5 text-emerald-900 font-bold">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <h3>{t.actions}</h3>
                </div>
                <ul className="space-y-2">
                    {(data.immediate_actions || []).map((action, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-emerald-50 shadow-sm">
                            <div className="min-w-[6px] h-[6px] rounded-full bg-emerald-500 mt-1.5"></div>
                            {action}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Questions */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                 <div className="flex items-center gap-2 mb-5 text-slate-800 font-bold">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                    <h3>{t.questions}</h3>
                </div>
                <ul className="space-y-3">
                    {(data.clarifying_questions || []).map((q, idx) => (
                        <li key={idx} className="text-sm text-slate-600 italic bg-slate-50 px-4 py-3 rounded-xl border-l-4 border-blue-300">
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
                <h4 className="font-bold text-white mb-2 text-lg">{t.conclusion}</h4>
                <p className="text-sm leading-relaxed mb-6 text-slate-300 border-l-2 border-slate-600 pl-4">
                    {data.explanatory_note}
                </p>
                {data.references && data.references.length > 0 && (
                    <div className="text-xs text-slate-500 bg-slate-800/50 p-4 rounded-xl">
                        <span className="font-bold text-slate-400 uppercase block mb-1">{t.sources}: </span>
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
            {t.reset} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-blue-500" />
        </button>
      </div>

    </div>
  );
};