'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Edit, FileText } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useLang } from '../../../../../contexts/LangContext';
import { getEvent, updateEvent, getEventRegistrations } from '../../../../../lib/firestore';
import { CLUBS, EVENT_STATUS_LABELS } from '../../../../../types';
import type { Event, EventRegistration } from '../../../../../types';

export default function EventDetailDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const id = params.id as string;
  const role = userProfile?.role ?? 'student';
  const isAdmin = role === 'super_admin' || role === 'council_admin';

  useEffect(() => {
    Promise.all([
      getEvent(id),
      getEventRegistrations(id),
    ]).then(([ev, regs]) => {
      setEvent(ev);
      setRegistrations(regs);
      if (ev?.adminNotes) setAdminNotes(ev.adminNotes);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  async function handleApprove() {
    if (!event) return;
    setActionLoading(true);
    try {
      await updateEvent(event.id, {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: userProfile?.uid,
        adminNotes,
      });
      setEvent((prev) => prev ? { ...prev, status: 'approved' } : null);
      toast.success(t('Event approved!', 'تمت الموافقة على الفعالية!'));
    } catch { toast.error(t('Failed.', 'فشل.')); } finally { setActionLoading(false); }
  }

  async function handleReject() {
    if (!event) return;
    setActionLoading(true);
    try {
      await updateEvent(event.id, {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: userProfile?.uid,
        adminNotes,
      });
      setEvent((prev) => prev ? { ...prev, status: 'rejected' } : null);
      toast.success(t('Event rejected.', 'تم رفض الفعالية.'));
    } catch { toast.error(t('Failed.', 'فشل.')); } finally { setActionLoading(false); }
  }

  async function handleNeedsEdits() {
    if (!event || !adminNotes) {
      toast.error(t('Please add admin notes before requesting edits.', 'أضف ملاحظات قبل طلب التعديلات.'));
      return;
    }
    setActionLoading(true);
    try {
      await updateEvent(event.id, {
        status: 'needs_edits',
        reviewedAt: new Date(),
        reviewedBy: userProfile?.uid,
        adminNotes,
      });
      setEvent((prev) => prev ? { ...prev, status: 'needs_edits' } : null);
      toast.success(t('Edits requested.', 'تم طلب التعديلات.'));
    } catch { toast.error(t('Failed.', 'فشل.')); } finally { setActionLoading(false); }
  }

  async function handlePublish() {
    if (!event) return;
    setActionLoading(true);
    try {
      await updateEvent(event.id, {
        status: 'published',
        publishedAt: new Date(),
      });
      setEvent((prev) => prev ? { ...prev, status: 'published' } : null);
      toast.success(t('Event published!', 'تم نشر الفعالية!'));
    } catch { toast.error(t('Failed.', 'فشل.')); } finally { setActionLoading(false); }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t('Event not found.', 'الفعالية غير موجودة.')}</p>
        <Link href="/dashboard/events" className="text-blue-600 hover:underline mt-4 inline-block">
          {t('Back', 'رجوع')}
        </Link>
      </div>
    );
  }

  const club = CLUBS.find((c) => c.id === event.clubId);
  const statusInfo = EVENT_STATUS_LABELS[event.status];

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/events" className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 line-clamp-1">
              {t(event.title, event.titleAr)}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm">{club?.icon}</span>
              <span className="text-sm text-gray-500">{t(club?.name ?? '', club?.nameAr ?? '')}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: statusInfo.color === 'green' ? '#dcfce7'
                    : statusInfo.color === 'yellow' ? '#fef9c3'
                    : statusInfo.color === 'orange' ? '#fed7aa'
                    : statusInfo.color === 'red' ? '#fee2e2'
                    : '#f3f4f6',
                  color: statusInfo.color === 'green' ? '#15803d'
                    : statusInfo.color === 'yellow' ? '#92400e'
                    : statusInfo.color === 'orange' ? '#9a3412'
                    : statusInfo.color === 'red' ? '#dc2626'
                    : '#6b7280',
                }}
              >
                {t(statusInfo.en, statusInfo.ar)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">{t('Event Details', 'تفاصيل الفعالية')}</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">{format(event.eventDate, 'EEEE, MMMM d, yyyy · h:mm a')}</span>
                  {event.eventEndDate && <span className="text-gray-500"> – {format(event.eventEndDate, 'h:mm a')}</span>}
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>{t(event.location, event.locationAr)}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>{event.registeredCount}/{event.capacity} {t('registered', 'مسجّل')}</span>
              </div>
              {event.submittedAt && (
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{t('Submitted', 'قُدِّم')} {format(event.submittedAt, 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-5 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t('Description', 'الوصف')}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{t(event.description, event.descriptionAr)}</p>
            </div>
          </div>

          {/* Registrations */}
          {registrations.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                {t('Registrations', 'التسجيلات')} ({registrations.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b">
                      <th className="pb-3 font-medium">{t('Name', 'الاسم')}</th>
                      <th className="pb-3 font-medium">{t('Student ID', 'رقم الطالب')}</th>
                      <th className="pb-3 font-medium">{t('Major', 'التخصص')}</th>
                      <th className="pb-3 font-medium">{t('Status', 'الحالة')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td className="py-3 font-medium text-gray-900">{reg.studentName}</td>
                        <td className="py-3 text-gray-500">{reg.studentIdNumber}</td>
                        <td className="py-3 text-gray-500">{reg.major}</td>
                        <td className="py-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: reg.status === 'attended' ? '#dcfce7' : reg.status === 'registered' ? '#dbeafe' : '#f3f4f6',
                              color: reg.status === 'attended' ? '#15803d' : reg.status === 'registered' ? '#1d4ed8' : '#6b7280',
                            }}
                          >
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('Review Panel', 'لوحة المراجعة')}
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Admin Notes', 'ملاحظات المشرف')}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
                  placeholder={t('Add notes for the organizer...', 'أضف ملاحظات للمنظّم...')}
                />
              </div>

              <div className="space-y-2">
                {event.status === 'pending_review' && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {t('Approve', 'موافقة')}
                    </button>
                    <button
                      onClick={handleNeedsEdits}
                      disabled={actionLoading}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50"
                    >
                      {t('Request Edits', 'طلب تعديلات')}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                    >
                      {t('Reject', 'رفض')}
                    </button>
                  </>
                )}
                {event.status === 'approved' && (
                  <button
                    onClick={handlePublish}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: 'var(--navy)' }}
                  >
                    {t('Publish Now', 'نشر الآن')}
                  </button>
                )}
                {event.adminNotes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium mb-1">{t('Previous Notes:', 'الملاحظات السابقة:')}</p>
                    <p className="text-sm text-gray-700">{event.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
