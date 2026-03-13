'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Loader2, 
  DollarSign, 
  HelpCircle,
  TrendingDown,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '@/lib/api';
import { CollectionAgendaItem, PaymentRequest, PaymentType, ExcessTarget } from '@/types';
import CustomCalendar from './CustomCalendar';

interface PaymentModalProps {
  item: CollectionAgendaItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ item, onClose, onSuccess }: PaymentModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<PaymentType>('FULL_INSTALLMENT');
  const [excessTarget, setExcessTarget] = useState<ExcessTarget>('NEXT');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (item) {
      setAmount(item.amountToCollect.toString());
      setSuccess(false);
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [item]);

  if (!item) return null;

  const handleClose = () => {
    setType('FULL_INSTALLMENT');
    setExcessTarget('NEXT');
    setIsCalendarOpen(false);
    setSuccess(false);
    if (item) {
      setAmount(item.amountToCollect.toString());
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: PaymentRequest = {
        loanId: item.loanId,
        amount: parseFloat(amount),
        type: type,
        excessTarget: excessTarget,
        paymentDate: `${paymentDate}T12:00:00` // Append time for LocalDateTime
      };

      await api.post('/loans/payment', payload);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error registering payment:', error);
      alert('Error registrando el pago. Revisa los datos.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeText = (t: PaymentType) => {
    switch (t) {
      case 'FULL_INSTALLMENT': return 'Cuota';
      case 'INTEREST_ONLY': return 'Solo Intereses';
      case 'FULL_LIQUIDATION': return 'Pago Total';
      case 'EXCESS_PAYMENT': return 'Abono Extra';
      default: return t;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 p-0 md:p-4">
      <div className="absolute inset-0" onClick={handleClose} />

      <div 
        className="bg-slate-900 w-full max-w-md rounded-t-[2rem] md:rounded-[2rem] shadow-2xl border-t md:border border-slate-800 animate-in slide-in-from-bottom-full md:slide-in-from-bottom-2 duration-300 overflow-visible relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-800 rounded-full" />
        </div>

        <div className="p-5 md:p-6 overflow-y-auto no-scrollbar">
          {success ? (
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic">¡Pago Exitoso!</h3>
                <p className="text-slate-500 text-xs mt-1">Recaudo registrado correctamente.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-white italic uppercase tracking-tight">Pagos</h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{item.customerName}</p>
                </div>
                <button onClick={handleClose} className="p-1.5 bg-slate-800 text-slate-400 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Monto Compacto */}
                <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 shadow-inner ring-1 ring-white/5">
                  <label className="flex items-center gap-2 text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">
                    <DollarSign className="w-2.5 h-2.5" /> Cantidad
                  </label>
                  <div className="relative flex items-center">
                    <span className="text-xl font-black text-indigo-500/50 mr-1">$</span>
                    <input
                      required
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent border-none text-2xl font-black text-white focus:outline-none focus:ring-0 p-0"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Fecha Pago Estética */}
                <div className="relative">
                  <div 
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3 flex items-center justify-between px-4 ring-1 ring-white/5 group cursor-pointer"
                  >
                    <label className="text-slate-500 text-[9px] font-black uppercase tracking-widest cursor-pointer">
                      Fecha
                    </label>
                    
                    <div className="flex items-center">
                      <span className="text-slate-300 text-[10px] font-black uppercase tracking-tight leading-none">
                        {format(new Date(paymentDate + 'T12:00:00'), "dd MMM, yyyy", { locale: es })}
                      </span>
                    </div>
                  </div>

                  {isCalendarOpen && (
                    <CustomCalendar 
                      selectedDate={new Date(paymentDate + 'T12:00:00')}
                      onSelect={(date) => {
                        setPaymentDate(date.toISOString().split('T')[0]);
                        setIsCalendarOpen(false);
                      }}
                      onClose={() => setIsCalendarOpen(false)}
                    />
                  )}
                </div>

                {/* Tipo de Pago Tabs más pequeños */}
                <div className="space-y-3">
                  <label className="text-slate-500 text-[9px] font-black uppercase tracking-widest pl-1">
                    Tipo de Pago
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['FULL_INSTALLMENT', 'INTEREST_ONLY', 'FULL_LIQUIDATION'] as PaymentType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setType(t);
                          if (t === 'INTEREST_ONLY') {
                            setAmount(item.interestAmount.toString());
                          } else if (t === 'FULL_INSTALLMENT') {
                            setAmount(item.amountToCollect.toString());
                          } else if (t === 'FULL_LIQUIDATION') {
                            setAmount(item.totalLiquidation.toString());
                          }
                        }}
                        className={`px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                          type === t 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                        }`}
                      >
                        {getTypeText(t)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Excedente Compacto */}
                {parseFloat(amount) > item.amountToCollect && type === 'FULL_INSTALLMENT' && (
                  <div className="bg-emerald-600/5 border border-emerald-500/10 rounded-2xl p-3 animate-in slide-in-from-top-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> Excedente
                      </p>
                      <p className="text-emerald-400 text-[9px] font-black">
                        ${(parseFloat(amount) - item.amountToCollect).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {(['NEXT', 'LAST'] as ExcessTarget[]).map((target) => (
                        <button
                          key={target}
                          type="button"
                          onClick={() => setExcessTarget(target)}
                          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black transition-all uppercase tracking-widest border ${
                            excessTarget === target
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                              : 'bg-slate-800/50 border-slate-700 text-slate-600'
                          }`}
                        >
                          {target === 'NEXT' ? 'Próxima' : 'Última'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  disabled={submitting}
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-2 text-[11px] tracking-widest uppercase"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Confirmar
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
