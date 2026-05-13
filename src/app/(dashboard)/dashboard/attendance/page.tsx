'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { ClipboardList, Check, X, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLang } from '../../../../contexts/LangContext';
import { getEventsByClub, getEventRegistrations, updateRegistration } from '../../../../lib/firestore';
import type { Event, EventRegistration } from '../../../../types';

export default function AttendancePage() {
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const clubId = userProfile?.clubId;

  useEffect(() => {
    if (!clubId) { setLoadingEvents(false); return; }
    getEventsByClub(clubId)
      .then((evs) => setEvents(evs.filter((e) => ['published', 'completed'].includes(e.status))))
      .catch(() => toast.error(t('Failed to load events.', 'فشل تحميل الفعاليات.')))
      .finally(() => setLoadingEvents(false));
  }, [clubId]);

  async function selectEvent(event: Event) {
    setSelectedEvent(event);
    setLoadingRegs(true);
    try {
      setRegistrations(await getEventRegistrations(event.id));
    } catch {
      toast.error(t('Failed to load registrations.', 'فشل تحميل التسجيلات.'));
    } finally {
      setLoadingRegs(false);
    }
  }

  async function toggleAttendance(reg: EventRegistration) {
    const newStatus = reg.status === 'attended' ? 'registered' : 'attended';
    setSaving(reg.id);
    try {
      await updateRegistration(reg.id, { status: newStatus });
      setRegistrations((prev) =>
        prev.map((r) => (r.id === reg.id ? { ...r, status: newStatus } : r)),
      );
    } catch {
      toast.error(t('Failed to update.', 'فشل التحديث.'));
    } finally {
      setSaving(null);
    }
  }

  const attendedCount = registrations.filter((r) => r.status === 'attended').length;

  if (!clubId) {
    return (
      <div className="text-center py-20">
        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="font-semibold text-gray-700">{t('No club assigned', 'لم يتم تعيين نادٍ')}</h3>
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('Attendance', 'الحضور')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {t('Track event attendance for your club.', 'تتبع حضور فعاليات ناديك.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">{t('Events', 'الفعاليات')}</h3>
          </div>

          {loadingEvents ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <p className="text-gray-400 text-xs">
                {t('No published events', 'لا توجد فعاليات منشورة')}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => selectEvent(ev)}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                    selectedEvent?.id === ev.id ? 'text-white shadow-sm' : 'hover:bg-gray-50'
                  }`}
                  style={selectedEvent?.id === ev.id ? { backgroundColor: 'var(--navy)' } : {}}
                >
                  <div
                    className={`text-sm font-medium ${
                      selectedEvent?.id === ev.id ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {t(ev.title, ev.titleAr)}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      selectedEvent?.id === ev.id ? 'text-blue-200' : 'text-gray-400'
                    }`}
                  >
                    {format(ev.eventDate, 'MMM d, yyyy')} · {ev.registeredCount}/{ev.capacity}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attendance sheet */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          {!selectedEvent ? (
            <div className="h-full flex items-center justify-center p-12 text-center min-h-[300px]">
              <div>
                <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-400 text-sm">
                  {t('Select an event to view attendance', 'اختر فعالية لعرض الحضور')}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  {t(selectedEvent.title, selectedEvent.titleAr)}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(selectedEvent.eventDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                  {registrations.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {t(
                        `${attendedCount} / ${registrations.length} attended`,
                        `${attendedCount} / ${registrations.length} حضروا`,
                      )}
                    </span>
                  )}
                </div>
              </div>

              {loadingRegs ? (
                <div className="p-6 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : registrations.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                  <p className="text-gray-400 text-sm">
                    {t('No registrations yet', 'لا يوجد مسجلون بعد')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {registrations.map((reg) => (
                    <div key={reg.id} className="flex items-center gap-4 px-6 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{reg.studentName}</div>
                        <div className="text-xs text-gray-400">
                          {reg.studentIdNumber}
                          {reg.major ? ` · ${reg.major}` : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAttendance(reg)}
                        disabled={saving === reg.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                          reg.status === 'attended'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {reg.status === 'attended' ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        {reg.status === 'attended' ? t('Attended', 'حضر') : t('Absent', 'غائب')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
