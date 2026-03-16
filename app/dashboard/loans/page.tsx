'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loan, LoanStatus } from '@/types';
import { 
  Wallet, 
  Search, 
  Plus, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchLoans();
    document.title = "Créditos | PayFig";
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/loans/my-collections');
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: LoanStatus) => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: 'bg-army-primary/10',
          text: 'text-army-accent',
          border: 'border-army-primary/20',
          icon: Clock,
          label: 'Activo'
        };
      case 'PAID':
        return {
          bg: 'bg-army-accent/10',
          text: 'text-army-accent',
          border: 'border-army-accent/20',
          icon: CheckCircle2,
          label: 'Pagado'
        };
      case 'OVERDUE':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/20',
          icon: AlertCircle,
          label: 'En Mora'
        };
      default:
        return {
          bg: 'bg-army-800/10',
          text: 'text-army-accent/40',
          border: 'border-army-700/20',
          icon: Clock,
          label: status
        };
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'DAILY': return 'DIARIO';
      case 'WEEKLY': return 'SEMANAL';
      case 'BIWEEKLY': return 'QUINCENAL';
      case 'MONTHLY': return 'MENSUAL';
      default: return freq;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="bg-army-900 border border-army-800 rounded-3xl p-4 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-army-primary text-white p-2 rounded-xl shadow-lg shadow-army-primary/20">
                <Wallet className="w-5 h-5" />
             </div>
             <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Créditos</h3>
          </div>
          <Link 
            href="/dashboard/loans/new"
            className="bg-army-primary hover:bg-army-hover text-white p-2 rounded-xl shadow-lg shadow-army-primary/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-army-accent/40 group-focus-within:text-army-accent transition-colors" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-army-800/50 border border-army-700/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-army-primary/50 focus:border-army-primary/50 transition-all placeholder:text-army-accent/20 shadow-inner"
            />
          </div>

          <div className="flex bg-army-800/50 p-1 rounded-xl shadow-inner border border-army-700/30">
            {(['ALL', 'ACTIVE', 'PAID', 'OVERDUE'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === tab 
                    ? 'bg-army-primary text-white shadow-lg' 
                    : 'text-army-accent/40 hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'Todos' : tab === 'ACTIVE' ? 'Activos' : tab === 'PAID' ? 'Pagos' : 'Mora'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loans Grid */}
      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-army-primary animate-spin" />
            <div className="absolute inset-0 blur-xl bg-army-primary/20 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLoans.map((loan) => {
            const statusConfig = getStatusStyle(loan.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div 
                key={loan.id}
                className="bg-army-900 border border-army-800 rounded-3xl p-5 hover:border-army-700 transition-all group flex flex-col shadow-xl relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest flex items-center gap-1`}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    {statusConfig.label}
                  </div>
                </div>

                <div className="mb-2">
                  <h4 className="text-lg font-bold text-white group-hover:text-army-accent transition-colors leading-tight mb-1.5 pr-12">
                    {loan.customer.name}
                  </h4>
                </div>

                <div className="space-y-1.5 mb-5">
                  <div className="bg-army-800/40 p-2.5 rounded-xl border border-army-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3 text-army-accent" />
                      <p className="text-[9px] text-army-accent/40 uppercase font-black tracking-widest mt-0.5">Prestado</p>
                    </div>
                    <p className="text-sm font-black text-white">${loan.amount.toLocaleString('es-CO')}</p>
                  </div>
                  <div className="bg-army-800/40 p-2.5 rounded-xl border border-army-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-army-accent" />
                      <p className="text-[9px] text-army-accent/40 uppercase font-black tracking-widest mt-0.5">Tasa</p>
                    </div>
                    <p className="text-sm font-black text-army-accent">{loan.interestRate}%</p>
                  </div>
                </div>

                <div className="space-y-2 mb-5 flex-1">
                   <div className="flex items-center justify-between text-[10px]">
                     <span className="text-army-accent/40 font-bold uppercase tracking-widest text-[8.5px]">Cuotas</span>
                     <span className="text-white font-black">{loan.installmentsCount} {getFrequencyLabel(loan.frequency)}</span>
                   </div>
                   <div className="flex items-center justify-between text-[10px]">
                     <span className="text-army-accent/40 font-bold uppercase tracking-widest text-[8.5px]">Inicio</span>
                     <span className="text-army-accent font-bold uppercase">{format(new Date(loan.startDate), "d MMM, yyyy", { locale: es })}</span>
                   </div>
                </div>

                <Link 
                  href={`/dashboard/loans/${loan.id}`}
                  className="w-full bg-army-800 hover:bg-army-700 text-white font-bold py-3 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 group/btn text-xs"
                >
                  Ver Detalles 
                  <ArrowUpRight className="w-3.5 h-3.5 text-army-accent/40 group-hover/btn:text-army-accent group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
                </Link>
              </div>
            );
          })}

          {filteredLoans.length === 0 && (
            <div className="col-span-full py-20 bg-army-900/50 rounded-[2.5rem] border-2 border-dashed border-army-800 flex flex-col items-center justify-center animate-pulse">
               <Wallet className="w-12 h-12 text-army-accent/20 mb-4" />
               <p className="text-army-accent/40 font-bold uppercase tracking-widest text-sm italic">No se encontraron créditos</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
