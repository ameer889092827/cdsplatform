import React, { useState } from 'react';
import { Plus, X, Activity, TestTube, FileText, User } from 'lucide-react';
import { PatientInput, LabResult } from '../types';

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
    labs: [],
    meds: [],
    habits: { diet: '', other: '' },
    history_notes: ''
  });

  const [newLab, setNewLab] = useState<LabResult>({ name: '', value: '', unit: '' });
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

  const addLab = () => {
    if (newLab.name && newLab.value) {
      setFormData({ ...formData, labs: [...formData.labs, newLab] });
      setNewLab({ name: '', value: '', unit: '' });
    }
  };

  const removeLab = (index: number) => {
    setFormData({ ...formData, labs: formData.labs.filter((_, i) => i !== index) });
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

  const inputClass = "flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-600 mb-2";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Данные пациента</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info & Vitals */}
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Демография</label>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Возраст"
                className={inputClass}
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
              <select
                className={inputClass}
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другое</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <label className="text-sm font-semibold text-slate-600">Витальные показатели</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input name="bp" placeholder="АД (120/80)" className={inputClass} onChange={handleVitalChange} />
              <input name="hr" placeholder="ЧСС (уд/мин)" className={inputClass} onChange={handleVitalChange} />
              <input name="temp" placeholder="Темп (°C)" className={inputClass} onChange={handleVitalChange} />
              <input name="spo2" placeholder="SpO2 (%)" className={inputClass} onChange={handleVitalChange} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <label className="text-sm font-semibold text-slate-600">Симптомы</label>
            </div>
            <div className="space-y-2">
              {formData.symptoms.map((symptom, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={symptom}
                    onChange={(e) => handleSymptomChange(idx, e.target.value)}
                    placeholder="напр., Боль в груди, усталость"
                    className={inputClass}
                  />
                  {formData.symptoms.length > 1 && (
                    <button onClick={() => removeSymptom(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addSymptom} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium mt-1">
                <Plus className="w-3 h-3" /> Добавить симптом
              </button>
            </div>
          </div>
        </div>

        {/* Labs & History */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TestTube className="w-4 h-4 text-blue-500" />
              <label className="text-sm font-semibold text-slate-600">Лабораторные анализы</label>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  placeholder="Название"
                  className="col-span-1 p-2 text-sm border border-slate-200 rounded bg-white text-slate-700"
                  value={newLab.name}
                  onChange={(e) => setNewLab({...newLab, name: e.target.value})}
                />
                <input
                  placeholder="Значение"
                  className="col-span-1 p-2 text-sm border border-slate-200 rounded bg-white text-slate-700"
                  value={newLab.value}
                  onChange={(e) => setNewLab({...newLab, value: e.target.value})}
                />
                 <input
                  placeholder="Ед.изм"
                  className="col-span-1 p-2 text-sm border border-slate-200 rounded bg-white text-slate-700"
                  value={newLab.unit}
                  onChange={(e) => setNewLab({...newLab, unit: e.target.value})}
                />
              </div>
              <button onClick={addLab} className="w-full py-1.5 bg-white border border-slate-300 text-slate-600 text-xs font-semibold rounded hover:bg-slate-100 transition-colors">
                Добавить анализ
              </button>
            </div>
            {formData.labs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.labs.map((lab, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                    {lab.name}: {lab.value} {lab.unit}
                    <button onClick={() => removeLab(idx)} className="hover:text-blue-900 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
             <label className={labelClass}>Лекарства и препараты</label>
             <div className="flex gap-2 mb-3">
                <input 
                  className={inputClass} 
                  placeholder="Добавить лекарство..."
                  value={newMed}
                  onChange={(e) => setNewMed(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMed()}
                />
                <button onClick={addMed} className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
             </div>
             <div className="flex flex-wrap gap-2">
                {formData.meds.map((med, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100">
                    {med}
                    <button onClick={() => removeMed(idx)} className="hover:text-purple-900 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                ))}
             </div>
          </div>

          <div>
            <label className={labelClass}>Анамнез, диета и заметки</label>
            <textarea
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg h-24 text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none transition-all"
              placeholder="Введите историю болезни, особенности питания или другие наблюдения..."
              value={formData.history_notes}
              onChange={(e) => setFormData({...formData, history_notes: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => onSubmit(formData)}
          disabled={isLoading}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-md ${
            isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-95'
          }`}
        >
          {isLoading ? 'Анализ...' : 'Сгенерировать карту'}
        </button>
      </div>
    </div>
  );
};