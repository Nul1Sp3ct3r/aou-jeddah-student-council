'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import PublicLayout from '../../../components/layout/PublicLayout';
import { useLang } from '../../../contexts/LangContext';
import { getPublicEvents } from '../../../lib/firestore';
import { CLUBS, EVENT_STATUS_LABELS } from '../../../types';
import type { Event, ClubId } from '../../../types';
import { format } from 'date-fns';

export default function EventsPage() {
  const { lang } = useLang();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClub, setFilterClub] = useState<ClubId | 'all'>('all');

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  useEffect(() => {
    getPublicEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) => {
    const matchesSearch =
      search === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.titleAr.includes(search);
    const matchesClub = filterClub === 'all' || e.clubId === filterClub;
    return matchesSearch && matchesClub;
  });

  const upcoming = filtered.filter((e) => e.eventDate >= new Date());
  const past = filtered.filter((e) => e.eventDate < new Date());

  return (
    <PublicLayout>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Hero */}
        <section
          className="py-14 text-white"
          style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold mb-2">{t('Events', 'الفعاليات')}</h1>
            <p className="text-gray-300 mb-8">
              {t('Discover and register for events from all clubs.', 'اكتشف وسجّل في الفعاليات من جميع الأندية.')}
            </p>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('Search events...', 'ابحث عن فعاليات...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterClub}
                  onChange={(e) => setFilterClub(e.target.value as ClubId | 'all')}
                  className="pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer"
                >
                  <option value="all" className="text-gray-900">{t('All Clubs', 'جميع الأندية')}</option>
                  {CLUBS.map((c) => (
                    <option key={c.id} value={c.id} className="text-gray-900">
                      {t(c.name, c.nameAr)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Upcoming */}
                {upcoming.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--navy)' }}>
                      {t('Upcoming Events', 'الفعاليات القادمة')} ({upcoming.length})
                    </h2>
                    <EventGrid events={upcoming} lang={lang} t={t} />
                  </div>
                )}

                {/* Past */}
                {past.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-6 text-gray-400">
                      {t('Past Events', 'الفعاليات السابقة')} ({past.length})
                    </h2>
                    <EventGrid events={past} lang={lang} t={t} muted />
                  </div>
                )}

                {filtered.length === 0 && (
                  <div className="text-center py-24 text-gray-400">
                    <Calendar className="w-14 h-14 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">{t('No events found.', 'لا توجد فعاليات.')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

function EventGrid({
  events,
  lang,
  t,
  muted = false,
}: {
  events: Event[];
  lang: 'en' | 'ar';
  t: (en: string, ar: string) => string;
  muted?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => {
        const club = CLUBS.find((c) => c.id === event.clubId);
        return (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 ${muted ? 'opacity-70 hover:opacity-100' : 'hover:-translate-y-0.5'}`}
          >
            <div className="h-1.5" style={{ backgroundColor: club?.color ?? 'var(--navy)' }} />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{club?.icon}</span>
                <span className="text-xs font-medium text-gray-500">
                  {lang === 'ar' ? club?.nameAr : club?.name}
                </span>
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: event.status === 'published' ? '#dcfce7' : '#f3f4f6',
                    color: event.status === 'published' ? '#16a34a' : '#6b7280',
                  }}
                >
                  {lang === 'ar'
                    ? EVENT_STATUS_LABELS[event.status].ar
                    : EVENT_STATUS_LABELS[event.status].en}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                {lang === 'ar' ? event.titleAr : event.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {lang === 'ar' ? event.descriptionAr : event.description}
              </p>

              <div className="space-y-1.5 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{format(event.eventDate, 'EEEE, MMMM d, yyyy · h:mm a')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{lang === 'ar' ? event.locationAr : event.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {event.registeredCount}/{event.capacity} {t('registered', 'مسجّل')}
                  </span>
                  {event.registeredCount >= event.capacity && (
                    <span className="text-red-500 font-medium">{t('Full', 'مكتمل')}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
