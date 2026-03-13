'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Customer } from '@/types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  MapPin, 
  Loader2, 
  X,
  Plus,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
    document.title = "Clientes | PayFig";
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/customers', { name, phone, address });
      setShowModal(false);
      setName('');
      setPhone('');
      setAddress('');
      fetchCustomers();
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error al crear el cliente');
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-xl">
                <Users className="w-5 h-5" />
             </div>
             <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Clientes</h3>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o celular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredCustomers.map((customer) => (
            <div 
              key={customer.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 active:bg-slate-850 transition-all group flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 w-10 h-10 rounded-xl flex items-center justify-center font-black text-indigo-400 text-base">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{customer.name}</h4>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" /> {customer.phone}
                    </p>
                    {customer.address && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate max-w-[180px]">
                        <MapPin className="w-2.5 h-2.5" /> {customer.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <Link 
                   href={`/dashboard/customers/${customer.id}`}
                   className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:text-indigo-400 transition-all active:scale-90"
                 >
                    <ChevronRight className="w-4 h-4" />
                 </Link>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
               <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
               <p className="text-slate-500">No se encontraron clientes</p>
            </div>
          )}
        </div>
      )}

      {/* Modal / Overlay for Registration */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <div 
            className="bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] border-t md:border border-slate-800 p-8 shadow-2xl animate-in slide-in-from-bottom duration-300"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <UserPlus className="text-indigo-500 w-7 h-7" /> Registrar Cliente
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-slate-800 p-2 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Número Celular</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="300 123 4567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Dirección (Opcional)</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle 123 #45-67..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 text-slate-400 font-bold py-3 rounded-xl hover:bg-slate-700 transition-all text-xs"
                >
                  Cancelar
                </button>
                <button
                  disabled={saving}
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
