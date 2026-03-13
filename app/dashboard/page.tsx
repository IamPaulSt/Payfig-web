'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { CollectionAgendaItem, CashSummary } from '@/types';
import { 
  Plus,
  Loader2,
  Calendar,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  DollarSign,
  CircleDollarSign,
  Wallet,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { isToday, isTomorrow, isBefore } from 'date-fns';
import PaymentModal from './components/PaymentModal';

export default function SummaryPage() {
  const [items, setItems] = useState<CollectionAgendaItem[]>([]);
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState<CollectionAgendaItem | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [immediateRes, summaryRes] = await Promise.all([
        api.get('/loans/dashboard/immediate'),
        api.get('/loans/dashboard/summary')
      ]);
      setItems(immediateRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    document.title = "Dashboard | PayFig";
  }, [fetchData]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* KPIs de Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Money in the street */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden group">
          <div className="bg-emerald-500/10 text-emerald-500 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-wider">Por Recaudar</p>
          <p className="text-xl font-black text-white mt-0.5">
            ${(summary?.moneyInTheStreet || 0).toLocaleString('es-CO')}
          </p>
        </div>

        {/* Total Lent */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden group">
          <div className="bg-indigo-500/10 text-indigo-500 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
            <CircleDollarSign className="w-4 h-4" />
          </div>
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-wider">Total Prestado</p>
          <p className="text-xl font-black text-white mt-0.5">
            ${(summary?.totalLent || 0).toLocaleString('es-CO')}
          </p>
        </div>

        {/* Monthly Collections */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden group">
          <div className="bg-blue-500/10 text-blue-500 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-wider">Recaudado Mes</p>
          <p className="text-xl font-black text-white mt-0.5">
            ${(summary?.monthlyCollections || 0).toLocaleString('es-CO')}
          </p>
        </div>

        {/* Active Loans */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden group">
          <div className="bg-amber-500/10 text-amber-500 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-wider">Créditos</p>
          <p className="text-xl font-black text-white mt-0.5">
            {summary?.activeLoansCount || 0} <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">activos</span>
          </p>
        </div>
      </div>

      {/* Header con botón de acción */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-xl font-bold text-white">Pendientes Urgentes</h3>
        <Link 
          href="/dashboard/loans/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-sm font-bold"
        >
          <Plus className="w-4 h-4" /> Nuevo Crédito
        </Link>
      </div>

      {/* Lista de Cobros Inmediatos */}
      <div className="grid grid-cols-1 gap-4">
        {items.length > 0 ? items.map((item) => {
          const dueDate = new Date(item.dueDate + 'T00:00:00');
          let label = "";
          let badgeClass = "";
          let icon = <Clock className="w-3.5 h-3.5" />;

          const today = new Date();
          today.setHours(0,0,0,0);

          if (isBefore(dueDate, today)) {
            label = "EN MORA";
            badgeClass = "bg-red-500/10 text-red-500 border-red-500/20";
            icon = <AlertCircle className="w-3.5 h-3.5" />;
          } else if (isToday(dueDate)) {
            label = "PARA HOY";
            badgeClass = "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
            icon = <Clock className="w-3.5 h-3.5" />;
          } else if (isTomorrow(dueDate)) {
            label = "MAÑANA";
            badgeClass = "bg-slate-800 text-slate-400 border-slate-700";
            icon = <Calendar className="w-3.5 h-3.5" />;
          } else {
            label = "PRÓXIMO";
            badgeClass = "bg-slate-800 text-slate-500 border-slate-700";
            icon = <Calendar className="w-3.5 h-3.5" />;
          }

          return (
            <div 
              key={`${item.loanId}-${item.installmentNumber}`}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition-all shadow-xl group"
            >
              <div className="flex items-center justify-between mb-4">
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border flex items-center gap-1.5 ${badgeClass}`}>
                    {icon} {label}
                 </div>
                 <span className="text-slate-500 text-[10px] font-black uppercase">Cuota {item.installmentNumber}</span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-bold text-white leading-none mb-1">{item.customerName}</h4>
                  <p className="text-slate-500 text-xs flex items-center gap-1 font-medium">
                    <Phone className="w-3 h-3" /> {item.customerPhone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-tighter mb-1">Monto</p>
                  <p className="text-2xl font-black text-white">
                    ${item.amountToCollect.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedItem(item)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-indigo-500/10 active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Pagar
                </button>
                <Link 
                  href={`/dashboard/loans/${item.loanId}`}
                  className="w-12 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all flex items-center justify-center active:scale-95 border border-slate-700"
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-20 bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-800">
             <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
             </div>
             <h3 className="text-lg font-bold text-white mb-2">¡Todo al día!</h3>
             <p className="text-slate-500 text-sm max-w-[200px] mx-auto">
               No tienes cobros pendientes urgentes por ahora.
             </p>
          </div>
        )}
      </div>

      <PaymentModal 
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSuccess={fetchData}
      />
    </div>
  );
}
