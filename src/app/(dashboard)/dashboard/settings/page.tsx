'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, User, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLang } from '../../../../contexts/LangContext';
import { updateUserProfile } from '../../../../lib/firestore';
import { ROLE_LABELS, CLUBS } from '../../../../types';

const schema = z.object({
  displayName: z.string().min(2, 'Name is required'),
  displayNameAr: z.string().min(2, 'Arabic name is required'),
  studentId: z.string().optional(),
  major: z.string().optional(),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const { userProfile, refreshProfile } = useAuth();
  const { lang } = useLang();
  const [saving, setSaving] = useState(false);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      displayName: userProfile?.displayName ?? '',
      displayNameAr: userProfile?.displayNameAr ?? '',
      studentId: userProfile?.studentId ?? '',
      major: userProfile?.major ?? '',
      phone: userProfile?.phone ?? '',
    },
  });

  if (!userProfile) return null;
  const club = userProfile.clubId ? CLUBS.find((c) => c.id === userProfile.clubId) : null;

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      await updateUserProfile(userProfile!.uid, data);
      await refreshProfile();
      toast.success(t('Profile updated!', 'تم تحديث الملف الشخصي!'));
    } catch {
      toast.error(t('Failed to save.', 'فشل الحفظ.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6" style={{ color: 'var(--navy)' }} />
          {t('Settings', 'الإعدادات')}
        </h1>
      </div>

      {/* Account info (read-only) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4" />
          {t('Account Information', 'معلومات الحساب')}
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">{t('Email', 'البريد الإلكتروني')}</div>
            <div className="font-medium text-gray-900">{userProfile.email}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">{t('Role', 'الدور')}</div>
            <div className="font-medium text-gray-900">
              {t(ROLE_LABELS[userProfile.role].en, ROLE_LABELS[userProfile.role].ar)}
            </div>
          </div>
          {club && (
            <div>
              <div className="text-xs text-gray-400 mb-0.5">{t('Club', 'النادي')}</div>
              <div className="font-medium text-gray-900">
                {club.icon} {t(club.name, club.nameAr)}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-400 mb-0.5">{t('Status', 'الحالة')}</div>
            <div className={`font-medium ${userProfile.isActive ? 'text-green-600' : 'text-red-500'}`}>
              {userProfile.isActive ? t('Active', 'نشط') : t('Inactive', 'غير نشط')}
            </div>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{t('Edit Profile', 'تعديل الملف الشخصي')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Full Name (EN)', 'الاسم الكامل (EN)')} *
              </label>
              <input
                {...register('displayName')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
              />
              {errors.displayName && <p className="text-xs text-red-500 mt-1">{errors.displayName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Full Name (AR)', 'الاسم الكامل (AR)')} *
              </label>
              <input
                {...register('displayNameAr')}
                dir="rtl"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 text-right"
              />
              {errors.displayNameAr && <p className="text-xs text-red-500 mt-1">{errors.displayNameAr.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Student ID', 'رقم الطالب')}
              </label>
              <input
                {...register('studentId')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                placeholder="e.g. 20231234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Major', 'التخصص')}
              </label>
              <input
                {...register('major')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                placeholder={t('e.g. Business Administration', 'مثال: إدارة الأعمال')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Phone', 'رقم الهاتف')}
              </label>
              <input
                {...register('phone')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                placeholder="+966 5X XXX XXXX"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--navy)' }}
        >
          <Save className="w-4 h-4" />
          {saving ? t('Saving...', 'جاري الحفظ...') : t('Save Changes', 'حفظ التغييرات')}
        </button>
      </form>
    </div>
  );
}
