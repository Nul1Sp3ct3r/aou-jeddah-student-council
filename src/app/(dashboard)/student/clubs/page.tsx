'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { X, ChevronRight, CalendarDays, Users, CheckCircle, Clock, Info } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLang } from '../../../../contexts/LangContext';
import {
  getAllClubRegistrationSettings,
  getStudentApplications,
  createClubApplication,
} from '../../../../lib/firestore';
import {
  CLUBS,
  APPLICATION_STATUS_LABELS,
  PREFERRED_ROLE_LABELS,
} from '../../../../types';
import type {
  ClubRegistrationSettings,
  ClubApplication,
  ClubId,
  PreferredRole,
} from '../../../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function effectiveStatus(s: ClubRegistrationSettings | null): 'open' | 'closed' | 'coming_soon' {
  if (!s || !s.registrationEnabled) return 'closed';
  const now = new Date();
  if (s.registrationStartDate && now < s.registrationStartDate) return 'coming_soon';
  if (s.registrationEndDate && now > s.registrationEndDate) return 'closed';
  return s.registrationStatus;
}

function statusBadge(status: 'open' | 'closed' | 'coming_soon', t: (en: string, ar: string) => string) {
  if (status === 'open')
    return { label: t('Registration Open', 'التسجيل مفتوح'), bg: '#dcfce7', text: '#15803d' };
  if (status === 'coming_soon')
    return { label: t('Coming Soon', 'قريبًا'), bg: '#dbeafe', text: '#1d4ed8' };
  return { label: t('Registration Closed', 'التسجيل مغلق'), bg: '#f3f4f6', text: '#6b7280' };
}

const ACADEMIC_LEVELS_EN = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5+'];
const ACADEMIC_LEVELS_AR = ['السنة الأولى', 'السنة الثانية', 'السنة الثالثة', 'السنة الرابعة', 'السنة الخامسة فأكثر'];

