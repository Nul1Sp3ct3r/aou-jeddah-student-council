'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Camera, Plus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLang } from '../../../../contexts/LangContext';
import { getMediaRequests, createMediaRequest, updateMediaRequest } from '../../../../lib/firestore';
import type { MediaRequest, MediaRequestType } from '../../../../types';

const TYPE_LABELS: Record<MediaRequestType, { en: string; ar: string }> = {
  photography:  { en: 'Photography',   ar: 'تصوير فوتوغرافي' },
  videography:  { en: 'Videography',   ar: 'تصوير فيديو'     },
  design:       { en: 'Design',        ar: 'تصميم'            },
  social_media: { en: 'Social Media',  ar: 'وسائل التواصل'   },
  all:          { en: 'All Services',  ar: 'جميع الخدمات'    },
};

const STATUS_STYLE: Record<string, { bg: string; text: string; en: string; ar: string }> = {
  pending:   { bg: '#fef9c3', text: '#92400e', en: 'Pending',   ar: 'قيد الانتظار' },
  accepted:  { bg: '#dbeafe', text: '#1d4ed8', en: 'Accepted',  ar: 'مقبول'         },
  rejected:  { bg: '#fee2e2', text: '#dc2626', en: 'Rejected',  ar: 'مرفوض'         },
  completed: { bg: '#dcfce7', text: '#15803d', en: 'Completed', ar: 'مكتمل'         },
};

export default function MediaRequestsPage() {
  const { userProfile } = useAuth();
  const { lang } = useLang();
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formTypes, setFormTypes] = useState<MediaRequestType[]>([]);
  const [formDesc, setFormDesc] = useState('');
  const [formDescAr, setFormDescAr] = useState('');

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const role = userProfile?.role ?? 'student';
  const isMediaMember = role === 'media_club_member';
  const isAdmin = role === 'super_admin' || role === 'council_admin';
  const isLeader = ['club_president', 'club_vice_president'].includes(role);
  const canCreate = isLeader || isAdmin;

  useEffect(() => {
    if (!userProfile) return;
    getMediaRequests()
      .then((reqs) => {
        if (isMediaMember || isAdmin) return reqs;
        return reqs.filter((r) => r.requestedBy === userProfile.uid);
      })
      .then(setRequests)
      .catch(() => toast.error(t('Failed to load requests.', 'فشل تحميل الطلبات.')))
      .finally(() => setLoading(false));
  }, [userProfile?.uid]);

  function toggleType(type: MediaRequestType) {
    setFormTypes((prev) =>
      prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userProfile || !formTitle.trim() || formTypes.length === 0) return;
    setSubmitting(true);
    try {
      await createMediaRequest({
        eventId: 'general',
        eventTitle: formTitle.trim(),
        requestedBy: userProfile.uid,
        requestedByName: userProfile.displayName,
        types: formTypes,
        description: formDesc,
        descriptionAr: formDescAr,
        status: 'pending',
      });
      toast.success(t('Request submitted!', 'تم إرسال الطلب!'));
      setShowForm(false);
      setFormTitle('');
      setFormTypes([]);
      setFormDesc('');
      setFormDescAr('');
      const reqs = await getMediaRequests();
      setRequests(isMediaMember || isAdmin ? reqs : reqs.filter((r) => r.requestedBy === userProfile.uid));
    } catch {
      toast.error(t('Failed to submit.', 'فشل الإرسال.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatus(id: string, status: MediaRequest['status']) {
    setUpdating(id);
    try {
      await updateMediaRequest(id, { status });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      toast.error(t('Failed to update.', 'فشل التحديث.'));
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('Media Requests', 'طلبات الإعلام')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isMediaMember
              ? t('View and manage incoming media coverage requests.', 'عرض وإدارة طلبات التغطية الإعلامية.')
              : t('Request media coverage for your events and activities.', 'اطلب التغطية الإعلامية لفعالياتك وأنشطتك.')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canCreate && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--navy)' }}
            >
              <Plus className="w-4 h-4" />
              {t('New Request', 'طلب جديد')}
            </button>
          )}
        </div>
      </div>

      {/* New request form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
        >
          <h3 className="font-semibold text-gray-900 mb-5">
            {t('New Media Coverage Request', 'طلب تغطية إعلامية جديد')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Event / Activity Title *', 'عنوان الفعالية / النشاط *')}
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder={t('e.g. Annual Sports Day 2025', 'مثال: يوم الرياضة السنوي 2025')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Services Needed *', 'الخدمات المطلوبة *')}
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TYPE_LABELS) as MediaRequestType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      formTypes.includes(type)
                        ? 'text-white border-transparent'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                    style={formTypes.includes(type) ? { backgroundColor: 'var(--navy)' } : {}}
                  >
                    {t(TYPE_LABELS[type].en, TYPE_LABELS[type].ar)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Description (English)', 'الوصف (إنجليزي)')}
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                  placeholder={t('Describe what you need...', 'اشرح ما تحتاجه...')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Description (Arabic)', 'الوصف (عربي)')}
                </label>
                <textarea
                  value={formDescAr}
                  onChange={(e) => setFormDescAr(e.target.value)}
                  rows={3}
                  dir="rtl"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                  placeholder="اشرح ما تحتاجه..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              {t('Cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              disabled={submitting || !formTitle.trim() || formTypes.length === 0}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: 'var(--navy)' }}
            >
              {submitting ? t('Submitting...', 'جارٍ الإرسال...') : t('Submit Request', 'إرسال الطلب')}
            </button>
          </div>
        </form>
      )}

      {/* Requests list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Camera className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900">{t('Requests', 'الطلبات')}</h3>
          <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {requests.length}
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <Camera className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 text-sm">{t('No requests yet', 'لا توجد طلبات بعد')}</p>
            {canCreate && (
              <p className="text-gray-300 text-xs mt-1">
                {t('Click "New Request" to create one.', 'انقر "طلب جديد" لإنشاء طلب.')}
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.map((req) => {
              const st = STATUS_STYLE[req.status] ?? STATUS_STYLE.pending;
              return (
                <div key={req.id} className="flex items-start gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{req.eventTitle}</div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {req.types.map((type) => (
                        <span
                          key={type}
                          className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                        >
                          {t(TYPE_LABELS[type].en, TYPE_LABELS[type].ar)}
                        </span>
                      ))}
                    </div>
                    {(req.description || req.descriptionAr) && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">
                        {lang === 'ar'
                          ? req.descriptionAr || req.description
                          : req.description || req.descriptionAr}
                      </p>
                    )}
                    <div className="text-xs text-gray-300 mt-1">
                      {req.requestedByName} · {format(req.createdAt, 'MMM d, yyyy')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: st.bg, color: st.text }}
                    >
                      {t(st.en, st.ar)}
                    </span>
                    {isMediaMember && req.status === 'pending' && (
                      <button
                        onClick={() => handleStatus(req.id, 'accepted')}
                        disabled={updating === req.id}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium disabled:opacity-50"
                      >
                        {t('Accept', 'قبول')}
                      </button>
                    )}
                    {isMediaMember && req.status === 'accepted' && (
                      <button
                        onClick={() => handleStatus(req.id, 'completed')}
                        disabled={updating === req.id}
                        className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-50"
                      >
                        {t('Complete', 'مكتمل')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
