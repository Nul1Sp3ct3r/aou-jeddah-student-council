'use client';

import type { ReactNode } from 'react';
import { useLang } from '../../contexts/LangContext';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { lang, setLang } = useLang();

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
      <Navbar lang={lang} onLangToggle={() => setLang(lang === 'en' ? 'ar' : 'en')} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer lang={lang} />
    </div>
  );
}
