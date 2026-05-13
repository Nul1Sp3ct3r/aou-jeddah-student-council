'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Globe } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { useLang } from '../../../contexts/LangContext';

const schema = z
  .object({
    displayName: z.string().min(2, 'Full name is required'),
    displayNameAr: z.string().min(2, 'Arabic name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { lang, setLang } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard when returning from Google redirect sign-in
  useEffect(() => {
    if (!authLoading && firebaseUser) {
      router.push('/dashboard');
    }
  }, [firebaseUser, authLoading, router]);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.displayName, data.displayNameAr);
      toast.success(t('Account created! Welcome to AOU Jeddah Clubs Hub.', 'تم إنشاء الحساب! مرحباً بك في منصة أندية AOU جدة.'));
      router.push('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-in-use') {
        toast.error(t('Email already in use.', 'البريد الإلكتروني مستخدم بالفعل.'));
      } else {
        toast.error(t('Registration failed. Try again.', 'فشل التسجيل. حاول مرة أخرى.'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle();
      // Page navigates away to Google — code below never runs
    } catch {
      toast.error(t('Failed. Try again.', 'فشل. حاول مرة أخرى.'));
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
            {t('Create Your Account', 'إنشاء حسابك')}
          </h1>
          <p className="text-gray-400 text-sm">
            {t('Join AOU Jeddah Clubs Hub', 'انضم إلى منصة أندية AOU جدة')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('Register with Google', 'التسجيل بـ Google')}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">{t('or', 'أو')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('Full Name (EN)', 'الاسم (EN)')} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    {...register('displayName')}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                    placeholder="John Doe"
                  />
                </div>
                {errors.displayName && <p className="text-xs text-red-500 mt-0.5">{errors.displayName.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('Full Name (AR)', 'الاسم (AR)')} *
                </label>
                <input
                  {...register('displayNameAr')}
                  dir="rtl"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 text-right"
                  placeholder="جون دو"
                />
                {errors.displayNameAr && <p className="text-xs text-red-500 mt-0.5">{errors.displayNameAr.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Email Address', 'البريد الإلكتروني')} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  placeholder="student@aou.edu.sa"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Password', 'كلمة المرور')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Confirm Password', 'تأكيد كلمة المرور')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-xs text-gray-500">
              {t(
                'By registering you agree to our terms of use. Your account will be reviewed by the Student Council.',
                'بالتسجيل توافق على شروط الاستخدام. سيتم مراجعة حسابك من قبل مجلس الطلاب.',
              )}
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--navy)' }}
            >
              <UserPlus className="w-4 h-4" />
              {loading ? t('Creating account...', 'جاري إنشاء الحساب...') : t('Create Account', 'إنشاء حساب')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('Already have an account?', 'لديك حساب بالفعل؟')}{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--navy)' }}>
              {t('Sign In', 'تسجيل الدخول')}
            </Link>
          </p>
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
