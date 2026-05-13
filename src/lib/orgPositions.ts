import type { OrgRoleCategory, OrgEntityType } from '../types';

export interface OrgPositionOption {
  id: string;
  labelEn: string;
  labelAr: string;
  roleCategory: OrgRoleCategory;
  entityType: OrgEntityType;
  defaultDisplayOrder: number;
  requiresClub: boolean;
}

export const ORG_POSITION_OPTIONS: OrgPositionOption[] = [
  // ── Student Council ──────────────────────────────────────────────────────────
  {
    id: 'council_president',
    labelEn: 'Student Council President',
    labelAr: 'رئيس المجلس الطلابي',
    roleCategory: 'council_president',
    entityType: 'student_council',
    defaultDisplayOrder: 1,
    requiresClub: false,
  },
  {
    id: 'council_vice_president',
    labelEn: 'Student Council Vice President',
    labelAr: 'نائب رئيس المجلس الطلابي',
    roleCategory: 'council_vice_president',
    entityType: 'student_council',
    defaultDisplayOrder: 2,
    requiresClub: false,
  },
  {
    id: 'clubs_supervisor',
    labelEn: 'Clubs Supervisor',
    labelAr: 'مشرف الأندية',
    roleCategory: 'clubs_supervisor',
    entityType: 'student_council',
    defaultDisplayOrder: 3,
    requiresClub: false,
  },
  {
    id: 'council_secretary',
    labelEn: 'Secretary / Coordinator',
    labelAr: 'أمين المجلس / منسق المجلس',
    roleCategory: 'council_secretary',
    entityType: 'student_council',
    defaultDisplayOrder: 4,
    requiresClub: false,
  },
  {
    id: 'council_officer_media',
    labelEn: 'Media Officer',
    labelAr: 'مسؤول الإعلام',
    roleCategory: 'council_officer',
    entityType: 'student_council',
    defaultDisplayOrder: 5,
    requiresClub: false,
  },
  {
    id: 'council_officer_events',
    labelEn: 'Events Officer',
    labelAr: 'مسؤول الفعاليات',
    roleCategory: 'council_officer',
    entityType: 'student_council',
    defaultDisplayOrder: 6,
    requiresClub: false,
  },
  {
    id: 'council_officer_member',
    labelEn: 'Council Member',
    labelAr: 'عضو المجلس',
    roleCategory: 'council_officer',
    entityType: 'student_council',
    defaultDisplayOrder: 7,
    requiresClub: false,
  },
  // ── Clubs ────────────────────────────────────────────────────────────────────
  {
    id: 'club_president',
    labelEn: 'Club President',
    labelAr: 'رئيس النادي',
    roleCategory: 'club_president',
    entityType: 'club',
    defaultDisplayOrder: 20,
    requiresClub: true,
  },
  {
    id: 'club_vice_president',
    labelEn: 'Club Vice President',
    labelAr: 'نائب رئيس النادي',
    roleCategory: 'club_vice_president',
    entityType: 'club',
    defaultDisplayOrder: 30,
    requiresClub: true,
  },
  {
    id: 'club_member_general',
    labelEn: 'Club Member',
    labelAr: 'عضو النادي',
    roleCategory: 'club_member',
    entityType: 'club',
    defaultDisplayOrder: 40,
    requiresClub: true,
  },
  {
    id: 'club_member_events',
    labelEn: 'Events Coordinator',
    labelAr: 'منسق الفعاليات',
    roleCategory: 'club_member',
    entityType: 'club',
    defaultDisplayOrder: 41,
    requiresClub: true,
  },
  {
    id: 'club_member_media',
    labelEn: 'Media Coordinator',
    labelAr: 'منسق الإعلام',
    roleCategory: 'club_member',
    entityType: 'club',
    defaultDisplayOrder: 42,
    requiresClub: true,
  },
  {
    id: 'club_member_writer',
    labelEn: 'Content Writer',
    labelAr: 'كاتب محتوى',
    roleCategory: 'club_member',
    entityType: 'club',
    defaultDisplayOrder: 43,
    requiresClub: true,
  },
  {
    id: 'club_member_designer',
    labelEn: 'Designer',
    labelAr: 'مصمم',
    roleCategory: 'club_member',
    entityType: 'club',
    defaultDisplayOrder: 44,
    requiresClub: true,
  },
  {
    id: 'club_member_photographer',
    labelEn: 'Photographer',
    labelAr: 'مصور',
    roleCategory: 'club_member',
    entityType: 'club',
    defaultDisplayOrder: 45,
    requiresClub: true,
  },
  {
    id: 'club_member_tech',
    labelEn: 'Technical Support',
    labelAr: 'دعم تقني',
    roleCategory: 'club_member',
    entityType: 'club',
    defaultDisplayOrder: 46,
    requiresClub: true,
  },
  {
    id: 'club_member_volunteer',
    labelEn: 'Volunteer',
    labelAr: 'متطوع',
    roleCategory: 'club_member',
    entityType: 'club',
    defaultDisplayOrder: 47,
    requiresClub: true,
  },
];

export function getOrgPositionById(id: string): OrgPositionOption | undefined {
  return ORG_POSITION_OPTIONS.find((p) => p.id === id);
}

export function getOrgPositionByRoleCategory(rc: OrgRoleCategory): OrgPositionOption[] {
  return ORG_POSITION_OPTIONS.filter((p) => p.roleCategory === rc);
}

export function getOrgPositionByLabels(en: string, ar: string): OrgPositionOption | undefined {
  return ORG_POSITION_OPTIONS.find((p) => p.labelEn === en && p.labelAr === ar);
}
