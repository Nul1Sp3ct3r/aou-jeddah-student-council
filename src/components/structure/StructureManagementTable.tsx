'use client';

import { useState } from 'react';
import { Edit2, Trash2, ToggleLeft, ToggleRight, Link2 } from 'lucide-react';
import type { OrganizationalMember, ClubId } from '../../types';
import { ORG_ROLE_LABELS, CLUBS } from '../../types';
import MemberRoleBadge from './MemberRoleBadge';

interface Props {
  members: OrganizationalMember[];
  lang: 'en' | 'ar';
  canEdit: boolean;
  restrictToClubId?: ClubId;
  onEdit: (member: OrganizationalMember) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, current: 'active' | 'inactive') => void;
}

export default function StructureManagementTable({
  members,
  lang,
  canEdit,
  restrictToClubId,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const visible = restrictToClubId
    ? members.filter((m) => m.clubId === restrictToClubId)
    : members;

  if (visible.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        {t('No members found.', 'لا يوجد أعضاء.')}
      </div>
    );
  }

  function clubName(id?: ClubId) {
    if (!id) return '—';
    const c = CLUBS.find((cl) => cl.id === id);
    return c ? t(c.name, c.nameAr) : id;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100" style={{ backgroundColor: 'var(--bg)' }}>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t('Member', 'العضو')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
              {t('Role', 'الدور')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              {t('Club', 'النادي')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              {t('Term', 'الفترة')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t('Status', 'الحالة')}
            </th>
            {canEdit && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('Actions', 'الإجراءات')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {visible.map((m) => (
            <tr key={m.id} className={`transition-colors hover:bg-gray-50 ${m.status === 'inactive' ? 'opacity-60' : ''}`}>
              {/* Member info */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: 'var(--navy)', color: 'var(--gold)' }}
                  >
                    {t(m.fullNameEn, m.fullNameAr)[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{t(m.fullNameEn, m.fullNameAr)}</p>
                    <p className="text-xs text-gray-400 truncate">{t(m.positionEn, m.positionAr)}</p>
                    {m.userId ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium mt-0.5">
                        <Link2 className="w-2.5 h-2.5" />
                        {t('Linked', 'مرتبط')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium mt-0.5">
                        {t('Manual', 'يدوي')}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              {/* Role */}
              <td className="px-4 py-3 hidden md:table-cell">
                <MemberRoleBadge role={m.roleCategory} lang={lang} size="xs" />
              </td>
              {/* Club */}
              <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                {m.entityType === 'club' ? clubName(m.clubId) : t('Council', 'المجلس')}
              </td>
              {/* Term */}
              <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                {m.termYear}
              </td>
              {/* Status */}
              <td className="px-4 py-3">
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                    m.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {m.status === 'active' ? t('Active', 'نشط') : t('Inactive', 'غير نشط')}
                </span>
              </td>
              {/* Actions */}
              {canEdit && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(m)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title={t('Edit', 'تعديل')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(m.id, m.status)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        m.status === 'active'
                          ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={m.status === 'active' ? t('Deactivate', 'تعطيل') : t('Activate', 'تفعيل')}
                    >
                      {m.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    {confirmDelete === m.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { onDelete(m.id); setConfirmDelete(null); }}
                          className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          {t('Yes', 'نعم')}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          {t('No', 'لا')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(m.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title={t('Delete', 'حذف')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
