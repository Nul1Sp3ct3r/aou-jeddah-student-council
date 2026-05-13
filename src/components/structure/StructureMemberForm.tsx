'use client';

import { useState, useMemo } from 'react';
import { Link2, UserCheck, User } from 'lucide-react';
import type { OrganizationalMember, OrgMemberStatus, ClubId } from '../../types';
import type { UserProfile } from '../../types';
import { CLUBS } from '../../types';
import { ORG_POSITION_OPTIONS, getOrgPositionById } from '../../lib/orgPositions';

type FormData = Omit<OrganizationalMember, 'id' | 'createdAt' | 'updatedAt'>;

interface Props {
  lang: 'en' | 'ar';
  initial?: OrganizationalMember;
  currentUid: string;
  isAdmin: boolean;
  users: UserProfile[];
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

function findInitialPositionId(initial?: OrganizationalMember): string {
  if (!initial) return ORG_POSITION_OPTIONS[0].id;
  const byBoth = ORG_POSITION_OPTIONS.find(
    (p) => p.roleCategory === initial.roleCategory && p.labelEn === initial.positionEn,
  );
  if (byBoth) return byBoth.id;
  const byRole = ORG_POSITION_OPTIONS.find((p) => p.roleCategory === initial.roleCategory);
  return byRole?.id ?? ORG_POSITION_OPTIONS[0].id;
}

const councilPositions = ORG_POSITION_OPTIONS.filter((p) => p.entityType === 'student_council');
const clubPositions = ORG_POSITION_OPTIONS.filter((p) => p.entityType === 'club');

export default function StructureMemberForm({ lang, initial, currentUid, isAdmin, users, onSave, onCancel }: Props) {
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const [saving, setSaving] = useState(false);
  const [positionId, setPositionId] = useState(findInitialPositionId(initial));
  const [linkedMode, setLinkedMode] = useState(isAdmin && !!initial?.userId);
  const [userSearch, setUserSearch] = useState('');

  const selectedPosition = getOrgPositionById(positionId) ?? ORG_POSITION_OPTIONS[0];

  const [form, setForm] = useState<FormData>({
    fullNameAr: initial?.fullNameAr ?? '',
    fullNameEn: initial?.fullNameEn ?? '',
    positionAr: initial?.positionAr ?? selectedPosition.labelAr,
    positionEn: initial?.positionEn ?? selectedPosition.labelEn,
    bioAr: initial?.bioAr ?? '',
    bioEn: initial?.bioEn ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    major: initial?.major ?? '',
    imageUrl: initial?.imageUrl ?? '',
    linkedInUrl: initial?.linkedInUrl ?? '',
    userId: initial?.userId,
    entityType: initial?.entityType ?? selectedPosition.entityType,
    clubId: initial?.clubId,
    roleCategory: initial?.roleCategory ?? selectedPosition.roleCategory,
    displayOrder: initial?.displayOrder ?? selectedPosition.defaultDisplayOrder,
    status: initial?.status ?? 'active',
    termYear: initial?.termYear ?? '2025-2026',
    createdByUid: initial?.createdByUid ?? currentUid,
    updatedByUid: currentUid,
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePositionChange(id: string) {
    const pos = getOrgPositionById(id);
    if (!pos) return;
    setPositionId(id);
    setForm((prev) => ({
      ...prev,
      positionEn: pos.labelEn,
      positionAr: pos.labelAr,
      roleCategory: pos.roleCategory,
      entityType: pos.entityType,
      displayOrder: pos.defaultDisplayOrder,
      clubId: pos.requiresClub ? prev.clubId : undefined,
    }));
  }

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, userSearch]);

  function handleUserSelect(uid: string) {
    const user = users.find((u) => u.uid === uid);
    if (!user) {
      set('userId', undefined);
      return;
    }
    setForm((prev) => ({
      ...prev,
      userId: user.uid,
      fullNameEn: user.displayName,
      fullNameAr: user.displayNameAr || user.displayName,
      email: user.email,
    }));
  }

  function handleModeSwitch(mode: 'linked' | 'manual') {
    if (mode === 'manual') {
      setLinkedMode(false);
      set('userId', undefined);
    } else {
      setLinkedMode(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white';
  const inputReadOnly = 'w-full px-3 py-2 rounded-lg border border-gray-100 text-sm bg-gray-50 text-gray-500 cursor-not-allowed';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  const namesReadOnly = linkedMode && !!form.userId;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── Position ─────────────────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>{t('Position', 'المنصب')} *</label>
        <select
          required
          className={inputClass}
          value={positionId}
          onChange={(e) => handlePositionChange(e.target.value)}
        >
          <optgroup label={t('Student Council', 'المجلس الطلابي')}>
            {councilPositions.map((p) => (
              <option key={p.id} value={p.id}>{t(p.labelEn, p.labelAr)}</option>
            ))}
          </optgroup>
          <optgroup label={t('Club', 'النادي')}>
            {clubPositions.map((p) => (
              <option key={p.id} value={p.id}>{t(p.labelEn, p.labelAr)}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Club selector — shown only for positions that require a club */}
      {selectedPosition.requiresClub && (
        <div>
          <label className={labelClass}>{t('Club', 'النادي')} *</label>
          <select
            required
            className={inputClass}
            value={form.clubId ?? ''}
            onChange={(e) => set('clubId', (e.target.value as ClubId) || undefined)}
          >
            <option value="">{t('Select a club...', 'اختر ناديًا...')}</option>
            {CLUBS.map((c) => (
              <option key={c.id} value={c.id}>{t(c.name, c.nameAr)}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Member entry mode (admin only) ───────────────────────────────────── */}
      {isAdmin && (
        <div>
          <p className={labelClass}>{t('Entry mode', 'وضع الإدخال')}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleModeSwitch('linked')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                linkedMode ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={linkedMode ? { backgroundColor: 'var(--navy)' } : {}}
            >
              <Link2 className="w-3 h-3" />
              {t('Link Account', 'ربط بحساب')}
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('manual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                !linkedMode ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={!linkedMode ? { backgroundColor: 'var(--navy)' } : {}}
            >
              <User className="w-3 h-3" />
              {t('Manual Entry', 'إدخال يدوي')}
            </button>
          </div>
        </div>
      )}

      {/* User selector — shown in linked mode (admin only) */}
      {isAdmin && linkedMode && (
        <div className="rounded-xl p-3 space-y-2 border border-blue-100" style={{ backgroundColor: '#eff6ff' }}>
          <label className={labelClass}>{t('Search and select user', 'ابحث عن مستخدم واختره')}</label>
          <input
            className={inputClass}
            placeholder={t('Search by name or email...', 'ابحث بالاسم أو البريد الإلكتروني...')}
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          <select
            className={inputClass}
            value={form.userId ?? ''}
            onChange={(e) => handleUserSelect(e.target.value)}
          >
            <option value="">{t('— Select a user —', '— اختر مستخدمًا —')}</option>
            {filteredUsers.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.displayName} ({u.email})
              </option>
            ))}
          </select>
          {form.userId && (
            <p className="text-xs text-blue-700 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              {t('Account linked — name and email auto-filled.', 'تم ربط الحساب — تم ملء الاسم والبريد تلقائيًا.')}
            </p>
          )}
        </div>
      )}

      {/* ── Names ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t('Full Name (English)', 'الاسم الكامل (إنجليزي)')} *</label>
          <input
            required
            className={namesReadOnly ? inputReadOnly : inputClass}
            readOnly={namesReadOnly}
            value={form.fullNameEn}
            onChange={(e) => set('fullNameEn', e.target.value)}
            placeholder="Full Name"
          />
        </div>
        <div>
          <label className={labelClass}>{t('Full Name (Arabic)', 'الاسم الكامل (عربي)')} *</label>
          <input
            required
            className={namesReadOnly ? inputReadOnly : inputClass}
            readOnly={namesReadOnly}
            value={form.fullNameAr}
            onChange={(e) => set('fullNameAr', e.target.value)}
            placeholder="الاسم الكامل"
            dir="rtl"
          />
        </div>
      </div>

      {/* ── Bio ──────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t('Bio (English)', 'النبذة (إنجليزية)')}</label>
          <textarea
            rows={3}
            className={inputClass}
            value={form.bioEn}
            onChange={(e) => set('bioEn', e.target.value)}
            placeholder="Short bio..."
          />
        </div>
        <div>
          <label className={labelClass}>{t('Bio (Arabic)', 'النبذة (عربية)')}</label>
          <textarea
            rows={3}
            className={inputClass}
            value={form.bioAr}
            onChange={(e) => set('bioAr', e.target.value)}
            placeholder="نبذة قصيرة..."
            dir="rtl"
          />
        </div>
      </div>

      {/* ── Optional details ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t('Email (optional)', 'البريد الإلكتروني (اختياري)')}</label>
          <input
            type="email"
            className={namesReadOnly ? inputReadOnly : inputClass}
            readOnly={namesReadOnly}
            value={form.email ?? ''}
            onChange={(e) => set('email', e.target.value || undefined)}
            placeholder="email@aou.edu.sa"
          />
        </div>
        <div>
          <label className={labelClass}>{t('Major (optional)', 'التخصص (اختياري)')}</label>
          <input
            className={inputClass}
            value={form.major ?? ''}
            onChange={(e) => set('major', e.target.value || undefined)}
            placeholder={t('e.g. Information Technology', 'مثل: تقنية المعلومات')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t('LinkedIn URL (optional)', 'رابط لينكدإن (اختياري)')}</label>
          <input
            type="url"
            className={inputClass}
            value={form.linkedInUrl ?? ''}
            onChange={(e) => set('linkedInUrl', e.target.value || undefined)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <div>
          <label className={labelClass}>{t('Image URL (optional)', 'رابط الصورة (اختياري)')}</label>
          <input
            type="url"
            className={inputClass}
            value={form.imageUrl ?? ''}
            onChange={(e) => set('imageUrl', e.target.value || undefined)}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* ── Settings ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>{t('Display Order', 'ترتيب العرض')}</label>
          <input
            type="number"
            className={inputClass}
            value={form.displayOrder}
            onChange={(e) => set('displayOrder', Number(e.target.value))}
            min={1}
          />
        </div>
        <div>
          <label className={labelClass}>{t('Status', 'الحالة')}</label>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) => set('status', e.target.value as OrgMemberStatus)}
          >
            <option value="active">{t('Active', 'نشط')}</option>
            <option value="inactive">{t('Inactive', 'غير نشط')}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('Term Year', 'العام الدراسي')}</label>
          <input
            className={inputClass}
            value={form.termYear}
            onChange={(e) => set('termYear', e.target.value)}
            placeholder="2025-2026"
          />
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: 'var(--navy)' }}
        >
          {saving ? t('Saving...', 'جاري الحفظ...') : t('Save', 'حفظ')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          {t('Cancel', 'إلغاء')}
        </button>
      </div>
    </form>
  );
}
