'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Users, Plus, ClipboardList,
  FileText, Settings, Camera, HelpCircle, X, Shield, BarChart3,
  UserPlus, ListChecks, ToggleLeft,
} from 'lucide-react';
import type { UserRole, ClubId } from '../../types';
import { CLUBS } from '../../types';

interface SidebarProps {
  role: UserRole;
  clubId?: ClubId;
  lang: 'en' | 'ar';
  onClose?: () => void;
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
      style={active ? { backgroundColor: 'var(--navy)' } : {}}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardSidebar({ role, clubId, lang, onClose }: SidebarProps) {
  const pathname = usePathname();
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const club = clubId ? CLUBS.find((c) => c.id === clubId) : null;

  const isAdmin = role === 'super_admin' || role === 'council_admin';
  const isClubLeader = role === 'club_president' || role === 'club_vice_president';
  const isClubMember = role === 'club_member' || role === 'media_club_member';

  const commonLinks = [
    { href: '/dashboard', icon: LayoutDashboard, en: 'Dashboard', ar: 'لوحة التحكم' },
    { href: '/dashboard/events', icon: Calendar, en: 'My Events', ar: 'فعالياتي' },
  ];

  const clubLeaderLinks = [
    { href: '/dashboard/events/new', icon: Plus, en: 'New Event', ar: 'فعالية جديدة' },
    { href: '/dashboard/club', icon: Users, en: 'My Club', ar: 'ناديي' },
    { href: '/dashboard/attendance', icon: ClipboardList, en: 'Attendance', ar: 'الحضور' },
    { href: '/dashboard/media-requests', icon: Camera, en: 'Media Requests', ar: 'طلبات الإعلام' },
  ];

  const memberLinks = [
    { href: '/dashboard/media-requests', icon: Camera, en: 'Media Requests', ar: 'طلبات الإعلام' },
  ];

  const adminLinks = [
    { href: '/dashboard/admin/events', icon: FileText, en: 'Event Approvals', ar: 'موافقات الفعاليات' },
    { href: '/dashboard/club-registration', icon: ToggleLeft, en: 'Club Registration', ar: 'إدارة التسجيل في الأندية' },
    { href: '/dashboard/club-applications', icon: ClipboardList, en: 'Club Applications', ar: 'طلبات الانضمام' },
    { href: '/dashboard/admin/users', icon: Users, en: 'User Management', ar: 'إدارة المستخدمين' },
    { href: '/dashboard/admin/reports', icon: BarChart3, en: 'Reports', ar: 'التقارير' },
  ];

  const clubLeaderAppLinks = [
    { href: '/dashboard/club-applications', icon: ClipboardList, en: 'Club Applications', ar: 'طلبات الانضمام' },
  ];

  const studentLinks = [
    { href: '/student/clubs', icon: UserPlus, en: 'Join a Club', ar: 'الانضمام لنادٍ' },
    { href: '/student/applications', icon: ListChecks, en: 'My Applications', ar: 'طلباتي' },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between border-b border-gray-100"
        style={{ backgroundColor: 'var(--navy)' }}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/logo-council-white.png"
            alt="AOU Student Council"
            width={32}
            height={32}
            className="object-contain"
          />
          <div>
            <div className="text-white font-semibold text-sm">{t('Clubs Hub', 'منصة الأندية')}</div>
            {club && (
              <div className="text-xs" style={{ color: '#d4b96b' }}>
                {t(club.name, club.nameAr)}
              </div>
            )}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {commonLinks.map((l) => (
          <NavItem key={l.href} href={l.href} icon={l.icon} label={t(l.en, l.ar)} active={pathname === l.href} />
        ))}

        {/* Club section for leaders and members */}
        {(isClubLeader || isClubMember) && (
          <>
            <div className="pt-3 pb-1 px-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t('Club', 'النادي')}
              </span>
            </div>
            {isClubLeader && clubLeaderLinks.map((l) => (
              <NavItem key={l.href} href={l.href} icon={l.icon} label={t(l.en, l.ar)} active={pathname === l.href} />
            ))}
            {isClubLeader && clubLeaderAppLinks.map((l) => (
              <NavItem key={l.href} href={l.href} icon={l.icon} label={t(l.en, l.ar)} active={pathname === l.href} />
            ))}
            {isClubMember && memberLinks.map((l) => (
              <NavItem key={l.href} href={l.href} icon={l.icon} label={t(l.en, l.ar)} active={pathname === l.href} />
            ))}
          </>
        )}

        {/* Clubs section for students */}
        {!isAdmin && !isClubLeader && !isClubMember && (
          <>
            <div className="pt-3 pb-1 px-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t('Clubs', 'الأندية')}
              </span>
            </div>
            {studentLinks.map((l) => (
              <NavItem key={l.href} href={l.href} icon={l.icon} label={t(l.en, l.ar)} active={pathname === l.href} />
            ))}
          </>
        )}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t('Administration', 'الإدارة')}
              </span>
            </div>
            {adminLinks.map((l) => (
              <NavItem key={l.href} href={l.href} icon={l.icon} label={t(l.en, l.ar)} active={pathname === l.href} />
            ))}
            {role === 'super_admin' && (
              <NavItem
                href="/dashboard/admin/system"
                icon={Shield}
                label={t('System Settings', 'إعدادات النظام')}
                active={pathname === '/dashboard/admin/system'}
              />
            )}
          </>
        )}

        <div className="pt-3 pb-1 px-4">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t('Account', 'الحساب')}
          </span>
        </div>
        <NavItem href="/dashboard/support" icon={HelpCircle} label={t('Support', 'الدعم')} active={pathname === '/dashboard/support'} />
        <NavItem href="/dashboard/settings" icon={Settings} label={t('Settings', 'الإعدادات')} active={pathname === '/dashboard/settings'} />
      </nav>
    </div>
  );
}
