'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { OverdueReportItem } from '@/types';
import { 
  AlertTriangle, 
  Phone, 
  Loader2,
  Clock,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function OverdueReportPage() {
  const [items, setItems] = useState<OverdueReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get('/loans/overdue-report');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching overdue report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
    document.title = "Lista de Mora | PayFig";
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Banner de Estado de Mora */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-4 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-red-500 p-2.5 rounded-xl shadow-lg shadow-red-500/20">
            <AlertTriangle className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Lista de Mora</h3>
            <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">Hay {items.length} cuotas atrasadas</p>
          </div>
        </div>
      </div>

      {/* Lista de Deudores (Vista Mobile Priority) */}
      <div className="space-y-4">
        {items.length > 0 ? items.map((item, index) => (
          <div 
            key={index} 
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg group active:bg-slate-850 transition-all border-l-4 border-l-red-500"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <Link href={`/dashboard/customers/${item.customerId}`}>
                  <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                    {item.customerName}
                  </h4>
                </Link>
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-0.5">
                  <Phone className="w-2.5 h-2.5" /> {item.customerPhone}
                </div>
              </div>
              <div className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase ${
                  item.daysOverdue > 7 ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600/20 text-amber-500'
                }`}>
                  {item.daysOverdue} DÍAS MORA
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                <p className="text-[8.5px] text-slate-500 font-black uppercase tracking-widest mb-1">Monto</p>
                <p className="text-base font-black text-white">
                  ${item.overdueAmount.toLocaleString('es-CO')}
                </p>
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                <p className="text-[8.5px] text-slate-500 font-black uppercase tracking-widest mb-1">Venció</p>
                <p className="text-[11px] font-bold text-slate-300">
                  {format(new Date(item.dueDate + 'T00:00:00'), "dd MMM", { locale: es })}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-slate-800/50 text-slate-500 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl flex items-center justify-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Pendiente de Cobro
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
            <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-emerald-500 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">¡Sin Mora!</h3>
            <p className="text-slate-500 text-sm">Todo está al día por el momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}

