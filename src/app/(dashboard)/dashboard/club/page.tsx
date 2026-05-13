'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLang } from '../../../../contexts/LangContext';
import { getClubMemberships } from '../../../../lib/firestore';
import { CLUBS } from '../../../../types';
import type { ClubMembership } from '../../../../types';

export default function MyClubPage() {
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const [members, setMembers] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const clubId = userProfile?.clubId;
  const club = clubId ? CLUBS.find((c) => c.id === clubId) : null;

  useEffect(() => {
    if (!clubId) { setLoading(false); return; }
    getClubMemberships(clubId)
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clubId]);

  if (!club) {
    return (
      <div className="text-center py-20">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="font-semibold text-gray-700">{t('No club assigned', 'لم يتم تعيين نادٍ')}</h3>
        <p className="text-gray-400 text-sm mt-1">
          {t('You are not assigned to any club.', 'لم يتم تعيينك في أي نادٍ.')}
        </p>
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('My Club', 'ناديي')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t(club.name, club.nameAr)}</p>
        </div>
      </div>

      {/* Club card */}
      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
        style={{ borderLeft: `4px solid ${club.color}` }}
      >
        <div className="flex items-center gap-4">
          <span className="text-5xl">{club.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t(club.name, club.nameAr)}</h2>
            <p className="text-gray-500 text-sm mt-1 max-w-lg">
              {t(club.description, club.descriptionAr)}
            </p>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="text-center inline-block">
            <div className="text-3xl font-bold" style={{ color: club.color }}>{members.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">{t('Active Members', 'الأعضاء الفعالون')}</div>
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900">{t('Active Members', 'الأعضاء الفعالون')}</h3>
          <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {members.length}
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 text-sm">{t('No members yet', 'لا يوجد أعضاء بعد')}</p>
            <p className="text-gray-300 text-xs mt-1">
              {t('Members are added when applications are accepted.', 'تتم إضافة الأعضاء عند قبول طلباتهم.')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {members.map((m, i) => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-3.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: club.color }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{m.fullName}</div>
                  <div className="text-xs text-gray-400">{m.universityEmail}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-gray-600 font-mono">{m.universityId}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {format(m.joinedAt, 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
