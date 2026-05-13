import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  lang: 'en' | 'ar';
}

export default function Footer({ lang }: FooterProps) {
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  return (
    <footer
      className="mt-auto pt-12 pb-6 text-white"
      style={{ backgroundColor: 'var(--navy-dark)' }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-council-white.png"
                alt="AOU Student Council"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <div className="font-bold">{t('Student Council', 'مجلس الطلاب')}</div>
                <div className="text-xs" style={{ color: 'var(--gold-light)' }}>
                  {t('Arab Open University – Jeddah', 'الجامعة العربية المفتوحة – جدة')}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t(
                'Empowering students through clubs, events, and community engagement.',
                'تمكين الطلاب من خلال الأندية والفعاليات والمشاركة المجتمعية.',
              )}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--gold)' }}>
              {t('Quick Links', 'روابط سريعة')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { href: '/clubs', en: 'Our Clubs', ar: 'أنديتنا' },
                { href: '/events', en: 'Events', ar: 'الفعاليات' },
                { href: '/about', en: 'About Us', ar: 'عن المنصة' },
                { href: '/login', en: 'Sign In', ar: 'تسجيل الدخول' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {t(l.en, l.ar)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Clubs */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--gold)' }}>
              {t('Our Clubs', 'أنديتنا')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { id: 'computer', en: 'Computer Club', ar: 'نادي الحاسب الآلي' },
                { id: 'business', en: 'Business Club', ar: 'نادي الأعمال' },
                { id: 'cultural', en: 'Cultural Club', ar: 'النادي الثقافي' },
                { id: 'sports', en: 'Sports Club', ar: 'النادي الرياضي' },
                { id: 'media', en: 'Media Club', ar: 'النادي الإعلامي' },
              ].map((c) => (
                <li key={c.id}>
                  <Link href={`/clubs#${c.id}`} className="hover:text-white transition-colors">
                    {t(c.en, c.ar)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>
            © {new Date().getFullYear()} {t('AOU Jeddah Student Council. All rights reserved.', 'مجلس طلاب جامعة AOU جدة. جميع الحقوق محفوظة.')}
          </span>
          <span>{t('Built with ❤ for AOU students', 'صُنع بـ ❤ لطلاب جامعة AOU')}</span>
        </div>
      </div>
    </footer>
  );
}
