'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BarChart3, Users, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useLang } from '../../../../../contexts/LangContext';
import { getAllEvents, getAllUsers, getAllActiveClubMemberships } from '../../../../../lib/firestore';
import { CLUBS } from '../../../../../types';
import type { Event, UserProfile, ClubMembership } from '../../../../../types';

export default function AdminReportsPage() {
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const role = userProfile?.role ?? 'student';
  const isAdmin = role === 'super_admin' || role === 'council_admin';

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([getAllEvents(), getAllUsers(), getAllActiveClubMemberships()])
      .then(([evs, usrs, mems]) => { setEvents(evs); setUsers(usrs); setMemberships(mems); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) {
    return <div className="text-center py-20"><p className="text-gray-500">{t('Access denied.', 'الوصول مرفوض.')}</p></div>;
  }

  const totalRegistrations = events.reduce((s, e) => s + e.registeredCount, 0);
  const publishedEvents = events.filter((e) => e.status === 'published');
  const pendingEvents = events.filter((e) => e.status === 'pending_review');
  const completedEvents = events.filter((e) => e.status === 'completed');
  const rejectedEvents = events.filter((e) => e.status === 'rejected');

  const clubStats = CLUBS.map((club) => {
    const clubEvents = events.filter((e) => e.clubId === club.id);
    const clubMembers = memberships.filter((m) => m.clubId === club.id);
    const totalRegs = clubEvents.reduce((s, e) => s + e.registeredCount, 0);
    return { club, eventCount: clubEvents.length, memberCount: clubMembers.length, registrations: totalRegs };
  });

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('Reports & Analytics', 'التقارير والتحليلات')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('Platform overview', 'نظرة عامة على المنصة')}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Calendar, label: t('Total Events', 'إجمالي الفعاليات'), value: events.length, color: 'var(--navy)' },
              { icon: Users, label: t('Total Users', 'إجمالي المستخدمين'), value: users.length, color: '#2563eb' },
              { icon: BarChart3, label: t('Total Registrations', 'إجمالي التسجيلات'), value: totalRegistrations, color: '#7c3aed' },
              { icon: CheckCircle, label: t('Published Events', 'الفعاليات المنشورة'), value: publishedEvents.length, color: '#16a34a' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: kpi.color + '15' }}
                >
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{kpi.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Event Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {t('Event Status Breakdown', 'توزيع حالات الفعاليات')}
              </h2>
              <div className="space-y-3">
                {[
                  { label: t('Published', 'منشورة'), count: publishedEvents.length, color: '#16a34a' },
                  { label: t('Pending Review', 'قيد المراجعة'), count: pendingEvents.length, color: '#f59e0b' },
                  { label: t('Completed', 'مكتملة'), count: completedEvents.length, color: '#7c3aed' },
                  { label: t('Rejected', 'مرفوضة'), count: rejectedEvents.length, color: '#ef4444' },
                  { label: t('Draft', 'مسودة'), count: events.filter((e) => e.status === 'draft').length, color: '#9ca3af' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                    <span className="text-sm text-gray-600 flex-1">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{row.count}</span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${events.length > 0 ? (row.count / events.length) * 100 : 0}%`,
                          backgroundColor: row.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Roles Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t('Users by Role', 'المستخدمون حسب الدور')}
              </h2>
              <div className="space-y-3">
                {['student', 'club_member', 'club_president', 'council_admin', 'super_admin'].map((r) => {
                  const count = users.filter((u) => u.role === r).length;
                  return (
                    <div key={r} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 flex-1 capitalize">{r.replace('_', ' ')}</span>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${users.length > 0 ? (count / users.length) * 100 : 0}%`,
                            backgroundColor: 'var(--navy)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Per-Club Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-5">{t('Club Statistics', 'إحصائيات الأندية')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-3 font-medium">{t('Club', 'النادي')}</th>
                    <th className="pb-3 font-medium text-right">{t('Events', 'الفعاليات')}</th>
                    <th className="pb-3 font-medium text-right">{t('Members', 'الأعضاء')}</th>
                    <th className="pb-3 font-medium text-right">{t('Registrations', 'التسجيلات')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clubStats.map(({ club, eventCount, memberCount, registrations }) => (
                    <tr key={club.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {club.logo ? (
                            <Image src={club.logo} alt={club.name} width={24} height={24} className="w-6 h-6 object-cover rounded" />
                          ) : (
                            <span>{club.icon}</span>
                          )}
                          <span className="font-medium">{t(club.name, club.nameAr)}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">{eventCount}</td>
                      <td className="py-3 text-right">{memberCount}</td>
                      <td className="py-3 text-right">{registrations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
