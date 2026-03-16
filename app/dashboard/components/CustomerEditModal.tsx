'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, User, Phone, MapPin } from 'lucide-react';
import api from '@/lib/api';
import { Customer } from '@/types';

interface CustomerEditModalProps {
  customer: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomerEditModal({ customer, onClose, onSuccess }: CustomerEditModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setAddress(customer.address || '');
    }
  }, [customer]);

  if (!customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/customers/${customer.id}`, { name, phone, address });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Error al actualizar el cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-army-950/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div 
        className="bg-army-900 w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] border-t md:border border-army-800 p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3 italic uppercase tracking-tight">
            <User className="text-army-accent w-7 h-7" /> Editar Cliente
          </h3>
          <button 
            onClick={onClose}
            className="bg-army-800 p-2 rounded-xl text-army-accent/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-army-800/40 border border-army-800 rounded-2xl p-4 shadow-inner">
            <label className="block text-[9px] font-black text-army-accent/40 uppercase tracking-widest mb-2 flex items-center gap-2">
              <User className="w-3 h-3" /> Nombre Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full bg-transparent text-lg font-bold text-white focus:outline-none transition-all outline-none"
            />
          </div>

          <div className="bg-army-800/40 border border-army-800 rounded-2xl p-4 shadow-inner">
            <label className="block text-[9px] font-black text-army-accent/40 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Phone className="w-3 h-3" /> Número Celular
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="300 123 4567"
              className="w-full bg-transparent text-lg font-bold text-white focus:outline-none transition-all outline-none"
            />
          </div>

          <div className="bg-army-800/40 border border-army-800 rounded-2xl p-4 shadow-inner">
            <label className="block text-[9px] font-black text-army-accent/40 uppercase tracking-widest mb-2 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Dirección
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle 123 #45-67..."
              rows={2}
              className="w-full bg-transparent text-sm font-bold text-white focus:outline-none transition-all outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-army-800 text-army-accent/60 font-black py-4 rounded-2xl hover:bg-army-700 transition-all text-[11px] uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              disabled={saving}
              type="submit"
              className="flex-1 bg-army-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-army-primary/20 hover:bg-army-hover active:scale-95 transition-all flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
