import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('payfig_token');
  const token = tokenCookie?.value;
  const { pathname } = request.nextUrl;

  // REGLA: Si el token es nulo, es la palabra "undefined" o no tiene puntos (no es JWT)
  const isInvalidToken = !token || token === 'undefined' || !token.includes('.');

  // 1. Proteger las rutas del dashboard y la raíz
  if (isInvalidToken && (pathname.startsWith('/dashboard') || pathname === '/')) {
    const loginUrl = new URL('/login', request.url);
    // Limpiamos la cookie mala si existe para evitar bucles
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('payfig_token');
    return response;
  }

  // 2. Si ya tiene un token VÁLIDO e intenta entrar al login, lo mandamos al dashboard
  if (!isInvalidToken && (pathname === '/login' || pathname === '/')) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
};
