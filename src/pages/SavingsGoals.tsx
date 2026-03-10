import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Plus, 
  X, 
  Plane, 
  Laptop, 
  Car, 
  Home, 
  GraduationCap, 
  HeartPulse, 
  PiggyBank,
  Wallet,
  TrendingUp,
  Edit2,
  Trash2
} from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';

const ICONS = [
  { id: 'plane', icon: Plane, label: 'Viaje' },
  { id: 'laptop', icon: Laptop, label: 'Tecnología' },
  { id: 'car', icon: Car, label: 'Vehículo' },
  { id: 'home', icon: Home, label: 'Hogar' },
  { id: 'education', icon: GraduationCap, label: 'Educación' },
  { id: 'health', icon: HeartPulse, label: 'Salud' },
  { id: 'emergency', icon: PiggyBank, label: 'Emergencia' },
  { id: 'wallet', icon: Wallet, label: 'Ahorro General' },
];

export default function SavingsGoals() {
  const { user, savingsGoals = [], addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    icon: 'emergency'
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: user?.currency || 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenModal = (goal?: any) => {
    if (goal) {
      setEditingId(goal.id);
      setForm({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        targetDate: goal.targetDate || '',
        icon: goal.icon || 'emergency'
      });
    } else {
      setEditingId(null);
      setForm({
        name: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        icon: 'emergency'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetAmount = parseFloat(form.targetAmount);
    const currentAmount = parseFloat(form.currentAmount) || 0;
    
    if (isNaN(targetAmount) || targetAmount <= 0) {
      alert('El monto objetivo debe ser mayor a cero');
      return;
    }

    const goalData = {
      name: form.name,
      targetAmount,
      currentAmount,
      targetDate: form.targetDate,
      icon: form.icon
    };

    if (editingId) {
      updateSavingsGoal(editingId, goalData);
    } else {
      addSavingsGoal(goalData);
    }
    
    handleCloseModal();
  };

  const getIconComponent = (iconId: string) => {
    const found = ICONS.find(i => i.id === iconId);
    const IconComponent = found ? found.icon : Target;
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metas de Ahorro</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus objetivos financieros</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Meta
        </button>
      </div>

      {savingsGoals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes metas de ahorro</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Establecer metas te ayuda a mantenerte motivado y enfocado en tus objetivos financieros.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear mi primera meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {savingsGoals.map((goal) => {
              const missingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
              const progressPercentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) || 0;
              
              // Calculate circle properties
              const radius = 36;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          {getIconComponent(goal.icon || 'emergency')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{goal.name}</h3>
                          <p className="text-sm text-gray-500">Meta: {formatCurrency(goal.targetAmount)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleOpenModal(goal)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('¿Estás seguro de eliminar esta meta?')) {
                              deleteSavingsGoal(goal.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 mb-2">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          {/* Background Circle */}
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r={radius}
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              className="text-gray-100"
                            />
                            {/* Progress Circle */}
                            <circle
                              cx="48"
                              cy="48"
                              r={radius}
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              className={progressPercentage >= 100 ? "text-green-500 transition-all duration-1000 ease-out" : "text-indigo-500 transition-all duration-1000 ease-out"}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-gray-800">{progressPercentage}%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Ahorro actual</p>
                          <p className="text-xl font-semibold text-gray-900">{formatCurrency(goal.currentAmount)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {progressPercentage >= 100 
                            ? "¡Felicidades! Has alcanzado tu meta de ahorro." 
                            : `¡Vas por buen camino! Has ahorrado ${formatCurrency(goal.currentAmount)}. Te faltan ${formatCurrency(missingAmount)} para llegar a tu meta.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {goal.targetDate && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                      <span>Fecha límite:</span>
                      <span className="font-medium text-gray-700">{goal.targetDate}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Agregar/Editar Meta */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Editar Meta' : 'Nueva Meta de Ahorro'}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ¿Para qué estás ahorrando?
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Viaje a Japón, Fondo de Emergencia..."
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ¿Cuánto necesitas? (Monto total)
                  </label>
                  <CurrencyInput
                    required
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={form.targetAmount}
                    onChangeValue={(val) => setForm({ ...form, targetAmount: val })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ¿Cuánto has ahorrado ya? (Opcional)
                  </label>
                  <CurrencyInput
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={form.currentAmount}
                    onChangeValue={(val) => setForm({ ...form, currentAmount: val })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ¿Para cuándo lo quieres? (Opcional)
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={form.targetDate}
                    onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icono
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {ICONS.map((iconObj) => {
                      const IconComp = iconObj.icon;
                      const isSelected = form.icon === iconObj.id;
                      return (
                        <button
                          key={iconObj.id}
                          type="button"
                          onClick={() => setForm({ ...form, icon: iconObj.id })}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            isSelected 
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-500'
                          }`}
                          title={iconObj.label}
                        >
                          <IconComp className="w-6 h-6" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingId ? 'Guardar Cambios' : 'Crear Meta'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
