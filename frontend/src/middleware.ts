import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const cachedUserStr = request.cookies.get('cached_user')?.value;
  
  const { pathname } = request.nextUrl;
  
  // Rute publik yang tidak perlu diproteksi
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') || pathname === '/_next' || pathname.startsWith('/api') || pathname.startsWith('/images')) {
    // Jika sudah login tapi mencoba ke /login, redirect ke dashboard yang sesuai
    if (token && cachedUserStr && (pathname === '/login' || pathname === '/register')) {
      try {
        const decodedStr = decodeURIComponent(cachedUserStr);
        const user = JSON.parse(decodedStr);
        if (user.role === 'admin' || user.role === 'master_admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else {
          return NextResponse.redirect(new URL('/mahasiswa', request.url));
        }
      } catch (e) {
        // Abaikan jika JSON tidak valid
      }
    }
    return NextResponse.next();
  }

  // Cek apakah pengguna belum login
  if (!token || !cachedUserStr) {
    // Jika mengakses halaman selain login, arahkan ke login
    if (pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const decodedStr = decodeURIComponent(cachedUserStr);
    const user = JSON.parse(decodedStr);
    
    // Redirect dari root atau /dashboard ke dashboard spesifik role
    if (pathname === '/' || pathname === '/dashboard') {
      if (user.role === 'admin' || user.role === 'master_admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/mahasiswa', request.url));
      }
    }
    
    // Role protection
    if (pathname.startsWith('/admin') && user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.redirect(new URL('/mahasiswa', request.url));
    }
    
    if (pathname.startsWith('/mahasiswa') && user.role !== 'mahasiswa') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

  } catch (error) {
    // Jika gagal parse JSON user, biarkan lewat (akan ditangani useAuth di client)
    console.error("Middleware failed to parse user", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
