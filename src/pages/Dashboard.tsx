import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, Plus, CheckCircle2, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import CurrencyInput from '../components/CurrencyInput';

export default function Dashboard() {
  const { user, fixedExpenses, dailyExpenses, savingsGoals = [], addDailyExpense } = useStore();
  
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'Alimentación',
    date: format(new Date(), 'yyyy-MM-dd'),
    isAnt: false
  });

  const categories = ['Alimentación', 'Transporte', 'Entretenimiento', 'Compras', 'Salud', 'Otros'];

  // Calculations
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthlyFixedTotal = fixedExpenses
    .filter(exp => exp.lastPaidMonth === format(currentMonth, 'yyyy-MM'))
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  const currentMonthDailyExpenses = dailyExpenses.filter(exp => {
    const expDate = parseISO(exp.date);
    return isWithinInterval(expDate, { start: monthStart, end: monthEnd });
  });

  const monthlyDailyTotal = currentMonthDailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const antExpensesTotal = currentMonthDailyExpenses
    .filter(exp => exp.isAnt)
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Income normalization to monthly
  let monthlyIncome = user?.income || 0;
  if (user?.incomeFrequency === 'quincenal') monthlyIncome *= 2;
  if (user?.incomeFrequency === 'semanal') monthlyIncome *= 4;

  const totalExpenses = monthlyFixedTotal + monthlyDailyTotal;
  
  // Calculate monthly savings goal
  let monthlySavings = 0;
  
  if (savingsGoals.length > 0) {
    savingsGoals.forEach(goal => {
      if (goal.targetDate) {
        const goalDate = parseISO(goal.targetDate);
        const today = new Date();
        let monthsDiff = (goalDate.getFullYear() - today.getFullYear()) * 12 + (goalDate.getMonth() - today.getMonth());
        if (monthsDiff <= 0) monthsDiff = 1;
        
        const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
        monthlySavings += remainingAmount / monthsDiff;
      }
    });
  } else if (user?.savingsGoalAmount && user?.savingsGoalDate) {
    const goalDate = parseISO(user.savingsGoalDate);
    const today = new Date();
    let monthsDiff = (goalDate.getFullYear() - today.getFullYear()) * 12 + (goalDate.getMonth() - today.getMonth());
    if (monthsDiff <= 0) monthsDiff = 1;
    
    const remainingAmount = Math.max(0, user.savingsGoalAmount - (user.savingsGoalCurrentAmount || 0));
    monthlySavings = remainingAmount / monthsDiff;
  }

  const availableBalance = monthlyIncome - totalExpenses;
  
  // Traffic Light Logic (Semáforo)
  const budgetLimit = monthlyIncome;
  const expensePercentage = budgetLimit > 0 ? (totalExpenses / budgetLimit) * 100 : 100;
  
  let trafficLightColor = 'bg-green-500';
  let trafficLightStatus = 'Saludable';
  if (expensePercentage >= 90) {
    trafficLightColor = 'bg-red-500';
    trafficLightStatus = 'Peligro';
  } else if (expensePercentage >= 70) {
    trafficLightColor = 'bg-yellow-500';
    trafficLightStatus = 'Precaución';
  }

  const isOverBudget = expensePercentage >= 100;

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {format(currentMonth, 'MMMM yyyy', { locale: es }).toUpperCase()}
        </div>
      </div>

      {/* Alerta de Límite de Gasto */}
      {isOverBudget && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start"
        >
          <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Has superado tu límite de presupuesto</h3>
            <p className="mt-1 text-sm text-red-700">
              Tus gastos actuales ({formatCurrency(totalExpenses)}) superan el presupuesto disponible para este mes.
            </p>
          </div>
        </motion.div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Saldo Disponible</h3>
            <div className={`h-3 w-3 rounded-full ${trafficLightColor}`} title={`Estado: ${trafficLightStatus}`} />
          </div>
          <p className={`mt-2 text-3xl font-light ${availableBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(availableBalance)}
          </p>
          <div className="mt-4 flex flex-col text-sm text-gray-500">
            <span>Presupuesto total: {formatCurrency(budgetLimit)}</span>
            {monthlySavings > 0 && (
              <span className="text-indigo-600 text-xs mt-1">Ahorro sugerido/mes: {formatCurrency(monthlySavings)}</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-500">Gastos Totales</h3>
          <p className="mt-2 text-3xl font-light text-gray-900">
            {formatCurrency(totalExpenses)}
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
            <span className="flex items-center"><TrendingUp className="h-4 w-4 mr-1 text-red-500" /> {formatCurrency(monthlyDailyTotal)} variables</span>
            <span className="flex items-center"><TrendingDown className="h-4 w-4 mr-1 text-blue-500" /> {formatCurrency(monthlyFixedTotal)} fijos</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-500">Gastos Hormiga</h3>
          <p className="mt-2 text-3xl font-light text-orange-600">
            {formatCurrency(antExpensesTotal)}
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>{((antExpensesTotal / (monthlyIncome || 1)) * 100).toFixed(1)}% de tus ingresos</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Egreso Rápido */}
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
              <Plus className="h-4 w-4 mr-2" /> Agregar Gasto
            </button>
          </form>
        </div>

        {/* Últimos Movimientos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Últimos Egresos Diarios</h2>
          {currentMonthDailyExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No has registrado gastos este mes.
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentMonthDailyExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(expense.date), 'dd MMM', { locale: es })}
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
