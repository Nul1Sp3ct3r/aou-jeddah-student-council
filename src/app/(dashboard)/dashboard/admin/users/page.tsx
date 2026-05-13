'use client';

import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useLang } from '../../../../../contexts/LangContext';
import { getAllUsers, updateUserProfile } from '../../../../../lib/firestore';
import { CLUBS, ROLE_LABELS } from '../../../../../types';
import type { UserProfile, UserRole, ClubId } from '../../../../../types';

const ROLES: UserRole[] = [
  'super_admin', 'council_admin', 'club_president', 'club_vice_president',
  'club_member', 'media_club_member', 'student', 'guest',
];

export default function AdminUsersPage() {
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const role = userProfile?.role ?? 'student';
  const isAdmin = role === 'super_admin' || role === 'council_admin';

  useEffect(() => {
    if (!isAdmin) return;
    getAllUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, [isAdmin]);

  const filtered = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleRoleChange(uid: string, newRole: UserRole) {
    setSaving(uid);
    try {
      await updateUserProfile(uid, { role: newRole });
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role: newRole } : u));
      toast.success(t('Role updated.', 'تم تحديث الدور.'));
    } catch { toast.error(t('Failed.', 'فشل.')); } finally { setSaving(null); }
  }

  async function handleClubChange(uid: string, clubId: ClubId | undefined) {
    setSaving(uid);
    try {
      await updateUserProfile(uid, { clubId });
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, clubId } : u));
      toast.success(t('Club updated.', 'تم تحديث النادي.'));
    } catch { toast.error(t('Failed.', 'فشل.')); } finally { setSaving(null); }
  }

  async function toggleActive(uid: string, current: boolean) {
    setSaving(uid);
    try {
      await updateUserProfile(uid, { isActive: !current });
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, isActive: !current } : u));
      toast.success(current ? t('User deactivated.', 'تم تعطيل المستخدم.') : t('User activated.', 'تم تفعيل المستخدم.'));
    } catch { toast.error(t('Failed.', 'فشل.')); } finally { setSaving(null); }
  }

  if (!isAdmin) {
    return <div className="text-center py-20"><p className="text-gray-500">{t('Access denied.', 'الوصول مرفوض.')}</p></div>;
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('User Management', 'إدارة المستخدمين')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} {t('users', 'مستخدم')}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={t('Search by name or email...', 'ابحث بالاسم أو البريد...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div
              key={user.uid}
              className={`bg-white rounded-2xl border px-5 py-4 shadow-sm transition-all ${
                !user.isActive ? 'opacity-60 border-red-100' : 'border-gray-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar & info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: 'var(--navy)', color: 'var(--gold)' }}
                  >
                    {user.displayName[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{user.displayName}</div>
                    <div className="text-xs text-gray-400 truncate">{user.email}</div>
                    {!user.isActive && (
                      <span className="text-xs text-red-500 font-medium">{t('Deactivated', 'معطّل')}</span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Role */}
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                    disabled={saving === user.uid || user.uid === userProfile?.uid}
                    className="text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 disabled:opacity-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {t(ROLE_LABELS[r].en, ROLE_LABELS[r].ar)}
                      </option>
                    ))}
                  </select>

                  {/* Club */}
                  <select
                    value={user.clubId ?? ''}
                    onChange={(e) => handleClubChange(user.uid, (e.target.value as ClubId) || undefined)}
                    disabled={saving === user.uid}
                    className="text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 disabled:opacity-50"
                  >
                    <option value="">{t('No Club', 'بلا نادٍ')}</option>
                    {CLUBS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {t(c.name, c.nameAr)}
                      </option>
                    ))}
                  </select>

                  {/* Toggle active */}
                  {user.uid !== userProfile?.uid && (
                    <button
                      onClick={() => toggleActive(user.uid, user.isActive)}
                      disabled={saving === user.uid}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                        user.isActive
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={user.isActive ? t('Deactivate', 'تعطيل') : t('Activate', 'تفعيل')}
                    >
                      {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  )}

                  {user.uid === userProfile?.uid && (
                    <span className="flex items-center gap-1 text-xs text-gray-400 px-2">
                      <Shield className="w-3 h-3" />
                      {t('You', 'أنت')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p>{t('No users found.', 'لا يوجد مستخدمون.')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
