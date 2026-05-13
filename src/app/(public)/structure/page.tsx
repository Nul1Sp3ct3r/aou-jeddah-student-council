'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, Star, Crown } from 'lucide-react';
import PublicLayout from '../../../components/layout/PublicLayout';
import { useLang } from '../../../contexts/LangContext';
import { CLUBS } from '../../../types';
import type { OrganizationalMember } from '../../../types';
import { getActiveOrgMembers } from '../../../lib/firestore';
import { DEMO_ORG_MEMBERS } from '../../../lib/structureDemo';
import StructureHero from '../../../components/structure/StructureHero';
import LeadershipCard from '../../../components/structure/LeadershipCard';
import ClubStructureCard from '../../../components/structure/ClubStructureCard';
import OrganizationChart from '../../../components/structure/OrganizationChart';
import EmptyStructureState from '../../../components/structure/EmptyStructureState';

export default function StructurePage() {
  const { lang } = useLang();
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const [members, setMembers] = useState<OrganizationalMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    getActiveOrgMembers()
      .then((data) => {
        if (data.length === 0) {
          // Fall back to demo data so the page looks populated
          const now = new Date();
          setMembers(
            DEMO_ORG_MEMBERS.map((m) => ({ ...m, createdAt: now, updatedAt: now })),
          );
          setUsingDemo(true);
        } else {
          setMembers(data);
        }
      })
      .catch(() => {
        const now = new Date();
        setMembers(DEMO_ORG_MEMBERS.map((m) => ({ ...m, createdAt: now, updatedAt: now })));
        setUsingDemo(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const councilMembers = members.filter((m) => m.entityType === 'student_council');
  const clubMembersAll = members.filter((m) => m.entityType === 'club');

  const totalActive = members.filter((m) => m.status === 'active').length;
  const councilLeaders = councilMembers.length;
  const clubLeaders = clubMembersAll.filter(
    (m) => m.roleCategory === 'club_president' || m.roleCategory === 'club_vice_president',
  ).length;

  const COUNCIL_LEADER_CATEGORIES = [
    'council_president',
    'council_vice_president',
    'council_secretary',
    'council_officer',
    'clubs_supervisor',
  ] as const;

  const councilLeadCards = councilMembers.filter((m) =>
    (COUNCIL_LEADER_CATEGORIES as readonly string[]).includes(m.roleCategory),
  );

  return (
    <PublicLayout>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Hero */}
        <StructureHero lang={lang} />

        {/* Stats bar */}
        {!loading && (
          <section className="py-8 bg-white border-b border-gray-100">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Crown, valueEn: String(councilLeaders), labelEn: 'Council Members', labelAr: 'أعضاء المجلس', color: 'var(--gold)' },
                  { icon: Building2, valueEn: String(CLUBS.length), labelEn: 'Active Clubs', labelAr: 'أندية نشطة', color: '#2563eb' },
                  { icon: Star, valueEn: String(clubLeaders), labelEn: 'Club Leaders', labelAr: 'قادة الأندية', color: '#059669' },
                  { icon: Users, valueEn: String(totalActive), labelEn: 'Active Members', labelAr: 'الأعضاء النشطون', color: '#7c3aed' },
                ].map((stat) => (
                  <div key={stat.labelEn} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: stat.color + '15' }}
                    >
                      <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-gray-900">{stat.valueEn}</p>
                      <p className="text-xs text-gray-500">{t(stat.labelEn, stat.labelAr)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Demo banner */}
        {usingDemo && !loading && (
          <div
            className="py-3 px-4 text-center text-sm"
            style={{ backgroundColor: 'var(--gold)', color: 'var(--navy)' }}
          >
            {t(
              'Showing placeholder data — the council will update this page with real information soon.',
              'يتم عرض بيانات تجريبية — سيقوم المجلس بتحديث هذه الصفحة بالمعلومات الفعلية قريبًا.',
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <section className="py-16" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && (
          <>
            {/* ── Student Council Leadership ───────────────────────────────────── */}
            <section className="py-16" style={{ backgroundColor: 'var(--bg)' }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--navy)' }}>
                    {t('Student Council Leadership', 'قيادة المجلس الطلابي')}
                  </h2>
                  <div
                    className="w-16 h-1 rounded-full mx-auto"
                    style={{ backgroundColor: 'var(--gold)' }}
                  />
                </div>

                {councilLeadCards.length === 0 ? (
                  <EmptyStructureState lang={lang} variant="council" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {councilLeadCards.map((m) => (
                      <LeadershipCard key={m.id} member={m} lang={lang} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── Organization Chart ───────────────────────────────────────────── */}
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--navy)' }}>
                    {t('Organization Chart', 'المخطط التنظيمي')}
                  </h2>
                  <div
                    className="w-16 h-1 rounded-full mx-auto"
                    style={{ backgroundColor: 'var(--gold)' }}
                  />
                </div>
                <OrganizationChart members={members} lang={lang} />
              </div>
            </section>

            {/* ── Clubs Structure ──────────────────────────────────────────────── */}
            <section className="py-16" style={{ backgroundColor: 'var(--bg)' }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--navy)' }}>
                    {t('Clubs Structure', 'هيكلة الأندية')}
                  </h2>
                  <div
                    className="w-16 h-1 rounded-full mx-auto mb-4"
                    style={{ backgroundColor: 'var(--gold)' }}
                  />
                  <p className="text-gray-500 max-w-xl mx-auto">
                    {t(
                      'Five clubs, each with dedicated leadership and specialized teams.',
                      'خمسة أندية، لكل منها قيادة مخصصة وفرق متخصصة.',
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {CLUBS.map((club) => {
                    const clubMembers = clubMembersAll.filter((m) => m.clubId === club.id);
                    return (
                      <ClubStructureCard
                        key={club.id}
                        club={club}
                        members={clubMembers}
                        lang={lang}
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── CTA ─────────────────────────────────────────────────────────── */}
            <section
              className="py-16 text-white text-center"
              style={{ backgroundColor: 'var(--navy)' }}
            >
              <div className="max-w-2xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-4">
                  {t('Join the Student Council Family', 'انضم لعائلة مجلس الطلاب')}
                </h2>
                <p className="text-gray-300 mb-8">
                  {t(
                    'Be part of a club and contribute to student life at Arab Open University – Jeddah Branch.',
                    'كن جزءاً من نادٍ وساهم في الحياة الطلابية في الجامعة العربية المفتوحة – فرع جدة.',
                  )}
                </p>
                <a
                  href="/clubs"
                  className="inline-block px-8 py-4 rounded-xl font-semibold text-lg transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--gold)', color: 'var(--navy)' }}
                >
                  {t('Explore Clubs', 'استكشف الأندية')}
                </a>
              </div>
            </section>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
