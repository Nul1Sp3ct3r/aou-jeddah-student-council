'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HelpCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLang } from '../../../../contexts/LangContext';
import { createSupportRequest } from '../../../../lib/firestore';

const schema = z.object({
  subject: z.string().min(5, 'Subject is required'),
  subjectAr: z.string().min(5, 'Arabic subject is required'),
  body: z.string().min(20, 'Please describe your issue in detail'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

type FormData = z.infer<typeof schema>;

export default function SupportPage() {
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  });

  async function onSubmit(data: FormData) {
    if (!userProfile) return;
    setSubmitting(true);
    try {
      await createSupportRequest({
        submittedBy: userProfile.uid,
        submittedByName: userProfile.displayName,
        subject: data.subject,
        subjectAr: data.subjectAr,
        body: data.body,
        priority: data.priority,
        status: 'open',
      });
      toast.success(t('Support request submitted!', 'تم تقديم طلب الدعم!'));
      setSubmitted(true);
      reset();
    } catch {
      toast.error(t('Failed. Try again.', 'فشل. حاول مرة أخرى.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6" style={{ color: 'var(--navy)' }} />
            {t('Support', 'الدعم الفني')}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {t('Submit a request and the Student Council will respond shortly.', 'أرسل طلبك وسيرد مجلس الطلاب قريباً.')}
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Send className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="font-bold text-green-900 mb-2">{t('Request Submitted!', 'تم إرسال الطلب!')}</h2>
          <p className="text-green-700 text-sm mb-4">
            {t('We will get back to you as soon as possible.', 'سنتواصل معك في أقرب وقت ممكن.')}
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-sm text-green-700 hover:underline"
          >
            {t('Submit another request', 'إرسال طلب آخر')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('Subject (EN)', 'الموضوع (EN)')} *
                </label>
                <input
                  {...register('subject')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  placeholder="Brief description of your issue"
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('Subject (AR)', 'الموضوع (AR)')} *
                </label>
                <input
                  {...register('subjectAr')}
                  dir="rtl"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 text-right"
                  placeholder="وصف مختصر لمشكلتك"
                />
                {errors.subjectAr && <p className="text-xs text-red-500 mt-1">{errors.subjectAr.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Priority', 'الأولوية')}
              </label>
              <select
                {...register('priority')}
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
              >
                <option value="low">{t('Low', 'منخفضة')}</option>
                <option value="medium">{t('Medium', 'متوسطة')}</option>
                <option value="high">{t('High', 'عالية')}</option>
                <option value="urgent">{t('Urgent', 'عاجلة')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Details', 'التفاصيل')} *
              </label>
              <textarea
                {...register('body')}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
                placeholder={t('Describe your issue in detail...', 'صِف مشكلتك بالتفصيل...')}
              />
              {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--navy)' }}
          >
            <Send className="w-4 h-4" />
            {submitting ? t('Submitting...', 'جاري الإرسال...') : t('Submit Request', 'إرسال الطلب')}
          </button>
        </form>
      )}
    </div>
  );
}
