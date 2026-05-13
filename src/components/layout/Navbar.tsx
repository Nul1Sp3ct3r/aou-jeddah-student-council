'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, LogIn, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  lang: 'en' | 'ar';
  onLangToggle: () => void;
}

const navLinks = [
  { href: '/', en: 'Home', ar: 'الرئيسية' },
  { href: '/clubs', en: 'Clubs', ar: 'الأندية' },
  { href: '/events', en: 'Events', ar: 'الفعاليات' },
  { href: '/structure', en: 'Structure', ar: 'الهيكل التنظيمي' },
  { href: '/about', en: 'About', ar: 'عن المنصة' },
];

export default function Navbar({ lang, onLangToggle }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { firebaseUser, userProfile, logOut, loading } = useAuth();

  const isActive = (href: string) => pathname === href;
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 shadow-md"
      style={{ backgroundColor: 'var(--navy)' }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-council-white.png"
              alt="AOU Student Council"
              width={36}
              height={36}
              className="object-contain"
            />
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-tight">
                {lang === 'ar' ? 'مجلس الطلاب' : 'Student Council'}
              </div>
              <div className="text-xs leading-tight" style={{ color: 'var(--gold-light)' }}>
                {lang === 'ar' ? 'الجامعة العربية المفتوحة - جدة' : 'Arab Open University – Jeddah'}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                style={isActive(link.href) ? { backgroundColor: 'var(--gold)', color: 'var(--navy)' } : {}}
              >
                {t(link.en, link.ar)}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={onLangToggle}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Auth */}
            {loading ? (
              <div className="w-20 h-8 rounded-md bg-white/10 animate-pulse" />
            ) : firebaseUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: 'var(--gold)', color: 'var(--navy)' }}
                  >
                    {(userProfile?.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-24 truncate">
                    {userProfile?.displayName || firebaseUser.email}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t('Dashboard', 'لوحة التحكم')}
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => { logOut(); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('Sign Out', 'تسجيل الخروج')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: 'var(--gold)', color: 'var(--navy)' }}
              >
                <LogIn className="w-4 h-4" />
                <span>{t('Sign In', 'تسجيل الدخول')}</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-2 border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 text-sm font-medium rounded-md mx-2 mb-1 ${
                  isActive(link.href) ? 'text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                style={isActive(link.href) ? { backgroundColor: 'var(--gold)', color: 'var(--navy)' } : {}}
                onClick={() => setMobileOpen(false)}
              >
                {t(link.en, link.ar)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
