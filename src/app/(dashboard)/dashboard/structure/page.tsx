'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLang } from '../../../../contexts/LangContext';
import {
  getAllOrgMembers,
  createOrgMember,
  updateOrgMember,
  deleteOrgMember,
  setOrgMemberStatus,
  getAllActiveUsers,
} from '../../../../lib/firestore';
import type { OrganizationalMember, OrgEntityType, ClubId, UserProfile } from '../../../../types';
import StructureManagementTable from '../../../../components/structure/StructureManagementTable';
import StructureMemberForm from '../../../../components/structure/StructureMemberForm';

type FormData = Omit<OrganizationalMember, 'id' | 'createdAt' | 'updatedAt'>;

export default function StructureManagementPage() {
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const [members, setMembers] = useState<OrganizationalMember[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OrganizationalMember | null>(null);
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState<OrgEntityType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const role = userProfile?.role ?? 'student';
  const isAdmin = role === 'super_admin' || role === 'council_admin';
  const isClubLeader = role === 'club_president' || role === 'club_vice_president';
  const canManage = isAdmin;
  const canViewClub = isClubLeader;

  useEffect(() => {
    if (!isAdmin && !canViewClub) return;
    getAllOrgMembers()
      .then(setMembers)
      .catch(() => toast.error(t('Failed to load.', 'فشل التحميل.')))
      .finally(() => setLoading(false));
    if (isAdmin) {
      getAllActiveUsers().then(setUsers).catch(() => {});
    }
  }, [isAdmin, canViewClub]);

  if (!isAdmin && !canViewClub) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t('Access denied.', 'الوصول مرفوض.')}</p>
      </div>
    );
  }

  // Club presidents can only see/manage their own club
  const restrictToClubId: ClubId | undefined =
    canViewClub && !isAdmin ? userProfile?.clubId : undefined;

  const filtered = members.filter((m) => {
    const matchSearch =
      m.fullNameEn.toLowerCase().includes(search.toLowerCase()) ||
      m.fullNameAr.includes(search) ||
      m.positionEn.toLowerCase().includes(search.toLowerCase()) ||
      m.positionAr.includes(search);
    const matchEntity = filterEntity === 'all' || m.entityType === filterEntity;
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchClub = !restrictToClubId || m.clubId === restrictToClubId;
    return matchSearch && matchEntity && matchStatus && matchClub;
  });

  async function handleSave(data: FormData) {
    if (!userProfile) return;
    if (editing) {
      await updateOrgMember(editing.id, { ...data, updatedByUid: userProfile.uid });
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editing.id ? { ...m, ...data, updatedAt: new Date() } : m,
        ),
      );
      toast.success(t('Member updated.', 'تم تحديث العضو.'));
    } else {
      const id = await createOrgMember({ ...data, createdByUid: userProfile.uid, updatedByUid: userProfile.uid });
      const newMember: OrganizationalMember = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
      setMembers((prev) => [...prev, newMember].sort((a, b) => a.displayOrder - b.displayOrder));
      toast.success(t('Member added.', 'تم إضافة العضو.'));
    }
    setShowForm(false);
    setEditing(null);
    // Re-throw is handled by the form's own catch block
  }

  async function handleDelete(id: string) {
    await deleteOrgMember(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success(t('Member removed.', 'تم حذف العضو.'));
  }

  async function handleToggleStatus(id: string, current: 'active' | 'inactive') {
    if (!userProfile) return;
    const next = current === 'active' ? 'inactive' : 'active';
    await setOrgMemberStatus(id, next, userProfile.uid);
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, status: next } : m));
    toast.success(next === 'active' ? t('Activated.', 'تم التفعيل.') : t('Deactivated.', 'تم التعطيل.'));
  }

  function openEdit(member: OrganizationalMember) {
    setEditing(member);
    setShowForm(true);
  }

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  const activeCount = members.filter((m) => m.status === 'active').length;
  const councilCount = members.filter((m) => m.entityType === 'student_council').length;
  const clubMemberCount = members.filter((m) => m.entityType === 'club').length;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('Manage Organizational Structure', 'إدارة الهيكل التنظيمي')}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {activeCount} {t('active members', 'عضو نشط')}
          </p>
        </div>
        {canManage && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--navy)' }}
          >
            <Plus className="w-4 h-4" />
            {t('Add Member', 'إضافة عضو')}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: t('Council Members', 'أعضاء المجلس'), value: councilCount, color: 'var(--navy)' },
          { label: t('Club Members', 'أعضاء الأندية'), value: clubMemberCount, color: '#059669' },
          { label: t('Active', 'نشط'), value: activeCount, color: '#7c3aed' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('Search members...', 'ابحث عن عضو...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white"
          />
        </div>
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value as OrgEntityType | 'all')}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white"
        >
          <option value="all">{t('All Entities', 'جميع الجهات')}</option>
          <option value="student_council">{t('Student Council', 'المجلس الطلابي')}</option>
          <option value="club">{t('Club', 'نادي')}</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white"
        >
          <option value="all">{t('All Status', 'جميع الحالات')}</option>
          <option value="active">{t('Active', 'نشط')}</option>
          <option value="inactive">{t('Inactive', 'غير نشط')}</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <StructureManagementTable
          members={filtered}
          lang={lang}
          canEdit={canManage}
          restrictToClubId={restrictToClubId}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div
              className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10"
            >
              <h2 className="font-bold text-gray-900">
                {editing
                  ? t('Edit Member', 'تعديل العضو')
                  : t('Add Member', 'إضافة عضو')}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <StructureMemberForm
                lang={lang}
                initial={editing ?? undefined}
                currentUid={userProfile?.uid ?? ''}
                isAdmin={isAdmin}
                users={users}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
