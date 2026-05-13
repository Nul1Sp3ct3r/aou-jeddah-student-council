'use client';

import type { OrgRoleCategory } from '../../types';
import { ORG_ROLE_LABELS } from '../../types';

const BADGE_COLORS: Record<OrgRoleCategory, string> = {
  council_president:      'bg-yellow-100 text-yellow-800 border-yellow-200',
  council_vice_president: 'bg-blue-100 text-blue-800 border-blue-200',
  council_secretary:      'bg-purple-100 text-purple-800 border-purple-200',
  council_officer:        'bg-indigo-100 text-indigo-800 border-indigo-200',
  clubs_supervisor:       'bg-teal-100 text-teal-800 border-teal-200',
  club_president:         'bg-green-100 text-green-800 border-green-200',
  club_vice_president:    'bg-emerald-100 text-emerald-800 border-emerald-200',
  club_member:            'bg-gray-100 text-gray-700 border-gray-200',
};

interface Props {
  role: OrgRoleCategory;
  lang: 'en' | 'ar';
  size?: 'sm' | 'xs';
}

export default function MemberRoleBadge({ role, lang, size = 'sm' }: Props) {
  const label = lang === 'ar' ? ORG_ROLE_LABELS[role].ar : ORG_ROLE_LABELS[role].en;
  const colorClass = BADGE_COLORS[role];
  const sizeClass = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-block rounded-full border font-medium ${colorClass} ${sizeClass}`}>
      {label}
    </span>
  );
}
