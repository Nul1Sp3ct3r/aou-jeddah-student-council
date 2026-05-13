'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, XCircle, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLang } from '../../../../contexts/LangContext';
import { getStudentApplications, updateClubApplication, getAllClubRegistrationSettings } from '../../../../lib/firestore';
import { CLUBS, APPLICATION_STATUS_LABELS } from '../../../../types';
import type { ClubApplication, ClubRegistrationSettings } from '../../../../types';

function statusIcon(status: string) {
  if (status === 'accepted')   return <CheckCircle className="w-4 h-4 text-green-600" />;
  if (status === 'rejected')   return <XCircle className="w-4 h-4 text-red-500" />;
  if (status === 'cancelled')  return <XCircle className="w-4 h-4 text-gray-400" />;
  if (status === 'waitlisted') return <Clock className="w-4 h-4 text-blue-500" />;
  return <Clock className="w-4 h-4 text-yellow-500" />;
}

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  pending:    { bg: '#fef9c3', text: '#92400e' },
  accepted:   { bg: '#dcfce7', text: '#15803d' },
  rejected:   { bg: '#fee2e2', text: '#dc2626' },
  waitlisted: { bg: '#dbeafe', text: '#1d4ed8' },
  cancelled:  { bg: '#f3f4f6', text: '#6b7280' },
};

export default function StudentApplicationsPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const [applications, setApplications] = useState<ClubApplication[]>([]);
  const [settings, setSettings] = useState<Record<string, ClubRegistrationSettings>>({});
  const [pageLoading, setPageLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  useEffect(() => {
    if (!authLoading && !firebaseUser) router.push('/login');
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    if (!firebaseUser) return;
    Promise.all([
      getStudentApplications(firebaseUser.uid),
      getAllClubRegistrationSettings(),
    ])
      .then(([apps, allSettings]) => {
        setApplications(apps);
        const map: Record<string, ClubRegistrationSettings> = {};
        allSettings.forEach((s) => { map[s.clubId] = s; });
        setSettings(map);
      })
      .catch(() => toast.error(t('Failed to load applications.', 'فشل تحميل الطلبات.')))
      .finally(() => setPageLoading(false));
  }, [firebaseUser]);

  async function handleCancel(app: ClubApplication) {
    const clubSettings = settings[app.clubId];
    if (!clubSettings?.allowStudentCancellation) {
      toast.error(t('Cancellation is not allowed for this club.', 'الإلغاء غير مسموح به لهذا النادي.'));
      return;
    }
    if (!confirm(t('Cancel this application?', 'هل تريد إلغاء هذا الطلب؟'))) return;
    setCancelling(app.id);
    try {
      await updateClubApplication(app.id, {
        status: 'cancelled',
        cancelledAt: new Date(),
      });
      setApplications((prev) =>
        prev.map((a) => a.id === app.id ? { ...a, status: 'cancelled', cancelledAt: new Date() } : a),
      );
      toast.success(t('Application cancelled.', 'تم إلغاء الطلب.'));
    } catch {
      toast.error(t('Failed to cancel. Try again.', 'فشل الإلغاء. حاول مرة أخرى.'));
    } finally {
      setCancelling(null);
    }
  }

  if (authLoading || pageLoading) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="space-y-4">
        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 animate-pulse space-y-3">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
            {t('My Applications', 'طلباتي')}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('Track your club membership applications.', 'تتبّع طلبات انضمامك إلى الأندية.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/student/clubs"
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: 'var(--navy)' }}
          >
            <UserPlus className="w-4 h-4" />
            {t('Browse Clubs', 'تصفح الأندية')}
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium mb-1">
            {t('No applications yet', 'لا توجد طلبات بعد')}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {t('Browse available clubs and submit your first application.', 'تصفّح الأندية المتاحة وقدّم طلبك الأول.')}
          </p>
          <Link
            href="/student/clubs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: 'var(--navy)' }}
          >
            <UserPlus className="w-4 h-4" />
            {t('Browse Clubs', 'تصفح الأندية')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const club = CLUBS.find((c) => c.id === app.clubId);
            const statusInfo = APPLICATION_STATUS_LABELS[app.status];
            const style = STATUS_STYLE[app.status] ?? STATUS_STYLE.pending;
            const canCancel =
              app.status === 'pending' && settings[app.clubId]?.allowStudentCancellation;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Club color bar */}
                <div className="h-1" style={{ backgroundColor: club?.color ?? 'var(--navy)' }} />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Club info */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: (club?.color ?? '#000') + '15' }}
                      >
                        {club?.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {t(club?.name ?? app.clubId, club?.nameAr ?? app.clubId)}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {t('Submitted', 'قُدِّم')} {format(app.submittedAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {statusIcon(app.status)}
                      {t(statusInfo.en, statusInfo.ar)}
                    </span>
                  </div>

                  {/* Details row */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-500">
                    <div>
                      <span className="block text-gray-400">{t('University ID', 'الرقم الجامعي')}</span>
                      <span className="font-medium text-gray-700">{app.universityId}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">{t('Major', 'التخصص')}</span>
                      <span className="font-medium text-gray-700">{app.major}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">{t('Academic Level', 'المستوى')}</span>
                      <span className="font-medium text-gray-700">{app.academicLevel}</span>
                    </div>
                    {app.preferredRole && (
                      <div>
                        <span className="block text-gray-400">{t('Preferred Role', 'الدور المفضّل')}</span>
                        <span className="font-medium text-gray-700 capitalize">
                          {app.preferredRole.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Review note */}
                  {app.reviewNote && (
                    <div className="mt-4 flex items-start gap-2 bg-amber-50 rounded-xl p-3 text-sm text-amber-800">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                      <div>
                        <span className="font-medium block mb-0.5">{t('Note from reviewer:', 'ملاحظة المراجع:')}</span>
                        {app.reviewNote}
                      </div>
                    </div>
                  )}

                  {/* Accepted message */}
                  {app.status === 'accepted' && (
                    <div className="mt-4 flex items-center gap-2 bg-green-50 rounded-xl p-3 text-sm text-green-800">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-600" />
                      {t(
                        'Congratulations! Your application was accepted. You are now a member of this club.',
                        'تهانينا! تم قبول طلبك. أنت الآن عضو في هذا النادي.',
                      )}
                    </div>
                  )}

                  {/* Cancel button */}
                  {canCancel && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleCancel(app)}
                        disabled={cancelling === app.id}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancelling === app.id
                          ? t('Cancelling...', 'جاري الإلغاء...')
                          : t('Cancel Application', 'إلغاء الطلب')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
