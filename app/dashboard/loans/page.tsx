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
          bg: 'bg-indigo-500/10',
          text: 'text-indigo-400',
          border: 'border-indigo-500/20',
          icon: Clock,
          label: 'Activo'
        };
      case 'PAID':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
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
          bg: 'bg-slate-500/10',
          text: 'text-slate-400',
          border: 'border-slate-500/20',
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-xl">
                <Wallet className="w-5 h-5" />
             </div>
             <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Créditos</h3>
          </div>
          <Link 
            href="/dashboard/loans/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 shadow-inner"
            />
          </div>

          <div className="flex bg-slate-800/50 p-1 rounded-xl shadow-inner border border-slate-700/30">
            {(['ALL', 'ACTIVE', 'PAID', 'OVERDUE'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === tab 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-white'
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
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
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
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition-all group flex flex-col shadow-xl relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest flex items-center gap-1`}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    {statusConfig.label}
                  </div>
                </div>

                <div className="mb-2">
                  <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight mb-1.5 pr-12">
                    {loan.customer.name}
                  </h4>
                </div>

                <div className="space-y-1.5 mb-5">
                  <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/50 flex items-center justify-between">
                    <p className="text-[8.5px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1">
                      <DollarSign className="w-2.5 h-2.5" /> Total
                    </p>
                    <p className="text-xs font-black text-white">${loan.totalToPay.toLocaleString('es-CO')}</p>
                  </div>
                  <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/50 flex items-center justify-between">
                    <p className="text-[8.5px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5" /> Tasa
                    </p>
                    <p className="text-xs font-black text-emerald-400">{loan.interestRate}%</p>
                  </div>
                </div>

                <div className="space-y-2 mb-5 flex-1">
                   <div className="flex items-center justify-between text-[10px]">
                     <span className="text-slate-500 font-bold uppercase tracking-widest text-[8.5px]">Cuotas</span>
                     <span className="text-white font-black">{loan.installmentsCount} {getFrequencyLabel(loan.frequency)}</span>
                   </div>
                   <div className="flex items-center justify-between text-[10px]">
                     <span className="text-slate-500 font-bold uppercase tracking-widest text-[8.5px]">Inicio</span>
                     <span className="text-slate-300 font-bold uppercase">{format(new Date(loan.startDate), "d MMM, yyyy", { locale: es })}</span>
                   </div>
                </div>

                <Link 
                  href={`/dashboard/loans/${loan.id}`}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 group/btn text-xs"
                >
                  Ver Detalles 
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-indigo-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
                </Link>
              </div>
            );
          })}

          {filteredLoans.length === 0 && (
            <div className="col-span-full py-20 bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center animate-pulse">
               <Wallet className="w-12 h-12 text-slate-700 mb-4" />
               <p className="text-slate-500 font-bold uppercase tracking-widest text-sm italic">No se encontraron créditos</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
