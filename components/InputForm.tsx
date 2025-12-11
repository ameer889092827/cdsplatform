import React, { useState } from 'react';
import { Plus, X, Activity, FileText, User, Microscope, Pill, AlignLeft } from 'lucide-react';
import { PatientInput } from '../types';

interface InputFormProps {
  onSubmit: (data: PatientInput) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PatientInput>({
    patient_id: `PT-${Math.floor(Math.random() * 10000)}`,
    age: '',
    gender: 'male',
    symptoms: [''],
    vitals: { bp: '', hr: '', temp: '', spo2: '' },
    lab_text: '',
    meds: [],
    habits: { diet: '', other: '' },
    history_notes: ''
  });

  const [newMed, setNewMed] = useState('');

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, vitals: { ...formData.vitals, [e.target.name]: e.target.value } });
  };

  const handleSymptomChange = (index: number, value: string) => {
    const newSymptoms = [...formData.symptoms];
    newSymptoms[index] = value;
    setFormData({ ...formData, symptoms: newSymptoms });
  };

  const addSymptom = () => setFormData({ ...formData, symptoms: [...formData.symptoms, ''] });
  const removeSymptom = (index: number) => {
    const newSymptoms = formData.symptoms.filter((_, i) => i !== index);
    setFormData({ ...formData, symptoms: newSymptoms });
  };

  const addMed = () => {
    if (newMed) {
      setFormData({ ...formData, meds: [...formData.meds, newMed] });
      setNewMed('');
    }
  };

  const removeMed = (index: number) => {
    setFormData({ ...formData, meds: formData.meds.filter((_, i) => i !== index) });
  };

  // Styles
  const sectionClass = "bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 mb-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]";
  const headerClass = "flex items-center gap-2 mb-4 text-slate-800 font-bold text-lg border-b border-slate-50 pb-2";
  const inputClass = "w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Demographics & Vitals & Meds */}
        <div className="md:col-span-4 space-y-6">
          
          <div className={sectionClass}>
            <div className={headerClass}>
              <User className="w-5 h-5 text-blue-600" />
              <span>Пациент</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Возраст</label>
                <input
                  type="number"
                  placeholder="Лет"
                  className={inputClass}
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div>
                <label className={labelClass}>Пол</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({...formData, gender: g as any})}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        formData.gender === g 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {g === 'male' ? 'Муж' : 'Жен'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className={headerClass}>
              <Activity className="w-5 h-5 text-emerald-500" />
              <span>Витальные</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>АД</label>
                <input name="bp" placeholder="120/80" className={inputClass} onChange={handleVitalChange} />
              </div>
              <div>
                <label className={labelClass}>ЧСС</label>
                <input name="hr" placeholder="уд/мин" className={inputClass} onChange={handleVitalChange} />
              </div>
              <div>
                <label className={labelClass}>Темп</label>
                <input name="temp" placeholder="°C" className={inputClass} onChange={handleVitalChange} />
              </div>
              <div>
                <label className={labelClass}>SpO2</label>
                <input name="spo2" placeholder="%" className={inputClass} onChange={handleVitalChange} />
              </div>
            </div>
          </div>

           <div className={sectionClass}>
            <div className={headerClass}>
               <Pill className="w-5 h-5 text-purple-500" />
               <span>Препараты</span>
            </div>
             <div className="flex gap-2 mb-3">
                <input 
                  className={inputClass} 
                  placeholder="Название..."
                  value={newMed}
                  onChange={(e) => setNewMed(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMed()}
                />
                <button onClick={addMed} className="px-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
             </div>
             <div className="flex flex-wrap gap-2">
                {formData.meds.map((med, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg border border-purple-100">
                    {med}
                    <button onClick={() => removeMed(idx)} className="hover:text-purple-900 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                ))}
             </div>
          </div>

        </div>

        {/* Right Column: Symptoms, History, Labs */}
        <div className="md:col-span-8 space-y-6">
          
          <div className={sectionClass}>
            <div className={headerClass}>
              <AlignLeft className="w-5 h-5 text-indigo-500" />
              <span>Жалобы и Симптомы</span>
            </div>
            <div className="space-y-3">
              {formData.symptoms.map((symptom, idx) => (
                <div key={idx} className="flex gap-2 relative group">
                  <input
                    value={symptom}
                    onChange={(e) => handleSymptomChange(idx, e.target.value)}
                    placeholder="Введите симптом (напр. Одышка при нагрузке)..."
                    className={inputClass}
                    autoFocus={idx === formData.symptoms.length - 1 && idx > 0}
                  />
                  {formData.symptoms.length > 1 && (
                    <button 
                        onClick={() => removeSymptom(idx)} 
                        className="absolute right-3 top-3 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addSymptom} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold mt-2 px-1">
                <Plus className="w-4 h-4" /> Добавить жалобу
              </button>
            </div>
          </div>

          <div className={sectionClass}>
            <div className={headerClass}>
              <Microscope className="w-5 h-5 text-amber-500" />
              <span>Лабораторные данные (Текст)</span>
            </div>
            <div className="relative">
                <textarea
                className={`${inputClass} h-32 resize-none font-mono text-xs leading-relaxed`}
                placeholder={`Вставьте сюда текст анализов. Пример:\nГемоглобин 90 г/л\nЛейкоциты 15\nФерритин снижен\nТТГ 4.5`}
                value={formData.lab_text}
                onChange={(e) => setFormData({...formData, lab_text: e.target.value})}
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-medium bg-white px-2 rounded">
                    ИИ распознает любой формат
                </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className={headerClass}>
              <FileText className="w-5 h-5 text-slate-500" />
              <span>Анамнез и Заметки</span>
            </div>
            <textarea
              className={`${inputClass} h-24 resize-none`}
              placeholder="История развития болезни, аллергии, наследственность, диета..."
              value={formData.history_notes}
              onChange={(e) => setFormData({...formData, history_notes: e.target.value})}
            />
          </div>

        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={() => onSubmit(formData)}
          disabled={isLoading}
          className={`
            relative overflow-hidden group px-10 py-4 rounded-2xl font-bold text-white text-lg shadow-xl shadow-blue-500/30 transition-all 
            ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] hover:shadow-blue-500/40'}
          `}
        >
            <span className="relative z-10 flex items-center gap-2">
                {isLoading ? 'Идет анализ...' : 'Запустить Диагностику'}
                {!isLoading && <Activity className="w-5 h-5" />}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </button>
      </div>

    </div>
  );
};