'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLang } from '../../../../contexts/LangContext';
import { getEventsByOrganizer, getAllEvents, deleteEvent } from '../../../../lib/firestore';
import { CLUBS, EVENT_STATUS_LABELS } from '../../../../types';
import type { Event } from '../../../../types';

export default function MyEventsPage() {
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const role = userProfile?.role ?? 'student';
  const isAdmin = role === 'super_admin' || role === 'council_admin';
  const canCreate = ['club_president', 'club_vice_president', 'council_admin', 'super_admin'].includes(role);

  useEffect(() => {
    if (!userProfile) return;
    const load = isAdmin
      ? getAllEvents()
      : getEventsByOrganizer(userProfile.uid);
    load.then(setEvents).catch(() => {}).finally(() => setLoading(false));
  }, [userProfile, isAdmin]);

  async function handleDelete(event: Event) {
    if (!confirm(t(`Delete "${event.title}"?`, `حذف "${event.titleAr}"؟`))) return;
    try {
      await deleteEvent(event.id);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      toast.success(t('Event deleted.', 'تم حذف الفعالية.'));
    } catch {
      toast.error(t('Failed to delete.', 'فشل الحذف.'));
    }
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? t('All Events', 'جميع الفعاليات') : t('My Events', 'فعالياتي')}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{events.length} {t('events', 'فعالية')}</p>
        </div>
        <div className="flex items-center gap-3">
          {canCreate && (
            <Link
              href="/dashboard/events/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--navy)' }}
            >
              <Plus className="w-4 h-4" />
              {t('New Event', 'فعالية جديدة')}
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-semibold text-gray-700 mb-2">{t('No events yet', 'لا توجد فعاليات بعد')}</h3>
          {canCreate && (
            <Link
              href="/dashboard/events/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white mt-2"
              style={{ backgroundColor: 'var(--navy)' }}
            >
              <Plus className="w-4 h-4" />
              {t('Submit Your First Event', 'قدّم فعاليتك الأولى')}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const club = CLUBS.find((c) => c.id === event.clubId);
            const statusInfo = EVENT_STATUS_LABELS[event.status];
            const canEdit = event.organizerId === userProfile?.uid && ['draft', 'needs_edits'].includes(event.status);
            const canDelete = event.organizerId === userProfile?.uid && event.status === 'draft';

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-2xl flex-shrink-0">{club?.icon}</span>
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-700 transition-colors truncate block"
                      >
                        {t(event.title, event.titleAr)}
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(event.eventDate, 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.registeredCount}/{event.capacity}
                        </span>
                        {isAdmin && (
                          <span>{t(club?.name ?? '', club?.nameAr ?? '')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium hidden sm:inline-flex"
                      style={{
                        backgroundColor: statusInfo.color === 'green' ? '#dcfce7'
                          : statusInfo.color === 'yellow' ? '#fef9c3'
                          : statusInfo.color === 'orange' ? '#fed7aa'
                          : statusInfo.color === 'red' ? '#fee2e2'
                          : statusInfo.color === 'blue' ? '#dbeafe'
                          : statusInfo.color === 'purple' ? '#f3e8ff'
                          : '#f3f4f6',
                        color: statusInfo.color === 'green' ? '#15803d'
                          : statusInfo.color === 'yellow' ? '#92400e'
                          : statusInfo.color === 'orange' ? '#9a3412'
                          : statusInfo.color === 'red' ? '#dc2626'
                          : statusInfo.color === 'blue' ? '#1d4ed8'
                          : statusInfo.color === 'purple' ? '#7c3aed'
                          : '#6b7280',
                      }}
                    >
                      {t(statusInfo.en, statusInfo.ar)}
                    </span>
                    {canEdit && (
                      <Link
                        href={`/dashboard/events/${event.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(event)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
