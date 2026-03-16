'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { Loan, Customer, CollectionAgendaItem, PaymentFrequency } from '@/types';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  CircleDollarSign,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PaymentModal from '../../components/PaymentModal';
import CustomerEditModal from '../../components/CustomerEditModal';
import { Pencil } from 'lucide-react';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLoan, setExpandedLoan] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<CollectionAgendaItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    document.title = "Perfil de Cliente | PayFig";
  }, []);

  const handleOpenPayment = (loan: Loan, inst: { installmentNumber: number; amount: number; interestAmount: number; dueDate: string }) => {
    const futureCapital = loan.installments
      ?.filter(i => i.status === 'PENDING' && i.installmentNumber > inst.installmentNumber)
      .reduce((acc, i) => acc + (i.amount - i.interestAmount), 0) || 0;
    
    const liquidation = inst.amount + futureCapital;

    const agendaItem: CollectionAgendaItem = {
      loanId: loan.id,
      customerId: customer?.id || 0,
      customerName: customer?.name || '',
      customerPhone: customer?.phone || '',
      installmentNumber: inst.installmentNumber,
      amountToCollect: inst.amount,
      interestAmount: inst.interestAmount,
      totalLiquidation: liquidation,
      dueDate: inst.dueDate,
      isOverdue: new Date(inst.dueDate) < new Date(new Date().setHours(0,0,0,0))
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
        <Loader2 className="w-8 h-8 text-army-primary animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-army-accent/40 bg-army-900 border border-dashed border-army-800 rounded-3xl m-6">
        Cliente no encontrado
      </div>
    );
  }

  const isOverdue = loans.some(l => l.status === 'OVERDUE');

  return (
    <div className="space-y-4 pb-10">
      {/* Header compact info */}
      <div className="bg-army-900 border border-army-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/customers"
            className="p-2 bg-army-800 rounded-xl text-army-accent/40 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white italic uppercase tracking-tight leading-none">{customer.name}</h3>
            </div>
            <div className="flex flex-wrap gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-[8.5px] text-army-accent/60 font-bold uppercase tracking-wide">
                <Phone className="w-3 h-3" /> {customer.phone}
              </div>
              {customer.address && (
                <div className="flex items-center gap-1.5 text-[8.5px] text-army-accent/60 font-bold uppercase tracking-wide">
                  <MapPin className="w-3 h-3" /> {customer.address}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-2.5 bg-army-800 rounded-xl text-white transition-all shadow-lg active:scale-95"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <div className="hidden md:flex flex-col items-end shrink-0">
               <div className="text-[7px] text-army-accent/40 font-black uppercase tracking-widest leading-none">Créditos</div>
               <div className="text-lg font-black text-white leading-none mt-1">{loans.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-army-accent/40 uppercase tracking-[0.2em] px-2 mb-1">Historial de Créditos</h4>
        
        {loans.length > 0 ? (
          loans.map((loan) => (
            <div key={loan.id} className="bg-army-900 border border-army-800 rounded-3xl shadow-xl overflow-hidden ring-1 ring-white/5">
              <div 
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-army-800 transition-all border-l-4 border-l-army-primary"
                onClick={() => setExpandedLoan(expandedLoan === loan.id ? null : loan.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-army-800 p-2.5 rounded-xl text-army-accent">
                    <CircleDollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-base font-black text-white italic">${loan.amount.toLocaleString('es-CO')}</p>
                    <p className="text-[9px] text-army-accent/60 font-bold uppercase tracking-widest mt-0.5">{loan.installmentsCount} cuotas • {getFrequencyLabel(loan.frequency)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right">
                    <p className={`text-[10px] font-black italic ${
                      loan.status === 'ACTIVE' ? 'text-army-accent' : 
                      loan.status === 'OVERDUE' ? 'text-rose-500' : 'text-army-accent/40'
                    }`}>
                      {loan.status === 'ACTIVE' ? 'ACTIVO' : 
                       loan.status === 'OVERDUE' ? 'EN MORA' : 'PAGADO'}
                    </p>
                    <p className="text-[9px] text-army-accent/40 font-bold uppercase tracking-widest">{format(new Date(loan.startDate + 'T00:00:00'), "dd MMM yyyy", { locale: es })}</p>
                  </div>
                  {expandedLoan === loan.id ? <ChevronUp className="w-4 h-4 text-army-accent/40" /> : <ChevronDown className="w-4 h-4 text-army-accent/40" />}
                </div>
              </div>

              {expandedLoan === loan.id && (
                <div className="p-4 bg-army-800/10 border-t border-army-800 space-y-2">
                  <h5 className="text-[9px] font-black text-army-accent/40 uppercase tracking-widest px-2 mb-2">Cuotas</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {loan.installments?.sort((a,b) => a.installmentNumber - b.installmentNumber).map((inst) => (
                      <div key={inst.id} className="bg-army-900 p-3 rounded-xl border border-army-800/50 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-army-accent/20">#{inst.installmentNumber}</span>
                          <div>
                            <p className="text-xs font-black text-white">${inst.amount.toLocaleString('es-CO')}</p>
                            <p className="text-[9px] text-army-accent/40 font-bold uppercase tracking-tighter">{format(new Date(inst.dueDate + 'T00:00:00'), "dd MMMM yyyy", { locale: es })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {inst.status === 'PAID' ? (
                            <div className="text-army-accent text-[9px] font-black uppercase tracking-widest bg-army-accent/10 px-2 py-1 rounded-full border border-army-accent/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Paga
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleOpenPayment(loan, inst)}
                              className="text-army-accent text-[9px] font-black uppercase tracking-widest bg-army-800 px-3 py-1 rounded-full border border-army-primary/20 hover:bg-army-primary hover:text-white transition-all flex items-center gap-1.5"
                            >
                              <Clock className="w-3 h-3" /> Pagar
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
          <div className="p-8 text-center text-army-accent/20 bg-army-900/50 border border-dashed border-army-800 rounded-3xl">
            <p className="text-[10px] font-black uppercase tracking-widest">Sin historial de préstamos</p>
          </div>
        )}
      </div>

      <PaymentModal 
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSuccess={fetchData}
      />

      {isEditModalOpen && (
        <CustomerEditModal 
          customer={customer}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
