'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, LogIn, Globe } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { useLang } from '../../../contexts/LangContext';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { lang, setLang } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  // Redirect to dashboard when returning from Google redirect sign-in
  useEffect(() => {
    if (!authLoading && firebaseUser) {
      router.push('/dashboard');
    }
  }, [firebaseUser, authLoading, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success(t('Welcome back!', 'مرحباً بعودتك!'));
      router.push('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        toast.error(t('Invalid email or password.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'));
      } else {
        toast.error(t('Sign in failed. Try again.', 'فشل تسجيل الدخول. حاول مرة أخرى.'));
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
      toast.error(t('Google sign-in failed.', 'فشل تسجيل الدخول بـ Google.'));
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
            {t('Welcome Back', 'مرحباً بعودتك')}
          </h1>
          <p className="text-gray-400 text-sm">
            {t('Sign in to AOU Jeddah Clubs Hub', 'سجّل دخولك إلى منصة أندية AOU جدة')}
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
            {t('Continue with Google', 'المتابعة بـ Google')}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">{t('or', 'أو')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Email Address', 'البريد الإلكتروني')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': 'var(--navy)' } as React.CSSProperties}
                  placeholder="student@aou.edu.sa"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  {t('Password', 'كلمة المرور')}
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs hover:underline"
                  style={{ color: 'var(--navy)' }}
                >
                  {t('Forgot password?', 'نسيت كلمة المرور؟')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90 mt-2"
              style={{ backgroundColor: 'var(--navy)' }}
            >
              <LogIn className="w-4 h-4" />
              {loading ? t('Signing in...', 'جاري تسجيل الدخول...') : t('Sign In', 'تسجيل الدخول')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t("Don't have an account?", 'ليس لديك حساب؟')}{' '}
            <Link href="/register" className="font-semibold hover:underline" style={{ color: 'var(--navy)' }}>
              {t('Register', 'سجّل الآن')}
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
