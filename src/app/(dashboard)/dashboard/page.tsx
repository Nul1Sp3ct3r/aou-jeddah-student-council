'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Users, Clock, CheckCircle, Plus, ArrowRight, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { useLang } from '../../../contexts/LangContext';
import {
  getEventsByOrganizer,
  getStudentRegistrations,
  getPendingEvents,
  getAllUsers,
  getAllEvents,
} from '../../../lib/firestore';
import { CLUBS, ROLE_LABELS, EVENT_STATUS_LABELS } from '../../../types';
import type { Event, EventRegistration } from '../../../types';

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const role = userProfile?.role ?? 'student';
  const isAdmin = role === 'super_admin' || role === 'council_admin';
  const isClubLeader = role === 'club_president' || role === 'club_vice_president';

  useEffect(() => {
    if (!userProfile) return;
    const uid = userProfile.uid;

    const tasks: Promise<void>[] = [];

    if (isAdmin) {
      tasks.push(
        getPendingEvents().then((e) => setPendingCount(e.length)),
        getAllUsers().then((u) => setTotalUsers(u.length)),
        getAllEvents().then((e) => setMyEvents(e.slice(0, 5))),
      );
    } else if (isClubLeader) {
      tasks.push(
        getEventsByOrganizer(uid).then(setMyEvents),
        getPendingEvents().then((e) => setPendingCount(e.length)),
      );
    } else {
      tasks.push(
        getStudentRegistrations(uid).then(setMyRegistrations),
      );
    }

    Promise.all(tasks).finally(() => setLoading(false));
  }, [userProfile, isAdmin, isClubLeader]);

  if (!userProfile) return null;

  const club = userProfile.clubId ? CLUBS.find((c) => c.id === userProfile.clubId) : null;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('Dashboard', 'لوحة التحكم')}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {t(ROLE_LABELS[role].en, ROLE_LABELS[role].ar)}
              {club && ` · ${t(club.name, club.nameAr)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isAdmin ? (
          <>
            <StatCard
              icon={Clock}
              label={t('Pending Approvals', 'بانتظار الموافقة')}
              value={pendingCount}
              color="#f59e0b"
              loading={loading}
            />
            <StatCard
              icon={Users}
              label={t('Total Users', 'إجمالي المستخدمين')}
              value={totalUsers}
              color="var(--navy)"
              loading={loading}
            />
            <StatCard
              icon={Calendar}
              label={t('Total Events', 'إجمالي الفعاليات')}
              value={myEvents.length}
              color="#2563eb"
              loading={loading}
            />
            <StatCard
              icon={CheckCircle}
              label={t('Published', 'منشورة')}
              value={myEvents.filter((e) => e.status === 'published').length}
              color="#16a34a"
              loading={loading}
            />
          </>
        ) : isClubLeader ? (
          <>
            <StatCard
              icon={Calendar}
              label={t('My Events', 'فعالياتي')}
              value={myEvents.length}
              color="var(--navy)"
              loading={loading}
            />
            <StatCard
              icon={CheckCircle}
              label={t('Published', 'منشورة')}
              value={myEvents.filter((e) => e.status === 'published').length}
              color="#16a34a"
              loading={loading}
            />
            <StatCard
              icon={Clock}
              label={t('Pending', 'قيد المراجعة')}
              value={myEvents.filter((e) => e.status === 'pending_review').length}
              color="#f59e0b"
              loading={loading}
            />
            <StatCard
              icon={Users}
              label={t('Total Registrations', 'إجمالي التسجيلات')}
              value={myEvents.reduce((s, e) => s + e.registeredCount, 0)}
              color="#7c3aed"
              loading={loading}
            />
          </>
        ) : (
          <>
            <StatCard
              icon={Calendar}
              label={t('Registered Events', 'الفعاليات المسجّلة')}
              value={myRegistrations.length}
              color="var(--navy)"
              loading={loading}
            />
            <StatCard
              icon={CheckCircle}
              label={t('Attended', 'حضرت')}
              value={myRegistrations.filter((r) => r.status === 'attended').length}
              color="#16a34a"
              loading={loading}
            />
            <StatCard
              icon={Clock}
              label={t('Upcoming', 'القادمة')}
              value={myRegistrations.filter((r) => r.status === 'registered').length}
              color="#2563eb"
              loading={loading}
            />
            <StatCard
              icon={Users}
              label={t('Waitlisted', 'قائمة انتظار')}
              value={myRegistrations.filter((r) => r.status === 'waitlisted').length}
              color="#f59e0b"
              loading={loading}
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      {(isClubLeader || isAdmin) && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {t('Quick Actions', 'إجراءات سريعة')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {isClubLeader && (
              <Link
                href="/dashboard/events/new"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--navy)' }}
              >
                <Plus className="w-4 h-4" />
                {t('Submit New Event', 'تقديم فعالية جديدة')}
              </Link>
            )}
            {isAdmin && pendingCount > 0 && (
              <Link
                href="/dashboard/admin/events"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
                style={{ backgroundColor: '#f59e0b' }}
              >
                <FileText className="w-4 h-4" />
                {t(`Review ${pendingCount} Pending`, `مراجعة ${pendingCount} طلب`)}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Recent Events (leaders/admins) */}
      {(isAdmin || isClubLeader) && myEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">
              {isAdmin ? t('Recent Events', 'الفعاليات الأخيرة') : t('My Events', 'فعالياتي')}
            </h2>
            <Link
              href="/dashboard/events"
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: 'var(--navy)' }}
            >
              {t('View all', 'عرض الكل')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {myEvents.slice(0, 5).map((event) => {
              const club = CLUBS.find((c) => c.id === event.clubId);
              const statusInfo = EVENT_STATUS_LABELS[event.status];
              return (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="block bg-white rounded-xl border border-gray-100 px-5 py-4 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{club?.icon}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {t(event.title, event.titleAr)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {format(event.eventDate, 'MMM d, yyyy')} · {t(club?.name ?? '', club?.nameAr ?? '')}
                        </div>
                      </div>
                    </div>
                    <span
                      className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
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
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* My Registrations (students) */}
      {role === 'student' && myRegistrations.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">
            {t('My Registered Events', 'الفعاليات المسجّلة')}
          </h2>
          <div className="space-y-3">
            {myRegistrations.slice(0, 5).map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-xl border border-gray-100 px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{reg.studentName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {format(reg.registeredAt, 'MMM d, yyyy')}
                    </div>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: reg.status === 'attended' ? '#dcfce7'
                        : reg.status === 'registered' ? '#dbeafe'
                        : reg.status === 'waitlisted' ? '#fef9c3'
                        : '#f3f4f6',
                      color: reg.status === 'attended' ? '#15803d'
                        : reg.status === 'registered' ? '#1d4ed8'
                        : reg.status === 'waitlisted' ? '#92400e'
                        : '#6b7280',
                    }}
                  >
                    {reg.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for students */}
      {role === 'student' && !loading && myRegistrations.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-semibold text-gray-900 mb-1">
            {t("You haven't registered for any events yet.", 'لم تسجّل في أي فعاليات بعد.')}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {t('Browse upcoming events and join the community!', 'تصفّح الفعاليات القادمة وانضم إلى المجتمع!')}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--navy)' }}
          >
            <Calendar className="w-4 h-4" />
            {t('Browse Events', 'تصفّح الفعاليات')}
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: number;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '15' }}
        >
          <Icon className="w-4 h-4" style={{ color } as React.CSSProperties} />
        </div>
      </div>
      {loading ? (
        <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
      ) : (
        <div className="text-2xl font-extrabold text-gray-900">{value}</div>
      )}
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
