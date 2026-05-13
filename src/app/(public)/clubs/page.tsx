'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import PublicLayout from '../../../components/layout/PublicLayout';
import { useLang } from '../../../contexts/LangContext';
import { CLUBS } from '../../../types';

export default function ClubsPage() {
  const { lang } = useLang();
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  return (
    <PublicLayout>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Hero */}
        <section
          className="py-16 text-white text-center"
          style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
        >
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-4xl font-extrabold mb-4">{t('Our Clubs', 'أنديتنا')}</h1>
            <p className="text-gray-300 text-lg">
              {t(
                'Five dynamic clubs that offer opportunities to learn, lead, create, and connect.',
                'خمسة أندية ديناميكية تقدم فرصاً للتعلم والقيادة والإبداع والتواصل.',
              )}
            </p>
          </div>
        </section>

        {/* Clubs */}
        <section className="py-16" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {CLUBS.map((club, idx) => (
                <div
                  key={club.id}
                  id={club.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row">
                    <div
                      className="w-full md:w-2 flex-shrink-0"
                      style={{ backgroundColor: club.color }}
                    />
                    <div className="p-8 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: club.color + '15' }}
                        >
                          {club.logo ? (
                            <Image
                              src={club.logo}
                              alt={club.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            club.icon
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">
                              {t(club.name, club.nameAr)}
                            </h2>
                            <span
                              className="text-xs px-3 py-1 rounded-full font-medium"
                              style={{ backgroundColor: club.color + '15', color: club.color }}
                            >
                              {t('Active', 'نشط')}
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed mb-6">
                            {t(club.description, club.descriptionAr)}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <Link
                              href={`/events?club=${club.id}`}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                              style={{ backgroundColor: club.color }}
                            >
                              {t('View Events', 'عرض الفعاليات')}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                              href="/register"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                              style={{ borderColor: club.color, color: club.color }}
                            >
                              <Users className="w-4 h-4" />
                              {t('Join Club', 'انضم للنادي')}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join CTA */}
        <section
          className="py-16 text-white text-center"
          style={{ backgroundColor: 'var(--navy)' }}
        >
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">
              {t("Can't find your club?", 'لا تجد ناديك؟')}
            </h2>
            <p className="text-gray-300 mb-8">
              {t(
                'Register for an account and reach out to the Student Council to suggest new club ideas.',
                'سجّل حساباً وتواصل مع مجلس الطلاب لاقتراح أفكار لأندية جديدة.',
              )}
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 rounded-xl font-semibold text-lg"
              style={{ backgroundColor: 'var(--gold)', color: 'var(--navy)' }}
            >
              {t('Register Now', 'سجّل الآن')}
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
