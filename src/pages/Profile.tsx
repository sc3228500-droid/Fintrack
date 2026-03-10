import React, { useState } from 'react';
import { useStore, SavingsGoalPriority, SavingsReminderFrequency } from '../store/useStore';
import { User, Settings, ShieldAlert, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CurrencyInput from '../components/CurrencyInput';

export default function Profile() {
  const { user, setUser, resetData } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    income: user?.income?.toString() || '',
    incomeFrequency: user?.incomeFrequency || 'mensual',
    savingsGoalName: user?.savingsGoalName || '',
    savingsGoalAmount: user?.savingsGoalAmount?.toString() || '',
    savingsGoalDate: user?.savingsGoalDate || '',
    savingsGoalPriority: user?.savingsGoalPriority || 'media',
    savingsGoalCurrentAmount: user?.savingsGoalCurrentAmount?.toString() || '0',
    savingsRemindersEnabled: user?.savingsRemindersEnabled || false,
    savingsRemindersFrequency: user?.savingsRemindersFrequency || 'mensual',
    currency: user?.currency || 'USD'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      name: formData.name,
      email: formData.email,
      income: parseFloat(formData.income),
      incomeFrequency: formData.incomeFrequency as any,
      savingsGoalName: formData.savingsGoalName,
      savingsGoalAmount: parseFloat(formData.savingsGoalAmount),
      savingsGoalDate: formData.savingsGoalDate,
      savingsGoalPriority: formData.savingsGoalPriority as SavingsGoalPriority,
      savingsGoalCurrentAmount: parseFloat(formData.savingsGoalCurrentAmount) || 0,
      savingsRemindersEnabled: formData.savingsRemindersEnabled,
      savingsRemindersFrequency: formData.savingsRemindersFrequency as SavingsReminderFrequency,
      currency: formData.currency
    });
    setIsEditing(false);
    alert('Perfil actualizado correctamente');
  };

  const handleDeleteData = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmation === 'ELIMINAR') {
      resetData();
      localStorage.removeItem('fintrack-storage');
      window.location.href = '/';
    } else {
      alert('Confirmación incorrecta. Escribe "ELIMINAR" en mayúsculas.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información Personal</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <input 
                    disabled={!isEditing}
                    type="email" 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Moneda (RF17)</label>
                  <select 
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500" 
                    value={formData.currency} 
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="COP">COP ($)</option>
                    <option value="MXN">MXN ($)</option>
                    <option value="ARS">ARS ($)</option>
                    <option value="PEN">PEN (S/.)</option>
                  </select>
                </div>
              </div>

              {/* Información Financiera */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Configuración Financiera</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ingreso Total</label>
                  <CurrencyInput 
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500" 
                    value={formData.income} 
                    onChangeValue={val => setFormData({...formData, income: val})} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Frecuencia de Ingreso</label>
                  <select 
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500" 
                    value={formData.incomeFrequency} 
                    onChange={e => setFormData({...formData, incomeFrequency: e.target.value})}
                  >
                    <option value="mensual">Mensual</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="semanal">Semanal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta de Ahorro</label>
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 mb-2" 
                    value={formData.savingsGoalName} 
                    onChange={e => setFormData({...formData, savingsGoalName: e.target.value})} 
                    placeholder="Nombre de la meta"
                  />
                  <CurrencyInput 
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 mb-2" 
                    value={formData.savingsGoalAmount} 
                    onChangeValue={val => setFormData({...formData, savingsGoalAmount: val})} 
                    placeholder="Monto objetivo"
                  />
                  <input 
                    disabled={!isEditing}
                    type="date" 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 mb-2" 
                    value={formData.savingsGoalDate} 
                    onChange={e => setFormData({...formData, savingsGoalDate: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioridad de la meta</label>
                  <select 
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500" 
                    value={formData.savingsGoalPriority} 
                    onChange={e => setFormData({...formData, savingsGoalPriority: e.target.value})}
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ahorro actual</label>
                  <CurrencyInput 
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500" 
                    value={formData.savingsGoalCurrentAmount} 
                    onChangeValue={val => setFormData({...formData, savingsGoalCurrentAmount: val})} 
                    placeholder="Monto ya ahorrado"
                  />
                </div>

                <div className="flex items-center mt-4">
                  <input
                    disabled={!isEditing}
                    id="savingsRemindersEnabled"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    checked={formData.savingsRemindersEnabled}
                    onChange={e => setFormData({...formData, savingsRemindersEnabled: e.target.checked})}
                  />
                  <label htmlFor="savingsRemindersEnabled" className="ml-2 block text-sm text-gray-900">
                    Activar recordatorios de ahorro
                  </label>
                </div>

                {formData.savingsRemindersEnabled && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">Frecuencia de recordatorios</label>
                    <select 
                      disabled={!isEditing}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500" 
                      value={formData.savingsRemindersFrequency} 
                      onChange={e => setFormData({...formData, savingsRemindersFrequency: e.target.value})}
                    >
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 flex justify-end space-x-4 border-t border-gray-100">
              {isEditing ? (
                <>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Guardar Cambios
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" /> Editar Perfil
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Zona de Peligro (RF20 - Derecho al Olvido) */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-6 sm:p-8 mt-8">
        <h3 className="text-lg font-bold text-red-800 flex items-center mb-2">
          <ShieldAlert className="h-5 w-5 mr-2" />
          Zona de Peligro
        </h3>
        <p className="text-sm text-red-700 mb-4">
          Eliminar tu cuenta borrará permanentemente todos tus registros de ingresos, gastos, metas y configuración. Esta acción no se puede deshacer.
        </p>
        <button 
          onClick={handleDeleteData}
          className="px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 flex items-center"
        >
          <LogOut className="h-4 w-4 mr-2" /> Eliminar todos mis datos
        </button>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center text-red-600 mb-4">
              <ShieldAlert className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-bold">Eliminar Cuenta</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar TODOS tus datos? Esta acción es irreversible y borrará todo tu historial financiero.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para confirmar, escribe "ELIMINAR" en mayúsculas:
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-red-500 focus:border-red-500" 
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="ELIMINAR"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deleteConfirmation !== 'ELIMINAR'}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
