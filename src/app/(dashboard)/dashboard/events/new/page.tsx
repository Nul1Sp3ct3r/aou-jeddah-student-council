'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useLang } from '../../../../../contexts/LangContext';
import { createEvent } from '../../../../../lib/firestore';
import { CLUBS } from '../../../../../types';
import type { ClubId } from '../../../../../types';

const schema = z.object({
  title: z.string().min(5, 'Title is required'),
  titleAr: z.string().min(5, 'Arabic title is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  descriptionAr: z.string().min(20, 'Arabic description is required'),
  location: z.string().min(3, 'Location is required'),
  locationAr: z.string().min(3, 'Arabic location is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  eventEndDate: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(10000, 'Capacity cannot exceed 10,000'),
  requiresMediaCoverage: z.boolean(),
  tags: z.string().optional(),
  tagsAr: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewEventPage() {
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const [submitting, setSubmitting] = useState(false);
  const [adminClubId, setAdminClubId] = useState<ClubId | ''>('');
  const [clubTouched, setClubTouched] = useState(false);
  const router = useRouter();

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { capacity: 50, requiresMediaCoverage: false },
  });

  if (!userProfile) return null;
  const isAdminRole = userProfile.role === 'super_admin' || userProfile.role === 'council_admin';
  const club = userProfile.clubId ? CLUBS.find((c) => c.id === userProfile.clubId) : null;

  const canSubmit = ['club_president', 'club_vice_president', 'council_admin', 'super_admin'].includes(userProfile.role);

  if (!canSubmit) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-gray-500">{t("You don't have permission to create events.", 'ليس لديك صلاحية إنشاء فعاليات.')}</p>
      </div>
    );
  }

  async function onSubmit(data: FormData, isDraft = false) {
    if (!userProfile) return;
    const effectiveClubId = isAdminRole ? adminClubId : userProfile.clubId;
    if (!effectiveClubId) {
      setClubTouched(true);
      toast.error(t('Please select a club for this event.', 'يرجى اختيار نادٍ للفعالية.'));
      return;
    }
    setSubmitting(true);
    try {
      const tags = data.tags ? data.tags.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const tagsAr = data.tagsAr ? data.tagsAr.split(',').map((s) => s.trim()).filter(Boolean) : [];
      await createEvent({
        title: data.title,
        titleAr: data.titleAr,
        description: data.description,
        descriptionAr: data.descriptionAr,
        location: data.location,
        locationAr: data.locationAr,
        eventDate: new Date(data.eventDate),
        eventEndDate: data.eventEndDate ? new Date(data.eventEndDate) : undefined,
        capacity: data.capacity,
        registeredCount: 0,
        requiresMediaCoverage: data.requiresMediaCoverage,
        clubId: effectiveClubId,
        organizerId: userProfile.uid,
        organizerName: userProfile.displayName,
        status: isDraft ? 'draft' : 'pending_review',
        tags,
        tagsAr,
        submittedAt: isDraft ? undefined : new Date(),
      });
      toast.success(
        isDraft
          ? t('Event saved as draft.', 'تم حفظ الفعالية كمسودة.')
          : t('Event submitted for review!', 'تم تقديم الفعالية للمراجعة!'),
      );
      router.push('/dashboard/events');
    } catch {
      toast.error(t('Failed to save event.', 'فشل حفظ الفعالية.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/events" className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('New Event', 'فعالية جديدة')}</h1>
            {club && (
              <p className="text-sm text-gray-500">
                {t(club.name, club.nameAr)}
              </p>
            )}
          </div>
        </div>
      </div>

      <form className="space-y-6">
        {/* Club selector — admins only */}
        {isAdminRole && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">{t('Organizing Club', 'النادي المنظم')} *</h2>
            <select
              value={adminClubId}
              onChange={(e) => setAdminClubId(e.target.value as ClubId | '')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white"
            >
              <option value="">{t('— Select a club —', '— اختر نادياً —')}</option>
              {CLUBS.map((c) => (
                <option key={c.id} value={c.id}>{t(c.name, c.nameAr)}</option>
              ))}
            </select>
            {!adminClubId && clubTouched && (
              <p className="text-xs text-red-500 mt-1">{t('Please select a club.', 'يرجى اختيار نادٍ.')}</p>
            )}
          </div>
        )}

        {/* Titles */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t('Event Title', 'عنوان الفعالية')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Title (English)', 'العنوان (English)')} *
              </label>
              <input
                {...register('title')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                placeholder="e.g. Annual Programming Competition"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Title (Arabic)', 'العنوان (Arabic)')} *
              </label>
              <input
                {...register('titleAr')}
                dir="rtl"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 text-right"
                placeholder="مثال: مسابقة البرمجة السنوية"
              />
              {errors.titleAr && <p className="text-xs text-red-500 mt-1">{errors.titleAr.message}</p>}
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t('Description', 'الوصف')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Description (English)', 'الوصف (English)')} *
              </label>
              <textarea
                {...register('description')}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
                placeholder="Describe your event in detail..."
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Description (Arabic)', 'الوصف (Arabic)')} *
              </label>
              <textarea
                {...register('descriptionAr')}
                dir="rtl"
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none text-right"
                placeholder="صِف فعاليتك بالتفصيل..."
              />
              {errors.descriptionAr && <p className="text-xs text-red-500 mt-1">{errors.descriptionAr.message}</p>}
            </div>
          </div>
        </div>

        {/* Date & Location */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t('Date & Location', 'التاريخ والموقع')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Start Date & Time', 'تاريخ ووقت البداية')} *
              </label>
              <input
                {...register('eventDate')}
                type="datetime-local"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
              />
              {errors.eventDate && <p className="text-xs text-red-500 mt-1">{errors.eventDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('End Date & Time (optional)', 'تاريخ ووقت النهاية (اختياري)')}
              </label>
              <input
                {...register('eventEndDate')}
                type="datetime-local"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Location (English)', 'الموقع (English)')} *
              </label>
              <input
                {...register('location')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                placeholder="e.g. AOU Jeddah Campus – Room 201"
              />
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Location (Arabic)', 'الموقع (Arabic)')} *
              </label>
              <input
                {...register('locationAr')}
                dir="rtl"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 text-right"
                placeholder="مثال: حرم جامعة AOU جدة – قاعة 201"
              />
              {errors.locationAr && <p className="text-xs text-red-500 mt-1">{errors.locationAr.message}</p>}
            </div>
          </div>
        </div>

        {/* Additional */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t('Additional Details', 'تفاصيل إضافية')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Maximum Capacity', 'الطاقة الاستيعابية')} *
              </label>
              <input
                {...register('capacity', { valueAsNumber: true })}
                type="number"
                min={1}
                max={10000}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
              />
              {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Tags (English, comma-separated)', 'الوسوم (English، مفصولة بفاصلة)')}
              </label>
              <input
                {...register('tags')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                placeholder="e.g. tech, programming, AI"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Tags (Arabic, comma-separated)', 'الوسوم (عربي، مفصولة بفاصلة)')}
              </label>
              <input
                {...register('tagsAr')}
                dir="rtl"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 text-right"
                placeholder="مثال: تقنية، برمجة، ذكاء اصطناعي"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 mt-4 cursor-pointer">
            <input
              {...register('requiresMediaCoverage')}
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded"
              style={{ accentColor: 'var(--navy)' }}
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                {t('Requires Media Coverage', 'يتطلب تغطية إعلامية')}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                {t(
                  'Check this if you want the Media Club to document this event.',
                  'حدّد هذا إذا كنت تريد من النادي الإعلامي توثيق هذه الفعالية.',
                )}
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit((d: FormData) => onSubmit(d, true))}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {t('Save as Draft', 'حفظ كمسودة')}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit((d: FormData) => onSubmit(d, false))}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: 'var(--navy)' }}
          >
            <Send className="w-4 h-4" />
            {submitting
              ? t('Submitting...', 'جاري التقديم...')
              : t('Submit for Review', 'تقديم للمراجعة')}
          </button>
        </div>
      </form>
    </div>
  );
}
