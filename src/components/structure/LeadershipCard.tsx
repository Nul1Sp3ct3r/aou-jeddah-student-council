'use client';

import Image from 'next/image';
import { Mail, ExternalLink } from 'lucide-react';
import type { OrganizationalMember } from '../../types';
import MemberRoleBadge from './MemberRoleBadge';

interface Props {
  member: OrganizationalMember;
  lang: 'en' | 'ar';
}

export default function LeadershipCard({ member, lang }: Props) {
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 mb-4 flex items-center justify-center text-2xl font-bold"
        style={{ backgroundColor: 'var(--navy)', color: 'var(--gold)' }}
      >
        {member.imageUrl ? (
          <Image
            src={member.imageUrl}
            alt={t(member.fullNameEn, member.fullNameAr)}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          (t(member.fullNameEn, member.fullNameAr)[0] ?? '?').toUpperCase()
        )}
      </div>

      {/* Name */}
      <h3 className="font-bold text-gray-900 text-base mb-0.5">
        {t(member.fullNameEn, member.fullNameAr)}
      </h3>

      {/* Position */}
      <p className="text-sm text-gray-500 mb-3">
        {t(member.positionEn, member.positionAr)}
      </p>

      {/* Role badge */}
      <div className="mb-3">
        <MemberRoleBadge role={member.roleCategory} lang={lang} />
      </div>

      {/* Bio */}
      {(member.bioEn || member.bioAr) && (
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
          {t(member.bioEn, member.bioAr)}
        </p>
      )}

      {/* Major */}
      {member.major && (
        <p className="text-xs text-gray-400 mb-3">{member.major}</p>
      )}

      {/* Links */}
      <div className="flex items-center gap-3 mt-auto">
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            title={member.email}
          >
            <Mail className="w-4 h-4" />
          </a>
        )}
        {member.linkedInUrl && (
          <a
            href={member.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="LinkedIn"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
