'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, ChevronRight, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import PublicLayout from '../components/layout/PublicLayout';
import { useLang } from '../contexts/LangContext';
import { CLUBS } from '../types';
import { getPublicEvents } from '../lib/firestore';
import type { Event } from '../types';
import { format } from 'date-fns';

export default function HomePage() {
  const { lang } = useLang();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  useEffect(() => {
    getPublicEvents().then((events) => {
      setUpcomingEvents(
        events.filter((e) => e.eventDate > new Date() && e.status === 'published').slice(0, 3),
      );
    }).catch(() => {});
  }, []);

  return (
    <PublicLayout>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Hero */}
        <section
          className="relative overflow-hidden py-24 sm:py-32"
          style={{ background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-light) 100%)' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full" style={{ backgroundColor: 'var(--gold)', filter: 'blur(80px)' }} />
            <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full" style={{ backgroundColor: 'var(--gold)', filter: 'blur(100px)' }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Logos */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <Image src="/logo-university-white.png" alt="Arab Open University" width={72} height={72} className="object-contain opacity-90" />
              <div className="w-px h-12 bg-white/20" />
              <Image src="/logo-council-white.png" alt="AOU Student Council" width={72} height={72} className="object-contain opacity-90" />
            </div>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: 'var(--gold-light)', border: '1px solid rgba(201,168,76,0.3)' }}
            >
              <Star className="w-4 h-4" />
              {t('Official Student Council Platform', 'المنصة الرسمية لمجلس الطلاب')}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              {t('AOU Jeddah', 'جامعة AOU جدة')}
              <br />
              <span style={{ color: 'var(--gold)' }}>
                {t('Clubs Hub', 'منصة الأندية')}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t(
                'Discover clubs, register for events, and be part of a vibrant student community at Arab Open University – Jeddah Branch.',
                'اكتشف الأندية وسجّل في الفعاليات وكن جزءاً من مجتمع طلابي نابض بالحياة في الجامعة العربية المفتوحة – فرع جدة.',
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--gold)', color: 'var(--navy)' }}
              >
                {t('Browse Events', 'تصفح الفعاليات')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/clubs"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all"
              >
                {t('Explore Clubs', 'استكشف الأندية')}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
              {[
                { value: '5', en: 'Active Clubs', ar: 'نادٍ نشط' },
                { value: '500+', en: 'Students', ar: 'طالب' },
                { value: '50+', en: 'Events/Year', ar: 'فعالية سنوياً' },
              ].map((s) => (
                <div key={s.value} className="text-center">
                  <div className="text-3xl font-extrabold" style={{ color: 'var(--gold)' }}>{s.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{t(s.en, s.ar)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clubs Section */}
        <section className="py-20" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--navy)' }}>
                {t('Our Clubs', 'أنديتنا')}
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                {t(
                  'Five vibrant student clubs to join, learn, and grow together.',
                  'خمسة أندية طلابية نابضة بالحياة للانضمام إليها والتعلم والنمو معاً.',
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {CLUBS.map((club) => (
                <Link
                  key={club.id}
                  href={`/clubs#${club.id}`}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110 overflow-hidden"
                    style={{ backgroundColor: club.color + '15' }}
                  >
                    {club.logo ? (
                      <Image src={club.logo} alt={club.name} width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      club.icon
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                    {t(club.name, club.nameAr)}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {t(club.description, club.descriptionAr)}
                  </p>
                  <div
                    className="mt-4 flex items-center gap-1 text-xs font-medium"
                    style={{ color: club.color }}
                  >
                    {t('Learn more', 'اعرف المزيد')}
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/clubs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border-2 transition-all hover:text-white"
                style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {t('View All Clubs', 'عرض جميع الأندية')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--navy)' }}>
                  {t('Upcoming Events', 'الفعاليات القادمة')}
                </h2>
                <p className="text-gray-500 mt-1">
                  {t("Don't miss what's happening on campus", 'لا تفوّت ما يحدث في الحرم الجامعي')}
                </p>
              </div>
              <Link
                href="/events"
                className="hidden sm:flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: 'var(--navy)' }}
              >
                {t('All Events', 'كل الفعاليات')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>{t('No upcoming events right now. Check back soon!', 'لا توجد فعاليات قادمة حالياً. تحقق لاحقاً!')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => {
                  const club = CLUBS.find((c) => c.id === event.clubId);
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    >
                      <div className="h-2" style={{ backgroundColor: club?.color ?? 'var(--navy)' }} />
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{club?.icon}</span>
                          <span className="text-xs font-medium text-gray-500">
                            {t(club?.name ?? '', club?.nameAr ?? '')}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                          {t(event.title, event.titleAr)}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                          {t(event.description, event.descriptionAr)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(event.eventDate, 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {event.registeredCount}/{event.capacity}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="text-center mt-8 sm:hidden">
              <Link href="/events" className="text-sm font-medium" style={{ color: 'var(--navy)' }}>
                {t('View all events →', 'عرض كل الفعاليات ←')}
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-20"
          style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)' }}
        >
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('Ready to Get Involved?', 'مستعد للمشاركة؟')}
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              {t(
                'Create your account to register for events, join clubs, and be part of the AOU Jeddah community.',
                'أنشئ حسابك للتسجيل في الفعاليات والانضمام إلى الأندية والانتماء إلى مجتمع AOU جدة.',
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--gold)', color: 'var(--navy)' }}
              >
                {t('Create Account', 'إنشاء حساب')}
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all"
              >
                {t('Sign In', 'تسجيل الدخول')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
