import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  addDoc,
  deleteField,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  UserProfile, Event, EventRegistration, MediaRequest, SupportRequest, ClubId, EventStatus,
  ClubRegistrationSettings, ClubApplication, ClubMembership,
  OrganizationalMember, OrgMemberStatus,
} from '../types';

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  } as UserProfile;
}

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
  await setDoc(doc(db, 'users', profile.uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    payload[key] = value === undefined ? deleteField() : value;
  }
  await updateDoc(doc(db, 'users', uid), payload);
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    } as UserProfile;
  });
}

export async function getAllActiveUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(
    query(collection(db, 'users'), where('isActive', '==', true)),
  );
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      } as UserProfile;
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

// ─── Events ───────────────────────────────────────────────────────────────────

function toEvent(id: string, data: Record<string, unknown>): Event {
  return {
    ...data,
    id,
    eventDate: (data.eventDate as Timestamp)?.toDate?.() ?? new Date(),
    eventEndDate: data.eventEndDate ? (data.eventEndDate as Timestamp)?.toDate?.() : undefined,
    submittedAt: data.submittedAt ? (data.submittedAt as Timestamp)?.toDate?.() : undefined,
    reviewedAt: data.reviewedAt ? (data.reviewedAt as Timestamp)?.toDate?.() : undefined,
    publishedAt: data.publishedAt ? (data.publishedAt as Timestamp)?.toDate?.() : undefined,
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
  } as Event;
}

export async function getEvent(id: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, 'events', id));
  if (!snap.exists()) return null;
  return toEvent(snap.id, snap.data() as Record<string, unknown>);
}

