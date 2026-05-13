'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PublicLayout from '../../../../components/layout/PublicLayout';
import { useLang } from '../../../../contexts/LangContext';
import { getEvent, getRegistration, registerForEvent } from '../../../../lib/firestore';
import { CLUBS } from '../../../../types';
import type { Event, EventRegistration } from '../../../../types';
import { useAuth } from '../../../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registrationSchema = z.object({
  studentIdNumber: z.string().min(5, 'Student ID is required'),
  major: z.string().min(2, 'Major is required'),
  phone: z.string().optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser, userProfile } = useAuth();
  const { lang } = useLang();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const id = params.id as string;

  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  useEffect(() => {
    Promise.all([
      getEvent(id),
      firebaseUser ? getRegistration(id, firebaseUser.uid) : Promise.resolve(null),
    ]).then(([ev, reg]) => {
      setEvent(ev);
      setRegistration(reg);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, firebaseUser]);

  async function onRegister(data: RegistrationForm) {
    if (!firebaseUser || !event || !userProfile) return;
    setRegistering(true);
    try {
      await registerForEvent(event.id, {
        eventId: event.id,
        studentId: firebaseUser.uid,
        studentName: userProfile.displayName,
        studentEmail: firebaseUser.email ?? '',
        studentIdNumber: data.studentIdNumber,
        major: data.major,
        phone: data.phone,
      });
      toast.success(t('Successfully registered!', 'تم التسجيل بنجاح!'));
      setShowForm(false);
      const [updatedEvent, reg] = await Promise.all([
        getEvent(id),
        getRegistration(id, firebaseUser.uid),
      ]);
      if (updatedEvent) setEvent(updatedEvent);
      setRegistration(reg);
    } catch {
      toast.error(t('Registration failed. Try again.', 'فشل التسجيل. حاول مرة أخرى.'));
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-40 bg-gray-200 rounded" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!event) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500">{t('Event not found.', 'الفعالية غير موجودة.')}</p>
          <Link href="/events" className="text-blue-600 hover:underline mt-4 inline-block">
            {t('Back to Events', 'العودة إلى الفعاليات')}
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const club = CLUBS.find((c) => c.id === event.clubId);
  const isFull = event.registeredCount >= event.capacity;
  const isPast = event.eventDate < new Date();

  return (
    <PublicLayout>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Color bar */}
        <div className="h-1.5" style={{ backgroundColor: club?.color }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Back */}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
          >
            {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {t('Back to Events', 'العودة إلى الفعاليات')}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Club badge */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">{club?.icon}</span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: (club?.color ?? '#000') + '15', color: club?.color }}
                >
                  {t(club?.name ?? '', club?.nameAr ?? '')}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900">
                {t(event.title, event.titleAr)}
              </h1>

              <p className="text-gray-600 leading-relaxed text-lg">
                {t(event.description, event.descriptionAr)}
              </p>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Info card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {format(event.eventDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(event.eventDate, 'h:mm a')}
                      {event.eventEndDate && ` – ${format(event.eventEndDate, 'h:mm a')}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{t(event.location, event.locationAr)}</span>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {event.registeredCount}/{event.capacity} {t('registered', 'مسجّل')}
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%`,
                          backgroundColor: isFull ? '#ef4444' : club?.color ?? 'var(--navy)',
                        }}
                      />
                    </div>
                    {isFull && (
                      <p className="text-xs text-orange-600 mt-1">
                        {t('Event is full — waitlist available', 'الفعالية مكتملة — قائمة انتظار متاحة')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  {registration ? (
                    <div
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                      style={{
                        backgroundColor: registration.status === 'registered' ? '#dcfce7' : '#fef9c3',
                        color: registration.status === 'registered' ? '#15803d' : '#92400e',
                      }}
                    >
                      {registration.status === 'registered' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      {registration.status === 'registered'
                        ? t('You are registered ✓', 'أنت مسجّل ✓')
                        : t('You are on the waitlist', 'أنت في قائمة الانتظار')}
                    </div>
                  ) : isPast ? (
                    <div className="text-sm text-gray-400 text-center py-2">
                      {t('This event has ended.', 'انتهت هذه الفعالية.')}
                    </div>
                  ) : firebaseUser ? (
                    <>
                      {showForm ? (
                        <form onSubmit={handleSubmit(onRegister)} className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              {t('Student ID', 'رقم الطالب')} *
                            </label>
                            <input
                              {...register('studentIdNumber')}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
                              style={{ '--tw-ring-color': club?.color } as React.CSSProperties}
                              placeholder="e.g. 20231234"
                            />
                            {errors.studentIdNumber && (
                              <p className="text-xs text-red-500 mt-0.5">{errors.studentIdNumber.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              {t('Major', 'التخصص')} *
                            </label>
                            <input
                              {...register('major')}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
                              placeholder={t('e.g. Business Administration', 'مثال: إدارة الأعمال')}
                            />
                            {errors.major && (
                              <p className="text-xs text-red-500 mt-0.5">{errors.major.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              {t('Phone (optional)', 'الهاتف (اختياري)')}
                            </label>
                            <input
                              {...register('phone')}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
                              placeholder="+966 5X XXX XXXX"
                            />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="submit"
                              disabled={registering}
                              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                              style={{ backgroundColor: club?.color ?? 'var(--navy)' }}
                            >
                              {registering ? t('Registering...', 'جاري التسجيل...') : t('Confirm', 'تأكيد')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowForm(false)}
                              className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                              {t('Cancel', 'إلغاء')}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setShowForm(true)}
                          className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                          style={{ backgroundColor: club?.color ?? 'var(--navy)' }}
                        >
                          {isFull ? t('Join Waitlist', 'انضم لقائمة الانتظار') : t('Register Now', 'سجّل الآن')}
                        </button>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block w-full py-3 rounded-xl text-sm font-semibold text-center text-white hover:opacity-90 transition-all"
                      style={{ backgroundColor: 'var(--navy)' }}
                    >
                      {t('Sign in to Register', 'سجّل دخولك للتسجيل')}
                    </Link>
                  )}
                </div>
              </div>

              {/* Organizer */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-500 mb-1">{t('Organized by', 'منظَّم من قِبَل')}</p>
                <p className="font-medium text-gray-800">{event.organizerName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
