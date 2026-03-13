'use client';

import { useEffect, useState, use } from 'react';
import { Loan, Customer, CollectionAgendaItem, PaymentFrequency } from '@/types';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  Wallet, 
  Calendar, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  CircleDollarSign
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PaymentModal from '../../components/PaymentModal';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLoan, setExpandedLoan] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<CollectionAgendaItem | null>(null);

  const fetchData = async () => {
    try {
      const [customerRes, loansRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/loans/customer/${id}/history`)
      ]);
      setCustomer(customerRes.data);
      setLoans(loansRes.data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    document.title = "Perfil de Cliente | PayFig";
  }, []);

  const handleOpenPayment = (loan: Loan, inst: any) => {
    const futureCapital = loan.installments
      ?.filter(i => i.status === 'PENDING' && i.installmentNumber > inst.installmentNumber)
      .reduce((acc, i) => acc + (i.amount - i.interestAmount), 0) || 0;
    
    const liquidation = inst.amount + futureCapital;

    const agendaItem: CollectionAgendaItem = {
      loanId: loan.id,
      customerName: customer?.name || '',
      customerPhone: customer?.phone || '',
      installmentNumber: inst.installmentNumber,
      amountToCollect: inst.amount,
      interestAmount: inst.interestAmount,
      totalLiquidation: liquidation,
      dueDate: inst.dueDate
    };
    setSelectedItem(agendaItem);
  };

  const getFrequencyLabel = (frequency: PaymentFrequency) => {
    const labels: Record<PaymentFrequency, string> = {
      DAILY: 'Diario',
      WEEKLY: 'Semanal',
      BIWEEKLY: 'Quincenal',
      MONTHLY: 'Mensual'
    };
    return labels[frequency] || frequency;
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900 border border-dashed border-slate-800 rounded-3xl m-6">
        Cliente no encontrado
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Header compact info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/customers"
            className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h3 className="text-lg font-black text-white italic uppercase tracking-tight leading-none">{customer.name}</h3>
            <div className="flex flex-wrap gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500 font-bold uppercase tracking-wide">
                <Phone className="w-3 h-3" /> {customer.phone}
              </div>
              {customer.address && (
                <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500 font-bold uppercase tracking-wide">
                  <MapPin className="w-3 h-3" /> {customer.address}
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end shrink-0">
             <div className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none">Créditos</div>
             <div className="text-lg font-black text-white leading-none mt-1">{loans.length}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 mb-1">Historial de Créditos</h4>
        
        {loans.length > 0 ? (
          loans.map((loan) => (
            <div key={loan.id} className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden ring-1 ring-white/5">
              <div 
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-850 transition-all border-l-4 border-l-indigo-600"
                onClick={() => setExpandedLoan(expandedLoan === loan.id ? null : loan.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800 p-2.5 rounded-xl text-indigo-400">
                    <CircleDollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-base font-black text-white italic">${loan.amount.toLocaleString('es-CO')}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{loan.installmentsCount} cuotas • {getFrequencyLabel(loan.frequency)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right">
                    <p className={`text-[10px] font-black italic ${loan.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'}`}>{loan.status === 'ACTIVE' ? 'ACTIVO' : 'PAGADO'}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{format(new Date(loan.startDate), "dd MMM yyyy", { locale: es })}</p>
                  </div>
                  {expandedLoan === loan.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
              </div>

              {expandedLoan === loan.id && (
                <div className="p-4 bg-slate-850/50 border-t border-slate-800 space-y-2">
                  <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 mb-2">Cuotas</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {loan.installments?.sort((a,b) => a.installmentNumber - b.installmentNumber).map((inst) => (
                      <div key={inst.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800/50 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-600">#{inst.installmentNumber}</span>
                          <div>
                            <p className="text-xs font-black text-white">${inst.amount.toLocaleString('es-CO')}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{format(new Date(inst.dueDate), "dd MMMM yyyy", { locale: es })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {inst.status === 'PAID' ? (
                            <div className="text-emerald-500 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Paga
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleOpenPayment(loan, inst)}
                              className="text-indigo-400 text-[9px] font-black uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5"
                            >
                              <Clock className="w-3 h-3" /> Cobrar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-600 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
            <p className="text-[10px] font-black uppercase tracking-widest">Sin historial de préstamos</p>
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
