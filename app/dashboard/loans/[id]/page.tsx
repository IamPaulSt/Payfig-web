'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { Loan, CollectionAgendaItem } from '@/types';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  Calendar, 
  Loader2, 
  Clock,
  CheckCircle2,
  Phone,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PaymentModal from '../../components/PaymentModal';

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<CollectionAgendaItem | null>(null);

  const fetchLoan = useCallback(async () => {
    try {
      const response = await api.get(`/loans/${id}`);
      setLoan(response.data);
    } catch (error) {
      console.error('Error fetching loan details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLoan();
  }, [fetchLoan]);

  useEffect(() => {
    document.title = "Detalle de Crédito | PayFig";
  }, []);

  const handleOpenPayment = (inst: { installmentNumber: number; amount: number; interestAmount: number; dueDate: string }) => {
    if (!loan) return;

    // Calculamos la liquidación total para el modal
    const futureCapital = loan.installments
      ?.filter(i => i.status === 'PENDING' && i.installmentNumber > inst.installmentNumber)
      .reduce((acc, i) => acc + (i.amount - i.interestAmount), 0) || 0;
    
    const liquidation = inst.amount + futureCapital;

    const agendaItem: CollectionAgendaItem = {
      loanId: loan.id,
      customerName: loan.customer.name,
      customerPhone: loan.customer.phone,
      installmentNumber: inst.installmentNumber,
      amountToCollect: inst.amount,
      interestAmount: inst.interestAmount,
      totalLiquidation: liquidation,
      dueDate: inst.dueDate
    };
    setSelectedItem(agendaItem);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="p-12 text-center text-slate-500 bg-slate-900 border border-dashed border-slate-800 rounded-[2.5rem]">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-700" />
        Crédito no encontrado
        <div className="mt-4">
          <Link href="/dashboard/loans" className="text-indigo-400 font-bold hover:underline">Volver a créditos</Link>
        </div>
      </div>
    );
  }

  const paidInstallments = loan.installments?.filter(i => i.status === 'PAID').length || 0;
  const progress = (paidInstallments / loan.installmentsCount) * 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/loans"
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Detalle de Crédito</h3>
          <div className="flex items-center gap-3">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">{loan.customer.name}</p>
            <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">
               <Phone className="w-2.5 h-2.5" /> {loan.customer.phone}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Loan Summary & Stats */}
        <div className="lg:col-span-1 space-y-6">
           {/* Main Stats Card */}
           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
              <div className="relative z-10 space-y-6">
                <div>
                   <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1.5">Monto del Préstamo</p>
                   <h2 className="text-3xl font-black text-white italic">${loan.amount.toLocaleString('es-CO')}</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/30">
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Tasa Interés</p>
                      <p className="text-lg font-black text-emerald-400">{loan.interestRate}%</p>
                   </div>
                   <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/30">
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Frecuencia</p>
                      <p className="text-lg font-black text-indigo-400">
                        {loan.frequency === 'DAILY' ? 'Día' : loan.frequency === 'WEEKLY' ? 'Sem' : 'Mes'}
                      </p>
                   </div>
                </div>

                <div className="space-y-1.5">
                   <div className="flex justify-between items-end">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Progreso de Pago</p>
                      <p className="text-[10px] font-black text-white">{paidInstallments} / {loan.installmentsCount}</p>
                   </div>
                   <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                      <div 
                        className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 font-black uppercase">Total a Recaudar</span>
                      <span className="text-base font-black text-white">${loan.totalToPay.toLocaleString('es-CO')}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 font-black uppercase">Fecha Inicio</span>
                      <span className="text-xs font-bold text-slate-300 uppercase">{format(new Date(loan.startDate), "dd MMM yyyy", { locale: es })}</span>
                   </div>
                </div>
              </div>
           </div>

        </div>

        {/* Right Column: Installments List */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between px-2 mb-2">
              <h4 className="text-lg font-black text-white italic uppercase">Plan de Pagos</h4>
              <div className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Detalle de Cuotas
              </div>
           </div>

           <div className="space-y-3 max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
             {loan.installments?.sort((a,b) => a.installmentNumber - b.installmentNumber).map((inst) => (
                <div 
                  key={inst.id}
                  onClick={() => inst.status === 'PENDING' && handleOpenPayment(inst)}
                  className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group transition-all ring-1 ring-white/5 shadow-lg ${
                    inst.status === 'PENDING' ? 'cursor-pointer hover:border-slate-600 hover:bg-slate-850 active:scale-[0.99]' : 'opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-transform group-hover:scale-110 ${
                      inst.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {inst.installmentNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-black text-white">${inst.amount.toLocaleString('es-CO')}</p>
                        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
                          Cap: ${(inst.amount - inst.interestAmount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-2.5 h-2.5 text-slate-500" />
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                          {format(new Date(inst.dueDate), "dd MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                     {inst.status === 'PAID' ? (
                        <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                           <CheckCircle2 className="w-3.5 h-3.5" /> Pagada
                        </div>
                     ) : (
                       (() => {
                         const isOverdue = new Date(inst.dueDate) < new Date(new Date().setHours(0,0,0,0));
                         return isOverdue ? (
                           <div className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                              <AlertCircle className="w-3.5 h-3.5" /> Vencida
                           </div>
                         ) : (
                           <div className="bg-slate-800 text-indigo-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <Clock className="w-3.5 h-3.5" /> Cobrar
                           </div>
                         );
                       })()
                     )}
                  </div>
                </div>
             ))}
           </div>
        </div>
      </div>

      <PaymentModal 
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSuccess={fetchLoan}
      />
    </div>
  );
}
