'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Shield, Users, Database, Bell, Globe, Lock } from 'lucide-react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useLang } from '../../../../../contexts/LangContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SystemSettingsPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const { lang } = useLang();

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  useEffect(() => {
    if (userProfile && userProfile.role !== 'super_admin') {
      router.replace('/dashboard');
    }
  }, [userProfile, router]);

  if (!userProfile || userProfile.role !== 'super_admin') return null;

  const sections = [
    {
      icon: Users,
      en: 'User Management',
      ar: 'إدارة المستخدمين',
      descEn: 'Manage roles, permissions, and account access for all users.',
      descAr: 'إدارة الأدوار والصلاحيات والوصول للحسابات لجميع المستخدمين.',
      href: '/dashboard/admin/users',
    },
    {
      icon: Database,
      en: 'Club Registration',
      ar: 'التسجيل في الأندية',
      descEn: 'Control when students can apply to join each club.',
      descAr: 'التحكم في توقيت قبول طلبات الانضمام لكل نادٍ.',
      href: '/dashboard/club-registration',
    },
    {
      icon: Bell,
      en: 'Event Approvals',
      ar: 'موافقات الفعاليات',
      descEn: 'Review and approve event submissions from club leaders.',
      descAr: 'مراجعة واعتماد طلبات الفعاليات المقدمة من قادة الأندية.',
      href: '/dashboard/admin/events',
    },
    {
      icon: Globe,
      en: 'Club Applications',
      ar: 'طلبات الانضمام',
      descEn: 'Review student applications to join clubs.',
      descAr: 'مراجعة طلبات الطلاب للانضمام إلى الأندية.',
      href: '/dashboard/club-applications',
    },
  ];

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('System Settings', 'إعدادات النظام')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {t('Super admin controls for the platform.', 'أدوات التحكم الكاملة بالمنصة لمدير النظام.')}
          </p>
        </div>
      </div>

      {/* Super admin badge */}
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-8 border"
        style={{ backgroundColor: '#0f2a4a10', borderColor: '#0f2a4a30' }}
      >
        <Shield className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--navy)' }} />
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>
            {t('Super Administrator Access', 'صلاحيات مدير النظام الكامل')}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {t(
              'You have full access to all platform settings and controls.',
              'لديك وصول كامل إلى جميع إعدادات وأدوات المنصة.',
            )}
          </div>
        </div>
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {sections.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#0f2a4a15' }}
              >
                <s.icon className="w-5 h-5" style={{ color: 'var(--navy)' }} />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                  {t(s.en, s.ar)}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{t(s.descEn, s.descAr)}</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Platform info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900 text-sm">{t('Platform Info', 'معلومات المنصة')}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400 text-xs mb-0.5">{t('Platform', 'المنصة')}</div>
            <div className="font-medium text-gray-700">AOU Clubs Hub</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-0.5">{t('University', 'الجامعة')}</div>
            <div className="font-medium text-gray-700">Arab Open University – Jeddah</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-0.5">{t('Clubs', 'الأندية')}</div>
            <div className="font-medium text-gray-700">5 {t('Active Clubs', 'أندية نشطة')}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-0.5">{t('Backend', 'الخادم')}</div>
            <div className="font-medium text-gray-700">Firebase Firestore</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-0.5">{t('Hosting', 'الاستضافة')}</div>
            <div className="font-medium text-gray-700">Vercel</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-0.5">{t('Framework', 'الإطار')}</div>
            <div className="font-medium text-gray-700">Next.js 16</div>
          </div>
        </div>
      </div>
    </div>
  );
}
