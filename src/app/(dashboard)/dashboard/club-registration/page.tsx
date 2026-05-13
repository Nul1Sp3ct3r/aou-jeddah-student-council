'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Save, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLang } from '../../../../contexts/LangContext';
import { getAllClubRegistrationSettings, upsertClubRegistrationSettings } from '../../../../lib/firestore';
import { CLUBS } from '../../../../types';
import type { ClubRegistrationSettings, ClubId, ClubRegistrationStatus } from '../../../../types';

// ─── Default settings for a club that has no Firestore document yet ───────────
function defaultSettings(clubId: ClubId): Omit<ClubRegistrationSettings, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    clubId,
    registrationEnabled: false,
    registrationStatus: 'closed',
    registrationStartDate: undefined,
    registrationEndDate: undefined,
    membershipSeatLimit: undefined,
    applicationInstructionsAr: '',
    applicationInstructionsEn: '',
    allowStudentCancellation: true,
    allowReapplyAfterRejection: true,
  };
}

// ─── Helper: date → input string (yyyy-MM-dd) ─────────────────────────────────
function toDateInput(d?: Date): string {
  if (!d) return '';
  return d.toISOString().substring(0, 10);
}

function fromDateInput(s: string): Date | undefined {
  if (!s) return undefined;
  return new Date(s + 'T00:00:00');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClubRegistrationPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const [pageLoading, setPageLoading] = useState(true);
  const [expandedClub, setExpandedClub] = useState<ClubId | null>(null);
  const [saving, setSaving] = useState<ClubId | null>(null);

  // Per-club settings state (keyed by clubId)
  type FormSettings = Omit<ClubRegistrationSettings, 'id' | 'createdAt' | 'updatedAt'>;
  const [clubForms, setClubForms] = useState<Record<ClubId, FormSettings>>({} as Record<ClubId, FormSettings>);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const role = userProfile?.role ?? 'student';
  const canManage = role === 'super_admin' || role === 'council_admin';

  useEffect(() => {
    if (!authLoading && !canManage) router.push('/dashboard');
  }, [authLoading, canManage, router]);

  useEffect(() => {
    if (!canManage) return;
    getAllClubRegistrationSettings()
      .then((allSettings) => {
        const map: Record<ClubId, FormSettings> = {} as Record<ClubId, FormSettings>;
        CLUBS.forEach((club) => {
          const existing = allSettings.find((s) => s.clubId === club.id);
          if (existing) {
            map[club.id] = {
              clubId: existing.clubId,
              registrationEnabled: existing.registrationEnabled,
              registrationStatus: existing.registrationStatus,
              registrationStartDate: existing.registrationStartDate,
              registrationEndDate: existing.registrationEndDate,
              membershipSeatLimit: existing.membershipSeatLimit,
              applicationInstructionsAr: existing.applicationInstructionsAr ?? '',
              applicationInstructionsEn: existing.applicationInstructionsEn ?? '',
              allowStudentCancellation: existing.allowStudentCancellation,
              allowReapplyAfterRejection: existing.allowReapplyAfterRejection,
              updatedByUid: existing.updatedByUid,
            };
          } else {
            map[club.id] = defaultSettings(club.id);
          }
        });
        setClubForms(map);
      })
      .catch(() => toast.error(t('Failed to load settings.', 'فشل تحميل الإعدادات.')))
      .finally(() => setPageLoading(false));
  }, [canManage]);

  function updateField<K extends keyof FormSettings>(clubId: ClubId, field: K, value: FormSettings[K]) {
    setClubForms((prev) => ({
      ...prev,
      [clubId]: { ...prev[clubId], [field]: value },
    }));
  }

  async function handleSave(clubId: ClubId) {
    const form = clubForms[clubId];
    if (!form) return;
    setSaving(clubId);
    try {
      await upsertClubRegistrationSettings(clubId, {
        ...form,
        updatedByUid: userProfile?.uid,
      });
      toast.success(t('Settings saved!', 'تم حفظ الإعدادات!'));
    } catch {
      toast.error(t('Failed to save. Try again.', 'فشل الحفظ. حاول مرة أخرى.'));
    } finally {
      setSaving(null);
    }
  }

  async function handleOpenAll() {
    if (!confirm(t('Open registration for ALL clubs?', 'هل تريد فتح التسجيل لجميع الأندية؟'))) return;
    for (const club of CLUBS) {
      await upsertClubRegistrationSettings(club.id, {
        clubId: club.id,
        registrationEnabled: true,
        registrationStatus: 'open',
        updatedByUid: userProfile?.uid,
      });
    }
    setClubForms((prev) => {
      const updated = { ...prev };
      CLUBS.forEach((c) => {
        updated[c.id] = { ...updated[c.id], registrationEnabled: true, registrationStatus: 'open' };
      });
      return updated;
    });
    toast.success(t('Registration opened for all clubs.', 'تم فتح التسجيل لجميع الأندية.'));
  }

  async function handleCloseAll() {
    if (!confirm(t('Close registration for ALL clubs?', 'هل تريد إغلاق التسجيل لجميع الأندية؟'))) return;
    for (const club of CLUBS) {
      await upsertClubRegistrationSettings(club.id, {
        clubId: club.id,
        registrationEnabled: false,
        registrationStatus: 'closed',
        updatedByUid: userProfile?.uid,
      });
    }
    setClubForms((prev) => {
      const updated = { ...prev };
      CLUBS.forEach((c) => {
        updated[c.id] = { ...updated[c.id], registrationEnabled: false, registrationStatus: 'closed' };
      });
      return updated;
    });
    toast.success(t('Registration closed for all clubs.', 'تم إغلاق التسجيل لجميع الأندية.'));
  }

  if (authLoading || pageLoading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  if (!canManage) return null;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
            {t('Club Registration Management', 'إدارة التسجيل في الأندية')}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('Control when students can apply to join each club.', 'تحكّم في وقت قبول طلبات انضمام الطلاب لكل نادٍ.')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenAll}
            className="text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: '#16a34a' }}
          >
            {t('Open All', 'فتح الكل')}
          </button>
          <button
            onClick={handleCloseAll}
            className="text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-90 transition-all bg-gray-500 hover:bg-gray-600"
          >
            {t('Close All', 'إغلاق الكل')}
          </button>
        </div>
      </div>

      {/* Club cards */}
      <div className="space-y-4">
        {CLUBS.map((club) => {
          const form = clubForms[club.id];
          if (!form) return null;
          const isExpanded = expandedClub === club.id;
          const isEnabled = form.registrationEnabled;

          return (
            <div key={club.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Club color bar */}
              <div className="h-1" style={{ backgroundColor: club.color }} />

              {/* Summary row */}
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: club.color + '15' }}
                  >
                    {club.logo ? (
                      <Image src={club.logo} alt={club.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{club.icon}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t(club.name, club.nameAr)}</h3>
                    <span
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                      style={isEnabled
                        ? { backgroundColor: '#dcfce7', color: '#15803d' }
                        : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
                    >
                      {isEnabled
                        ? t('Registration Open', 'التسجيل مفتوح')
                        : t('Registration Closed', 'التسجيل مغلق')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quick toggle */}
                  <button
                    onClick={() => {
                      const newVal = !form.registrationEnabled;
                      updateField(club.id, 'registrationEnabled', newVal);
                      updateField(club.id, 'registrationStatus', newVal ? 'open' : 'closed');
                    }}
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: isEnabled ? '#16a34a' : '#6b7280' }}
                  >
                    {isEnabled
                      ? <ToggleRight className="w-6 h-6" />
                      : <ToggleLeft className="w-6 h-6" />}
                  </button>

                  {/* Expand/collapse */}
                  <button
                    onClick={() => setExpandedClub(isExpanded ? null : club.id)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded settings */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                  {/* Status + Dates row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t('Registration Status', 'حالة التسجيل')}
                      </label>
                      <select
                        value={form.registrationStatus}
                        onChange={(e) => updateField(club.id, 'registrationStatus', e.target.value as ClubRegistrationStatus)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"
                      >
                        <option value="open">{t('Open', 'مفتوح')}</option>
                        <option value="closed">{t('Closed', 'مغلق')}</option>
                        <option value="coming_soon">{t('Coming Soon', 'قريبًا')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t('Start Date', 'تاريخ البداية')}
                      </label>
                      <input
                        type="date"
                        value={toDateInput(form.registrationStartDate)}
                        onChange={(e) => updateField(club.id, 'registrationStartDate', fromDateInput(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t('End Date', 'تاريخ الانتهاء')}
                      </label>
                      <input
                        type="date"
                        value={toDateInput(form.registrationEndDate)}
                        onChange={(e) => updateField(club.id, 'registrationEndDate', fromDateInput(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Seat limit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t('Seat Limit', 'الحد الأقصى للمقاعد')}{' '}
                        <span className="text-gray-400 font-normal">({t('optional', 'اختياري')})</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={form.membershipSeatLimit ?? ''}
                        onChange={(e) => updateField(club.id, 'membershipSeatLimit', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                        placeholder={t('No limit', 'بلا حد')}
                      />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t('Application Instructions (English)', 'تعليمات التقديم (إنجليزي)')}
                      </label>
                      <textarea
                        rows={2}
                        value={form.applicationInstructionsEn ?? ''}
                        onChange={(e) => updateField(club.id, 'applicationInstructionsEn', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none"
                        placeholder="Optional note visible to students..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t('Application Instructions (Arabic)', 'تعليمات التقديم (عربي)')}
                      </label>
                      <textarea
                        rows={2}
                        value={form.applicationInstructionsAr ?? ''}
                        onChange={(e) => updateField(club.id, 'applicationInstructionsAr', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none"
                        dir="rtl"
                        placeholder="ملاحظة اختيارية تظهر للطلاب..."
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.allowStudentCancellation}
                        onChange={(e) => updateField(club.id, 'allowStudentCancellation', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        {t('Allow students to cancel their application', 'السماح للطلاب بإلغاء طلباتهم')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.allowReapplyAfterRejection}
                        onChange={(e) => updateField(club.id, 'allowReapplyAfterRejection', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        {t('Allow re-apply after rejection', 'السماح بالتقديم مجدداً بعد الرفض')}
                      </span>
                    </label>
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleSave(club.id)}
                      disabled={saving === club.id}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 hover:opacity-90 transition-all"
                      style={{ backgroundColor: 'var(--navy)' }}
                    >
                      <Save className="w-4 h-4" />
                      {saving === club.id ? t('Saving...', 'جاري الحفظ...') : t('Save Settings', 'حفظ الإعدادات')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
