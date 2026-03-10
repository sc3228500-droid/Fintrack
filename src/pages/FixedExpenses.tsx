import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { format, addDays, isBefore, isAfter, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';

export default function FixedExpenses() {
  const { user, fixedExpenses, addFixedExpense, deleteFixedExpense, markFixedExpensePaid } = useStore();
  
  const [form, setForm] = useState({
    name: '',
    amount: '',
    date: '1',
    category: 'Vivienda'
  });

  const categories = ['Vivienda', 'Servicios', 'Transporte', 'Suscripciones', 'Educación', 'Otros'];
  const currentMonth = format(new Date(), 'yyyy-MM');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    const date = parseInt(form.date, 10);
    
    if (isNaN(amount) || amount <= 0) return alert('Monto inválido');
    if (isNaN(date) || date < 1 || date > 31) return alert('Día inválido (1-31)');

    addFixedExpense({
      name: form.name,
      amount,
      date,
      category: form.category
    });

    setForm({ name: '', amount: '', date: '1', category: 'Vivienda' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: user?.currency || 'USD'
    }).format(amount);
  };

  // Sort by proximity to current date
  const today = new Date().getDate();
  
  const sortedExpenses = [...fixedExpenses].sort((a, b) => {
    // If a is paid this month and b is not, b comes first
    const aPaid = a.lastPaidMonth === currentMonth;
    const bPaid = b.lastPaidMonth === currentMonth;
    if (aPaid && !bPaid) return 1;
    if (!aPaid && bPaid) return -1;
    
    // Calculate distance to next payment
    const distA = a.date >= today ? a.date - today : a.date + 31 - today;
    const distB = b.date >= today ? b.date - today : b.date + 31 - today;
    return distA - distB;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gastos Fijos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Nuevo Gasto Fijo</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Nombre</label>
              <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ej: Arriendo, Internet..." />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Monto Mensual</label>
              <CurrencyInput required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={form.amount} onChangeValue={val => setForm({...form, amount: val})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Categoría</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Día de Pago</label>
                <input required type="number" min="1" max="31" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="w-full mt-4 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" /> Agregar Gasto Fijo
            </button>
          </form>
        </div>

        {/* Lista de Pagos (Agenda) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Agenda de Deudas ({format(new Date(), 'MMMM', { locale: es })})</h2>
          
          {sortedExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tienes gastos fijos registrados.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedExpenses.map((expense) => {
                const isPaid = expense.lastPaidMonth === currentMonth;
                let daysUntil = expense.date - today;
                if (daysUntil < 0 && !isPaid) daysUntil += 31; // Roughly next month if missed
                
                let statusText = '';
                let statusColor = '';
                
                if (isPaid) {
                  statusText = 'Pagado';
                  statusColor = 'text-green-600 bg-green-50';
                } else if (daysUntil === 0) {
                  statusText = 'Vence hoy';
                  statusColor = 'text-red-600 bg-red-50 font-bold';
                } else if (daysUntil < 0) {
                  statusText = `Vencido hace ${Math.abs(daysUntil)} días`;
                  statusColor = 'text-red-600 bg-red-50 font-bold';
                } else {
                  statusText = `Vence en ${daysUntil} días`;
                  statusColor = daysUntil <= 5 ? 'text-orange-600 bg-orange-50' : 'text-gray-600 bg-gray-50';
                }

                return (
                  <div key={expense.id} className={`flex items-center justify-between p-4 rounded-lg border ${isPaid ? 'border-green-100 bg-green-50/30' : 'border-gray-200'}`}>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => !isPaid && markFixedExpensePaid(expense.id, currentMonth)}
                        disabled={isPaid}
                        className={`focus:outline-none ${isPaid ? 'text-green-500 cursor-default' : 'text-gray-300 hover:text-green-500'}`}
                      >
                        {isPaid ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                      </button>
                      <div>
                        <h3 className={`text-sm font-medium ${isPaid ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{expense.name}</h3>
                        <p className="text-xs text-gray-500">{expense.category} • Día {expense.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isPaid ? 'text-gray-500' : 'text-gray-900'}`}>{formatCurrency(expense.amount)}</p>
                        <p className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor}`}>
                          {statusText}
                        </p>
                      </div>
                      <button 
                        onClick={() => deleteFixedExpense(expense.id)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
