'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Customer, PaymentFrequency, LoanRequest } from '@/types';
import { 
  ArrowLeft, 
  User, 
  DollarSign, 
  Percent, 
  CalendarDays, 
  RefreshCcw,
  Plus,
  Loader2,
  CheckCircle2,
  Calendar,
  Search,
  X,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CustomCalendar from '../../components/CustomCalendar';

export default function NewLoanPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [amount, setAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('10'); // Default 10
  const [installmentsCount, setInstallmentsCount] = useState<string>('2'); // Default 2
  const [frequency, setFrequency] = useState<PaymentFrequency>('MONTHLY'); // Default MONTHLY
  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customers');
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
    document.title = "Nuevo Crédito | PayFig";
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !amount || !interestRate || !installmentsCount) {
      alert('Por favor selecciona un cliente y completa todos los campos.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: LoanRequest = {
        customerId: selectedCustomer.id,
        amount: parseFloat(amount),
        interestRate: parseInt(interestRate),
        installmentsCount: parseInt(installmentsCount),
        frequency: frequency,
        startDate: startDate
      };

      await api.post('/loans', payload);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating loan:', error);
      alert('Error al crear el crédito. Por favor verifica los datos.');
    } finally {
      setSubmitting(false);
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const numRate = parseInt(interestRate) || 0;
  const numInst = parseInt(installmentsCount) || 1;

  const interestPerInstallment = numAmount * (numRate / 100);
  const capitalPerInstallment = numAmount / numInst;
  const installmentAmount = capitalPerInstallment + interestPerInstallment;
  const totalToPay = installmentAmount * numInst;

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const getFrequencyText = (f: PaymentFrequency) => {
    switch(f) {
      case 'DAILY': return 'Diario';
      case 'WEEKLY': return 'Semanal';
      case 'BIWEEKLY': return 'Quincenal';
      case 'MONTHLY': return 'Mensual';
      default: return f;
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard"
          className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-black text-white italic uppercase tracking-tight">Nuevo Crédito</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selección de Cliente */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <label className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
            <User className="w-3 h-3" /> Cliente
          </label>
          
          <div className="relative">
            {selectedCustomer ? (
              <div className="flex items-center justify-between w-full bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-3 text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] uppercase">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-none">{selectedCustomer.name}</p>
                    <p className="text-[9px] text-slate-500 mt-1">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-4 h-4 text-indigo-400" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  />
                </div>

                {isDropdownOpen && customerSearch && (
                  <div className="absolute z-50 mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                    {filteredCustomers.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCustomers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(c);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-700 transition-all border-b border-slate-700 last:border-0"
                          >
                            <p className="font-bold text-white text-sm">{c.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase">{c.phone}</p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-slate-500 text-sm">No se encontraron clientes</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Inputs en Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <label className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
              <DollarSign className="w-3 h-3" /> Capital
            </label>
            <input
              required
              type="number"
              placeholder="Ej: 100000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <label className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
              <Percent className="w-3 h-3" /> Interés
            </label>
            <input
              required
              type="number"
              placeholder="10"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <label className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
              <CalendarDays className="w-3 h-3" /> Cuotas
            </label>
            <input
              required
              type="number"
              placeholder="2"
              value={installmentsCount}
              onChange={(e) => setInstallmentsCount(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <label className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
              <RefreshCcw className="w-3 h-3" /> Frecuencia
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFrequencyOpen(!isFrequencyOpen)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-white flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all hover:bg-slate-700/30"
              >
                <span className="text-xs">
                  {getFrequencyText(frequency)}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isFrequencyOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFrequencyOpen && (
                <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  {(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'] as PaymentFrequency[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setFrequency(f);
                        setIsFrequencyOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-700 transition-all border-b border-slate-700 last:border-0"
                    >
                      <p className="text-white text-xs">
                        {getFrequencyText(f)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fecha Inicio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <label className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-3">
            <Calendar className="w-3 h-3 text-indigo-500" /> Fecha de Préstamo
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="w-full bg-slate-800/20 border border-slate-800 rounded-xl px-4 py-2.5 text-white flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-xs tracking-tight">
                  {format(new Date(startDate + 'T12:00:00'), "dd 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
            </button>

            {isCalendarOpen && (
              <CustomCalendar 
                selectedDate={new Date(startDate + 'T12:00:00')}
                onSelect={(date) => {
                  setStartDate(format(date, 'yyyy-MM-dd'));
                  setIsCalendarOpen(false);
                }}
                onClose={() => setIsCalendarOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-4 space-y-2">
          <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" /> Resumen del Crédito
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Total a Recolectar</p>
              <p className="text-lg font-black text-white">${totalToPay.toLocaleString('es-CO')}</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Valor Cuota</p>
              <p className="text-lg font-black text-white">${installmentAmount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="pt-3 border-t border-indigo-500/5">
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
               {installmentsCount} pagos {frequency === 'DAILY' ? 'diarios' : frequency === 'WEEKLY' ? 'semanales' : frequency === 'BIWEEKLY' ? 'quincenales' : 'mensuales'}
             </p>
          </div>
        </div>

        <button
          disabled={submitting}
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" /> Crear Crédito
            </>
          )}
        </button>
      </form>
    </div>
  );
}
