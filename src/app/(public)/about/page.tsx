'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Users, Calendar, Star, Mail } from 'lucide-react';
import PublicLayout from '../../../components/layout/PublicLayout';
import { useLang } from '../../../contexts/LangContext';

export default function AboutPage() {
  const { lang } = useLang();
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const features = [
    {
      icon: Users,
      en: 'Club Management',
      ar: 'إدارة الأندية',
      descEn: 'Dedicated digital hub for each of the 5 AOU Jeddah clubs.',
      descAr: 'مركز رقمي مخصص لكل من الأندية الخمسة لجامعة AOU جدة.',
    },
    {
      icon: Calendar,
      en: 'Event Workflow',
      ar: 'سير عمل الفعاليات',
      descEn: 'Full lifecycle from draft to published with council approval.',
      descAr: 'دورة حياة كاملة من المسودة إلى النشر مع موافقة مجلس الطلاب.',
    },
    {
      icon: Shield,
      en: 'Role-Based Access',
      ar: 'صلاحيات متعددة المستويات',
      descEn: '8 distinct roles ensuring the right access for every person.',
      descAr: '8 أدوار مختلفة تضمن الصلاحيات المناسبة لكل شخص.',
    },
    {
      icon: Star,
      en: 'Bilingual Platform',
      ar: 'منصة ثنائية اللغة',
      descEn: 'Full Arabic/English support with proper RTL layout.',
      descAr: 'دعم كامل للعربية والإنجليزية مع تخطيط RTL صحيح.',
    },
  ];

  return (
    <PublicLayout>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Hero */}
        <section
          className="py-20 text-white text-center"
          style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
        >
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-4xl font-extrabold mb-4">
              {t('About AOU Jeddah Clubs Hub', 'عن منصة أندية AOU جدة')}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t(
                'The official digital platform for the Student Council of Arab Open University – Jeddah Branch, connecting students with clubs and events.',
                'المنصة الرقمية الرسمية لمجلس طلاب الجامعة العربية المفتوحة – فرع جدة، تربط الطلاب بالأندية والفعاليات.',
              )}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--navy)' }}>
              {t('Our Mission', 'مهمتنا')}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {t(
                'To provide AOU Jeddah students with a transparent, efficient, and engaging platform to participate in student life — from discovering clubs and registering for events to tracking participation and building community.',
                'توفير منصة شفافة وفعّالة وجذابة لطلاب جامعة AOU جدة للمشاركة في الحياة الطلابية — من اكتشاف الأندية والتسجيل في الفعاليات إلى تتبع المشاركة وبناء المجتمع.',
              )}
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-16" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--navy)' }}>
              {t('Platform Features', 'مميزات المنصة')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((f) => (
                <div key={f.en} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--navy)', opacity: 0.9 }}
                  >
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t(f.en, f.ar)}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{t(f.descEn, f.descAr)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles overview */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-10" style={{ color: 'var(--navy)' }}>
              {t('User Roles', 'أدوار المستخدمين')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { en: 'Super Admin', ar: 'مدير النظام', desc: 'Full system control' },
                { en: 'Council Admin', ar: 'مدير المجلس', desc: 'Event approval authority' },
                { en: 'Club President', ar: 'رئيس النادي', desc: 'Leads club operations' },
                { en: 'Vice President', ar: 'نائب الرئيس', desc: 'Supports president' },
                { en: 'Club Member', ar: 'عضو النادي', desc: 'Club activities' },
                { en: 'Media Member', ar: 'عضو إعلامي', desc: 'Media coverage' },
                { en: 'Student', ar: 'طالب', desc: 'Event registration' },
                { en: 'Guest', ar: 'زائر', desc: 'Public browsing' },
              ].map((role) => (
                <div
                  key={role.en}
                  className="p-4 rounded-xl border border-gray-100 text-center"
                  style={{ backgroundColor: 'var(--bg)' }}
                >
                  <div className="font-semibold text-sm text-gray-900 mb-0.5">{t(role.en, role.ar)}</div>
                  <div className="text-xs text-gray-500">{role.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section
          className="py-16 text-white text-center"
          style={{ backgroundColor: 'var(--navy)' }}
        >
          <div className="max-w-2xl mx-auto px-4">
            <Mail className="w-10 h-10 mx-auto mb-4 opacity-70" />
            <h2 className="text-2xl font-bold mb-3">
              {t('Questions or Suggestions?', 'أسئلة أو اقتراحات؟')}
            </h2>
            <p className="text-gray-300 mb-6">
              {t(
                'Reach out to the AOU Jeddah Student Council — we are here to help.',
                'تواصل مع مجلس طلاب جامعة AOU جدة — نحن هنا للمساعدة.',
              )}
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 rounded-xl font-semibold"
              style={{ backgroundColor: 'var(--gold)', color: 'var(--navy)' }}
            >
              {t('Get Started', 'ابدأ الآن')}
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
