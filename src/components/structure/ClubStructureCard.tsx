'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import type { Club, OrganizationalMember } from '../../types';
import MemberRoleBadge from './MemberRoleBadge';
import EmptyStructureState from './EmptyStructureState';

interface Props {
  club: Club;
  members: OrganizationalMember[];
  lang: 'en' | 'ar';
}

const CLUB_ROLES = [
  { en: 'Events Coordinator', ar: 'منسق الفعاليات' },
  { en: 'Media Coordinator', ar: 'منسق الإعلام' },
  { en: 'Content Writer', ar: 'كاتب محتوى' },
  { en: 'Designer', ar: 'مصمم' },
  { en: 'Technical Support', ar: 'دعم تقني' },
  { en: 'Volunteer', ar: 'متطوع' },
];

export default function ClubStructureCard({ club, members, lang }: Props) {
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const president = members.find((m) => m.roleCategory === 'club_president');
  const vp = members.find((m) => m.roleCategory === 'club_vice_president');
  const teamMembers = members.filter((m) => m.roleCategory === 'club_member');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Club header */}
      <div className="flex items-center gap-4 p-5 border-b border-gray-100">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: club.color + '15' }}
        >
          {club.logo ? (
            <Image src={club.logo} alt={club.name} width={56} height={56} className="w-full h-full object-cover" />
          ) : (
            club.icon
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900">{t(club.name, club.nameAr)}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">
              {members.length} {t('members', 'عضو')}
            </span>
          </div>
        </div>
        <Link
          href={`/events?club=${club.id}`}
          className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: club.color }}
        >
          {t('Events', 'الفعاليات')}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Leadership */}
      <div className="p-5">
        {members.length === 0 ? (
          <EmptyStructureState lang={lang} variant="club" />
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {president && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: 'var(--navy)', color: 'var(--gold)' }}
                  >
                    {t(president.fullNameEn, president.fullNameAr)[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {t(president.fullNameEn, president.fullNameAr)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {t(president.positionEn, president.positionAr)}
                    </p>
                  </div>
                  <MemberRoleBadge role="club_president" lang={lang} size="xs" />
                </div>
              )}
              {vp && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: club.color + '20', color: club.color }}
                  >
                    {t(vp.fullNameEn, vp.fullNameAr)[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {t(vp.fullNameEn, vp.fullNameAr)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {t(vp.positionEn, vp.positionAr)}
                    </p>
                  </div>
                  <MemberRoleBadge role="club_vice_president" lang={lang} size="xs" />
                </div>
              )}
            </div>

            {/* Team members */}
            {teamMembers.length > 0 && (
              <>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {t('Team Members', 'الأعضاء')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {teamMembers.slice(0, 6).map((m) => (
                      <span
                        key={m.id}
                        className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-600 bg-gray-50"
                      >
                        {t(m.fullNameEn, m.fullNameAr)}
                      </span>
                    ))}
                    {teamMembers.length > 6 && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-400 bg-gray-50">
                        +{teamMembers.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Available roles */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {t('Club Roles', 'أدوار النادي')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CLUB_ROLES.map((r) => (
                  <span
                    key={r.en}
                    className="text-xs px-2 py-0.5 rounded-full text-gray-600"
                    style={{ backgroundColor: club.color + '10', border: `1px solid ${club.color}30` }}
                  >
                    {t(r.en, r.ar)}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
