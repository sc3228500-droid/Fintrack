import { useState } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';

const articles = [
  {
    id: 1,
    title: 'El método de los 5 sobres para ahorrar',
    content: 'Este método consiste en dividir tus ingresos en 5 categorías principales (sobres) apenas recibes tu sueldo. Puedes usar sobres físicos o cuentas digitales. Las categorías suelen ser: Vivienda, Alimentación, Transporte, Ahorro y Gastos Personales. Al asignar un límite a cada sobre, evitas gastar dinero destinado a obligaciones en cosas innecesarias.',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    title: 'Cómo identificar y reducir los gastos hormiga',
    content: 'Los gastos hormiga son pequeñas compras diarias que parecen inofensivas, pero al final del mes suman una gran cantidad. Un café diario, snacks, suscripciones que no usas. Para reducirlos: 1. Registra todo lo que compras. 2. Identifica patrones. 3. Busca alternativas (ej. prepara café en casa). 4. Asigna un presupuesto mensual fijo para estos gustos.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    title: 'La regla 50/30/20',
    content: 'Una regla sencilla para presupuestar: destina el 50% de tus ingresos a necesidades básicas (arriendo, servicios, comida), el 30% a deseos (entretenimiento, salidas, compras) y el 20% a ahorro o pago de deudas. Ajusta estos porcentajes según tu realidad, pero mantén siempre la proporción de ahorro.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800'
  }
];

const glossary = [
  { term: 'Activos', definition: 'Todo lo que tienes y que tiene valor económico (dinero, propiedades, inversiones).' },
  { term: 'Ahorro', definition: 'Parte del ingreso que no se gasta y se guarda para el futuro.' },
  { term: 'Gasto Fijo', definition: 'Pagos obligatorios que se repiten cada mes (arriendo, servicios, internet).' },
  { term: 'Gasto Hormiga', definition: 'Compras pequeñas que parecen no importar (un café, un dulce), pero que al sumarlas al mes restan mucho dinero.' },
  { term: 'Gasto Variable', definition: 'Gastos que cambian mes a mes y no son estrictamente obligatorios (salidas, ropa).' },
  { term: 'Ingreso', definition: 'Dinero que recibes, ya sea por tu trabajo, inversiones o negocios.' },
  { term: 'Pasivos', definition: 'Todas las deudas u obligaciones financieras que tienes que pagar.' },
  { term: 'Patrimonio', definition: 'La diferencia entre lo que tienes (Activos) y lo que debes (Pasivos).' },
  { term: 'Presupuesto', definition: 'Plan que haces para organizar tu dinero, calculando cuánto vas a ganar y cuánto vas a gastar.' },
  { term: 'Tasa de Interés', definition: 'El costo de pedir dinero prestado o la ganancia por ahorrar/invertir dinero.' }
];

export default function Education() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const filteredGlossary = glossary.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Educación Financiera</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RF13: Blog Informativo */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
            Biblioteca de Estrategias
          </h2>
          
          <div className="space-y-4">
            {articles.map(article => (
              <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-48 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{article.title}</h3>
                  <p className={`text-gray-600 text-sm ${expandedArticle === article.id ? '' : 'line-clamp-3'}`}>
                    {article.content}
                  </p>
                  <button 
                    onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                  >
                    {expandedArticle === article.id ? (
                      <>Leer menos <ChevronUp className="h-4 w-4 ml-1" /></>
                    ) : (
                      <>Leer más <ChevronDown className="h-4 w-4 ml-1" /></>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RF14: Glosario de Términos */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Search className="h-5 w-5 mr-2 text-indigo-600" />
            Diccionario Financiero
          </h2>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Buscar un término (ej. Activos, Pasivos...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredGlossary.length > 0 ? (
                filteredGlossary.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <h4 className="text-md font-semibold text-indigo-700">{item.term}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.definition}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No se encontraron términos que coincidan con tu búsqueda.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
