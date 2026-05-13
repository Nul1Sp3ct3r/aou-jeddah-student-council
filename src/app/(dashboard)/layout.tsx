'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, Globe, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LangContext';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { ROLE_LABELS } from '../../types';

function DashboardInner({ children }: { children: ReactNode }) {
  const { firebaseUser, userProfile, loading, logOut } = useAuth();
  const { lang, setLang } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [loading, firebaseUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-3 animate-pulse"
            style={{ backgroundColor: 'var(--gold)', color: 'var(--navy)' }}
          >
            AOU
          </div>
          <p className="text-gray-500 text-sm">{t('Loading...', 'جاري التحميل...')}</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) return null;

  const role = userProfile?.role ?? 'student';

  return (
    <div className="min-h-screen flex" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ backgroundColor: 'var(--bg)' }}>
      {/* Sidebar — desktop */}
      <div className="hidden lg:flex w-64 flex-shrink-0">
        <div className="fixed top-0 bottom-0 w-64">
          <DashboardSidebar role={role} clubId={userProfile?.clubId} lang={lang} />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">
            <DashboardSidebar
              role={role}
              clubId={userProfile?.clubId}
              lang={lang}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:block">
                <span className="text-sm font-semibold text-gray-900">
                  {t('Welcome,', 'مرحباً،')} {userProfile?.displayName || firebaseUser.email}
                </span>
                {userProfile && (
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: 'var(--navy)', color: 'var(--gold)' }}
                  >
                    {lang === 'ar' ? ROLE_LABELS[role].ar : ROLE_LABELS[role].en}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                <Bell className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 font-medium transition-colors"
                title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
              >
                <Globe className="w-4 h-4" />
                <span>{lang === 'ar' ? 'EN' : 'ع'}</span>
              </button>
              <button
                onClick={async () => {
                  await logOut();
                  toast.success(t('Signed out.', 'تم تسجيل الخروج.'));
                  router.push('/');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('Sign Out', 'خروج')}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardInner>{children}</DashboardInner>;
}
