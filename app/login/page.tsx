'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { jwt } = response.data;

      // Guardamos el token en cookies por 7 días
      Cookies.set('payfig_token', jwt, { expires: 7 });

      router.push('/dashboard');
    } catch {
      setError('Credenciales inválidas o error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-army-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-army-900 rounded-2xl shadow-2xl border border-army-800 p-8">
        <div className="text-center mb-10">
          <div className="bg-army-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-army-primary/20">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PayFig</h1>
          <p className="text-army-accent/60">Inicia sesión en tu panel administrativo</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-army-accent/80 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-army-800 border border-army-700 rounded-xl px-4 py-3 text-white placeholder-army-accent/30 focus:outline-none focus:ring-2 focus:ring-army-primary focus:border-transparent transition-all"
              placeholder="admin@payfig.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-army-accent/80 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-army-800 border border-army-700 rounded-xl px-4 py-3 text-white placeholder-army-accent/30 focus:outline-none focus:ring-2 focus:ring-army-primary focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-army-primary hover:bg-army-hover text-white font-semibold py-3 rounded-xl shadow-lg shadow-army-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Entrar al Sistema'
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-army-accent/40">
          © 2026 PayFig. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
