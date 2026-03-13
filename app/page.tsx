import { redirect } from 'next/navigation';

export default function RootPage() {
  // Cuando alguien entre a la raíz, lo mandamos directo al dashboard
  // El middleware se encargará de decidir si debe ir a /login o si puede entrar
  redirect('/dashboard');
}
