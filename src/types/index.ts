export type UserRole =
  | 'super_admin'
  | 'council_admin'
  | 'club_president'
  | 'club_vice_president'
  | 'club_member'
  | 'media_club_member'
  | 'student'
  | 'guest';

export type ClubId =
  | 'computer'
  | 'business'
  | 'cultural'
  | 'sports'
  | 'media';

export type EventStatus =
  | 'draft'
  | 'pending_review'
  | 'needs_edits'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'completed'
  | 'cancelled';

export type MediaRequestType =
  | 'photography'
  | 'videography'
  | 'design'
  | 'social_media'
  | 'all';

export type SupportRequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  displayNameAr: string;
  role: UserRole;
  clubId?: ClubId;
  studentId?: string;
  major?: string;
  phone?: string;
  photoURL?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Club {
  id: ClubId;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  color: string;
  icon: string;
  logo?: string;
  presidentId?: string;
  vicePresidentId?: string;
  memberCount: number;
  isActive: boolean;
}

export interface Event {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  clubId: ClubId;
  organizerId: string;
  organizerName: string;
  status: EventStatus;
  eventDate: Date;
  eventEndDate?: Date;
  location: string;
  locationAr: string;
  capacity: number;
  registeredCount: number;
  tags: string[];
  tagsAr: string[];
  imageUrl?: string;
  requiresMediaCoverage: boolean;
  mediaRequestId?: string;
  adminNotes?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentIdNumber: string;
  major: string;
  phone?: string;
  status: 'registered' | 'waitlisted' | 'attended' | 'no_show' | 'cancelled';
  qrCode?: string;
  registeredAt: Date;
  attendedAt?: Date;
}

