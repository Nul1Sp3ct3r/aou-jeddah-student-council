'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Search, Filter, Download, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, Eye, X,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLang } from '../../../../contexts/LangContext';
import {
  getAllClubApplications,
  getClubApplications,
  updateClubApplication,
  createClubMembership,
} from '../../../../lib/firestore';
import { CLUBS, APPLICATION_STATUS_LABELS, PREFERRED_ROLE_LABELS } from '../../../../types';
import type { ClubApplication, ClubApplicationStatus, ClubId } from '../../../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  pending:    { bg: '#fef9c3', text: '#92400e' },
  accepted:   { bg: '#dcfce7', text: '#15803d' },
  rejected:   { bg: '#fee2e2', text: '#dc2626' },
  waitlisted: { bg: '#dbeafe', text: '#1d4ed8' },
  cancelled:  { bg: '#f3f4f6', text: '#6b7280' },
};

function exportCSV(apps: ClubApplication[]) {
  const headers = ['Name', 'University ID', 'Email', 'Phone', 'Major', 'Level', 'Club', 'Preferred Role', 'Status', 'Submitted'];
  const rows = apps.map((a) => [
    a.fullName,
    a.universityId,
    a.universityEmail,
    a.phone,
    a.major,
    a.academicLevel,
    a.clubId,
    a.preferredRole ?? '',
    a.status,
    format(a.submittedAt, 'yyyy-MM-dd'),
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`));
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `club-applications-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClubApplicationsPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const [applications, setApplications] = useState<ClubApplication[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClub, setFilterClub] = useState<ClubId | ''>('');
  const [filterStatus, setFilterStatus] = useState<ClubApplicationStatus | ''>('');

  // Detail modal
  const [viewingApp, setViewingApp] = useState<ClubApplication | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const role = userProfile?.role ?? 'student';
  const isAdmin = role === 'super_admin' || role === 'council_admin';
  const isClubLeader = role === 'club_president' || role === 'club_vice_president';
  const canAccess = isAdmin || isClubLeader;

  useEffect(() => {
    if (!authLoading && !canAccess) router.push('/dashboard');
  }, [authLoading, canAccess, router]);

  useEffect(() => {
    if (!canAccess || !userProfile) return;
    const loader = isAdmin
      ? getAllClubApplications()
      : getClubApplications(userProfile.clubId as ClubId);
    loader
      .then(setApplications)
      .catch(() => toast.error(t('Failed to load applications.', 'فشل تحميل الطلبات.')))
      .finally(() => setPageLoading(false));
  }, [canAccess, userProfile]);

  // Filtered applications
  const filtered = useMemo(() => {
    let list = applications;
    if (filterClub) list = list.filter((a) => a.clubId === filterClub);
    if (filterStatus) list = list.filter((a) => a.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.fullName.toLowerCase().includes(q) ||
          a.universityId.toLowerCase().includes(q) ||
          a.universityEmail.toLowerCase().includes(q),
      );
    }
    return list;
  }, [applications, filterClub, filterStatus, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    waitlisted: applications.filter((a) => a.status === 'waitlisted').length,
  }), [applications]);

  async function handleAction(app: ClubApplication, newStatus: ClubApplicationStatus) {
    setActionLoading(true);
    try {
      const updateData: Partial<ClubApplication> = {
        status: newStatus,
        reviewNote: reviewNote.trim() || undefined,
        reviewedByUid: userProfile?.uid,
        reviewedAt: new Date(),
      };
      await updateClubApplication(app.id, updateData);

      // If accepted → create club membership
      if (newStatus === 'accepted') {
        await createClubMembership({
          clubId: app.clubId,
          studentUid: app.studentUid,
          applicationId: app.id,
          fullName: app.fullName,
          universityId: app.universityId,
          universityEmail: app.universityEmail,
          memberType: 'regular_student_member',
          status: 'active',
          joinedAt: new Date(),
        });
      }

      setApplications((prev) =>
        prev.map((a) => a.id === app.id ? { ...a, ...updateData } : a),
      );
      if (viewingApp?.id === app.id) {
        setViewingApp((prev) => prev ? { ...prev, ...updateData } : null);
      }
      toast.success(
        newStatus === 'accepted'
          ? t('Application accepted! Membership created.', 'تم قبول الطلب! تم إنشاء العضوية.')
          : newStatus === 'rejected'
          ? t('Application rejected.', 'تم رفض الطلب.')
          : t('Application waitlisted.', 'تم إضافة الطلب لقائمة الانتظار.'),
      );
    } catch {
      toast.error(t('Action failed. Try again.', 'فشلت العملية. حاول مرة أخرى.'));
    } finally {
      setActionLoading(false);
    }
  }

  function openDetail(app: ClubApplication) {
    setViewingApp(app);
    setReviewNote(app.reviewNote ?? '');
  }

  if (authLoading || pageLoading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!canAccess) return null;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
            {t('Club Applications', 'طلبات الانضمام للأندية')}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('Review, accept, or reject student membership applications.', 'مراجعة طلبات انضمام الطلاب وقبولها أو رفضها.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            {t('Export CSV', 'تصدير CSV')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: t('Total', 'الكل'), value: stats.total, bg: 'var(--navy)', text: 'white' },
          { label: t('Pending', 'قيد المراجعة'), value: stats.pending, bg: '#fef9c3', text: '#92400e' },
          { label: t('Accepted', 'مقبول'), value: stats.accepted, bg: '#dcfce7', text: '#15803d' },
          { label: t('Rejected', 'مرفوض'), value: stats.rejected, bg: '#fee2e2', text: '#dc2626' },
          { label: t('Waitlisted', 'قائمة الانتظار'), value: stats.waitlisted, bg: '#dbeafe', text: '#1d4ed8' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: s.bg, color: s.text }}
          >
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search by name, ID, or email…', 'ابحث بالاسم أو الرقم أو البريد…')}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none"
            style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', paddingLeft: lang === 'ar' ? '0.75rem' : '', paddingRight: lang === 'ar' ? '2.25rem' : '' }}
          />
          {lang === 'ar' && (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Club filter */}
        {isAdmin && (
          <select
            value={filterClub}
            onChange={(e) => setFilterClub(e.target.value as ClubId | '')}
            className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none"
          >
            <option value="">{t('All Clubs', 'كل الأندية')}</option>
            {CLUBS.map((c) => (
              <option key={c.id} value={c.id}>{t(c.name, c.nameAr)}</option>
            ))}
          </select>
        )}

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ClubApplicationStatus | '')}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none"
        >
          <option value="">{t('All Statuses', 'كل الحالات')}</option>
          {(Object.entries(APPLICATION_STATUS_LABELS) as [ClubApplicationStatus, { en: string; ar: string }][]).map(([key, lbl]) => (
            <option key={key} value={key}>{t(lbl.en, lbl.ar)}</option>
          ))}
        </select>

        <span className="text-sm text-gray-400">
          {filtered.length} {t('results', 'نتيجة')}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Filter className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">{t('No applications found.', 'لا توجد طلبات.')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500">
                  <th className="px-4 py-3 text-start font-medium">{t('Applicant', 'المتقدم')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('Club', 'النادي')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('Major / Level', 'التخصص / المستوى')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('Status', 'الحالة')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('Submitted', 'تاريخ التقديم')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('Actions', 'الإجراءات')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((app) => {
                  const club = CLUBS.find((c) => c.id === app.clubId);
                  const statusInfo = APPLICATION_STATUS_LABELS[app.status];
                  const style = STATUS_STYLE[app.status] ?? STATUS_STYLE.pending;
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{app.fullName}</div>
                        <div className="text-xs text-gray-400">{app.universityId} · {app.universityEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{club?.icon}</span>
                          <span className="text-gray-700">{t(club?.name ?? '', club?.nameAr ?? '')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{app.major}</div>
                        <div className="text-xs text-gray-400">{app.academicLevel}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: style.bg, color: style.text }}
                        >
                          {t(statusInfo.en, statusInfo.ar)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {format(app.submittedAt, 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(app)}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t('Review', 'مراجعة')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail / Review Modal */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !actionLoading && setViewingApp(null)} />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-bold text-gray-900">{viewingApp.fullName}</h2>
                <p className="text-sm text-gray-400">{viewingApp.universityId} · {viewingApp.universityEmail}</p>
              </div>
              <button onClick={() => !actionLoading && setViewingApp(null)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status + Club */}
              <div className="flex items-center gap-3 flex-wrap">
                {(() => {
                  const club = CLUBS.find((c) => c.id === viewingApp.clubId);
                  const style = STATUS_STYLE[viewingApp.status] ?? STATUS_STYLE.pending;
                  const statusInfo = APPLICATION_STATUS_LABELS[viewingApp.status];
                  return (
                    <>
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: club?.color }}>
                        <span>{club?.icon}</span>
                        <span>{t(club?.name ?? '', club?.nameAr ?? '')}</span>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: style.bg, color: style.text }}>
                        {t(statusInfo.en, statusInfo.ar)}
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: t('Phone', 'الجوال'), value: viewingApp.phone },
                  { label: t('Major', 'التخصص'), value: viewingApp.major },
                  { label: t('Academic Level', 'المستوى'), value: viewingApp.academicLevel },
                  {
                    label: t('Preferred Role', 'الدور المفضّل'),
                    value: viewingApp.preferredRole
                      ? t(PREFERRED_ROLE_LABELS[viewingApp.preferredRole].en, PREFERRED_ROLE_LABELS[viewingApp.preferredRole].ar)
                      : t('—', '—'),
                  },
                  { label: t('Submitted', 'تاريخ التقديم'), value: format(viewingApp.submittedAt, 'PPP') },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <span className="block text-xs text-gray-400 mb-0.5">{item.label}</span>
                    <span className="font-medium text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Reason */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {t('Why do they want to join?', 'لماذا يريد الانضمام؟')}
                </h4>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                  {viewingApp.reasonToJoin}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {t('Skills', 'المهارات')}
                </h4>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                  {viewingApp.skills}
                </p>
              </div>

              {/* Previous experience */}
              {viewingApp.previousExperience && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {t('Previous Experience', 'الخبرات السابقة')}
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                    {viewingApp.previousExperience}
                  </p>
                </div>
              )}

              {/* Review note */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {t('Review Note (visible to student)', 'ملاحظة المراجع (تظهر للطالب)')}
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  disabled={['accepted', 'rejected', 'cancelled'].includes(viewingApp.status)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder={t('Optional note for the applicant…', 'ملاحظة اختيارية للمتقدم…')}
                />
              </div>

              {/* Action buttons — only for pending/waitlisted */}
              {!['accepted', 'rejected', 'cancelled'].includes(viewingApp.status) && (
                <div className="flex gap-3 flex-wrap pt-1">
                  <button
                    onClick={() => handleAction(viewingApp, 'accepted')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('Accept', 'قبول')}
                  </button>
                  <button
                    onClick={() => handleAction(viewingApp, 'waitlisted')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-60"
                  >
                    <Clock className="w-4 h-4" />
                    {t('Waitlist', 'قائمة الانتظار')}
                  </button>
                  <button
                    onClick={() => handleAction(viewingApp, 'rejected')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('Reject', 'رفض')}
                  </button>
                </div>
              )}

              {['accepted', 'rejected'].includes(viewingApp.status) && viewingApp.reviewedAt && (
                <p className="text-xs text-gray-400 text-center">
                  {t('Reviewed on', 'تمت المراجعة في')} {format(viewingApp.reviewedAt, 'PPP')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
