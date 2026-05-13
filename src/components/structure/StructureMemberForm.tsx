'use client';

import { useState } from 'react';
import type { OrganizationalMember, OrgEntityType, OrgRoleCategory, ClubId } from '../../types';
import { ORG_ROLE_LABELS, CLUBS } from '../../types';

type FormData = Omit<OrganizationalMember, 'id' | 'createdAt' | 'updatedAt'>;

interface Props {
  lang: 'en' | 'ar';
  initial?: OrganizationalMember;
  currentUid: string;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

const ROLE_CATEGORIES: OrgRoleCategory[] = [
  'council_president', 'council_vice_president', 'council_secretary',
  'council_officer', 'clubs_supervisor', 'club_president', 'club_vice_president', 'club_member',
];

const ENTITY_TYPES: { value: OrgEntityType; en: string; ar: string }[] = [
  { value: 'student_council', en: 'Student Council', ar: 'المجلس الطلابي' },
  { value: 'club', en: 'Club', ar: 'نادي' },
];

export default function StructureMemberForm({ lang, initial, currentUid, onSave, onCancel }: Props) {
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormData>({
    fullNameAr: initial?.fullNameAr ?? '',
    fullNameEn: initial?.fullNameEn ?? '',
    positionAr: initial?.positionAr ?? '',
    positionEn: initial?.positionEn ?? '',
    bioAr: initial?.bioAr ?? '',
    bioEn: initial?.bioEn ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    major: initial?.major ?? '',
    imageUrl: initial?.imageUrl ?? '',
    linkedInUrl: initial?.linkedInUrl ?? '',
    entityType: initial?.entityType ?? 'student_council',
    clubId: initial?.clubId,
    roleCategory: initial?.roleCategory ?? 'council_officer',
    displayOrder: initial?.displayOrder ?? 99,
    status: initial?.status ?? 'active',
    termYear: initial?.termYear ?? '2025-2026',
    createdByUid: initial?.createdByUid ?? currentUid,
    updatedByUid: currentUid,
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t('Full Name (English)', 'الاسم الكامل (إنجليزي)')}</label>
          <input
            required
            className={inputClass}
            value={form.fullNameEn}
            onChange={(e) => set('fullNameEn', e.target.value)}
            placeholder="Full Name"
          />
        </div>
        <div>
          <label className={labelClass}>{t('Full Name (Arabic)', 'الاسم الكامل (عربي)')}</label>
          <input
            required
            className={inputClass}
            value={form.fullNameAr}
            onChange={(e) => set('fullNameAr', e.target.value)}
            placeholder="الاسم الكامل"
            dir="rtl"
          />
        </div>
      </div>

      {/* Positions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t('Position (English)', 'المنصب (إنجليزي)')}</label>
          <input
            required
            className={inputClass}
            value={form.positionEn}
            onChange={(e) => set('positionEn', e.target.value)}
            placeholder="Position"
          />
        </div>
        <div>
          <label className={labelClass}>{t('Position (Arabic)', 'المنصب (عربي)')}</label>
          <input
            required
            className={inputClass}
            value={form.positionAr}
            onChange={(e) => set('positionAr', e.target.value)}
            placeholder="المنصب"
            dir="rtl"
          />
        </div>
      </div>

      {/* Bio */}
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

      {/* Entity & Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t('Entity Type', 'نوع الجهة')}</label>
          <select
            className={inputClass}
            value={form.entityType}
            onChange={(e) => set('entityType', e.target.value as OrgEntityType)}
          >
            {ENTITY_TYPES.map((et) => (
              <option key={et.value} value={et.value}>{t(et.en, et.ar)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('Role Category', 'فئة الدور')}</label>
          <select
            className={inputClass}
            value={form.roleCategory}
            onChange={(e) => set('roleCategory', e.target.value as OrgRoleCategory)}
          >
            {ROLE_CATEGORIES.map((rc) => (
              <option key={rc} value={rc}>{t(ORG_ROLE_LABELS[rc].en, ORG_ROLE_LABELS[rc].ar)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Club (if entity type is club) */}
      {form.entityType === 'club' && (
        <div>
          <label className={labelClass}>{t('Club', 'النادي')}</label>
          <select
            className={inputClass}
            value={form.clubId ?? ''}
            onChange={(e) => set('clubId', e.target.value as ClubId || undefined)}
          >
            <option value="">{t('Select a club...', 'اختر ناديًا...')}</option>
            {CLUBS.map((c) => (
              <option key={c.id} value={c.id}>{t(c.name, c.nameAr)}</option>
            ))}
          </select>
        </div>
      )}

      {/* Optional fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t('Email (optional)', 'البريد الإلكتروني (اختياري)')}</label>
          <input
            type="email"
            className={inputClass}
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

      {/* Display order, status, term */}
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
            onChange={(e) => set('status', e.target.value as 'active' | 'inactive')}
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

      {/* Actions */}
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
