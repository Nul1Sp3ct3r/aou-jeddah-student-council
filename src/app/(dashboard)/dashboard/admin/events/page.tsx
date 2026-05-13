'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle, XCircle, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useLang } from '../../../../../contexts/LangContext';
import { getPendingEvents, getAllEvents, updateEvent } from '../../../../../lib/firestore';
import { CLUBS, EVENT_STATUS_LABELS } from '../../../../../types';
import type { Event, EventStatus } from '../../../../../types';

const TABS: { key: EventStatus | 'all'; en: string; ar: string }[] = [
  { key: 'pending_review', en: 'Pending', ar: 'قيد المراجعة' },
  { key: 'needs_edits', en: 'Needs Edits', ar: 'يحتاج تعديلات' },
  { key: 'approved', en: 'Approved', ar: 'معتمدة' },
  { key: 'published', en: 'Published', ar: 'منشورة' },
  { key: 'all', en: 'All', ar: 'الكل' },
];

export default function AdminEventsPage() {
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<EventStatus | 'all'>('pending_review');
  const [actionId, setActionId] = useState<string | null>(null);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const role = userProfile?.role ?? 'student';
  const isAdmin = role === 'super_admin' || role === 'council_admin';

  useEffect(() => {
    if (!isAdmin) return;
    getAllEvents().then(setEvents).catch(() => {}).finally(() => setLoading(false));
  }, [isAdmin]);

  async function quickApprove(eventId: string) {
    setActionId(eventId);
    try {
      await updateEvent(eventId, {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: userProfile?.uid,
      });
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, status: 'approved' } : e));
      toast.success(t('Approved!', 'تمت الموافقة!'));
    } catch { toast.error(t('Failed.', 'فشل.')); } finally { setActionId(null); }
  }

  async function quickReject(eventId: string) {
    setActionId(eventId);
    try {
      await updateEvent(eventId, {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: userProfile?.uid,
      });
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, status: 'rejected' } : e));
      toast.success(t('Rejected.', 'تم الرفض.'));
    } catch { toast.error(t('Failed.', 'فشل.')); } finally { setActionId(null); }
  }

  async function quickPublish(eventId: string) {
    setActionId(eventId);
    try {
      await updateEvent(eventId, { status: 'published', publishedAt: new Date() });
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, status: 'published' } : e));
      toast.success(t('Published!', 'تم النشر!'));
    } catch { toast.error(t('Failed.', 'فشل.')); } finally { setActionId(null); }
  }

  const filtered = activeTab === 'all' ? events : events.filter((e) => e.status === activeTab);

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t('Access denied.', 'الوصول مرفوض.')}</p>
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('Event Approvals', 'موافقات الفعاليات')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {events.filter((e) => e.status === 'pending_review').length} {t('pending review', 'بانتظار المراجعة')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => {
          const count = tab.key === 'all' ? events.length : events.filter((e) => e.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(tab.en, tab.ar)}
              {count > 0 && (
                <span
                  className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: activeTab === tab.key ? 'var(--navy)' : '#e5e7eb',
                    color: activeTab === tab.key ? 'white' : '#6b7280',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('No events in this category.', 'لا توجد فعاليات في هذه الفئة.')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => {
            const club = CLUBS.find((c) => c.id === event.clubId);
            const statusInfo = EVENT_STATUS_LABELS[event.status];
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-2xl">{club?.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/events/${event.id}`}
                          className="font-semibold text-gray-900 hover:text-blue-700 truncate"
                        >
                          {t(event.title, event.titleAr)}
                        </Link>
                        <span
                          className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: statusInfo.color === 'yellow' ? '#fef9c3'
                              : statusInfo.color === 'orange' ? '#fed7aa'
                              : statusInfo.color === 'green' ? '#dcfce7'
                              : '#f3f4f6',
                            color: statusInfo.color === 'yellow' ? '#92400e'
                              : statusInfo.color === 'orange' ? '#9a3412'
                              : statusInfo.color === 'green' ? '#15803d'
                              : '#6b7280',
                          }}
                        >
                          {t(statusInfo.en, statusInfo.ar)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(event.eventDate, 'MMM d, yyyy')}
                        </span>
                        <span>{t(club?.name ?? '', club?.nameAr ?? '')}</span>
                        <span>{t('By', 'بقلم')} {event.organizerName}</span>
                        {event.submittedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t('Submitted', 'قُدِّم')} {format(event.submittedAt, 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('Full review', 'مراجعة كاملة')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    {event.status === 'pending_review' && (
                      <>
                        <button
                          onClick={() => quickApprove(event.id)}
                          disabled={actionId === event.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title={t('Approve', 'موافقة')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => quickReject(event.id)}
                          disabled={actionId === event.id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title={t('Reject', 'رفض')}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {event.status === 'approved' && (
                      <button
                        onClick={() => quickPublish(event.id)}
                        disabled={actionId === event.id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white disabled:opacity-50"
                        style={{ backgroundColor: 'var(--navy)' }}
                      >
                        {t('Publish', 'نشر')}
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
