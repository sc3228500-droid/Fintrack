import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function History() {
  const { user, dailyExpenses, fixedExpenses, deleteDailyExpense } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: user?.currency || 'USD'
    }).format(amount);
  };

  const currentMonthDate = parseISO(`${selectedMonth}-01`);
  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(currentMonthDate);

  // Filter daily expenses for selected month
  const monthDailyExpenses = dailyExpenses.filter(exp => {
    const expDate = parseISO(exp.date);
    return isWithinInterval(expDate, { start: monthStart, end: monthEnd });
  });

  // Filter paid fixed expenses for selected month
  const monthFixedExpenses = fixedExpenses
    .filter(exp => exp.lastPaidMonth === selectedMonth)
    .map(exp => ({
      id: `fixed-${exp.id}`,
      description: exp.name,
      amount: exp.amount,
      category: exp.category,
      date: `${selectedMonth}-${exp.date.toString().padStart(2, '0')}`,
      isAnt: false,
      isFixed: true,
      originalId: exp.id
    }));

  const monthExpenses = [...monthDailyExpenses, ...monthFixedExpenses];

  // RF07: Weekly Metrics (Last 7 days from today, or selected week if we want, let's just do last 7 days)
  const today = new Date();
  const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today });
  const weeklyData = last7Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const total = dailyExpenses
      .filter(exp => exp.date === dayStr)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return {
      name: format(day, 'EEEEE', { locale: es }),
      total
    };
  });

  // RF08: Biweekly Metrics
  const firstHalfTotal = monthExpenses
    .filter(exp => parseISO(exp.date).getDate() <= 15)
    .reduce((sum, exp) => sum + exp.amount, 0);
  const secondHalfTotal = monthExpenses
    .filter(exp => parseISO(exp.date).getDate() > 15)
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  const biweeklyData = [
    { name: '1ra Quincena', total: firstHalfTotal },
    { name: '2da Quincena', total: secondHalfTotal }
  ];

  // RF09: Monthly Summary by Category
  const categoryTotals = monthExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const antTotal = monthExpenses.filter(e => e.isAnt).reduce((sum, e) => sum + e.amount, 0);
  if (antTotal > 0) {
    categoryTotals['Gastos Hormiga'] = antTotal;
  }

  const totalMonthExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyIncome = user?.income || 1; // Avoid division by zero

  // Export to PDF (RF19)
  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`Reporte Financiero - ${format(currentMonthDate, 'MMMM yyyy', { locale: es }).toUpperCase()}`, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Ingreso Registrado: ${formatCurrency(monthlyIncome)}`, 14, 32);
    doc.text(`Total Gastos Variables: ${formatCurrency(totalMonthExpenses)}`, 14, 40);
    
    autoTable(doc, {
      startY: 50,
      head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
      body: monthExpenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(exp => [
          format(parseISO(exp.date), 'dd/MM/yyyy'),
          exp.description + (exp.isAnt ? ' (Hormiga)' : ''),
          exp.category,
          formatCurrency(exp.amount)
        ]),
    });

    doc.save(`Reporte_FinTrack_${selectedMonth}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Métricas e Historial</h1>
        <div className="flex space-x-4">
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button 
            onClick={exportPDF}
            className="flex items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="h-4 w-4 mr-2" /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RF07: Gráfico Semanal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Gastos Últimos 7 Días</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RF08: Comparativa Quincenal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Comparativa Quincenal ({format(currentMonthDate, 'MMMM', { locale: es })})</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={biweeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RF09: Resumen por Categorías */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen por Categorías</h2>
          <div className="space-y-4">
            {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([category, amount]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-gray-900">{formatCurrency(amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((amount / monthlyIncome) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {((amount / monthlyIncome) * 100).toFixed(1)}% del ingreso
                </div>
              </div>
            ))}
            {Object.keys(categoryTotals).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No hay datos para este mes.</p>
            )}
          </div>
        </div>

        {/* RF15 & RF16: Historial Detallado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Historial de Gastos</h2>
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
                {monthExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(expense.date), 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {expense.description}
                      {expense.isAnt && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Hormiga</span>}
                      {(expense as any).isFixed && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Fijo</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {expense.category}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {!(expense as any).isFixed && (
                        <button 
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de eliminar este registro?')) {
                              deleteDailyExpense(expense.id);
                            }
                          }} 
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar registro"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {monthExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      No hay registros para este mes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