export async function getPublicEvents(): Promise<Event[]> {
  const snap = await getDocs(
    query(collection(db, 'events'), where('status', 'in', ['published', 'completed'])),
  );
  return snap.docs
    .map((d) => toEvent(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
}

export async function getEventsByClub(clubId: ClubId): Promise<Event[]> {
  const snap = await getDocs(
    query(collection(db, 'events'), where('clubId', '==', clubId)),
  );
  return snap.docs
    .map((d) => toEvent(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getEventsByOrganizer(organizerId: string): Promise<Event[]> {
  const snap = await getDocs(
    query(collection(db, 'events'), where('organizerId', '==', organizerId)),
  );
  return snap.docs
    .map((d) => toEvent(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getPendingEvents(): Promise<Event[]> {
  const snap = await getDocs(
    query(collection(db, 'events'), where('status', '==', 'pending_review')),
  );
  return snap.docs
    .map((d) => toEvent(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (a.submittedAt?.getTime() ?? 0) - (b.submittedAt?.getTime() ?? 0));
}

export async function getAllEvents(statuses?: EventStatus[]): Promise<Event[]> {
  const q =
    statuses && statuses.length > 0
      ? query(collection(db, 'events'), where('status', 'in', statuses))
      : collection(db, 'events');
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => toEvent(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'events'), {
    ...data,
    eventDate: Timestamp.fromDate(data.eventDate),
    eventEndDate: data.eventEndDate ? Timestamp.fromDate(data.eventEndDate) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(id: string, data: Partial<Event>) {
  const payload: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
  if (data.eventDate) payload.eventDate = Timestamp.fromDate(data.eventDate);
  if (data.eventEndDate) payload.eventEndDate = Timestamp.fromDate(data.eventEndDate);
  if (data.submittedAt) payload.submittedAt = Timestamp.fromDate(data.submittedAt);
  if (data.reviewedAt) payload.reviewedAt = Timestamp.fromDate(data.reviewedAt);
  if (data.publishedAt) payload.publishedAt = Timestamp.fromDate(data.publishedAt);
  await updateDoc(doc(db, 'events', id), payload);
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(db, 'events', id));
}

// ─── Registrations ────────────────────────────────────────────────────────────

export async function getRegistration(eventId: string, studentId: string): Promise<EventRegistration | null> {
  const snap = await getDocs(
    query(
      collection(db, 'registrations'),
      where('eventId', '==', eventId),
      where('studentId', '==', studentId),
      limit(1),
    ),
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    ...data,
    id: d.id,
    registeredAt: data.registeredAt?.toDate?.() ?? new Date(),
    attendedAt: data.attendedAt?.toDate?.() ?? undefined,
  } as EventRegistration;
}

export async function getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
  const snap = await getDocs(
    query(collection(db, 'registrations'), where('eventId', '==', eventId)),
  );
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        registeredAt: data.registeredAt?.toDate?.() ?? new Date(),
      } as EventRegistration;
    })
    .sort((a, b) => a.registeredAt.getTime() - b.registeredAt.getTime());
}

export async function getStudentRegistrations(studentId: string): Promise<EventRegistration[]> {
  const snap = await getDocs(
    query(collection(db, 'registrations'), where('studentId', '==', studentId)),
  );
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        registeredAt: data.registeredAt?.toDate?.() ?? new Date(),
      } as EventRegistration;
    })
    .sort((a, b) => b.registeredAt.getTime() - a.registeredAt.getTime());
}

export async function createRegistration(data: Omit<EventRegistration, 'id' | 'registeredAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'registrations'), {
    ...data,
    registeredAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateRegistration(id: string, data: Partial<EventRegistration>) {
  await updateDoc(doc(db, 'registrations', id), data);
}

export async function registerForEvent(
  eventId: string,
  data: Omit<EventRegistration, 'id' | 'registeredAt' | 'status' | 'qrCode' | 'attendedAt'>,
): Promise<'registered' | 'waitlisted'> {
  const eventRef = doc(db, 'events', eventId);
  const newRegRef = doc(collection(db, 'registrations'));
  let resultStatus: 'registered' | 'waitlisted' = 'registered';

  await runTransaction(db, async (txn) => {
    const eventSnap = await txn.get(eventRef);
    if (!eventSnap.exists()) throw new Error('Event not found');
    const ev = eventSnap.data();
    const currentCount: number = ev.registeredCount ?? 0;
    const capacity: number = ev.capacity ?? 0;
    resultStatus = currentCount >= capacity ? 'waitlisted' : 'registered';

    txn.set(newRegRef, { ...data, status: resultStatus, registeredAt: serverTimestamp() });

    if (resultStatus === 'registered') {
      txn.update(eventRef, { registeredCount: currentCount + 1, updatedAt: serverTimestamp() });
    }
  });

  return resultStatus;
}

// ─── Media Requests ───────────────────────────────────────────────────────────

export async function getMediaRequests(): Promise<MediaRequest[]> {
  const snap = await getDocs(query(collection(db, 'mediaRequests'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    } as MediaRequest;
  });
}

export async function updateMediaRequest(id: string, data: Partial<MediaRequest>): Promise<void> {
  await updateDoc(doc(db, 'mediaRequests', id), { ...data, updatedAt: serverTimestamp() });
}

export async function createMediaRequest(data: Omit<MediaRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'mediaRequests'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Support Requests ─────────────────────────────────────────────────────────

export async function getSupportRequests(): Promise<SupportRequest[]> {
  const snap = await getDocs(query(collection(db, 'supportRequests'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    } as SupportRequest;
  });
}

export async function createSupportRequest(data: Omit<SupportRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'supportRequests'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Club Registration Settings ───────────────────────────────────────────────

function toClubRegistrationSettings(id: string, data: Record<string, unknown>): ClubRegistrationSettings {
  return {
    ...data,
    id,
    registrationStartDate: data.registrationStartDate
      ? (data.registrationStartDate as Timestamp)?.toDate?.()
      : undefined,
    registrationEndDate: data.registrationEndDate
      ? (data.registrationEndDate as Timestamp)?.toDate?.()
      : undefined,
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
  } as ClubRegistrationSettings;
}

export async function getClubRegistrationSettings(clubId: string): Promise<ClubRegistrationSettings | null> {
  const snap = await getDoc(doc(db, 'clubRegistrationSettings', clubId));
  if (!snap.exists()) return null;
  return toClubRegistrationSettings(snap.id, snap.data() as Record<string, unknown>);
}

export async function getAllClubRegistrationSettings(): Promise<ClubRegistrationSettings[]> {
  const snap = await getDocs(collection(db, 'clubRegistrationSettings'));
  return snap.docs.map((d) => toClubRegistrationSettings(d.id, d.data() as Record<string, unknown>));
}

export async function upsertClubRegistrationSettings(
  clubId: string,
  data: Partial<Omit<ClubRegistrationSettings, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  const ref = doc(db, 'clubRegistrationSettings', clubId);
  const snap = await getDoc(ref);
  const payload: Record<string, unknown> = { ...data, clubId, updatedAt: serverTimestamp() };
  if (data.registrationStartDate) payload.registrationStartDate = Timestamp.fromDate(data.registrationStartDate);
  else if (data.registrationStartDate === undefined && 'registrationStartDate' in data) payload.registrationStartDate = null;
  if (data.registrationEndDate) payload.registrationEndDate = Timestamp.fromDate(data.registrationEndDate);
  else if (data.registrationEndDate === undefined && 'registrationEndDate' in data) payload.registrationEndDate = null;
  if (!snap.exists()) {
    await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
  } else {
    await updateDoc(ref, payload);
  }
}

// ─── Club Applications ────────────────────────────────────────────────────────

function toClubApplication(id: string, data: Record<string, unknown>): ClubApplication {
  return {
    ...data,
    id,
    submittedAt: (data.submittedAt as Timestamp)?.toDate?.() ?? new Date(),
    reviewedAt: data.reviewedAt ? (data.reviewedAt as Timestamp)?.toDate?.() : undefined,
    cancelledAt: data.cancelledAt ? (data.cancelledAt as Timestamp)?.toDate?.() : undefined,
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
  } as ClubApplication;
}

export async function createClubApplication(
  data: Omit<ClubApplication, 'id' | 'createdAt' | 'updatedAt' | 'submittedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'clubApplications'), {
    ...data,
    submittedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getStudentApplications(studentUid: string): Promise<ClubApplication[]> {
  const snap = await getDocs(
    query(collection(db, 'clubApplications'), where('studentUid', '==', studentUid)),
  );
  return snap.docs
    .map((d) => toClubApplication(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getClubApplications(clubId: ClubId): Promise<ClubApplication[]> {
  const snap = await getDocs(
    query(collection(db, 'clubApplications'), where('clubId', '==', clubId)),
  );
  return snap.docs
    .map((d) => toClubApplication(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getAllClubApplications(): Promise<ClubApplication[]> {
  const snap = await getDocs(
    query(collection(db, 'clubApplications'), orderBy('createdAt', 'desc')),
  );
  return snap.docs.map((d) => toClubApplication(d.id, d.data() as Record<string, unknown>));
}

export async function updateClubApplication(id: string, data: Partial<ClubApplication>): Promise<void> {
  const payload: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
  if (data.reviewedAt) payload.reviewedAt = Timestamp.fromDate(data.reviewedAt);
  if (data.cancelledAt) payload.cancelledAt = Timestamp.fromDate(data.cancelledAt);
  await updateDoc(doc(db, 'clubApplications', id), payload);
}

// ─── Club Memberships ─────────────────────────────────────────────────────────

function toClubMembership(id: string, data: Record<string, unknown>): ClubMembership {
  return {
    ...data,
    id,
    joinedAt: (data.joinedAt as Timestamp)?.toDate?.() ?? new Date(),
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
  } as ClubMembership;
}

export async function createClubMembership(
  data: Omit<ClubMembership, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'clubMemberships'), {
    ...data,
    joinedAt: Timestamp.fromDate(data.joinedAt),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getClubMemberships(clubId: ClubId): Promise<ClubMembership[]> {
  const snap = await getDocs(
    query(collection(db, 'clubMemberships'), where('clubId', '==', clubId)),
  );
  return snap.docs
    .map((d) => toClubMembership(d.id, d.data() as Record<string, unknown>))
    .filter((m) => m.status === 'active')
    .sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime());
}

export async function getStudentMemberships(studentUid: string): Promise<ClubMembership[]> {
  const snap = await getDocs(
    query(collection(db, 'clubMemberships'), where('studentUid', '==', studentUid)),
  );
  return snap.docs
    .map((d) => toClubMembership(d.id, d.data() as Record<string, unknown>))
    .filter((m) => m.status === 'active');
}

export async function getAllActiveClubMemberships(): Promise<ClubMembership[]> {
  const snap = await getDocs(
    query(collection(db, 'clubMemberships'), where('status', '==', 'active')),
  );
  return snap.docs.map((d) => toClubMembership(d.id, d.data() as Record<string, unknown>));
}

// ─── Organizational Structure ─────────────────────────────────────────────────

function toOrgMember(id: string, data: Record<string, unknown>): OrganizationalMember {
  return {
    ...data,
    id,
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
  } as OrganizationalMember;
}

export async function getActiveOrgMembers(): Promise<OrganizationalMember[]> {
  const snap = await getDocs(
    query(collection(db, 'organizationalMembers'), where('status', '==', 'active')),
  );
  return snap.docs
    .map((d) => toOrgMember(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (a.displayOrder ?? Infinity) - (b.displayOrder ?? Infinity));
}

export async function getAllOrgMembers(): Promise<OrganizationalMember[]> {
  const snap = await getDocs(
    query(collection(db, 'organizationalMembers'), orderBy('displayOrder', 'asc')),
  );
  return snap.docs.map((d) => toOrgMember(d.id, d.data() as Record<string, unknown>));
}

export async function createOrgMember(
  data: Omit<OrganizationalMember, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'organizationalMembers'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateOrgMember(
  id: string,
  data: Partial<Omit<OrganizationalMember, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'organizationalMembers', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOrgMember(id: string): Promise<void> {
  await deleteDoc(doc(db, 'organizationalMembers', id));
}

export async function setOrgMemberStatus(id: string, status: OrgMemberStatus, updatedByUid: string): Promise<void> {
  await updateDoc(doc(db, 'organizationalMembers', id), { status, updatedByUid, updatedAt: serverTimestamp() });
}
