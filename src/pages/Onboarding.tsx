import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, IncomeFrequency, SavingsGoalPriority, SavingsReminderFrequency } from '../store/useStore';
import { motion } from 'motion/react';
import CurrencyInput from '../components/CurrencyInput';

export default function Onboarding() {
  const { user, setUser, addSavingsGoal } = useStore();
  const navigate = useNavigate();
  
  // If no user exists, redirect to login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.onboarded) {
      navigate('/');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    income: '',
    incomeFrequency: 'mensual' as IncomeFrequency,
    savingsGoalName: '',
    savingsGoalAmount: '',
    savingsGoalDate: '',
    savingsGoalPriority: 'media' as SavingsGoalPriority,
    savingsGoalCurrentAmount: '',
    savingsRemindersEnabled: false,
    savingsRemindersFrequency: 'mensual' as SavingsReminderFrequency,
    currency: 'USD'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    const income = parseFloat(formData.income);
    const savingsAmount = parseFloat(formData.savingsGoalAmount);
    const currentSavingsAmount = parseFloat(formData.savingsGoalCurrentAmount) || 0;
    
    if (isNaN(income) || income <= 0) {
      alert('El ingreso debe ser un número mayor a cero');
      return;
    }
    if (isNaN(savingsAmount) || savingsAmount <= 0) {
      alert('El monto de ahorro debe ser un número mayor a cero');
      return;
    }
    if (currentSavingsAmount < 0) {
      alert('El ahorro actual no puede ser negativo');
      return;
    }

    addSavingsGoal({
      name: formData.savingsGoalName,
      targetAmount: savingsAmount,
      currentAmount: currentSavingsAmount,
      targetDate: formData.savingsGoalDate,
      icon: 'emergency'
    });

    setUser({
      income,
      incomeFrequency: formData.incomeFrequency,
      savingsGoalName: formData.savingsGoalName,
      savingsGoalAmount: savingsAmount,
      savingsGoalDate: formData.savingsGoalDate,
      savingsGoalPriority: formData.savingsGoalPriority,
      savingsGoalCurrentAmount: currentSavingsAmount,
      savingsRemindersEnabled: formData.savingsRemindersEnabled,
      savingsRemindersFrequency: formData.savingsRemindersFrequency,
      currency: formData.currency,
      onboarded: true,
      savingsGoalMigrated: true
    });
    
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Hola, {user.name} 👋
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Configuremos tu perfil financiero para empezar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Moneda</label>
              <select id="currency" className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="COP">COP ($)</option>
                <option value="MXN">MXN ($)</option>
                <option value="ARS">ARS ($)</option>
                <option value="PEN">PEN (S/.)</option>
              </select>
            </div>

            <div>
              <label htmlFor="income" className="block text-sm font-medium text-gray-700">Ingreso Total</label>
              <CurrencyInput id="income" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.income} onChangeValue={val => setFormData({...formData, income: val})} />
            </div>

            <div>
              <label htmlFor="incomeFrequency" className="block text-sm font-medium text-gray-700">Frecuencia del Ingreso</label>
              <select id="incomeFrequency" className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.incomeFrequency} onChange={e => setFormData({...formData, incomeFrequency: e.target.value as IncomeFrequency})}>
                <option value="mensual">Mensual</option>
                <option value="quincenal">Quincenal</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Meta de Ahorro</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="savingsGoalName" className="block text-sm font-medium text-gray-700">Nombre de la meta</label>
                  <input id="savingsGoalName" required type="text" placeholder="Ej: Viaje a la playa" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.savingsGoalName} onChange={e => setFormData({...formData, savingsGoalName: e.target.value})} />
                </div>

                <div>
                  <label htmlFor="savingsGoalAmount" className="block text-sm font-medium text-gray-700">Monto objetivo</label>
                  <CurrencyInput id="savingsGoalAmount" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.savingsGoalAmount} onChangeValue={val => setFormData({...formData, savingsGoalAmount: val})} />
                </div>

                <div>
                  <label htmlFor="savingsGoalDate" className="block text-sm font-medium text-gray-700">Fecha estimada</label>
                  <input id="savingsGoalDate" required type="date" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.savingsGoalDate} onChange={e => setFormData({...formData, savingsGoalDate: e.target.value})} />
                </div>

                <div>
                  <label htmlFor="savingsGoalPriority" className="block text-sm font-medium text-gray-700">Prioridad de la meta</label>
                  <select id="savingsGoalPriority" className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.savingsGoalPriority} onChange={e => setFormData({...formData, savingsGoalPriority: e.target.value as SavingsGoalPriority})}>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="savingsGoalCurrentAmount" className="block text-sm font-medium text-gray-700">Ahorro actual</label>
                  <CurrencyInput id="savingsGoalCurrentAmount" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.savingsGoalCurrentAmount} onChangeValue={val => setFormData({...formData, savingsGoalCurrentAmount: val})} />
                </div>

                <div className="flex items-center">
                  <input
                    id="savingsRemindersEnabled"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.savingsRemindersEnabled}
                    onChange={e => setFormData({...formData, savingsRemindersEnabled: e.target.checked})}
                  />
                  <label htmlFor="savingsRemindersEnabled" className="ml-2 block text-sm text-gray-900">
                    Activar recordatorios de ahorro
                  </label>
                </div>

                {formData.savingsRemindersEnabled && (
                  <div>
                    <label htmlFor="savingsRemindersFrequency" className="block text-sm font-medium text-gray-700">Frecuencia de recordatorios</label>
                    <select id="savingsRemindersFrequency" className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.savingsRemindersFrequency} onChange={e => setFormData({...formData, savingsRemindersFrequency: e.target.value as SavingsReminderFrequency})}>
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Comenzar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
