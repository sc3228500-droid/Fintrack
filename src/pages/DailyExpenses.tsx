import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Trash2 } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';

export default function DailyExpenses() {
  const { user, dailyExpenses, addDailyExpense, deleteDailyExpense } = useStore();
  
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'Alimentación',
    date: format(new Date(), 'yyyy-MM-dd'),
    isAnt: false
  });

  const categories = ['Alimentación', 'Transporte', 'Entretenimiento', 'Compras', 'Salud', 'Otros'];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseForm.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('El monto debe ser numérico y mayor a cero');
      return;
    }

    addDailyExpense({
      description: expenseForm.description,
      amount,
      category: expenseForm.category,
      date: expenseForm.date,
      isAnt: expenseForm.isAnt
    });

    setExpenseForm({
      description: '',
      amount: '',
      category: 'Alimentación',
      date: format(new Date(), 'yyyy-MM-dd'),
      isAnt: false
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: user?.currency || 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Egresos Diarios</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Registrar Egreso</h2>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Descripción</label>
              <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} placeholder="Ej: Café, Almuerzo..." />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Monto</label>
              <CurrencyInput required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={expenseForm.amount} onChangeValue={val => setExpenseForm({...expenseForm, amount: val})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Categoría</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha</label>
                <input required type="date" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} />
              </div>
            </div>

            <div className="flex items-center mt-4">
              <input id="isAnt" type="checkbox" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" checked={expenseForm.isAnt} onChange={e => setExpenseForm({...expenseForm, isAnt: e.target.checked})} />
              <label htmlFor="isAnt" className="ml-2 block text-sm text-gray-900">
                Es un gasto hormiga 🐜
              </label>
            </div>

            <button type="submit" className="w-full mt-4 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" /> Agregar Egreso
            </button>
          </form>
        </div>

        {/* Lista de Egresos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Todos los Egresos Diarios</h2>
          {dailyExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tienes gastos registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dailyExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(expense.date), 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {expense.description}
                        {expense.isAnt && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Hormiga</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {expense.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => deleteDailyExpense(expense.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
