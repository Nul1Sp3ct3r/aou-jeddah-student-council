'use client';

import { Users } from 'lucide-react';

interface Props {
  lang: 'en' | 'ar';
  variant?: 'council' | 'club';
}

export default function EmptyStructureState({ lang, variant = 'council' }: Props) {
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const message =
    variant === 'club'
      ? t('Club team information will be added soon.', 'سيتم إضافة معلومات فريق النادي قريبًا.')
      : t('Leadership information will be added soon.', 'سيتم إضافة معلومات القيادة قريبًا.');

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--navy)', opacity: 0.08 }}
      />
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 -mt-16"
        style={{ backgroundColor: '#f5f6f8' }}
      >
        <Users className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-gray-500 text-sm max-w-xs">{message}</p>
    </div>
  );
}