export interface MediaRequest {
  id: string;
  eventId: string;
  eventTitle: string;
  requestedBy: string;
  requestedByName: string;
  types: MediaRequestType[];
  description: string;
  descriptionAr: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assignedTo?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportRequest {
  id: string;
  submittedBy: string;
  submittedByName: string;
  clubId?: ClubId;
  subject: string;
  subjectAr: string;
  body: string;
  status: SupportRequestStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const CLUBS: Club[] = [
  {
    id: 'computer',
    name: 'Computer Club',
    nameAr: 'نادي الحاسب الآلي',
    description: 'Empowering students with cutting-edge technology skills, programming workshops, and innovation.',
    descriptionAr: 'تمكين الطلاب بمهارات التكنولوجيا الحديثة وورش البرمجة والابتكار.',
    color: '#2563eb',
    icon: '💻',
    memberCount: 0,
    isActive: true,
  },
  {
    id: 'business',
    name: 'Business Club',
    nameAr: 'نادي الأعمال',
    description: 'Developing entrepreneurial mindsets, leadership skills, and business acumen for future leaders.',
    descriptionAr: 'تطوير العقلية الريادية ومهارات القيادة والوعي التجاري لقادة المستقبل.',
    color: '#059669',
    icon: '📊',
    memberCount: 0,
    isActive: true,
  },
  {
    id: 'cultural',
    name: 'Cultural Club',
    nameAr: 'النادي الثقافي',
    description: 'Celebrating diversity, heritage, and arts through cultural events and enriching experiences.',
    descriptionAr: 'الاحتفاء بالتنوع والتراث والفنون من خلال الفعاليات الثقافية والتجارب المثرية.',
    color: '#7c3aed',
    icon: '🎭',
    logo: '/logo-club-cultural.jpeg',
    memberCount: 0,
    isActive: true,
  },
  {
    id: 'sports',
    name: 'Sports Club',
    nameAr: 'النادي الرياضي',
    description: 'Promoting physical wellness, team spirit, and healthy competition through sports and fitness.',
    descriptionAr: 'تعزيز الصحة البدنية وروح الفريق والمنافسة الصحية من خلال الرياضة واللياقة البدنية.',
    color: '#dc2626',
    icon: '⚽',
    logo: '/logo-club-sports.jpeg',
    memberCount: 0,
    isActive: true,
  },
  {
    id: 'media',
    name: 'Media Club',
    nameAr: 'النادي الإعلامي',
    description: 'Telling stories through photography, videography, design, and digital content creation.',
    descriptionAr: 'رواية القصص من خلال التصوير الفوتوغرافي والفيديو والتصميم وإنشاء المحتوى الرقمي.',
    color: '#d97706',
    icon: '📸',
    logo: '/logo-club-media.png',
    memberCount: 0,
    isActive: true,
  },
];

export const ROLE_LABELS: Record<UserRole, { en: string; ar: string }> = {
  super_admin: { en: 'Super Admin', ar: 'مدير النظام' },
  council_admin: { en: 'Council Admin', ar: 'مدير مجلس الطلاب' },
  club_president: { en: 'Club President', ar: 'رئيس النادي' },
  club_vice_president: { en: 'Vice President', ar: 'نائب رئيس النادي' },
  club_member: { en: 'Club Member', ar: 'عضو النادي' },
  media_club_member: { en: 'Media Member', ar: 'عضو النادي الإعلامي' },
  student: { en: 'Student', ar: 'طالب' },
  guest: { en: 'Guest', ar: 'زائر' },
};

export const EVENT_STATUS_LABELS: Record<EventStatus, { en: string; ar: string; color: string }> = {
  draft: { en: 'Draft', ar: 'مسودة', color: 'gray' },
  pending_review: { en: 'Pending Review', ar: 'في انتظار المراجعة', color: 'yellow' },
  needs_edits: { en: 'Needs Edits', ar: 'يحتاج تعديلات', color: 'orange' },
  approved: { en: 'Approved', ar: 'معتمد', color: 'blue' },
  rejected: { en: 'Rejected', ar: 'مرفوض', color: 'red' },
  published: { en: 'Published', ar: 'منشور', color: 'green' },
  completed: { en: 'Completed', ar: 'مكتمل', color: 'purple' },
  cancelled: { en: 'Cancelled', ar: 'ملغى', color: 'gray' },
};

// ─── Club Membership Feature ──────────────────────────────────────────────────

export type ClubApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'cancelled';
export type ClubRegistrationStatus = 'open' | 'closed' | 'coming_soon';
export type ClubMembershipStatus = 'active' | 'inactive' | 'removed';
export type PreferredRole =
  | 'organizer'
  | 'designer'
  | 'photographer'
  | 'presenter'
  | 'writer'
  | 'technical_support'
  | 'volunteer';

export interface ClubRegistrationSettings {
  id: string;
  clubId: ClubId | 'global';
  registrationEnabled: boolean;
  registrationStatus: ClubRegistrationStatus;
  registrationStartDate?: Date;
  registrationEndDate?: Date;
  membershipSeatLimit?: number;
  applicationInstructionsAr?: string;
  applicationInstructionsEn?: string;
  allowStudentCancellation: boolean;
  allowReapplyAfterRejection: boolean;
  updatedByUid?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClubApplication {
  id: string;
  clubId: ClubId;
  studentUid?: string;
  fullName: string;
  universityId: string;
  universityEmail: string;
  phone: string;
  major: string;
  academicLevel: string;
  reasonToJoin: string;
  skills: string;
  previousExperience?: string;
  preferredRole?: PreferredRole;
  status: ClubApplicationStatus;
  reviewNote?: string;
  reviewedByUid?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClubMembership {
  id: string;
  clubId: ClubId;
  studentUid?: string;
  applicationId: string;
  fullName: string;
  universityId: string;
  universityEmail: string;
  memberType: 'regular_student_member';
  status: ClubMembershipStatus;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const APPLICATION_STATUS_LABELS: Record<ClubApplicationStatus, { en: string; ar: string; color: string }> = {
  pending:    { en: 'Pending Review',    ar: 'قيد المراجعة',      color: 'yellow' },
  accepted:   { en: 'Accepted',          ar: 'مقبول',             color: 'green'  },
  rejected:   { en: 'Rejected',          ar: 'مرفوض',             color: 'red'    },
  waitlisted: { en: 'Waitlisted',        ar: 'قائمة الانتظار',    color: 'blue'   },
  cancelled:  { en: 'Cancelled',         ar: 'ملغي',              color: 'gray'   },
};

export const PREFERRED_ROLE_LABELS: Record<PreferredRole, { en: string; ar: string }> = {
  organizer:        { en: 'Organizer',        ar: 'منظم'         },
  designer:         { en: 'Designer',         ar: 'مصمم'         },
  photographer:     { en: 'Photographer',     ar: 'مصور'         },
  presenter:        { en: 'Presenter',        ar: 'مقدم'         },
  writer:           { en: 'Writer',           ar: 'كاتب محتوى'   },
  technical_support:{ en: 'Technical Support',ar: 'دعم تقني'     },
  volunteer:        { en: 'Volunteer',        ar: 'متطوع'        },
};