const PREFERRED_ROLES = Object.entries(PREFERRED_ROLE_LABELS) as [PreferredRole, { en: string; ar: string }][];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentClubsPage() {
  const { firebaseUser, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const [settings, setSettings] = useState<Record<string, ClubRegistrationSettings>>({});
  const [myApplications, setMyApplications] = useState<ClubApplication[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Modal state
  const [applyingTo, setApplyingTo] = useState<ClubId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    universityId: '',
    universityEmail: '',
    phone: '',
    major: '',
    academicLevel: '',
    reasonToJoin: '',
    skills: '',
    previousExperience: '',
    preferredRole: '' as PreferredRole | '',
    agreement: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  useEffect(() => {
    if (!authLoading && !firebaseUser) router.push('/login');
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    if (!firebaseUser) return;
    Promise.all([
      getAllClubRegistrationSettings(),
      getStudentApplications(firebaseUser.uid),
    ])
      .then(([allSettings, apps]) => {
        const map: Record<string, ClubRegistrationSettings> = {};
        allSettings.forEach((s) => { map[s.clubId] = s; });
        setSettings(map);
        setMyApplications(apps);
      })
      .catch(() => toast.error(t('Failed to load clubs.', 'فشل تحميل الأندية.')))
      .finally(() => setPageLoading(false));
  }, [firebaseUser]);

  // Pre-fill form from profile when opening modal
  function openApplyModal(clubId: ClubId) {
    setForm({
      fullName: userProfile?.displayName ?? '',
      universityId: userProfile?.studentId ?? '',
      universityEmail: firebaseUser?.email ?? '',
      phone: userProfile?.phone ?? '',
      major: userProfile?.major ?? '',
      academicLevel: '',
      reasonToJoin: '',
      skills: '',
      previousExperience: '',
      preferredRole: '',
      agreement: false,
    });
    setErrors({});
    setSubmitted(false);
    setApplyingTo(clubId);
  }

  // Check if student has an active (non-rejected, non-cancelled) application for a club
  function activeApplicationFor(clubId: ClubId): ClubApplication | null {
    return myApplications.find(
      (a) => a.clubId === clubId && !['rejected', 'cancelled'].includes(a.status),
    ) ?? null;
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = t('Required', 'مطلوب');
    if (!form.universityId.trim()) e.universityId = t('Required', 'مطلوب');
    if (!form.universityEmail.trim()) e.universityEmail = t('Required', 'مطلوب');
    if (!form.phone.trim()) e.phone = t('Required', 'مطلوب');
    if (!form.major.trim()) e.major = t('Required', 'مطلوب');
    if (!form.academicLevel) e.academicLevel = t('Required', 'مطلوب');
    if (form.reasonToJoin.trim().length < 20)
      e.reasonToJoin = t('Please write at least 20 characters.', 'الرجاء كتابة 20 حرفاً على الأقل.');
    if (form.skills.trim().length < 10)
      e.skills = t('Please write at least 10 characters.', 'الرجاء كتابة 10 أحرف على الأقل.');
    if (!form.agreement) e.agreement = t('You must agree to continue.', 'يجب الموافقة للمتابعة.');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!applyingTo || !firebaseUser || !validate()) return;

    // Check for duplicate active application
    if (activeApplicationFor(applyingTo)) {
      toast.error(t('You already have an active application for this club.', 'لديك طلب نشط بالفعل لهذا النادي.'));
      return;
    }

    setSubmitting(true);
    try {
      await createClubApplication({
        clubId: applyingTo,
        studentUid: firebaseUser.uid,
        fullName: form.fullName.trim(),
        universityId: form.universityId.trim(),
        universityEmail: form.universityEmail.trim(),
        phone: form.phone.trim(),
        major: form.major.trim(),
        academicLevel: form.academicLevel,
        reasonToJoin: form.reasonToJoin.trim(),
        skills: form.skills.trim(),
        previousExperience: form.previousExperience.trim() || undefined,
        preferredRole: (form.preferredRole as PreferredRole) || undefined,
        status: 'pending',
      });
      // Reload applications
      const apps = await getStudentApplications(firebaseUser.uid);
      setMyApplications(apps);
      setSubmitted(true);
    } catch {
      toast.error(t('Submission failed. Please try again.', 'فشل الإرسال. يرجى المحاولة مرة أخرى.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || pageLoading) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse space-y-3">
              <div className="h-14 w-14 bg-gray-200 rounded-2xl" />
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-9 w-full bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const applyingClub = applyingTo ? CLUBS.find((c) => c.id === applyingTo) : null;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
            {t('Available Clubs for Registration', 'الأندية المتاحة للتسجيل')}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('Apply to join a student club at AOU Jeddah.', 'تقدّم للانضمام إلى أحد أندية طلاب جامعة AOU جدة.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/student/applications"
            className="text-sm font-medium px-4 py-2 rounded-xl border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}
          >
            {t('My Applications', 'طلباتي')}
          </Link>
        </div>
      </div>

      {/* Club Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {CLUBS.map((club) => {
          const clubSettings = settings[club.id] ?? null;
          const status = effectiveStatus(clubSettings);
          const badge = statusBadge(status, t);
          const activeApp = activeApplicationFor(club.id as ClubId);
          const isOpen = status === 'open';
          const instructionsEn = clubSettings?.applicationInstructionsEn;
          const instructionsAr = clubSettings?.applicationInstructionsAr;
          const instructions = lang === 'ar' ? instructionsAr : instructionsEn;

          return (
            <div
              key={club.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Color top bar */}
              <div className="h-1.5" style={{ backgroundColor: club.color }} />

              <div className="p-6 flex flex-col flex-1">
                {/* Logo + Status */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: club.color + '15' }}
                  >
                    {club.logo ? (
                      <Image src={club.logo} alt={club.name} width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{club.icon}</span>
                    )}
                  </div>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Name + Description */}
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  {t(club.name, club.nameAr)}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3 flex-1">
                  {t(club.description, club.descriptionAr)}
                </p>

                {/* Dates / Seats */}
                {clubSettings && (
                  <div className="space-y-1 mb-4">
                    {clubSettings.registrationEndDate && status === 'open' && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {t('Deadline:', 'آخر موعد:')} {format(clubSettings.registrationEndDate, 'MMM d, yyyy')}
                      </div>
                    )}
                    {clubSettings.registrationStartDate && status === 'coming_soon' && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {t('Opens:', 'يبدأ:')} {format(clubSettings.registrationStartDate, 'MMM d, yyyy')}
                      </div>
                    )}
                    {clubSettings.membershipSeatLimit && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        {t('Seats available:', 'المقاعد المتاحة:')} {clubSettings.membershipSeatLimit}
                      </div>
                    )}
                  </div>
                )}

                {/* Instructions */}
                {instructions && (
                  <div
                    className="flex items-start gap-2 text-xs rounded-xl p-3 mb-4"
                    style={{ backgroundColor: club.color + '10', color: club.color }}
                  >
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{instructions}</span>
                  </div>
                )}

                {/* Active application badge */}
                {activeApp && (
                  <div
                    className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl mb-3"
                    style={{
                      backgroundColor: APPLICATION_STATUS_LABELS[activeApp.status].color === 'yellow'
                        ? '#fef9c3' : APPLICATION_STATUS_LABELS[activeApp.status].color === 'green'
                        ? '#dcfce7' : APPLICATION_STATUS_LABELS[activeApp.status].color === 'blue'
                        ? '#dbeafe' : '#f3f4f6',
                      color: APPLICATION_STATUS_LABELS[activeApp.status].color === 'yellow'
                        ? '#92400e' : APPLICATION_STATUS_LABELS[activeApp.status].color === 'green'
                        ? '#15803d' : APPLICATION_STATUS_LABELS[activeApp.status].color === 'blue'
                        ? '#1d4ed8' : '#6b7280',
                    }}
                  >
                    {activeApp.status === 'accepted' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {t(
                        APPLICATION_STATUS_LABELS[activeApp.status].en,
                        APPLICATION_STATUS_LABELS[activeApp.status].ar,
                      )}
                    </span>
                    {activeApp.status === 'accepted' && (
                      <span className="text-xs opacity-75">
                        {t('— You are a member!', '— أنت عضو الآن!')}
                      </span>
                    )}
                  </div>
                )}

                {/* Action button */}
                {activeApp ? (
                  <Link
                    href="/student/applications"
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2 border"
                    style={{ borderColor: club.color, color: club.color }}
                  >
                    {t('View Application', 'عرض الطلب')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : isOpen ? (
                  <button
                    onClick={() => openApplyModal(club.id as ClubId)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                    style={{ backgroundColor: club.color }}
                  >
                    {t('Apply to Join', 'تقديم طلب انضمام')}
                  </button>
                ) : status === 'coming_soon' ? (
                  <div className="w-full py-2.5 rounded-xl text-sm font-medium text-center bg-gray-50 text-gray-400 border border-gray-200">
                    {t('Registration will open soon', 'التسجيل سيفتح قريبًا')}
                  </div>
                ) : (
                  <div className="w-full py-2.5 rounded-xl text-sm font-medium text-center bg-gray-50 text-gray-400 border border-gray-200">
                    {t('Registration is currently closed', 'التسجيل مغلق حاليًا')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Modal */}
      {applyingTo && applyingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !submitting && setApplyingTo(null)} />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: applyingClub.color + '15' }}
                >
                  {applyingClub.logo ? (
                    <Image src={applyingClub.logo} alt={applyingClub.name} width={40} height={40} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{applyingClub.icon}</span>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{t('Apply to Join', 'تقديم طلب انضمام')}</h2>
                  <p className="text-sm" style={{ color: applyingClub.color }}>
                    {t(applyingClub.name, applyingClub.nameAr)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !submitting && setApplyingTo(null)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success state */}
            {submitted ? (
              <div className="p-8 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#dcfce7' }}
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t('Application Submitted!', 'تم إرسال طلبك!')}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {t(
                    'Your application has been submitted successfully and will be reviewed by the club management or Student Council.',
                    'تم إرسال طلبك بنجاح، وسيتم مراجعته من قبل إدارة النادي أو المجلس الطلابي.',
                  )}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setApplyingTo(null)}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: applyingClub.color }}
                  >
                    {t('Done', 'تم')}
                  </button>
                  <Link
                    href="/student/applications"
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    {t('View My Applications', 'عرض طلباتي')}
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Row: Full Name + University ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Full Name', 'الاسم الكامل')} *
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': applyingClub.color } as React.CSSProperties}
                    />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('University ID', 'الرقم الجامعي')} *
                    </label>
                    <input
                      type="text"
                      value={form.universityId}
                      onChange={(e) => setForm({ ...form, universityId: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': applyingClub.color } as React.CSSProperties}
                      placeholder="e.g. 20231234"
                    />
                    {errors.universityId && <p className="text-xs text-red-500 mt-1">{errors.universityId}</p>}
                  </div>
                </div>

                {/* Row: Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('University Email', 'البريد الجامعي')} *
                    </label>
                    <input
                      type="email"
                      value={form.universityEmail}
                      onChange={(e) => setForm({ ...form, universityEmail: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': applyingClub.color } as React.CSSProperties}
                    />
                    {errors.universityEmail && <p className="text-xs text-red-500 mt-1">{errors.universityEmail}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Phone Number', 'رقم الجوال')} *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': applyingClub.color } as React.CSSProperties}
                      placeholder="+966 5X XXX XXXX"
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Row: Major + Academic Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Major', 'التخصص')} *
                    </label>
                    <input
                      type="text"
                      value={form.major}
                      onChange={(e) => setForm({ ...form, major: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': applyingClub.color } as React.CSSProperties}
                      placeholder={t('e.g. Business Administration', 'مثال: إدارة الأعمال')}
                    />
                    {errors.major && <p className="text-xs text-red-500 mt-1">{errors.major}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Academic Level', 'المستوى الدراسي')} *
                    </label>
                    <select
                      value={form.academicLevel}
                      onChange={(e) => setForm({ ...form, academicLevel: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white"
                      style={{ '--tw-ring-color': applyingClub.color } as React.CSSProperties}
                    >
                      <option value="">{t('Select level', 'اختر المستوى')}</option>
                      {ACADEMIC_LEVELS_EN.map((lvl, i) => (
                        <option key={lvl} value={lvl}>
                          {lang === 'ar' ? ACADEMIC_LEVELS_AR[i] : lvl}
                        </option>
                      ))}
                    </select>
                    {errors.academicLevel && <p className="text-xs text-red-500 mt-1">{errors.academicLevel}</p>}
                  </div>
                </div>

                {/* Preferred Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Preferred Role', 'الدور المفضّل')}{' '}
                    <span className="text-gray-400 font-normal">({t('optional', 'اختياري')})</span>
                  </label>
                  <select
                    value={form.preferredRole}
                    onChange={(e) => setForm({ ...form, preferredRole: e.target.value as PreferredRole })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': applyingClub.color } as React.CSSProperties}
                  >
                    <option value="">{t('No preference', 'بدون تفضيل')}</option>
                    {PREFERRED_ROLES.map(([key, lbl]) => (
                      <option key={key} value={key}>{t(lbl.en, lbl.ar)}</option>
                    ))}
                  </select>
                </div>

                {/* Reason to join */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Why do you want to join this club?', 'لماذا ترغب بالانضمام لهذا النادي؟')} *
                  </label>
                  <textarea
                    rows={3}
                    value={form.reasonToJoin}
                    onChange={(e) => setForm({ ...form, reasonToJoin: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{ '--tw-ring-color': applyingClub.color } as React.CSSProperties}
                    placeholder={t('Tell us why you want to be part of this club...', 'أخبرنا لماذا تريد أن تكون جزءاً من هذا النادي...')}
                  />
                  {errors.reasonToJoin && <p className="text-xs text-red-500 mt-1">{errors.reasonToJoin}</p>}
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('What skills can you contribute?', 'ما المهارات التي يمكنك تقديمها؟')} *
                  </label>
                  <textarea
                    rows={3}
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{ '--tw-ring-color': applyingClub.color } as React.CSSProperties}
                    placeholder={t('e.g. video editing, public speaking, design...', 'مثال: تحرير الفيديو، الخطابة، التصميم...')}
                  />
                  {errors.skills && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}
                </div>

                {/* Previous experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Previous Experience', 'الخبرات السابقة')}{' '}
                    <span className="text-gray-400 font-normal">({t('optional', 'اختياري')})</span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.previousExperience}
                    onChange={(e) => setForm({ ...form, previousExperience: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{ '--tw-ring-color': applyingClub.color } as React.CSSProperties}
                    placeholder={t('Any relevant clubs, activities, or experience...', 'أي أندية أو نشاطات أو خبرات ذات صلة...')}
                  />
                </div>

                {/* Agreement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreement}
                    onChange={(e) => setForm({ ...form, agreement: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700">
                    {t(
                      'I confirm that all submitted information is correct.',
                      'أتعهد بأن جميع البيانات المدخلة صحيحة.',
                    )}
                  </span>
                </label>
                {errors.agreement && <p className="text-xs text-red-500 -mt-3">{errors.agreement}</p>}

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 hover:opacity-90 transition-all"
                    style={{ backgroundColor: applyingClub.color }}
                  >
                    {submitting
                      ? t('Submitting...', 'جاري الإرسال...')
                      : t('Submit Application', 'إرسال الطلب')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyingTo(null)}
                    disabled={submitting}
                    className="px-5 py-3 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {t('Cancel', 'إلغاء')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
