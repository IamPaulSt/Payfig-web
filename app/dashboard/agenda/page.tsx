'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { CollectionAgendaItem } from '@/types';
import { 
  Calendar, 
  ChevronDown, 
  Phone, 
  Loader2, 
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PaymentModal from '../components/PaymentModal';

export default function AgendaPage() {
  const [items, setItems] = useState<CollectionAgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CollectionAgendaItem | null>(null);

  const months = [
    { n: 'Enero', v: 1 }, { n: 'Febrero', v: 2 }, { n: 'Marzo', v: 3 },
    { n: 'Abril', v: 4 }, { n: 'Mayo', v: 5 }, { n: 'Junio', v: 6 },
    { n: 'Julio', v: 7 }, { n: 'Agosto', v: 8 }, { n: 'Septiembre', v: 9 },
    { n: 'Octubre', v: 10 }, { n: 'Noviembre', v: 11 }, { n: 'Diciembre', v: 12 }
  ];

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/loans/today-agenda';
      let params = {};

      if (view === 'weekly') endpoint = '/loans/weekly-agenda';
      if (view === 'monthly') {
        endpoint = '/loans/monthly-agenda';
        params = { month: selectedMonth, year: selectedYear };
      }

      const response = await api.get(endpoint, { params });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching agenda:', error);
    } finally {
      setLoading(false);
    }
  }, [view, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  useEffect(() => {
    document.title = "Agenda | PayFig";
  }, []);

  const sortedItems = [...items].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const filteredItems = sortedItems;

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header & View Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl">
                <Calendar className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Agenda de Cobros</h3>
               <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">Pendientes</p>
             </div>
          </div>

          <div className="flex bg-slate-800/50 p-1 rounded-xl shadow-inner border border-slate-700/30 w-full md:w-auto">
            {(['daily', 'weekly', 'monthly'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 md:flex-none md:px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  view === v 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {v === 'daily' ? 'Hoy' : v === 'weekly' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selectors (Monthly Only) */}
      {view === 'monthly' && (
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-2xl w-fit shadow-lg ml-1">
           <div className="relative min-w-[120px]">
              <button
                type="button"
                onClick={() => {
                  setIsMonthPickerOpen(!isMonthPickerOpen);
                  setIsYearPickerOpen(false);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white flex items-center justify-between transition-all hover:bg-slate-700/50"
              >
                <span className="font-black text-[10px] uppercase tracking-widest">
                  {months.find(m => m.v === selectedMonth)?.n}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMonthPickerOpen && (
                <div className="absolute z-50 mt-2 w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="max-h-60 overflow-y-auto no-scrollbar">
                    {months.map((m) => (
                      <button
                        key={m.v}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(m.v);
                          setIsMonthPickerOpen(false);
                        }}
                        className="w-full px-4 py-1.5 text-left hover:bg-white/5 transition-all border-b border-white/5 last:border-0"
                      >
                        <p className={`font-black text-[9px] uppercase tracking-widest ${selectedMonth === m.v ? 'text-indigo-400' : 'text-slate-400'}`}>
                          {m.n}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative min-w-[90px]">
              <button
                type="button"
                onClick={() => {
                  setIsYearPickerOpen(!isYearPickerOpen);
                  setIsMonthPickerOpen(false);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white flex items-center justify-between transition-all hover:bg-slate-700/50"
              >
                <span className="font-black text-[10px]">
                  {selectedYear}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isYearPickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isYearPickerOpen && (
                <div className="absolute z-50 mt-2 w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setSelectedYear(y);
                        setIsYearPickerOpen(false);
                      }}
                      className="w-full px-4 py-1.5 text-left hover:bg-white/5 transition-all border-b border-white/5 last:border-0"
                    >
                      <p className={`font-black text-[9px] uppercase tracking-widest ${selectedYear === y ? 'text-indigo-400' : 'text-slate-400'}`}>
                        {y}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
         </div>
      )}

      {/* List */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <div 
              key={`${item.loanId}-${item.installmentNumber}`}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition-all group flex flex-col shadow-lg"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h4 className="text-lg font-bold text-white leading-tight pr-4">{item.customerName}</h4>
                  <div className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest shrink-0">
                    Cuota {item.installmentNumber}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase mb-4">
                   <Phone className="w-2.5 h-2.5" /> {item.customerPhone}
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[8.5px] font-black uppercase tracking-wider">A Cobrar</span>
                    <span className="text-xl font-black text-white">
                      ${item.amountToCollect.toLocaleString('es-CO')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-slate-800/40 rounded-xl border border-slate-800/50">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Vencimiento</p>
                      <p className="text-xs font-bold text-slate-300">
                        {format(new Date(item.dueDate), "d MMM", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-indigo-500/10 active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                    >
                      Realizar Cobro
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[30vh] bg-slate-900 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-8">
          <CheckCircle2 className="w-8 h-8 text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">¡Todo al día!</h3>
          <p className="text-slate-500 text-xs max-w-xs uppercase tracking-widest font-black opacity-50">Sin cobros pendientes</p>
        </div>
      )}

      <PaymentModal 
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSuccess={fetchAgenda}
      />
    </div>
  );
}
