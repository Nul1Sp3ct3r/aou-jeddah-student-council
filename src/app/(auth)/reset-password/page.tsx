'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Globe } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { useLang } from '../../../contexts/LangContext';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { lang, setLang } = useLang();
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch {
      toast.error(t('Could not send reset email. Check the address and try again.', 'تعذر إرسال البريد. تحقق من العنوان وحاول مرة أخرى.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{ background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%)' }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="block">
            <Image
              src="/logo-council-white.png"
              alt="AOU Student Council"
              width={72}
              height={72}
              className="object-contain mx-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">
            {t('Reset Password', 'إعادة تعيين كلمة المرور')}
          </h1>
          <p className="text-gray-400 text-sm">
            {t('Enter your email and we\'ll send a reset link.', 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--gold)' + '20' }}
              >
                <Mail className="w-7 h-7" style={{ color: 'var(--gold)' }} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {t('Check your email', 'تحقق من بريدك الإلكتروني')}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {t(
                  'A password reset link has been sent. Check your inbox and spam folder.',
                  'تم إرسال رابط إعادة تعيين كلمة المرور. تحقق من صندوق الوارد والبريد العشوائي.',
                )}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: 'var(--navy)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                {t('Back to Sign In', 'العودة لتسجيل الدخول')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('Email Address', 'البريد الإلكتروني')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                    placeholder="student@aou.edu.sa"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--navy)' }}
              >
                {loading
                  ? t('Sending...', 'جاري الإرسال...')
                  : t('Send Reset Link', 'إرسال رابط الإعادة')}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm hover:underline text-gray-500"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t('Back to Sign In', 'العودة لتسجيل الدخول')}
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            {lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          </button>
        </div>
      </div>
    </div>
  );
}
